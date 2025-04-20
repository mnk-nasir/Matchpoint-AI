import React from "react";
import { Rocket, ClipboardList, BarChart3, ShieldCheck, Users, FileBarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StartupsAndCompanies() {
  const navigate = useNavigate();
  const features = [
    {
      icon: ClipboardList,
      title: "Investment Health‑Check",
      desc: "Assess your company before conversations with accelerators, investors, or funds.",
    },
    {
      icon: FileBarChart2,
      title: "Readiness & Valuation",
      desc: "Generate an investment readiness score and benchmark your valuation.",
    },
    {
      icon: ShieldCheck,
      title: "Fundraising Preparation",
      desc: "Get guidance to maximize investability and fix weak points.",
    },
    {
      icon: BarChart3,
      title: "Valuation Benchmarking",
      desc: "Build or benchmark your company’s valuation using consistent signals.",
    },
    {
      icon: Users,
      title: "Performance Profile",
      desc: "Use your data to build a performance and investor profile.",
    },
    {
      icon: Rocket,
      title: "Investor Pack",
      desc: "Package a concise profile and summary to support investor discussions.",
    },
  ];

  return (
    <main className="text-white" style={{ backgroundColor: "#050a12" }}>
      {/* Hero */}
      <header id="hero" className="relative w-full">
        <div
          className="relative h-[52vh] sm:h-[60vh] w-full bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(rgba(5,10,18,0.45), rgba(5,10,18,0.55)), url('https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1600&q=60')",
          }}
        >
          <div className="mx-auto flex h-full max-w-6xl items-center justify-center px-6 text-center">
            <div>
              <h1
                className="text-3xl sm:text-5xl font-bold tracking-wide"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                STARTUPS AND COMPANIES
              </h1>
              <p
                className="mt-3 text-sm sm:text-base text-white/85"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Assisting company fundraising from seed to revenue phases.
              </p>

              <a
                href="#features"
                className="mt-6 inline-block rounded-full border px-6 py-2 text-xs font-bold uppercase tracking-[0.2em] bg-white/10 backdrop-blur hover:bg-white/15 transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.12)", fontFamily: "'Space Mono', monospace" }}
              >
                Explore Features
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <h2
          className="text-2xl sm:text-3xl font-bold"
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          FEATURES
        </h2>
        <div className="mt-4 h-px w-full bg-white/10" />

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }, idx) => (
            <article
              key={idx}
              className="rounded-2xl border bg-white/[0.04] p-6 shadow-sm"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center gap-3">
                <Icon className="text-emerald-400" />
                <h3 className="text-sm font-semibold" style={{ fontFamily: "'Space Mono', monospace" }}>
                  {title}
                </h3>
              </div>
              <p className="mt-3 text-sm text-white/75" style={{ fontFamily: "'Space Mono', monospace" }}>
                {desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="mx-auto max-w-6xl px-6 pb-16 sm:pb-24">
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/funding")}
            className="rounded-full px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,230,180,0.2)] transition-all"
            style={{
              fontFamily: "'Space Mono', monospace",
              backgroundImage: "linear-gradient(90deg,#00e6b4,#00aaff)",
              color: "#050a12",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            Investment Evaluation → Go
          </button>
        </div>
      </section>
    </main>
  );
}

