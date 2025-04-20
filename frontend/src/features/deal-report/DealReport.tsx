import React from "react";
import LeftRail from "./components/LeftRail";
import CompanyDetails from "./components/CompanyDetails";
import DealSummary from "./components/DealSummary";
import Configurator from "./components/Configurator";
import InvestmentReadiness from "./components/InvestmentReadiness";
import Valuator from "./components/Valuator";
import SectionHeader from "./components/SectionHeader";
import { Mail } from "lucide-react";
import logo from "../../assets/logo.png";

export default function DealReport({
  company,
  result,
}: {
  company: any;
  result: any;
}) {
  const totalScore = result?.total_score ?? 0;
  const percentage = Math.max(0, Math.min(100, Math.round((totalScore / 200) * 100)));

  // Heuristic numeric wiring for Market Validation sub-scores (each out of 3)
  const mv_identification = (() => {
    let s = 0;
    if (Number(company?.tam) > 0 || String(company?.tam || "").trim() !== "") s += 1;
    if (Number(company?.sam) > 0 || String(company?.sam || "").trim() !== "") s += 1;
    if (Number(company?.som) > 0 || String(company?.som || "").trim() !== "") s += 1;
    return Math.min(3, s);
  })();
  const mv_interact = (() => {
    let s = 0;
    if (company?.hasLOIs) s += 1;
    if (company?.hasPartnerships) s += 1;
    if (company?.hasSignedContracts) s += 1;
    return Math.min(3, s);
  })();
  const mv_results = (() => {
    let s = 0;
    if (Number(company?.monthlyRevenue) > 0) s += 1;
    if (Number(company?.payingCustomers) > 0) s += 1;
    if (Number(company?.revenueGrowth) > 0 || Number(company?.activeUsers) > 0) s += 1;
    return Math.min(3, s);
  })();

  const leftItems = [
    {
      label: "Market Validation",
      stage: "(Stage 1)",
      subs: [
        { label: "Identification (3)", max: 3, score: mv_identification },
        { label: "Interact (3)", max: 3, score: mv_interact },
        { label: "Results (3)", max: 3, score: mv_results },
      ],
      // Keep aggregate fallback in case subs are removed; otherwise LeftRail will compute from subs
      scoreOutOf: 9,
      value: mv_identification + mv_interact + mv_results,
    },
    {
      label: "Progress & Execution",
      stage: "(Stage 2)",
      subs: [
        {
          label: "LOI / Pre-Orders (3)",
          max: 3,
          score:
            (company?.hasLOIs ? 1 : 0) +
            (company?.hasSignedContracts ? 1 : 0) +
            (Number(company?.payingCustomers) > 0 ? 1 : 0),
        },
        {
          label: "Product Development (5)",
          max: 5,
          score:
            (company?.hasTechnicalFounder ? 1 : 0) +
            (Number(company?.teamSize) >= 2 ? 1 : 0) +
            (String(company?.solution || "").trim() ? 1 : 0) +
            (Number(company?.activeUsers) > 0 ? 1 : 0) +
            (Number(company?.revenueGrowth) > 0 ? 1 : 0),
        },
        {
          label: "Financial Tests (2)",
          max: 2,
          score:
            (Number(company?.revenueGrowth) > 0 ? 1 : 0) +
            (Number(company?.retentionRate) > 0 ? 1 : 0),
        },
        {
          label: "External Cash (5)",
          max: 5,
          score:
            (Number(company?.previousFunding) > 0 ? 1 : 0) +
            (Number(company?.amountRaising) > 0 ? 1 : 0) +
            (String(company?.fundUse || "").trim() ? 1 : 0) +
            (String(company?.nextRound || "").trim() ? 1 : 0) +
            (Number(company?.burnRate) > 0 ? 1 : 0),
        },
        {
          label: "Setup (4)",
          max: 4,
          score:
            (String(company?.legalStructure || "").trim() ? 1 : 0) +
            (String(company?.incorporationYear || "").trim() ? 1 : 0) +
            (String(company?.contactEmail || "").trim() ? 1 : 0) +
            (String(company?.capTableSummary || "").trim() ? 1 : 0),
        },
      ],
      scoreOutOf: 3 + 5 + 2 + 5 + 4,
      value: 0, // computed from subs by LeftRail
    },
    {
      label: "People",
      stage: "(Stage 3)",
      subs: [
        {
          label: "Founder Skills Mix (6)",
          max: 6,
          score:
            (company?.hasTechnicalFounder ? 1 : 0) +
            (Number(company?.domainExperience) > 0 ? 1 : 0) +
            (Number(company?.foundersCount) >= 2 ? 1 : 0) +
            (company?.prevStartupExp ? 1 : 0) +
            (company?.isFullTime ? 1 : 0) +
            (String(company?.founderBackground || "").trim() ? 1 : 0),
        },
        {
          label: "Advisor / Mentor (6)",
          max: 6,
          score:
            (String(company?.advisoryBoard || "").trim() ? 1 : 0) +
            ((company?.advisoryBoard || "").includes(",") ? 1 : 0) +
            (/(mentor|advisor|board)/i.test(String(company?.advisoryBoard || "")) ? 1 : 0) +
            (Number(company?.domainExperience) > 3 ? 1 : 0) +
            (company?.prevStartupExp ? 1 : 0) +
            (Number(company?.teamSize) > 3 ? 1 : 0),
        },
        {
          label: "Team Members (5)",
          max: 5,
          score:
            (Number(company?.teamSize) >= 2 ? 1 : 0) +
            (Number(company?.teamSize) >= 5 ? 1 : 0) +
            (Number(company?.teamSize) >= 10 ? 1 : 0) +
            (company?.isFullTime ? 1 : 0) +
            (company?.hasTechnicalFounder ? 1 : 0),
        },
        {
          label: "Board / Chair (1)",
          max: 1,
          score: /(chair|board)/i.test(String(company?.advisoryBoard || "")) ? 1 : 0,
        },
      ],
      scoreOutOf: 6 + 6 + 5 + 1,
      value: 0,
    },
    {
      label: "Founders",
      stage: "(Stage 4)",
      subs: [
        {
          label: "Previous Startup (12)",
          max: 12,
          score:
            (company?.prevStartupExp ? 6 : 0) +
            (Number(company?.domainExperience) >= 5 ? 3 : Number(company?.domainExperience) > 0 ? 1 : 0) +
            (String(company?.founderProfileUrl || "").trim() ? 1 : 0) +
            (company?.isFullTime ? 1 : 0) +
            (Number(company?.foundersCount) >= 2 ? 1 : 0),
        },
        {
          label: "Personal Investment (8)",
          max: 8,
          score:
            (Number(company?.previousFunding) > 0 ? 2 : 0) +
            (String(company?.fundUse || "").trim() ? 1 : 0) +
            (Number(company?.burnRate) > 0 ? 1 : 0) +
            (Number(company?.amountRaising) > 0 ? 1 : 0) +
            (String(company?.nextRound || "").trim() ? 1 : 0) +
            (Number(company?.preMoneyValuation) > 0 ? 1 : 0) +
            (Number(company?.equityOffered) > 0 ? 1 : 0),
        },
        {
          label: "Bootstrapped (3)",
          max: 3,
          score:
            (Number(company?.previousFunding) === 0 ? 1 : 0) +
            (Number(company?.monthlyRevenue) > 0 ? 1 : 0) +
            (Number(company?.payingCustomers) > 0 ? 1 : 0),
        },
      ],
      scoreOutOf: 12 + 8 + 3,
      value: 0,
    },
    {
      label: "ROI Predicted",
      stage: "(Stage 5)",
      subs: [
        {
          label: "ROI Multiple (3)",
          max: 3,
          score: (() => {
            const x = Number(company?.investorReturn ?? company?.roiMultiple ?? 0);
            if (x >= 7) return 3;
            if (x >= 4) return 2;
            if (x >= 3) return 1;
            return 0;
          })(),
        },
        { label: "0-2x", count: 0 },
        { label: "3-4x", count: 0 },
        { label: "4-7x", count: 0 },
        { label: "7-10x", count: 0 },
        { label: "10x+", count: 0 },
      ],
      scoreOutOf: 3,
      value: 0, // computed from the first sub
    },
    {
      label: "Exit",
      stage: "(Stage 6)",
      subs: [
        {
          label: "Exit Acquirers (2)",
          max: 2,
          score:
            (String(company?.exitStrategy || "").trim() ? 1 : 0) +
            (company?.hasPartnerships || company?.hasSignedContracts ? 1 : 0),
        },
        {
          label: "Exit Dialogue (3)",
          max: 3,
          score:
            (company?.hasLOIs ? 1 : 0) +
            (company?.hasSignedContracts ? 1 : 0) +
            (String(company?.exitTimeline || "").trim() ? 1 : 0),
        },
        {
          label: "Exit Event (3)",
          max: 3,
          score:
            (Number(company?.investorReturn) > 0 ? 1 : 0) +
            (Number(company?.exitValuation) > 0 ? 1 : 0) +
            (String(company?.nextRound || "").trim() ? 1 : 0),
        },
      ],
      scoreOutOf: 2 + 3 + 3,
      value: 0,
    },
    {
      label: "Business Case",
      stage: "(Stage 7)",
      subs: [
        {
          label: "Tone Check (1)",
          max: 1,
          score: (String(company?.coreProblem || "").trim() && String(company?.whyNow || "").trim()) ? 1 : 0,
        },
        {
          label: "Pitch Statement (2)",
          max: 2,
          score:
            (String(company?.solution || "").trim() ? 1 : 0) +
            (String(company?.uniqueAdvantage || "").trim() ? 1 : 0),
        },
        {
          label: "Benchmarks (5)",
          max: 5,
          score:
            (String(company?.tam || "").trim() ? 1 : 0) +
            (String(company?.sam || "").trim() ? 1 : 0) +
            (String(company?.som || "").trim() ? 1 : 0) +
            (String(company?.marketGrowth || "").trim() ? 1 : 0) +
            (Number(company?.competitiveAdvantageScore) > 0 ? 1 : 0),
        },
        {
          label: "Go-To-Market (3)",
          max: 3,
          score:
            (String(company?.targetCustomer || "").trim() ? 1 : 0) +
            (String(company?.competitors || "").trim() ? 1 : 0) +
            (Number(company?.retentionRate) > 0 ? 1 : 0),
        },
      ],
      scoreOutOf: 1 + 2 + 5 + 3,
      value: 0,
    },
  ];

  const valuatorEntries = (() => {
    const mv_total = mv_identification + mv_interact + mv_results; // out of 9
    const progress_total =
      ((company?.hasLOIs ? 1 : 0) +
        (company?.hasSignedContracts ? 1 : 0) +
        (Number(company?.payingCustomers) > 0 ? 1 : 0)) +
      ((company?.hasTechnicalFounder ? 1 : 0) +
        (Number(company?.teamSize) >= 2 ? 1 : 0) +
        (String(company?.solution || "").trim() ? 1 : 0) +
        (Number(company?.activeUsers) > 0 ? 1 : 0) +
        (Number(company?.revenueGrowth) > 0 ? 1 : 0)) +
      ((Number(company?.revenueGrowth) > 0 ? 1 : 0) + (Number(company?.retentionRate) > 0 ? 1 : 0)) +
      ((Number(company?.previousFunding) > 0 ? 1 : 0) +
        (Number(company?.amountRaising) > 0 ? 1 : 0) +
        (String(company?.fundUse || "").trim() ? 1 : 0) +
        (String(company?.nextRound || "").trim() ? 1 : 0) +
        (Number(company?.burnRate) > 0 ? 1 : 0)) +
      ((String(company?.legalStructure || "").trim() ? 1 : 0) +
        (String(company?.incorporationYear || "").trim() ? 1 : 0) +
        (String(company?.contactEmail || "").trim() ? 1 : 0) +
        (String(company?.capTableSummary || "").trim() ? 1 : 0)); // max 19
    const founders_total =
      ((company?.prevStartupExp ? 6 : 0) +
        (Number(company?.domainExperience) >= 5 ? 3 : Number(company?.domainExperience) > 0 ? 1 : 0) +
        (String(company?.founderProfileUrl || "").trim() ? 1 : 0) +
        (company?.isFullTime ? 1 : 0) +
        (Number(company?.foundersCount) >= 2 ? 1 : 0)) +
      ((Number(company?.previousFunding) > 0 ? 2 : 0) +
        (String(company?.fundUse || "").trim() ? 1 : 0) +
        (Number(company?.burnRate) > 0 ? 1 : 0) +
        (Number(company?.amountRaising) > 0 ? 1 : 0) +
        (String(company?.nextRound || "").trim() ? 1 : 0) +
        (Number(company?.preMoneyValuation) > 0 ? 1 : 0) +
        (Number(company?.equityOffered) > 0 ? 1 : 0)) +
      ((Number(company?.previousFunding) === 0 ? 1 : 0) +
        (Number(company?.monthlyRevenue) > 0 ? 1 : 0) +
        (Number(company?.payingCustomers) > 0 ? 1 : 0)); // max 23
    const idea_total =
      ((String(company?.coreProblem || "").trim() && String(company?.whyNow || "").trim()) ? 1 : 0) +
      ((String(company?.solution || "").trim() ? 1 : 0) + (String(company?.uniqueAdvantage || "").trim() ? 1 : 0)) +
      ((String(company?.tam || "").trim() ? 1 : 0) +
        (String(company?.sam || "").trim() ? 1 : 0) +
        (String(company?.som || "").trim() ? 1 : 0) +
        (String(company?.marketGrowth || "").trim() ? 1 : 0) +
        (Number(company?.competitiveAdvantageScore) > 0 ? 1 : 0)) +
      ((String(company?.targetCustomer || "").trim() ? 1 : 0) +
        (String(company?.competitors || "").trim() ? 1 : 0) +
        (Number(company?.retentionRate) > 0 ? 1 : 0)); // max 11
    const sales_traction =
      (Number(company?.monthlyRevenue) > 0 ? 1 : 0) +
      (Number(company?.payingCustomers) > 0 ? 1 : 0) +
      (Number(company?.activeUsers) > 0 ? 1 : 0) +
      (Number(company?.revenueGrowth) > 0 ? 1 : 0); // max 4
    const sales_pipeline =
      (company?.hasLOIs ? 1 : 0) + (company?.hasSignedContracts ? 1 : 0) + (company?.hasPartnerships ? 1 : 0); // max 3
    const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
    return [
      { label: "Market Validation (5)", count: clamp(Math.floor((mv_total / 9) * 5), 0, 5) },
      { label: "Progress (3)", count: clamp(Math.floor((progress_total / 19) * 3), 0, 3) },
      { label: "Founders (5)", count: clamp(Math.floor((founders_total / 23) * 5), 0, 5) },
      { label: "Idea Potential (3)", count: clamp(Math.floor((idea_total / 11) * 3), 0, 3) },
      { label: "Sales / Traction (4)", count: clamp(sales_traction, 0, 4) },
      { label: "Sales Pipeline (3)", count: clamp(sales_pipeline, 0, 3) },
    ];
  })();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          {company?.companyLogoUrl && (
            <img 
              src={company.companyLogoUrl} 
              alt="Company Logo" 
              className="h-12 w-12 object-contain rounded-xl bg-white/5 p-1.5 border border-white/10"
            />
          )}
          <div className="leading-tight text-white/85">
            <div className="text-[18px] md:text-[20px] font-black tracking-[0.08em] uppercase">
              {company?.companyName || "Deal Intelligence Report"}
            </div>
            <div className="text-[10px] md:text-[11px] font-medium text-white/50 tracking-widest uppercase">
              {company?.companyName ? "Deal Intelligence Report" : "Matchpoint AI Analysis"}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <img src={logo} alt="Match Point logo" className="h-4 w-auto opacity-50" />
          <div className="text-[10px] text-white/40 text-right">
            Report ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4">
          <SectionHeader title="Smart Investment Score" />
          <div className="mt-3">
            <LeftRail items={leftItems as any} />
          </div>
        </div>
        <div className="md:col-span-8 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl font-bold text-white mb-1">Overview</div>
              <div className="text-white/60 text-sm flex items-start gap-2 mt-1">
                <Mail className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="break-all leading-tight">{company?.contactEmail || "Contact not provided"}</span>
              </div>
            </div>
            <div className="text-right text-xs text-white/60 space-y-1">
              <div>First Data: {new Date().toLocaleDateString()}</div>
              <div>Sector: {company?.sector || "—"}</div>
              <div>Location: {company?.country || "United Kingdom"}</div>
            </div>
          </div>

          {result?.ai_summary && (
            <div>
              <SectionHeader title="SUMMARY" />
              <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
                {result.ai_summary}
              </div>
            </div>
          )}

          <CompanyDetails company={company} />

          <DealSummary
            strengths={(result?.ai_strengths as string[]) || (result?.strengths as string[]) || []}
            weaknesses={(result?.ai_risks as string[]) || (result?.weaknesses as string[]) || []}
          />

          <Configurator company={company} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <InvestmentReadiness percent={percentage} />
            </div>
            <div className="md:col-span-2">
              <Valuator entries={valuatorEntries} />
            </div>
          </div>

          <div className="text-[10px] text-white/50 rounded-lg border border-white/10 bg-white/5 p-3">
            Disclaimer: This material does not constitute investment advice. Valuation benchmarks rely on MATCHPoint outputs as
            indicators only and not suggestions or advice for a company’s valuation or exit position.
          </div>
        </div>
      </div>
    </div>
  );
}
