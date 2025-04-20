import React, { useEffect, useRef } from "react";
import { Rocket, Gauge, Shield, LineChart, Layers, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const INSTANCE_NAME = "Match Point";

function ParticleNetworkCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const nodes = Array.from({ length: 80 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      // draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 140 * 140) {
            const alpha = 1 - d2 / (140 * 140);
            ctx.strokeStyle = `rgba(0, 230, 180, ${alpha * 0.25})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // draw nodes
      for (const n of nodes) {
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }
      anim = requestAnimationFrame(draw);
    };

    let anim = requestAnimationFrame(draw);
    const onResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);
    return () => {
      cancelAnimationFrame(anim);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

const cards = [
  {
    id: "01",
    label: "FOR",
    title: "Startups / Companies",
    accent: "#00e6b4",
    Icon: Rocket,
    route: "/startups-and-companies",
    description: "Prepare for fundraising with AI-driven deal reports, precise valuation benchmarking, and readiness scoring.",
    stats: { label: "Average Readiness", value: "88%" },
    features: [
      "AI-assisted pitch prep",
      "Investor-fit scoring",
      "Traction heatmaps",
    ],
  },
  {
    id: "02",
    label: "FOR",
    title: "Accelerators",
    accent: "#00aaff",
    Icon: Layers,
    route: "/accelerators",
    description: "Manage cohorts efficiently with automated signal extraction, performance dashboards, and portfolio health tracking.",
    stats: { label: "Signals tracked", value: "1.2k+" },
    features: [
      "Cohort benchmarking",
      "Signal-based shortlisting",
      "Portfolio dashboards",
    ],
  },
  {
    id: "03",
    label: "FOR",
    title: "Investors / Funds",
    accent: "#a78bfa",
    Icon: LineChart,
    route: "/investors",
    description: "Act with conviction using intelligent risk indexing, deep deal intelligence, and automated pipeline filtering.",
    stats: { label: "Deal Match Rate", value: "94%" },
    features: [
      "Risk index",
      "Smart pipeline filters",
      "Team credibility graph",
    ],
  },
];

function DRiskCard({ data, onReadMore }) {
  const { id, label, title, accent, Icon, description, stats, features } = data;
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md min-h-[420px] md:min-h-[520px] flex flex-col"
      style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.06)" }}
    >
      {/* Glow orb */}
      <div
        className="pointer-events-none absolute -top-16 -left-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-70"
        style={{ background: accent }}
      />
      {/* Top glow line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-20 group-hover:opacity-80 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />

      {/* Default State */}
      <div className="relative z-10 p-6 sm:p-8 flex-1">
        <div className="flex items-center gap-4">
          <div
            className="grid place-items-center h-12 w-12 rounded-xl border bg-white/5 backdrop-blur"
            style={{ borderColor: "rgba(255,255,255,0.12)", boxShadow: `0 0 12px ${accent}40` }}
          >
            <Icon style={{ color: accent }} className="h-6 w-6" />
          </div>
          <div className="text-left">
            <div
              className="text-xs uppercase tracking-[0.25em] text-white/60"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {id} //
              <span className="ml-2 text-white/50">{label}</span>
            </div>
            <h3
              className="mt-1 text-2xl sm:text-3xl font-bold leading-tight"
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              {title}
            </h3>
          </div>
        </div>


      </div>

      {/* Middle Content Area */}
      <div className="relative px-6 sm:px-8 pb-6 sm:pb-8 flex-1 flex flex-col justify-end">
        {/* Placeholder (visible BEFORE hover) */}
        <div className="absolute inset-x-6 sm:inset-x-8 bottom-6 sm:bottom-8 transition-all duration-300 ease-out opacity-100 visible group-hover:opacity-0 group-hover:invisible">
          <div className="p-4 sm:p-5 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden">
            {/* Animated Graph Background Accent */}
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none" style={{ color: accent }}>
              <TrendingUp className="w-24 h-24 transform translate-x-4 translate-y-4" />
            </div>

            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-end gap-1 h-8 opacity-80">
                {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 rounded-t-sm"
                    style={{ backgroundColor: accent }}
                    animate={{ height: [`${h * 0.4}%`, `${h}%`, `${h * 0.6}%`] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: i * 0.1 }}
                  />
                ))}
              </div>
              <div>
                <div className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{stats.value}</div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-white/50" style={{ fontFamily: "'Space Mono', monospace" }}>{stats.label}</div>
              </div>
            </div>
            
            <p className="text-white/70 text-sm leading-relaxed border-l-2 pl-3" style={{ borderColor: `${accent}40` }}>
              {description}
            </p>
          </div>
        </div>

        {/* Hover Reveal Panel (shows ON hover) */}

        <div
          className="rounded-xl border transition-all duration-300 ease-out opacity-0 translate-y-2 invisible pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible group-hover:pointer-events-auto h-[180px] md:h-[220px] overflow-hidden"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            background: `linear-gradient(180deg, ${accent}1A, rgba(5,10,18,0.22))`,
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="h-full p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div
                className="text-[11px] mb-4 uppercase tracking-[0.25em] text-white/70 flex items-center gap-3"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                <span
                  className="inline-block h-[1px] w-8 opacity-70"
                  style={{ background: accent }}
                />
                MATCHPoint FEATURES
              </div>
              <ul className="space-y-3">
                {features.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <span
                      className="mt-1 inline-block h-2 w-2 rounded-full shadow-[0_0_8px]"
                      style={{ background: accent, boxShadow: `0 0 10px ${accent}` }}
                    />
                    <span style={{ fontFamily: "'Space Mono', monospace" }} className="text-white/85">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent action button (always visible) */}
      <div className="px-6 sm:px-8 pb-6 sm:pb-8 -mt-2 transform translate-y-2 transition-transform duration-300 ease-out group-hover:-translate-y-1">
        <div
          className="text-sm text-white/80"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          “Match Point surfaces signals that matter — from traction to team — so you can act with conviction.”
        </div>
        <div className="mt-3 h-px w-full bg-white/10" />
        <div className="mt-1 h-px w-2/3 bg-white/15" />
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: `${accent}22` }}
          whileTap={{ scale: 0.95 }}
          onClick={onReadMore}
          className="mt-3 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] border transition-colors"
          style={{ fontFamily: "'Space Mono', monospace", borderColor: accent, color: accent }}
        >
          Read More →
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function DRiskLanding() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: "#050a12" }}>
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0">
        {/* Particle network */}
        <ParticleNetworkCanvas />

        {/* Subtle teal grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,230,180,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,230,180,0.06)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />

        {/* Vignette */}
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]" />
      </div>

      {/* Header */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-24 pb-10 text-center">
        <div
          className="mx-auto inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] text-white/80 bg-white/5 backdrop-blur"
          style={{ borderColor: "rgba(255,255,255,0.12)", fontFamily: "'Space Mono', monospace" }}
        >
          {INSTANCE_NAME}
        </div>

      </div>

      {/* Cards */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-stretch">
          {cards.map((c) => (
            <DRiskCard key={c.id} data={c} onReadMore={() => navigate(c.route)} />
          ))}
        </div>

        {/* Shared borders on desktop */}
        <div className="hidden md:block mt-6 h-px w-full bg-white/10" />
      </div>

      {/* Mobile dividers */}
      <div className="md:hidden relative z-10 mx-auto max-w-6xl px-6 -mt-6 space-y-6">
        <div className="h-px w-full bg-white/10" />
        <div className="h-px w-full bg-white/10" />
      </div>
    </section>
  );
}
