import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { GlassCard } from "../ui/GlassCard";
import { GlowButton } from "../ui/GlowButton";
import { Trophy, CheckCircle, AlertTriangle, Share2, Download, RefreshCw, XCircle, User } from "lucide-react";
import { useWindowSize } from "react-use";

interface FundingResultProps {
  totalScore: number;
  rating: string;
  strengths: string[];
  weaknesses: string[];
  data: any;
  onRestart?: () => void;
}

const CircularProgress = ({ score }: { score: number }) => {
  const radius = 60;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 200) * circumference; // Max score assumed ~200 for full circle, adjusted below

  // Color logic based on classification
  const getColor = (s: number) => {
    if (s >= 180) return "#10b981"; // Emerald
    if (s >= 120) return "#3b82f6"; // Blue
    if (s >= 60) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="rotate-[-90deg] transform"
      >
        <circle
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <motion.circle
          stroke={getColor(score)}
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <CountUp end={score} />
        <span className="text-xs text-white/50 font-medium uppercase tracking-wider">Score</span>
      </div>
    </div>
  );
};

const CountUp = ({ end }: { end: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end]);

  return <span className="text-3xl font-bold text-white">{count}</span>;
};

const FundingResult: React.FC<FundingResultProps> = ({ totalScore, rating, strengths, weaknesses, data, onRestart }) => {
  const MVP_MODE = true;
  if (MVP_MODE) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="max-w-2xl w-full p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Evaluation Result</h1>
            <p className="text-white/60 mt-1">{data.companyName || "Your Company"}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/50 uppercase tracking-wider">Score</div>
              <div className="text-2xl font-semibold text-white">{totalScore}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/50 uppercase tracking-wider">Rating</div>
              <div className="text-2xl font-semibold text-white">{rating}</div>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wide">Key Strengths</h2>
            <ul className="mt-2 list-disc list-inside text-sm text-white/80">
              {(strengths && strengths.length ? strengths : ["No strengths available"]).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wide">Areas to Improve</h2>
            <ul className="mt-2 list-disc list-inside text-sm text-white/80">
              {(weaknesses && weaknesses.length ? weaknesses : ["No weaknesses available"]).map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
          {onRestart && (
            <div className="pt-2">
              <button
                onClick={onRestart}
                className="w-full rounded-md border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 transition-colors"
              >
                Restart
              </button>
            </div>
          )}
        </GlassCard>
      </div>
    );
  }
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (totalScore >= 180) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 8000);
    }
  }, [totalScore]);

  const classification = (() => {
    switch (rating) {
      case "HIGH_POTENTIAL":
        return {
          label: "High Potential",
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          desc: "Exceptional application with strong market fit and metrics.",
        };
      case "STRONG":
        return {
          label: "Strong",
          color: "text-blue-400",
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
          desc: "Solid business case with good traction potential.",
        };
      case "MODERATE":
        return {
          label: "Moderate",
          color: "text-amber-400",
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
          desc: "Promising but requires more validation or stronger metrics.",
        };
      default:
        return {
          label: "High Risk",
          color: "text-red-400",
          bg: "bg-red-500/10",
          border: "border-red-500/20",
          desc: "Significant gaps in model or traction. Review key areas.",
        };
    }
  })();

  const currencyCode: string = data.currency || "USD";
  const currencySymbolMap: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    INR: "₹",
    CAD: "CA$",
    AUD: "A$",
    SGD: "S$",
    AED: "AED",
  };
  const currencySymbol = currencySymbolMap[currencyCode] || currencyCode;

  const getStrengths = () => {
    const strengths = [];
    if (Number(data.monthlyRevenue) > 0) strengths.push("Revenue Generating");
    if (Number(data.domainExperience) > 5) strengths.push("Experienced Founder");
    if (Number(data.investorReturn) > 5) strengths.push("Strong ROI Potential");
    if (data.productStage === "growth" || Number(data.activeUsers) > 1000) strengths.push("Market Traction");
    return strengths.length > 0 ? strengths : ["Reviewing Data..."];
  };

  const getWeaknesses = () => {
    const weaknesses = [];
    if (!data.hasSignedContracts && !data.hasLOIs) weaknesses.push("Lack of Contracts/LOIs");
    if (Number(data.monthlyRevenue) === 0) weaknesses.push("Pre-revenue Stage");
    if (!data.isFullTime) weaknesses.push("Part-time Founder");
    if (!data.competitors) weaknesses.push("Unclear Competitive Landscape");
    return weaknesses.length > 0 ? weaknesses : ["No major red flags detected"];
  };

  const founderProfileUrl: string | undefined = data.founderProfileUrl;
  const formattedFounderUrl = founderProfileUrl
    ? founderProfileUrl.replace(/^https?:\/\//i, "")
    : "";

  const handleDownloadReport = () => {
    if (typeof window === "undefined") return;
    const reportWindow = window.open("", "_blank", "width=900,height=700");
    if (!reportWindow) return;

    const doc = reportWindow.document;
    const companyName = data.companyName || "Startup";
    const ratingLabel = classification.label;
    const scorePercent = Math.round((totalScore / 200) * 100);
    const computedStrengths = strengths.length ? strengths : getStrengths();
    const computedWeaknesses = weaknesses.length ? weaknesses : getWeaknesses();

    doc.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${companyName} – Investment Evaluation</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background:#02030a; color:#f9fafb; padding:32px; }
    .shell { max-width: 900px; margin:0 auto; border-radius:24px; background: radial-gradient(circle at top, #0b1220, #02030a); border:1px solid rgba(148,163,184,0.4); box-shadow:0 24px 80px rgba(15,23,42,0.85); padding:32px 32px 36px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:24px; }
    .badge { font-size:10px; letter-spacing:0.18em; text-transform:uppercase; padding:4px 10px; border-radius:999px; border:1px solid rgba(148,163,184,0.7); color:rgba(148,163,184,0.9); }
    h1 { font-size:26px; line-height:1.2; margin-top:4px; }
    h2 { font-size:16px; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.12em; color:#9ca3af; }
    .muted { font-size:12px; color:#9ca3af; margin-top:4px; }
    .grid { display:grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap:18px; margin-top:16px; }
    .card { border-radius:18px; background:rgba(15,23,42,0.9); border:1px solid rgba(148,163,184,0.5); padding:16px 18px; }
    .score-wrap { display:flex; align-items:center; gap:18px; }
    .score-main { font-size:32px; font-weight:700; }
    .chip { display:inline-flex; align-items:center; gap:8px; padding:4px 10px; border-radius:999px; font-size:11px; text-transform:uppercase; letter-spacing:0.16em; }
    .chip-high { background:rgba(16,185,129,0.16); color:#6ee7b7; border:1px solid rgba(16,185,129,0.6); }
    .chip-strong { background:rgba(59,130,246,0.16); color:#93c5fd; border:1px solid rgba(59,130,246,0.6); }
    .chip-moderate { background:rgba(245,158,11,0.16); color:#facc15; border:1px solid rgba(245,158,11,0.6); }
    .chip-risk { background:rgba(239,68,68,0.16); color:#fecaca; border:1px solid rgba(239,68,68,0.6); }
    .list-pill { display:inline-flex; align-items:center; padding:4px 10px; border-radius:999px; font-size:11px; margin:3px; background:rgba(15,23,42,0.9); border:1px solid rgba(148,163,184,0.5); }
    .section { margin-top:24px; }
    .meta { font-size:12px; color:#e5e7eb; }
    .meta dt { font-weight:600; margin-right:6px; }
    .meta dd { margin-right:18px; display:inline-block; }
    @media print { body { background:#02030a; } .shell { box-shadow:none; } }
  </style>
</head>
<body>
  <div class="shell">
    <div class="header">
      <div>
        <div class="badge">Match Point · Investment Evaluation</div>
        <h1>${companyName}</h1>
        <div class="muted">Automated assessment generated on ${new Date().toLocaleString()}</div>
      </div>
      <div class="meta">
        <dl>
          <dt>Stage:</dt><dd>${data.stage || "N/A"}</dd>
          <dt>Country:</dt><dd>${data.country || "N/A"}</dd>
          <dt>Amount Raising:</dt><dd>${currencySymbol} ${data.amountRaising || "N/A"}</dd>
        </dl>
      </div>
    </div>

    <div class="grid">
      <section class="card">
        <h2>Score & Rating</h2>
        <div class="score-wrap">
          <div>
            <div class="score-main">${totalScore}</div>
            <div class="muted">of 200 · ${scorePercent}%</div>
          </div>
          <div>
            <span class="chip ${rating === "HIGH_POTENTIAL" ? "chip-high" : rating === "STRONG" ? "chip-strong" : rating === "MODERATE" ? "chip-moderate" : "chip-risk"}">
              ${ratingLabel}
            </span>
          </div>
        </div>
        <p class="muted" style="margin-top:10px;">${classification.desc}</p>
      </section>

      <section class="card">
        <h2>Key Strengths</h2>
        <div>
          ${computedStrengths
        .map(s => `<span class="list-pill">+ ${s}</span>`)
        .join("")}
        </div>
      </section>

      <section class="card">
        <h2>Risks & Gaps</h2>
        <div>
          ${computedWeaknesses
        .map(w => `<span class="list-pill">! ${w}</span>`)
        .join("")}
        </div>
      </section>
    </div>

    <section class="section">
      <h2>Snapshot</h2>
      <p class="muted" style="margin-top:6px;">
        This snapshot is a high‑level overview based on the information you provided in the MATCHPoint funding application.
        Use it as a companion to your deck and internal planning, not as financial advice.
      </p>
    </section>

    <section class="section">
      <h2>Founder</h2>
      <p class="muted" style="margin-top:6px;">
        ${data.founderBackground || "No founder background provided."}
      </p>
      ${founderProfileUrl
        ? `<p class="muted" style="margin-top:8px;">
               <span>Portfolio/LinkedIn: </span>
               <a href="${founderProfileUrl}" style="color:#38bdf8; text-decoration:none;">
                 ${formattedFounderUrl || founderProfileUrl}
               </a>
             </p>`
        : ""
      }
    </section>
  </div>
</body>
</html>`);

    doc.close();
    reportWindow.focus();
    reportWindow.print();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}

      <GlassCard className="max-w-3xl w-full p-8 md:p-10 space-y-8 relative z-10" gradient>
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Assessment Complete</h1>
          <p className="text-white/60">
            Analysis for <span className="text-white font-medium">{data.companyName}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Column: Score & Class */}
          <div className="flex flex-col items-center justify-center space-y-6">
            <CircularProgress score={totalScore} />

            <div className={`px-4 py-2 rounded-full border ${classification.bg} ${classification.border} ${classification.color} font-bold text-lg flex items-center gap-2`}>
              {totalScore >= 120 ? <Trophy className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              {classification.label}
            </div>

            <p className="text-center text-sm text-white/60 max-w-xs">
              {classification.desc}
            </p>
          </div>

          {/* Right Column: Insights */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Key Strengths
              </h3>
              <div className="flex flex-wrap gap-2">
                {strengths.map((s, i) => (
                  <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-emerald-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400" /> Areas to Improve
              </h3>
              <div className="flex flex-wrap gap-2">
                {weaknesses.map((w, i) => (
                  <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-red-300">
                    {w}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide flex items-center gap-2">
                <User className="w-4 h-4 text-sky-400" /> Founder Snapshot
              </h3>
              <p className="text-sm text-white/70">
                {data.founderBackground || "No founder background provided."}
              </p>
              {founderProfileUrl && (
                <a
                  href={founderProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-300 hover:text-sky-200 underline break-all"
                >
                  {formattedFounderUrl || founderProfileUrl}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4 justify-center">
          <GlowButton onClick={handleDownloadReport} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Download Full Snapshot
          </GlowButton>

          <GlowButton variant="secondary" onClick={() => alert("Share Link Copied!")} className="w-full sm:w-auto">
            <Share2 className="w-4 h-4 mr-2" />
            Share Profile
          </GlowButton>

          {onRestart && (
            <button
              onClick={onRestart}
              className="flex items-center justify-center gap-2 text-sm text-white/40 hover:text-white transition-colors w-full sm:w-auto px-4 py-2"
            >
              <RefreshCw className="w-4 h-4" />
              Restart Application
            </button>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default FundingResult;
