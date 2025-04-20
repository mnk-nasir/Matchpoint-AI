import api from "./api";
import { getAccessToken, getRefreshToken, setAccessToken, clearAccessToken, clearRefreshToken } from "../utils/auth";

export const chatService = {
  async send({ message, session_id }) {
    const res = await api.post("/investor/chat", { message, session_id });
    return res.data;
  },
  async *stream({ message, session_id, filters = {} }) {
    const baseURL = (api && api.defaults && api.defaults.baseURL) || (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || "";
    const qs = new URLSearchParams();
    qs.set("message", message);
    if (session_id) qs.set("session_id", session_id);
    if (filters.ids && Array.isArray(filters.ids)) qs.set("ids", filters.ids.join(","));
    if (filters.stage) qs.set("stage", filters.stage);
    if (typeof filters.min_score === "number") qs.set("min_score", String(filters.min_score));
    if (typeof filters.limit === "number") qs.set("limit", String(filters.limit));
    const url = `${String(baseURL).replace(/\/+$/, "")}/investor/chat/stream?${qs.toString()}`;
    let token = getAccessToken();
    let res = await fetch(url, {
      method: "GET",
      mode: "cors",
      headers: {
        "Accept": "text/event-stream",
        "Authorization": token ? `Bearer ${token}` : "",
      },
      credentials: "omit",
    });
    if (!res.ok && res.status === 401) {
      try {
        const refresh = getRefreshToken();
        if (refresh) {
          const rb = String(baseURL).replace(/\/+$/, "");
          const rf = await fetch(`${rb}/auth/token/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh }),
          });
          if (rf.ok) {
            const data = await rf.json();
            const newAccess = data && data.access;
            if (newAccess) {
              setAccessToken(newAccess);
              token = newAccess;
              res = await fetch(url, {
                method: "GET",
                mode: "cors",
                headers: {
                  "Accept": "text/event-stream",
                  "Authorization": `Bearer ${token}`,
                },
                credentials: "omit",
              });
            }
          } else {
            clearAccessToken();
            clearRefreshToken();
          }
        }
      } catch {
      }
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Stream error ${res.status}: ${text || res.statusText}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";
      for (const chunk of parts) {
        const lines = chunk.split("\n");
        let event = null;
        let data = "";
        let id = null;
        for (const line of lines) {
          if (line.startsWith("id:")) id = Number(line.slice(3).trim());
          else if (line.startsWith("event:")) event = line.slice(6).trim();
          else if (line.startsWith("data:")) data += line.slice(5);
        }
        yield { event, data, id };
      }
    }
  },
};
