import { logAi } from "../utils/logger";
import { deriveStrengths, deriveWeaknesses, deriveSummary } from "../utils/aiFallback";
import api from "./api";

type NarrativeResponse = {
  summary?: string;
  strengths?: string[];
  risks?: string[];
};

const TIMEOUT_MS = Number(import.meta.env.VITE_AI_TIMEOUT_MS || 15000);
const RETRIES = Number(import.meta.env.VITE_AI_RETRIES || 2);

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    const res = await p;
    return res;
  } finally {
    clearTimeout(t);
  }
}

async function callBackendNarrative(payload: any, requestId: string): Promise<NarrativeResponse> {
  const start = performance.now();
  logAi({ type: "ai_request_start", requestId, source: "backend", ts: Date.now() });
  const res = await api.post("/ai/narrative/", payload);
  const duration = performance.now() - start;
  logAi({ type: "ai_request_success", requestId, source: "backend", durationMs: Math.round(duration), ts: Date.now() });
  return res.data as NarrativeResponse;
}

export const aiService = {
  async generateNarrative(company: any, score: number, sections: any[]): Promise<NarrativeResponse> {
    const payload = { company, score, sections };
    const requestId = Math.random().toString(36).slice(2);
    let attempt = 0;
    const backoff = [500, 1500, 3000];
    while (attempt <= RETRIES) {
      try {
        const p = callBackendNarrative(payload, requestId);
        return await withTimeout(p, TIMEOUT_MS);
      } catch (err: any) {
        const status = err?.status;
        const msg = String(err?.message || "");
        const isRate = status === 429;
        const isTimeout = /timeout|Network Error|abort/i.test(msg);
        if (attempt < RETRIES && (isRate || isTimeout)) {
          await new Promise((r) => setTimeout(r, backoff[attempt] || 1000));
          attempt++;
          continue;
        }
        break;
      }
    }
    logAi({ type: "ai_fallback_local", requestId, ts: Date.now() });
    return {
      summary: deriveSummary(company, score),
      strengths: deriveStrengths(company),
      risks: deriveWeaknesses(company),
    };
  },
};
