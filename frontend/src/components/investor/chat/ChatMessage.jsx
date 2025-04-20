import React, { useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Scans a text string for known company names (longest-match first) and
 * returns an array of React nodes with clickable company pills inserted.
 */
function linkifyCompanies(text, companyMap, onCompanyClick) {
  if (!companyMap || !onCompanyClick || !text) return text;

  // Sort by name length desc so longer names match before substrings
  const entries = Object.entries(companyMap).sort((a, b) => b[0].length - a[0].length);
  if (!entries.length) return text;

  // Build a single regex alternating all company names (escaped)
  const pattern = new RegExp(
    `(${entries.map(([n]) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi"
  );

  const parts = text.split(pattern);
  return parts.map((part, i) => {
    const lower = part.toLowerCase();
    const entry = companyMap[lower];
    if (entry) {
      return (
        <button
          key={i}
          onClick={(e) => { e.stopPropagation(); onCompanyClick(entry.id); }}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 hover:bg-indigo-500/30 hover:text-indigo-200 transition-all duration-150 cursor-pointer font-medium text-[0.8em]"
          title={`View ${entry.name} Deal Report`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
          {part}
        </button>
      );
    }
    return part;
  });
}

export default function ChatMessage({ sender, message, companyMap = {}, onCompanyClick }) {
  const mine = sender === "user";

  const makeTextRenderer = useCallback(
    (node) => {
      const text = node.children;
      if (typeof text !== "string" || mine) return text;
      return linkifyCompanies(text, companyMap, onCompanyClick);
    },
    [companyMap, onCompanyClick, mine]
  );

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"} mb-4`}>
      <div 
        className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-xl transition-all duration-300 ${
          mine 
            ? "bg-white/[0.08] border border-white/15 ml-12" 
            : "bg-gradient-to-br from-[#1a1f2e] to-[#101522] border border-white/10 mr-12"
        } ring-1 ring-black/20`}
      >
        <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${mine ? "text-white/40" : "text-indigo-400"}`}>
          {mine ? "Transmission / You" : <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" /> DealScope AI Analyst</span>}
        </div>
        
        <div className="prose prose-invert prose-sm max-w-none text-white/90 leading-relaxed">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({node, ...props}) => (
                <div className="my-4 overflow-x-auto rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm">
                  <table className="w-full border-collapse text-xs" {...props} />
                </div>
              ),
              thead: ({node, ...props}) => <thead className="bg-white/5 text-indigo-300" {...props} />,
              th: ({node, ...props}) => <th className="px-4 py-2 text-left font-bold border-b border-white/10" {...props} />,
              td: ({node, ...props}) => <td className="px-4 py-2 border-b border-white/5 text-white/80" {...props} />,
              h1: ({node, ...props}) => <h1 className="text-lg font-bold text-white mb-2 mt-4" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-base font-bold text-white mb-2 mt-4" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-sm font-bold text-white/90 mb-1 mt-3" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 my-2" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />,
              li: ({node, ...props}) => <li className="text-white/80" {...props} />,
              p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
              strong: ({node, ...props}) => <strong className="text-indigo-300 font-bold" {...props} />,
              a: ({node, ...props}) => <a className="text-indigo-400 underline hover:text-indigo-300" target="_blank" rel="noreferrer" {...props} />,
              // Intercept plain text nodes to make company names clickable
              text: (node) => makeTextRenderer(node),
            }}
          >
            {message}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
