from rest_framework.renderers import BaseRenderer


class EventStreamRenderer(BaseRenderer):
    media_type = "text/event-stream"
    format = "sse"

    def render(self, data, accepted_media_type=None, renderer_context=None):
        # DRF requires a render method for negotiation, but our view
        # returns a StreamingHttpResponse, so this is a no-op fallback.
        # Ensure bytes for safety.
        if data is None:
            return b""
        if isinstance(data, (bytes, bytearray)):
            return data
        return (str(data) or "").encode("utf-8")

