from typing import Dict, Any, List, Tuple, Optional
import difflib
import os
import logging
from decouple import config
try:
    from openai import OpenAI  # optional; only used if API key present
except Exception:
    OpenAI = None
try:
    import google.generativeai as genai  # optional Gemini fallback
except Exception:
    genai = None
try:
    import httpx  # to construct a no-proxy HTTP client for OpenAI
except Exception:
    httpx = None

def _clear_proxy_env():
    try:
        for k in ["HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy", "ALL_PROXY", "all_proxy"]:
            if k in os.environ:
                os.environ.pop(k, None)
    except Exception:
        pass

def _make_openai_client(api_key: str):
    _clear_proxy_env()
    try:
        if httpx is not None:
            http_client = httpx.Client(timeout=30)
            return OpenAI(api_key=api_key, http_client=http_client)
    except Exception:
        pass
    return OpenAI(api_key=api_key)
SYSTEM_PROMPT = """
You are DealScope AI, an institutional-grade investment intelligence assistant.

Your role is to analyze startup data available on the platform and provide structured investment insights.

Core Rules:
- Only answer using provided platform startup data.
- Never fabricate or guess financial numbers.
- If requested data is not available, respond with:
  'Information not available in platform records.'
- If a question is unrelated to startups, investments, or companies on this platform, respond with the refusal message.
- Maintain a professional, analytical, investor-style tone.
- Avoid casual or conversational language.

Query Understanding:
Users may ask different types of questions. Identify the intent and respond accordingly.

Possible request types include:
1. Startup ranking (e.g., "top startups", "highest score companies")
2. Company financial reports (MRR, users, customers)
3. Founder information
4. Startup comparisons
5. Investment risk analysis
6. Startup overview or profile
7. Metrics analysis (growth, revenue, traction)

Context Rules:
- If 'selected_startup' exists in the context, assume the user refers to that startup unless a different company is explicitly mentioned.
- If multiple startups are requested, compare them objectively using available metrics.
- Prefer structured database metrics over document-based claims if there is a conflict.

Response Structure:

If the request is about a specific startup:

Startup Overview
Financial Metrics
Risk Analysis
Key Insights

If the request is about multiple startups:

Ranking or Comparison Summary
Key Metrics Table
Investment Insights

Formatting Rules:
- Use clear section headings.
- Avoid duplicated companies.
- Ensure responses are concise but informative.
- Prioritize clarity for investors reviewing startup opportunities.
"""
UNRELATED_RESPONSE = "I am an investment assistant and can only help with startup and investment-related queries within this platform."

def _looks_unrelated(q: str) -> bool:
    ql = (q or "").lower()
    invest_terms = ["startup", "startups", "company", "companies", "funding", "valuation", "mrr", "revenue", "invest", "investment", "cap table", "roi", "risk", "traction", "deal", "round", "growth", "users", "burn", "raise", "score", "stage", "portfolio", "list"]
    return not any(t in ql for t in invest_terms)


def fallback_narrative(company: Dict[str, Any], score: Any) -> str:
    name = (company or {}).get("name") or (company or {}).get("company_name") or "The company"
    sc = score if isinstance(score, (int, float, str)) else ""
    parts = [
        f"{name} overview",
        f"- Platform score: {sc}" if sc != "" else "- Platform score: N/A",
        "- This narrative is generated from available platform records only.",
    ]
    return "\n".join(parts)


def generate_narrative(company: Dict[str, Any], score: Any, sections: Any | None = None) -> str:
    # For stability and to avoid external calls for this endpoint, use fallback
    return fallback_narrative(company, score)


def _simple_context_summary(ctx: Dict[str, Any]) -> str:
    startups: List[Dict[str, Any]] = _extract_startups(ctx)
    if not startups:
        return "Information not available in platform records."
    lines = []
    top = startups[: min(5, len(startups))]
    for s in top:
        name = s.get("company_name") or s.get("name") or "—"
        raw_score = s.get("total_score")
        if raw_score is None:
            raw_score = s.get("score")
        score = raw_score if isinstance(raw_score, (int, float)) else "—"
        stage = s.get("stage") or "—"
        lines.append(f"- {name}: score {score}, stage {stage}")
    return "Summary of visible startups:\n" + "\n".join(lines)

def _companies_list(ctx: Dict[str, Any]) -> str:
    startups: List[Dict[str, Any]] = _extract_startups(ctx)
    if not startups:
        return "No companies found in platform records."
    lines = []
    for s in startups:
        name = s.get("company_name") or s.get("name") or "—"
        raw_score = s.get("total_score")
        if raw_score is None:
            raw_score = s.get("score")
        score = raw_score if isinstance(raw_score, (int, float)) else "—"
        stage = s.get("stage") or "—"
        lines.append(f"- {name} (score {score}, stage {stage})")
    return "Company list:\n" + "\n".join(lines)

def _unique_companies(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen = set()
    out: List[Dict[str, Any]] = []
    for s in items:
        key = s.get("id") or (s.get("company_name") or s.get("name"), s.get("stage"), s.get("score") or s.get("total_score"))
        if key in seen:
            continue
        seen.add(key)
        out.append(s)
    return out

def _top_companies(ctx: Dict[str, Any], top_n: int = 3, min_score: Optional[float] = None) -> str:
    startups: List[Dict[str, Any]] = _extract_startups(ctx)
    if not startups:
        return "No companies found in platform records."
    def score_of(s: Dict[str, Any]) -> float:
        v = s.get("total_score")
        if v is None:
            v = s.get("score")
        try:
            return float(v)
        except Exception:
            return -1.0
    deduped = _unique_companies(startups)
    if min_score is not None:
        try:
            threshold = float(min_score)
            deduped = [s for s in deduped if score_of(s) >= threshold]
        except Exception:
            pass
    ranked = sorted(deduped, key=score_of, reverse=True)
    top = ranked[: max(1, min(top_n, len(ranked)))]
    lines = []
    for s in top:
        name = s.get("company_name") or s.get("name") or "—"
        sc = score_of(s)
        stage = s.get("stage") or "—"
        lines.append(f"- {name} (score {sc}, stage {stage})")
    heading = "Top companies by score"
    if min_score is not None:
        try:
            ms = int(min_score)
            heading += f" ≥ {ms}"
        except Exception:
            pass
    return heading + ":\n" + "\n".join(lines)

def _format_rank_table(ctx: Dict[str, Any], top_n: int = 10, min_score: Optional[float] = None) -> str:
    startups: List[Dict[str, Any]] = _extract_startups(ctx)
    if not startups:
        return "No companies found in platform records."
    def score_of(s: Dict[str, Any]) -> float:
        v = s.get("total_score")
        if v is None:
            v = s.get("score")
        try:
            return float(v)
        except Exception:
            return -1.0
    deduped = _unique_companies(startups)
    if min_score is not None:
        try:
            th = float(min_score)
            deduped = [s for s in deduped if score_of(s) >= th]
        except Exception:
            pass
    ranked = sorted(deduped, key=score_of, reverse=True)[: max(1, min(top_n, len(deduped)))]
    header = "Rank | Company | Score | Stage | Country | Rating"
    rule = "-|-|-|-|-|-"
    rows = []
    for idx, s in enumerate(ranked, start=1):
        name = s.get("company_name") or s.get("name") or "—"
        sc = score_of(s)
        rows.append(" | ".join([
            str(idx),
            _fmt_val(name),
            _fmt_val(sc),
            _fmt_val(s.get("stage")),
            _fmt_val(s.get("country")),
            _fmt_val(s.get("rating")),
        ]))
    title = "Top companies by score"
    if min_score is not None:
        try:
            title += f" ≥ {int(min_score)}"
        except Exception:
            pass
    return f"{title}:\n{header}\n{rule}\n" + "\n".join(rows)

def _extract_startups(ctx: Dict[str, Any]) -> List[Dict[str, Any]]:
    startups: List[Dict[str, Any]] = []
    if isinstance(ctx, dict):
        if isinstance(ctx.get("companies"), list):
            startups = ctx.get("companies")  # type: ignore
        elif isinstance(ctx.get("startups"), list):
            startups = ctx.get("startups")  # type: ignore
        elif isinstance(ctx.get("results"), list):
            startups = ctx.get("results")  # type: ignore
    return startups

def _detect_intent(question: str) -> Tuple[str, Optional[str]]:
    ql = (question or "").lower()
    if any(k in ql for k in ["chart", "graph", "plot"]):
        return "unsupported", "chart"
    if any(k in ql for k in ["table", "tabular", "grid", "columns"]):
        return "table", None
    if any(k in ql for k in ["compare", "versus", "vs", "difference"]):
        return "compare", None
    if ("list" in ql) or any(k in ql for k in ["bullet", "bulleted", "enumerate"]):
        return "list", None
    if any(k in ql for k in ["top", "best", "rank", "ranking", "recommend", "suggest"]):
        return "rank", None
    if any(k in ql for k in ["about ", " about", "details", "detail", "information on", "info on", "tell me about", "who is", "what does"]):
        return "company_profile", None
    metrics = ["mrr", "revenue", "users", "active users", "paying customers", "burn", "burn rate", "stage", "score", "rating", "country", "valuation", "amount raising", "funding", "growth"]
    if any(k in ql for k in metrics):
        return "company_metric", None
    if any(k in ql for k in ["summary", "overview"]):
        return "summary", None
    return "chat", None

def _fmt_val(v: Any) -> str:
    if v is None:
        return "—"
    return str(v)

def _format_table(ctx: Dict[str, Any]) -> str:
    startups = _extract_startups(ctx)
    if not startups:
        return "No companies found in platform records."
    startups = _unique_companies(startups)
    headers = ["Name", "Stage", "Score", "MRR", "Country", "Rating"]
    rows: List[List[str]] = []
    for s in startups:
        name = s.get("company_name") or s.get("name") or "—"
        raw_score = s.get("total_score")
        if raw_score is None:
            raw_score = s.get("score")
        mrr = s.get("mrr")
        rows.append([
            _fmt_val(name),
            _fmt_val(s.get("stage")),
            _fmt_val(raw_score),
            _fmt_val(mrr),
            _fmt_val(s.get("country")),
            _fmt_val(s.get("rating")),
        ])
    out_lines = []
    header = " | ".join(headers)
    rule = "-|-|-|-|-|-"
    out_lines.append(header)
    out_lines.append(rule)
    for r in rows:
        out_lines.append(" | ".join(r))
    return "Company Table:\n" + "\n".join(out_lines)

def _format_list(ctx: Dict[str, Any]) -> str:
    startups = _extract_startups(ctx)
    if not startups:
        return "No companies found in platform records."
    lines = []
    for s in startups:
        name = s.get("company_name") or s.get("name") or "—"
        raw_score = s.get("total_score")
        if raw_score is None:
            raw_score = s.get("score")
        stage = s.get("stage") or "—"
        lines.append(f"- {name}: stage {stage}, score {raw_score if raw_score is not None else '—'}")
    return "Company List:\n" + "\n".join(lines)

def _format_compare(ctx: Dict[str, Any], top_n: int = 2) -> str:
    startups = _extract_startups(ctx)
    if not startups:
        return "No companies found in platform records."
    def score_of(s: Dict[str, Any]) -> float:
        v = s.get("total_score")
        if v is None:
            v = s.get("score")
        try:
            return float(v)
        except Exception:
            return -1.0
    ranked = sorted(startups, key=score_of, reverse=True)[:max(1, min(top_n, len(startups)))]
    if len(ranked) == 1:
        return _simple_context_summary({"companies": ranked})
    fields = ["Stage", "Score", "MRR", "Country", "Rating"]
    names = [ (x.get("company_name") or x.get("name") or "—") for x in ranked ]
    lines = []
    header = "Metric | " + " | ".join(names)
    rule = "-|"+ "|".join(["-"]*len(names))
    lines.append(header)
    lines.append(rule)
    for field in fields:
        row = [field]
        for s in ranked:
            if field == "Stage":
                row.append(_fmt_val(s.get("stage")))
            elif field == "Score":
                v = s.get("total_score")
                if v is None:
                    v = s.get("score")
                row.append(_fmt_val(v))
            elif field == "MRR":
                row.append(_fmt_val(s.get("mrr")))
            elif field == "Country":
                row.append(_fmt_val(s.get("country")))
            elif field == "Rating":
                row.append(_fmt_val(s.get("rating")))
        lines.append(" | ".join(row))
    return "Comparison:\n" + "\n".join(lines)

def _norm_text(x: str) -> str:
    return "".join(ch.lower() if ch.isalnum() or ch.isspace() else " " for ch in (x or "")).split()

def _norm_name(x: str) -> str:
    return "".join(ch.lower() if ch.isalnum() else " " for ch in (x or "")).replace("  ", " ").strip()

def _name_similarity(a: str, b: str) -> float:
    an = _norm_name(a)
    bn = _norm_name(b)
    if not an or not bn:
        return 0.0
    # Token overlap
    at = set(an.split())
    bt = set(bn.split())
    inter = len(at & bt)
    union = len(at | bt) or 1
    jacc = inter / union
    # Sequence ratio
    seq = difflib.SequenceMatcher(a=an, b=bn).ratio()
    # Combined score gives more weight to sequence but keeps token overlap signal
    return 0.6 * seq + 0.4 * jacc

def _find_company_by_name(question: str, ctx: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    startups = _extract_startups(ctx)
    if not startups:
        return None
    q_tokens = _norm_text(question)
    if not q_tokens:
        return None
    best = None
    best_score = 0
    for s in startups:
        name = s.get("company_name") or s.get("name") or ""
        n_tokens = _norm_text(name)
        if not n_tokens:
            continue
        overlap = len([t for t in n_tokens if t in q_tokens])
        if overlap > best_score or (overlap == best_score and len(n_tokens) < (len(best.get("name_tokens", [])) if best else 1e9)):
            best = {"data": s, "name_tokens": n_tokens}
            best_score = overlap
    if best_score == 0:
        return None
    return best["data"]

def _find_companies_by_names(question: str, ctx: Dict[str, Any]) -> List[Dict[str, Any]]:
    startups = _extract_startups(ctx)
    if not startups:
        return []
    q = (question or "")
    q = q.replace(" vs ", " and ")
    # Split by delimiters while keeping order
    parts: List[str] = []
    for chunk in q.split(","):
        sub = [p.strip() for p in chunk.split(" and ") if p.strip()]
        parts.extend(sub)
    # Remove obvious non-name phrases
    stop_phrases = {"compare", "between", "the", "companies", "company", "startups", "startup", "top", "of", "and"}
    candidates = []
    for p in parts:
        tokens = [t for t in _norm_text(p) if t not in stop_phrases]
        if tokens:
            candidates.append(" ".join(tokens))
    # Match candidates to startups by token overlap, keeping order and uniqueness
    matches: List[Dict[str, Any]] = []
    used_ids = set()
    for cand in candidates:
        best_s = None
        best_score = 0.0
        for s in startups:
            sid = s.get("id") or (s.get("company_name") or s.get("name"))
            if sid in used_ids:
                continue
            sname = (s.get("company_name") or s.get("name") or "")
            score = _name_similarity(cand, sname)
            if score > best_score:
                best_score = score
                best_s = s
        # Require a reasonable similarity threshold to avoid wrong matches
        if best_s and best_score >= 0.55:
            used_ids.add(best_s.get("id") or (best_s.get("company_name") or best_s.get("name")))
            matches.append(best_s)
    return matches

def _format_compare_selected(selected: List[Dict[str, Any]]) -> str:
    if not selected:
        return "No companies found in platform records."
    if len(selected) == 1:
        return _simple_context_summary({"companies": selected})
    fields = ["Stage", "Score", "MRR", "Country", "Rating"]
    names = [ (x.get("company_name") or x.get("name") or "—") for x in selected ]
    lines = []
    header = "Metric | " + " | ".join(names)
    rule = "-|"+ "|".join(["-"]*len(names))
    lines.append(header)
    lines.append(rule)
    for field in fields:
        row = [field]
        for s in selected:
            if field == "Stage":
                row.append(_fmt_val(s.get("stage")))
            elif field == "Score":
                v = s.get("total_score")
                if v is None:
                    v = s.get("score")
                row.append(_fmt_val(v))
            elif field == "MRR":
                row.append(_fmt_val(s.get("mrr")))
            elif field == "Country":
                row.append(_fmt_val(s.get("country")))
            elif field == "Rating":
                row.append(_fmt_val(s.get("rating")))
        lines.append(" | ".join(row))
    return "Comparison:\n" + "\n".join(lines)

def _company_profile(ctx: Dict[str, Any], company: Dict[str, Any]) -> str:
    name = company.get("company_name") or company.get("name") or "—"
    v_score = company.get("total_score")
    if v_score is None:
        v_score = company.get("score")
    lines = []
    lines.append("Company Profile:")
    lines.append(f"- Name: {name}")
    lines.append(f"- Stage: {_fmt_val(company.get('stage'))}")
    lines.append(f"- Score: {_fmt_val(v_score)}")
    lines.append(f"- MRR: {_fmt_val(company.get('mrr'))}")
    lines.append(f"- Active users: {_fmt_val(company.get('active_users'))}")
    lines.append(f"- Paying customers: {_fmt_val(company.get('paying_customers'))}")
    lines.append(f"- Burn rate: {_fmt_val(company.get('burn_rate'))}")
    lines.append(f"- Amount raising: {_fmt_val(company.get('amount_raising'))}")
    lines.append(f"- Country: {_fmt_val(company.get('country'))}")
    lines.append(f"- Rating: {_fmt_val(company.get('rating'))}")
    return "\n".join(lines)

def _company_metric_answer(question: str, ctx: Dict[str, Any]) -> Optional[str]:
    s = _find_company_by_name(question, ctx)
    if not s:
        return None
    ql = (question or "").lower()
    name = s.get("company_name") or s.get("name") or "—"
    def get_score():
        v = s.get("total_score")
        if v is None:
            v = s.get("score")
        return v
    if "mrr" in ql or "revenue" in ql:
        return f"{name} MRR: {_fmt_val(s.get('mrr'))}"
    if "users" in ql and "active" in ql:
        return f"{name} active users: {_fmt_val(s.get('active_users'))}"
    if "paying" in ql or "customers" in ql:
        return f"{name} paying customers: {_fmt_val(s.get('paying_customers'))}"
    if "burn" in ql:
        return f"{name} burn rate: {_fmt_val(s.get('burn_rate'))}"
    if "amount" in ql and "raising" in ql:
        return f"{name} amount raising: {_fmt_val(s.get('amount_raising'))}"
    if "stage" in ql:
        return f"{name} stage: {_fmt_val(s.get('stage'))}"
    if "score" in ql or "rating" in ql:
        return f"{name} score: {_fmt_val(get_score())}, rating: {_fmt_val(s.get('rating'))}"
    if "country" in ql or "location" in ql:
        return f"{name} country: {_fmt_val(s.get('country'))}"
    return _company_profile(ctx, s)

def select_formatted_response(question: str, context: Dict[str, Any]) -> Optional[str]:
    """
    Returns a deterministic formatted string if we can satisfy the query from platform data
    without model calls. Otherwise returns None to let model handle it.
    """
    fmt, unsupported = _detect_intent(question)
    if fmt in {"company_profile", "company_metric"}:
        ans = _company_metric_answer(question, context)
        if ans:
            return ans
        # Fallback: if question mentions ranking keywords, switch to rank table
        ql = (question or "").lower()
        if any(k in ql for k in ["top", "best", "rank", "ranking"]):
            fmt = "rank"
        else:
            fmt = "summary"
    if fmt == "chat":
        return None
    startups = _extract_startups(context)
    if unsupported:
        base = f"Requested format '{unsupported}' is not supported. Showing a table instead."
        body = _format_table(context) if startups else "No companies found in platform records."
        return base + "\n\n" + body
    if fmt in {"table", "list", "compare", "rank", "summary"}:
        if not startups:
            return "No companies found in platform records."
        top_n = None
        min_score = None
        try:
            import re
            ql = (question or "").lower()
            m = re.search(r"top\s+(\d+)", ql)
            if m:
                top_n = int(m.group(1))
            ms = re.search(r"(?:score|scores)\s+(?:more|above|greater)\s+(?:than|that)\s*(\d+)", ql)
            if ms:
                min_score = float(ms.group(1))
        except Exception:
            pass
        if fmt == "table":
            return _format_table(context)
        if fmt == "list":
            return _format_list(context)
        if fmt == "compare":
            # Try to match companies mentioned by name in the question
            selected = _find_companies_by_names(question, context)
            if len(selected) >= 2:
                return _format_compare_selected(selected)
            return _format_compare(context)
        if fmt == "rank":
            n = top_n if isinstance(top_n, int) and top_n > 0 else 3
            # Return a clean ranked table matching the requested format
            return _format_rank_table(context, top_n=n, min_score=min_score)
        if fmt == "summary":
            return _simple_context_summary(context)
    return None

def generate_response(question: str, context: Dict[str, Any]) -> str:
    logger = logging.getLogger("core.ai")
    if _looks_unrelated(question):
        logger.info(f"[answer] unrelated q='{(question or '')[:100]}'")
        return UNRELATED_RESPONSE
    # Try deterministic formatting first for structured requests
    try:
        deterministic = select_formatted_response(question, context)
        if deterministic:
            return deterministic
    except Exception as _:
        pass
    api_key = config("OPENAI_API_KEY", default="")
    # No API key: return deterministic, platform-only summary
    if not api_key or OpenAI is None:
        ql = (question or "").lower()
        companies_count = 0
        try:
            companies_count = len(context.get("companies") or [])
        except Exception:
            companies_count = 0
        logger.info(f"[answer] fallback q='{(question or '')[:80]}' companies={companies_count}")
        deterministic = select_formatted_response(question, context)
        if deterministic:
            return deterministic
        return _simple_context_summary(context)
    # Guardrails: short input, safe defaults
    safe_question = (question or "")[:1000]
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Question: {safe_question}\n\nContext:\n{context}"},
    ]
    try:
        client = _make_openai_client(api_key)
        resp = client.chat.completions.create(
            model=config("OPENAI_MODEL", default="gpt-4o-mini"),
            messages=messages,
            temperature=0.2,
            max_tokens=400,
        )
        content = resp.choices[0].message.content.strip()
        companies_count = 0
        try:
            companies_count = len(context.get("companies") or [])
        except Exception:
            companies_count = 0
        logger.info(f"[answer] openai_ok tokens={len(content)} companies={companies_count}")
        return content or "Information not available in platform records."
    except Exception as e:
        logger.error(f"[answer] openai_error: {e}")
        # Try Gemini fallback if configured
        gem_key = config("GEMINI_API_KEY", default="")
        if gem_key and genai is not None:
            try:
                genai.configure(api_key=gem_key)
                model_name = config("GEMINI_MODEL", default="gemini-1.5-flash")
                model = genai.GenerativeModel(model_name)
                prompt = f"{SYSTEM_PROMPT}\n\nQuestion: {safe_question}\n\nContext:\n{context}"
                r = model.generate_content(prompt)
                content = (getattr(r, "text", None) or "").strip()
                if not content and hasattr(r, "candidates") and r.candidates:
                    parts = []
                    try:
                        for c in r.candidates:
                            if hasattr(c, "content") and hasattr(c.content, "parts"):
                                for p in c.content.parts:
                                    parts.append(str(getattr(p, "text", "") or ""))
                    except Exception:
                        pass
                    content = "\n".join([x for x in parts if x]).strip()
                if content:
                    logger.info("[answer] gemini_ok")
                    return content
            except Exception as ge:
                logger.error(f"[answer] gemini_error: {ge}")
        return _simple_context_summary(context)
