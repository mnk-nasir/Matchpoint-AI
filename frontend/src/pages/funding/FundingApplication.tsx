import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "../../components/ui/GlassCard";
import { GlowButton } from "../../components/ui/GlowButton";
import { ChevronRight, ChevronLeft, Trophy, Loader2, AlertCircle } from "lucide-react";
import StepIdentity from "../../components/form/StepIdentity";
import StepProblemSolution from "../../components/form/StepProblemSolution";
import StepMarket from "../../components/form/StepMarket";
import StepTraction from "../../components/form/StepTraction";
import StepFinancials from "../../components/form/StepFinancials";
import StepTeam from "../../components/form/StepTeam";
import StepExit from "../../components/form/StepExit";
import ErrorBoundary from "../../components/util/ErrorBoundary";
import { evaluationService } from "../../services/evaluation";
import { aiService } from "../../services/ai";
import { Tooltip } from "../../components/ui/Tooltip";
import DealReport from "../../features/deal-report/DealReport";
import { exportElementToPdf } from "../../utils/exportPdf";
import { Download } from "lucide-react";
import { deriveSummary } from "../../utils/aiFallback";

// Steps configuration
const STEPS = [
  { id: 1, title: "Company Identity", description: "Structure & Details" },
  { id: 2, title: "Problem & Solution", description: "Core Value Proposition" },
  { id: 3, title: "Market", description: "Market analysis" },
  { id: 4, title: "Traction", description: "Metrics & Validation" },
  { id: 5, title: "Team Overview", description: "Core Members" },
  { id: 6, title: "Financials", description: "Financial projections" },
  { id: 7, title: "Exit & ROI", description: "Strategy & Returns" },
];

const TOOLTIP_BY_STEP: Record<number, string> = {
  1: "Company identity: legal structure, incorporation year, HQ country, stage, currency, previous funding, and cap table context.",
  2: "Describe the problem, your solution, why now, and your unique advantage or moat.",
  3: "Market overview: TAM/SAM/SOM, target customer, growth rate, competitors, and moat score.",
  4: "Traction signals: revenue and growth, active users, paying customers, retention, contracts/LOIs/partnerships.",
  5: "Team snapshot: founder background, domain experience, profile link, startup experience, commitment, hires, and advisors.",
  6: "Round economics: amount raising, pre-money valuation, equity offered, use of funds, burn rate, and next round.",
  7: "Exit planning: exit strategy, expected investor return, exit valuation, and timeline.",
};

export default function FundingApplication() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendResult, setBackendResult] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const startedAtRef = useRef<number>(Date.now());
  const printableRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<any>({
    // Step 1: Identity
    companyName: "",
    legalStructure: "",
    incorporationYear: "",
    country: "",
    currency: "",
    companyLogoUrl: "",
    sector: "",
    capTableSummary: "",
    stage: "",
    previousFunding: "", // Maps to funding_raised in backend
    contactEmail: "",
    contactPhone: "",

    // Step 2: Problem & Solution
    coreProblem: "",
    solution: "",
    whyNow: "",
    uniqueAdvantage: "",

    // Step 3: Market
    tam: "", // Maps to tam_size
    sam: "",
    som: "",
    targetCustomer: "",
    competitors: "", // Maps to competition_level or generic field
    marketGrowth: "",
    competitiveAdvantageScore: 5,

    // Step 4: Traction
    monthlyRevenue: "", // Maps to mrr
    revenueGrowth: "",
    activeUsers: "", // Maps to active_users
    payingCustomers: "",
    retentionRate: "",
    hasSignedContracts: false,
    hasLOIs: false,
    hasPartnerships: false,

    // Step 5 & 7: Team
    foundersCount: 1, // Maps to founders_count
    hasTechnicalFounder: false, // Maps to has_technical_founder
    teamSize: 1, // Maps to team_size
    founderProfileUrl: "",

    // Step 6: Financials
    burnRate: "", // Maps to burn_rate

    // Step 8: Exit
    exitStrategy: "", // Maps to exit_strategy
  });

  const updateFormData = (newData: any) => {
    setFormData((prev: any) => ({ ...prev, ...newData }));
  };

  const REQUIRED_BY_STEP: Record<number, Array<keyof typeof formData>> = {
    1: ["companyName", "legalStructure", "incorporationYear", "country", "stage", "contactEmail", "contactPhone", "companyLogoUrl"],
    2: ["coreProblem", "solution", "whyNow", "uniqueAdvantage"],
    3: ["tam", "sam", "som", "targetCustomer", "competitors"],
    4: ["monthlyRevenue", "revenueGrowth", "activeUsers", "payingCustomers", "retentionRate"],
    5: ["founderBackground", "domainExperience"],
    6: ["amountRaising", "preMoneyValuation", "equityOffered", "fundUse"],
    7: ["exitStrategy", "investorReturn"],
  } as any;

  const isEmpty = (val: any) =>
    val === "" || val === undefined || val === null;

  const validateField = (name: string): boolean => {
    const required = (REQUIRED_BY_STEP[currentStep] as string[] | undefined) || [];
    if (!required.includes(name)) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
      return true;
    }
    const value = (formData as any)[name];
    const invalid = isEmpty(value);
    setErrors((prev) => ({ ...prev, [name]: invalid ? "This field is required" : "" }));
    return !invalid;
  };

  const validateStep = (step: number): { valid: boolean; invalidFields: string[] } => {
    const required = (REQUIRED_BY_STEP[step] as string[] | undefined) || [];
    const invalid: string[] = [];
    const nextErrors: Record<string, string> = { ...errors };
    for (const field of required) {
      const value = (formData as any)[field];
      if (isEmpty(value)) {
        invalid.push(field);
        nextErrors[field] = "This field is required";
      } else {
        nextErrors[field] = "";
      }
    }
    setErrors(nextErrors);
    return { valid: invalid.length === 0, invalidFields: invalid };
  };

  const focusFirstInvalid = (fields: string[]) => {
    if (!fields.length) return;
    const id = `field-${fields[0]}`;
    const el = document.getElementById(id) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        (el as any).focus?.();
      }, 200);
    }
  };

  const isStepValidPure = (step: number): boolean => {
    const required = (REQUIRED_BY_STEP[step] as string[] | undefined) || [];
    for (const field of required) {
      const value = (formData as any)[field];
      if (isEmpty(value)) return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        step1: {
          companyName: formData.companyName,
          legalStructure: formData.legalStructure,
          incorporationYear: formData.incorporationYear,
          country: formData.country,
          currency: formData.currency,
          stage: formData.stage,
          previousFunding: formData.previousFunding,
          capTableSummary: formData.capTableSummary,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          companyLogoUrl: formData.companyLogoUrl,
          sector: formData.sector,
        },
        step2: {
          coreProblem: formData.coreProblem,
          solution: formData.solution,
          whyNow: formData.whyNow,
          uniqueAdvantage: formData.uniqueAdvantage,
        },
        step3: {
          tam: formData.tam,
          sam: formData.sam,
          som: formData.som,
          targetCustomer: formData.targetCustomer,
          competitors: formData.competitors,
          marketGrowth: formData.marketGrowth,
          competitiveAdvantageScore: formData.competitiveAdvantageScore,
        },
        step4: {
          monthlyRevenue: formData.monthlyRevenue,
          revenueGrowth: formData.revenueGrowth,
          activeUsers: formData.activeUsers,
          payingCustomers: formData.payingCustomers,
          retentionRate: formData.retentionRate,
          hasSignedContracts: formData.hasSignedContracts,
          hasLOIs: formData.hasLOIs,
          hasPartnerships: formData.hasPartnerships,
        },
        step5: {
          foundersCount: formData.foundersCount,
          hasTechnicalFounder: formData.hasTechnicalFounder,
          teamSize: formData.teamSize,
          isFullTime: formData.isFullTime,
          keyHires: formData.keyHires,
          advisoryBoard: formData.advisoryBoard,
          founderBackground: formData.founderBackground,
          domainExperience: formData.domainExperience,
          prevStartupExp: formData.prevStartupExp,
          founderProfileUrl: formData.founderProfileUrl,
        },
        step6: {
          amountRaising: formData.amountRaising,
          preMoneyValuation: formData.preMoneyValuation,
          equityOffered: formData.equityOffered,
          fundUse: formData.fundUse,
          burnRate: formData.burnRate,
          nextRound: formData.nextRound,
        },
        step7: {
          founderBackground: formData.founderBackground,
          isFullTime: formData.isFullTime,
          vision: formData.vision,
          founderProfileUrl: formData.founderProfileUrl,
        },
        step8: {
          exitStrategy: formData.exitStrategy,
          investorReturn: formData.investorReturn,
          exitValuation: formData.exitValuation,
          exitTimeline: formData.exitTimeline,
        },
      } as const;

      const result = await evaluationService.submitFullEvaluation(payload as any);
      try {
        const ai = await aiService.generateNarrative(formData, result?.total_score ?? 0, []);
        const cleanSummary =
          (ai.summary && ai.summary !== "Automated snapshot based on submitted signals.")
            ? ai.summary
            : deriveSummary(formData, result?.total_score ?? 0);
        setBackendResult({
          ...result,
          ai_summary: cleanSummary,
          ai_strengths: ai.strengths,
          ai_risks: ai.risks,
        });
      } catch {
        setBackendResult(result);
      }
      setIsSubmitted(true);
    } catch (err: any) {
      let msg = err?.message || "Failed to submit evaluation. Please try again.";
      const details = err?.details;
      if (details && typeof details === "object") {
        const parts: string[] = [];
        for (const [k, v] of Object.entries(details)) {
          if (Array.isArray(v)) {
            parts.push(`${k}: ${v.join(", ")}`);
          } else if (v && typeof v === "object") {
            try {
              parts.push(`${k}: ${JSON.stringify(v)}`);
            } catch {
              parts.push(`${k}`);
            }
          } else if (v) {
            parts.push(`${k}: ${String(v)}`);
          }
        }
        if (parts.length) msg = `${msg} — ${parts.join("; ")}`;
      }
      console.error("Submit evaluation failed:", { err, details: err?.details });
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidUrl = (value: string) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const nextStep = () => {
    const check = validateStep(currentStep);
    if (!check.valid) {
      focusFirstInvalid(check.invalidFields);
      return;
    }
    if ((currentStep === 5 || currentStep === 7) && formData.founderProfileUrl) {
      if (!isValidUrl(formData.founderProfileUrl)) {
        alert("Please enter a valid Portfolio/LinkedIn URL (e.g. https://www.linkedin.com/in/yourprofile)");
        return;
      }
    }

    if (currentStep < STEPS.length) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };



  const handleNext = () => {
    // Basic validation for Step 1
    if (currentStep === 1) {
      if (!formData.companyName) return alert("Please enter Company Name");
      if (!formData.legalStructure) return alert("Please select Legal Structure");
      if (!formData.incorporationYear) return alert("Please enter Incorporation Year");
      if (!formData.country) return alert("Please enter Country");
      if (!formData.stage) return alert("Please select Stage");
    }

    // Validation for Step 2
    if (currentStep === 2) {
      if (!formData.coreProblem) return alert("Please describe the Core Problem");
      if (!formData.solution) return alert("Please describe Your Solution");
      if (!formData.whyNow) return alert("Please explain Why Now");
      if (!formData.uniqueAdvantage) return alert("Please explain your Unique Advantage");
    }

    // Validation for Step 3
    if (currentStep === 3) {
      if (!formData.tam) return alert("Please enter TAM");
      if (!formData.sam) return alert("Please enter SAM");
      if (!formData.som) return alert("Please enter SOM");
      if (!formData.targetCustomer) return alert("Please enter Target Customer");
      if (!formData.competitors) return alert("Please list Competitors");
    }

    // Validation for Step 4
    if (currentStep === 4) {
      if (formData.monthlyRevenue === "") return alert("Please enter Monthly Revenue");
      if (formData.revenueGrowth === "") return alert("Please enter Revenue Growth");
      if (formData.activeUsers === "") return alert("Please enter Active Users");
      if (formData.payingCustomers === "") return alert("Please enter Paying Customers");
      if (formData.retentionRate === "") return alert("Please enter Retention Rate");
    }

    // Validation for Step 6
    if (currentStep === 6) {
      if (!formData.amountRaising) return alert("Please enter Amount Raising");
      if (!formData.preMoneyValuation) return alert("Please enter Pre-money Valuation");
      if (!formData.equityOffered) return alert("Please enter Equity Offered");
      if (!formData.fundUse) return alert("Please enter Use of Funds");
    }

    // Validation for Step 7
    if (currentStep === 7) {
      if (!formData.founderBackground) return alert("Please describe your Founder Background");
      if (!formData.domainExperience) return alert("Please enter Domain Experience");
    }

    // Validation for Step 8
    if (currentStep === 8) {
      if (!formData.exitStrategy) return alert("Please select an Exit Strategy");
      if (!formData.investorReturn) return alert("Please enter Investor Return Projection");
    }

    if (currentStep < STEPS.length) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    } else {
      // Submit
      setIsSubmitted(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  const handleRestart = () => {
    setCurrentStep(1);
    setTotalScore(0);
    setIsSubmitted(false);
    setFormData({
      companyName: "",
      legalStructure: "",
      incorporationYear: "",
      country: "",
      contactEmail: "",
      contactPhone: "",
      capTableSummary: "",
      stage: "",
      previousFunding: "",
      coreProblem: "",
      solution: "",
      whyNow: "",
      uniqueAdvantage: "",
      tam: "",
      sam: "",
      som: "",
      targetCustomer: "",
      competitors: "",
      marketGrowth: "",
      competitiveAdvantageScore: 5,
      monthlyRevenue: "",
      revenueGrowth: "",
      activeUsers: "",
      payingCustomers: "",
      retentionRate: "",
      hasSignedContracts: false,
      hasLOIs: false,
      hasPartnerships: false,
      isFullTime: false,
      keyHires: "",
      advisoryBoard: "",
      founderProfileUrl: "",
      exitStrategy: "",
      investorReturn: "",
      amountRaising: "",
      preMoneyValuation: "",
      equityOffered: "",
      fundUse: "",
      nextRound: "",
      exitValuation: "",
      exitTimeline: "",
      founderBackground: "",
      domainExperience: "",
      prevStartupExp: false,
    });
  };

  const handlePdf = async () => {
    const el = printableRef.current;
    if (!el) return;
    const name = (formData?.companyName || "startup").toString().trim().replace(/\s+/g, "_");
    const ts = new Date().toISOString().slice(0, 10);
    await exportElementToPdf(el, `Intelligence_Report_${name}_${ts}.pdf`, {
      backgroundColor: "#0b1220",
      scale: Math.min(3, window.devicePixelRatio * 2),
      orientation: "portrait",
      format: "a4",
      ignoreSelector: ".bg-mp-gradient",
    });
  };

  if (isSubmitted && backendResult) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-mp-bg text-white font-sans selection:bg-mp-primary/30 pt-20">
          <div className="fixed inset-0 bg-mp-gradient pointer-events-none" />
          <div className="relative mx-auto max-w-6xl px-4 py-8 md:py-14">
            <div className="flex items-center justify-end mb-4">
              <button
                onClick={handlePdf}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-mp-primary text-white hover:opacity-90 transition"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
            <div ref={printableRef}>
              <DealReport company={formData} result={backendResult} />
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen bg-mp-bg text-white font-sans selection:bg-mp-primary/30 pb-24 sm:pb-0 pt-20">
      {/* Background Gradients */}
      <div className="fixed inset-0 bg-mp-gradient pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-4 py-12 md:py-20">
        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Header & Progress */}
        <div className="mb-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-mp-primary">
                Funding Application
              </h1>
              <p className="text-white/60 mt-1">
                Step {currentStep} of {STEPS.length}:{" "}
                <span className="text-mp-primary font-medium">
                  {STEPS[currentStep - 1].title}
                </span>
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="absolute h-full bg-gradient-to-r from-mp-primary to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / STEPS.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "circOut" }}
            />
          </div>
        </div>

        {/* Main Card */}
        <GlassCard className="min-h-[500px] p-6 sm:p-10 border-mp-primary/20" gradient>
          <div className="mb-8">
            <div className="flex items-center gap-3" role="region" aria-live="polite">
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1.5">
                <h2 className="text-2xl font-semibold text-white">
                  {STEPS[currentStep - 1].title}
                </h2>
              </div>
              <div className="mt-1">
                <Tooltip content={TOOLTIP_BY_STEP[currentStep]} />
              </div>
            </div>
            <p className="text-white/60">{STEPS[currentStep - 1].description}</p>
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -20 : 20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {currentStep === 1 && (
                <StepIdentity
                  data={formData}
                  updateData={updateFormData}
                  errors={errors}
                  onFieldBlur={(name) => validateField(name as string)}
                />
              )}

              {currentStep === 2 && (
                <StepProblemSolution
                  data={formData}
                  updateData={updateFormData}
                  errors={errors}
                  onFieldBlur={(name) => validateField(name as string)}
                />
              )}

              {currentStep === 3 && (
                <StepMarket
                  data={formData}
                  updateData={updateFormData}
                  errors={errors}
                  onFieldBlur={(name) => validateField(name as string)}
                />
              )}

              {currentStep === 4 && (
                <StepTraction
                  data={formData}
                  updateData={updateFormData}
                  errors={errors}
                  onFieldBlur={(name) => validateField(name as string)}
                />
              )}

              {currentStep === 5 && (
                <StepTeam
                  data={formData}
                  updateData={updateFormData}
                  errors={errors}
                  onFieldBlur={(name) => validateField(name as string)}
                />
              )}

              {currentStep === 6 && (
                <StepFinancials
                  data={formData}
                  updateData={updateFormData}
                  errors={errors}
                  onFieldBlur={(name) => validateField(name as string)}
                />
              )}

              {currentStep === 7 && (
                <StepExit
                  data={formData}
                  updateData={updateFormData}
                  errors={errors}
                  onFieldBlur={(name) => validateField(name as string)}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-10 flex justify-between pt-6 border-t border-white/10">
            <button
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-colors ${currentStep === 1
                ? "opacity-0 pointer-events-none"
                : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            <GlowButton
              onClick={nextStep}
              disabled={isSubmitting || !isStepValidPure(currentStep)}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : currentStep === STEPS.length ? (
                "Submit Evaluation"
              ) : (
                <>
                  Next Step
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </GlowButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
