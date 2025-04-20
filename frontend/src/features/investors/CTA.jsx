import React from "react";
import { Link } from "react-router-dom";

export default function InvestorsCTA() {
  return (
    <div className="mt-12 flex items-center justify-center">
      <Link
        to="/investors/interest"
        className="rounded-full px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(167,139,250,0.25)] transition-all"
        style={{
          fontFamily: "'Space Mono', monospace",
          backgroundImage: "linear-gradient(90deg,#a78bfa,#00aaff)",
          color: "#050a12",
          border: "1px solid rgba(255,255,255,0.12)"
        }}
      >
        Register Interest
      </Link>
    </div>
  );
}
