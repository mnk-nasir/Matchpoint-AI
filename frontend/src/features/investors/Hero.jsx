import React from "react";

export default function InvestorsHero() {
  return (
    <header className="relative w-full">
      <div
        className="relative h-[58vh] md:h-[66vh] w-full bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=2000&q=60')",
          filter: "grayscale(8%)",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-[#050a12]/70" />
      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto max-w-5xl px-6 w-full">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-[12px] uppercase tracking-[0.25em] bg-white/10"
            style={{ borderColor: "rgba(255,255,255,0.2)", fontFamily: "'Space Mono', monospace" }}
          >
            Investors and Funds
          </div>
          <h1
            className="mt-4 text-4xl sm:text-6xl font-extrabold text-white leading-tight"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            Save Time, Go Deeper, Get to the Best Deals Faster.
          </h1>
          <p
            className="mt-4 text-white/85 text-base sm:text-lg max-w-3xl"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Signal‑driven screening, risk indexing, and portfolio insights built for professional investors.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="#features"
              className="rounded-full px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,230,180,0.2)] transition-all"
              style={{
                fontFamily: "'Space Mono', monospace",
                backgroundImage: "linear-gradient(90deg,#00e6b4,#00aaff)",
                color: "#050a12",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              Explore Features
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
