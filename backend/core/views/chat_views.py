from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status, throttling
from django.utils.html import strip_tags
from django.http import StreamingHttpResponse
import json
from core.models.chat import ChatSession, ChatMessage
from core.serializers.chat_serializers import ChatSessionSerializer, ChatMessageSerializer
from core.services.startup_data_service import fetch_investor_context
from core.services.ai_service import generate_response, UNRELATED_RESPONSE, SYSTEM_PROMPT, select_formatted_response
try:
    from openai import OpenAI
except Exception:
    OpenAI = None
import logging
import os
from decouple import config
try:
    import httpx
except Exception:
    httpx = None
try:
    import google.generativeai as genai
except Exception:
    genai = None
from rest_framework.renderers import JSONRenderer, BrowsableAPIRenderer
from core.renderers.event_stream import EventStreamRenderer


class InvestorThrottle(throttling.SimpleRateThrottle):
    scope = "investor_chat"
    rate = "10/minute"

    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            ident = self.get_ident(request)
        else:
            ident = str(request.user.id)
        return self.cache_format % {"scope": self.scope, "ident": ident}


class InvestorChatAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [InvestorThrottle]

    def post(self, request, *args, **kwargs):
        user = request.user
        if not getattr(user, "is_investor", False) and not getattr(user, "is_staff", False):
            return Response({"detail": "Investor access required."}, status=status.HTTP_403_FORBIDDEN)

        payload = request.data or {}
        text = strip_tags(str(payload.get("message", "")))[:2000].strip()
        session_id = payload.get("session_id")
        if not text:
            return Response({"detail": "message is required"}, status=status.HTTP_400_BAD_REQUEST)

        session = None
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, investor=user)
            except ChatSession.DoesNotExist:
                return Response({"detail": "Invalid session"}, status=status.HTTP_404_NOT_FOUND)
        else:
            session = ChatSession.objects.create(investor=user)

        ChatMessage.objects.create(session=session, sender=ChatMessage.Sender.USER, message=text)

        ctx = fetch_investor_context(user, text)
        answer = generate_response(text, ctx)

        ChatMessage.objects.create(session=session, sender=ChatMessage.Sender.ASSISTANT, message=answer)

        out = {
            "session_id": session.id,
            "answer": answer,
        }
        return Response(out, status=status.HTTP_200_OK)

class InvestorChatStreamAPIView(APIView):
    renderer_classes = [EventStreamRenderer, JSONRenderer, BrowsableAPIRenderer]
    permission_classes = [permissions.AllowAny]
    throttle_classes = [InvestorThrottle]

    def options(self, request, *args, **kwargs):
        resp = Response(status=status.HTTP_200_OK)
        origin = request.META.get("HTTP_ORIGIN")
        if origin:
            resp["Access-Control-Allow-Origin"] = origin
        resp["Access-Control-Allow-Credentials"] = "true"
        resp["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Accept"
        resp["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        resp["Vary"] = "Origin"
        return resp

    def get(self, request, *args, **kwargs):
        origin = request.META.get("HTTP_ORIGIN")
        user = request.user
        logger = logging.getLogger("core.ai")
        if not (user and user.is_authenticated):
            resp = Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
            if origin:
                resp["Access-Control-Allow-Origin"] = origin
                resp["Access-Control-Allow-Credentials"] = "true"
                resp["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Accept"
                resp["Vary"] = "Origin"
            return resp
        if not getattr(user, "is_investor", False) and not getattr(user, "is_staff", False):
            resp = Response({"detail": "Investor access required."}, status=status.HTTP_403_FORBIDDEN)
            if origin:
                resp["Access-Control-Allow-Origin"] = origin
                resp["Access-Control-Allow-Credentials"] = "true"
                resp["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Accept"
                resp["Vary"] = "Origin"
            return resp
        text = strip_tags(str(request.GET.get("message", "")))[:2000].strip()
        sid = request.GET.get("session_id")
        if not text:
            return Response({"detail": "message is required"}, status=status.HTTP_400_BAD_REQUEST)
        if sid:
            try:
                session = ChatSession.objects.get(id=sid, investor=user)
            except ChatSession.DoesNotExist:
                return Response({"detail": "Invalid session"}, status=status.HTTP_404_NOT_FOUND)
        else:
            session = ChatSession.objects.create(investor=user)
        ChatMessage.objects.create(session=session, sender=ChatMessage.Sender.USER, message=text)

        def event_stream():
            seq = 0
            yield f"event: meta\ndata: {json.dumps({'session_id': str(session.id)})}\n\n".encode("utf-8")
            # Optional filters
            ids_param = request.GET.get("ids")
            ids_list = [x for x in (ids_param or "").split(",") if x]
            stage = request.GET.get("stage") or None
            try:
                min_score = int(request.GET.get("min_score")) if request.GET.get("min_score") else None
            except Exception:
                min_score = None
            try:
                limit = int(request.GET.get("limit")) if request.GET.get("limit") else 10
            except Exception:
                limit = 10
            ctx = fetch_investor_context(user, text, ids=ids_list or None, stage=stage, min_score=min_score, limit=limit)
            try:
                companies_count = len(ctx.get("companies") or [])
            except Exception:
                companies_count = 0
            logger.info(f"[stream] q='{text[:100]}' companies={companies_count} stage={stage} min_score={min_score} limit={limit}")
            structured = None
            try:
                structured = select_formatted_response(text, ctx)
            except Exception:
                structured = None
            if structured:
                content_acc = structured
                # SSE requires each line to be prefixed by 'data:' to be delivered correctly.
                for line in (structured.splitlines() or [""]):
                    seq += 1
                    yield f"id: {seq}\nevent: token\ndata: {line}\n\n".encode("utf-8")
                yield "event: done\ndata: {}\n\n".encode("utf-8")
                ChatMessage.objects.create(session=session, sender=ChatMessage.Sender.ASSISTANT, message=content_acc)
                return
            api_key = config("OPENAI_API_KEY", default="")
            content_acc = ""
            if not api_key or OpenAI is None:
                # Fallback without OpenAI: use non-stream generator
                ans = generate_response(text, ctx)
                content_acc = ans
                yield f"event: token\ndata: {ans}\n\n".encode("utf-8")
                yield "event: done\ndata: {}\n\n".encode("utf-8")
                ChatMessage.objects.create(session=session, sender=ChatMessage.Sender.ASSISTANT, message=content_acc)
                return
            try:
                # avoid proxy incompatibilities with httpx version
                try:
                    for k in ["HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy", "ALL_PROXY", "all_proxy"]:
                        if k in os.environ:
                            os.environ.pop(k, None)
                except Exception:
                    pass
                if httpx is not None:
                    http_client = httpx.Client(timeout=30)
                    client = OpenAI(api_key=api_key, http_client=http_client)
                else:
                    client = OpenAI(api_key=api_key)
                sys_prompt = SYSTEM_PROMPT
                # Simple unrelated guard pre-check
                ql = text.lower()
                invest_terms = ["startup", "startups", "company", "companies", "funding", "valuation", "mrr", "revenue", "invest", "investment", "cap table", "roi", "risk", "traction", "deal", "round", "growth", "users", "burn", "raise", "score", "stage", "portfolio", "list"]
                if not any(t in ql for t in invest_terms):
                    content_acc = UNRELATED_RESPONSE
                    yield f"event: token\ndata: {UNRELATED_RESPONSE}\n\n".encode("utf-8")
                    yield "event: done\ndata: {}\n\n".encode("utf-8")
                    ChatMessage.objects.create(session=session, sender=ChatMessage.Sender.ASSISTANT, message=content_acc)
                    return
                msgs = [
                    {"role": "system", "content": sys_prompt},
                    {"role": "user", "content": f"Question: {text}\n\nContext:\n{json.dumps(ctx)}"},
                ]
                stream = client.chat.completions.create(
                    model=config("OPENAI_MODEL", default="gpt-4o-mini"),
                    messages=msgs,
                    temperature=0.2,
                    max_tokens=400,
                    stream=True,
                )
                for part in stream:
                    try:
                        delta = part.choices[0].delta.content or ""
                    except Exception:
                        delta = ""
                    if delta:
                        content_acc += delta
                        seq += 1
                        yield f"id: {seq}\nevent: token\ndata: {delta}\n\n".encode("utf-8")
                yield "event: done\ndata: {}\n\n".encode("utf-8")
            except Exception as e:
                logger.error(f"[stream] openai_error: {e}")
                # Fallback to non-stream generator (may use Gemini if configured)
                try:
                    ans = generate_response(text, ctx)
                except Exception as ge:
                    logger.error(f"[stream] fallback_error: {ge}")
                    ans = "Information not available in platform records."
                content_acc = ans
                seq += 1
                yield f"id: {seq}\nevent: token\ndata: {ans}\n\n".encode("utf-8")
                yield "event: done\ndata: {}\n\n".encode("utf-8")
            finally:
                ChatMessage.objects.create(session=session, sender=ChatMessage.Sender.ASSISTANT, message=content_acc)

        resp = StreamingHttpResponse(event_stream(), content_type="text/event-stream")
        resp["Cache-Control"] = "no-cache"
        resp["X-Accel-Buffering"] = "no"
        origin = request.META.get("HTTP_ORIGIN")
        if origin:
            resp["Access-Control-Allow-Origin"] = origin
            resp["Access-Control-Allow-Credentials"] = "true"
            resp["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Accept"
            resp["Vary"] = "Origin"
            resp["Access-Control-Expose-Headers"] = "Content-Type"
        return resp


class InvestorChatSessionsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        if not getattr(user, "is_investor", False) and not getattr(user, "is_staff", False):
            return Response({"detail": "Investor access required."}, status=status.HTTP_403_FORBIDDEN)
        qs = ChatSession.objects.filter(investor=user).order_by("-created_at")[:20]
        data = []
        for s in qs:
            last = s.messages.order_by("-created_at").first()
            data.append({
                "id": str(s.id),
                "created_at": s.created_at,
                "last_message": last.message if last else "",
                "last_sender": last.sender if last else None,
                "last_at": last.created_at if last else s.created_at,
            })
        return Response({"results": data}, status=status.HTTP_200_OK)


class InvestorChatSessionDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, id, *args, **kwargs):
        user = request.user
        if not getattr(user, "is_investor", False) and not getattr(user, "is_staff", False):
            return Response({"detail": "Investor access required."}, status=status.HTTP_403_FORBIDDEN)
        try:
            s = ChatSession.objects.get(id=id, investor=user)
        except ChatSession.DoesNotExist:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        msgs = [{"id": m.id, "sender": m.sender, "message": m.message, "created_at": m.created_at} for m in s.messages.all()]
        return Response({"id": str(s.id), "created_at": s.created_at, "messages": msgs}, status=status.HTTP_200_OK)


class AIHealthAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        out = {
            "openai": {"configured": False, "ok": False, "error": None, "model": None},
            "gemini": {"configured": False, "ok": False, "error": None, "model": None},
        }
        # OpenAI
        okey = config("OPENAI_API_KEY", default="")
        if okey and OpenAI is not None:
            out["openai"]["configured"] = True
            try:
                try:
                    for k in ["HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy", "ALL_PROXY", "all_proxy"]:
                        if k in os.environ:
                            os.environ.pop(k, None)
                except Exception:
                    pass
                if httpx is not None:
                    http_client = httpx.Client(proxies=None, timeout=10)
                    client = OpenAI(api_key=okey, http_client=http_client)
                else:
                    client = OpenAI(api_key=okey)
                _ = client.models.list()
                out["openai"]["ok"] = True
                out["openai"]["model"] = config("OPENAI_MODEL", default="gpt-4o-mini")
            except Exception as e:
                out["openai"]["error"] = str(e)
        # Gemini
        gkey = config("GEMINI_API_KEY", default="")
        if gkey and genai is not None:
            out["gemini"]["configured"] = True
            try:
                genai.configure(api_key=gkey)
                _ = genai.list_models()
                out["gemini"]["ok"] = True
                out["gemini"]["model"] = config("GEMINI_MODEL", default="models/gemini-1.5-flash-latest")
            except Exception as e:
                out["gemini"]["error"] = str(e)
        return Response(out, status=status.HTTP_200_OK)
