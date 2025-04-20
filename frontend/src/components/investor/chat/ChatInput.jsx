import React, { useState } from "react";
import { Send } from "lucide-react";

export default function ChatInput({ onSend, loading }) {
  const [text, setText] = useState("");
  const send = () => {
    const msg = text.trim();
    if (!msg) return;
    onSend(msg);
    setText("");
  };
  return (
    <div className="flex items-center gap-2 p-3 border-t border-white/10 bg-white/[0.02]">
      <div className="flex-1 flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-3 py-2">
        <input
          className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
          placeholder="Ask about risk, valuation, financials…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading}
          aria-label="Send"
          className="rounded-full p-2 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
