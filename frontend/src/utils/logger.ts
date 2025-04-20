export type AiLogEvent =
  | { type: "ai_request_start"; requestId: string; model?: string; source: "backend" | "openai"; ts: number }
  | { type: "ai_request_success"; requestId: string; durationMs: number; source: "backend" | "openai"; ts: number }
  | {
    type: "ai_request_error";
    requestId: string;
    source: "backend" | "openai";
    ts: number;
    code?: number | string;
    message?: string;
  }
  | { type: "ai_fallback_local"; requestId: string; ts: number };

export function logAi(event: AiLogEvent) {
  try {
    // Basic console logging
    // eslint-disable-next-line no-console
    console.info("[AI]", event);
    // Dispatch a custom event for any external telemetry hook
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent("ai-log", { detail: event }));
    }
  } catch {
    // noop
  }
}

