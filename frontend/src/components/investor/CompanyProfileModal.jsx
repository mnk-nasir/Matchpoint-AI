import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { GlowButton } from "../ui/GlowButton";
import { investorService } from "../../services/investor";
import { exportElementToPdf } from "../../utils/exportPdf";
import DealReport from "../../features/deal-report/DealReport";

export default function CompanyProfileModal({ id, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("overview");
  const [isPrinting, setIsPrinting] = useState(false);
  const ref = useRef(null);
  const printRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    investorService
      .getEvaluationDetail(id)
      .then(setData)
      .catch((e) => setError(e?.message || "Failed to load company"))
      .finally(() => setLoading(false));
  }, [id]);

  const metrics = useMemo(() => {
    const fd = data?.form_data || {};
    const s4 = fd.step4 || {};
    const s5 = fd.step5 || {};
    const s6 = fd.step6 || {};
    return {
      monthlyRevenue: s4.monthlyRevenue || null,
      activeUsers: s4.activeUsers || null,
      payingCustomers: s4.payingCustomers || null,
      burnRate: s6.burnRate || null,
      amountRaising: s6.amountRaising || null,
      hasTechnicalFounder: s5.hasTechnicalFounder || null,
      foundersCount: s5.foundersCount || null,
    };
  }, [data]);

  const flatData = useMemo(() => {
    if (!data?.form_data) return {};
    return Object.values(data.form_data).reduce((acc, stepData) => ({ ...acc, ...stepData }), {});
  }, [data]);

  const roi = useMemo(() => {
    const raise = Number(metrics.amountRaising || 0);
    const mrr = Number(metrics.monthlyRevenue || 0);
    if (raise <= 0 || mrr <= 0) return null;
    const paybackMonths = Math.ceil(raise / Math.max(1, mrr));
    return { raise, mrr, paybackMonths, simpleRoi: Math.round((mrr * 12) / raise, 2) };
  }, [metrics]);

  const downloadPdf = async () => {
    setIsPrinting(true);
    // Wait for the DOM to update the hidden report
    setTimeout(async () => {
      if (printRef.current) {
        await exportElementToPdf(printRef.current, `${data?.company_name || "company"}-deal-report.pdf`, {
          ignoreSelector: ".no-print",
          backgroundColor: "#0b1220"
        });
      }
      setIsPrinting(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-6">
      <div className="absolute inset-0" onClick={onClose} />
      <GlassCard className={`relative w-full sm:max-w-4xl ${isPrinting ? 'h-auto' : 'max-h-[90vh] overflow-hidden'}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="text-sm font-semibold text-white/80">{data?.company_name || "Company"}</div>
          <button className="text-white/60 hover:text-white no-print" onClick={onClose}>Close</button>
        </div>
        <div className="px-4 pt-3 no-print flex gap-2">
          <button onClick={() => setTab("overview")} className={`text-xs px-3 py-1.5 rounded ${tab==="overview"?"bg-white/15":"hover:bg-white/10"} `}>Overview</button>
          <button onClick={() => setTab("report")} className={`text-xs px-3 py-1.5 rounded ${tab==="report"?"bg-white/15":"hover:bg-white/10"} `}>Deal Report</button>
        </div>
        <div ref={ref} className={`p-4 ${isPrinting ? 'h-auto overflow-visible' : 'overflow-y-auto max-h-[75vh]'}`}>
          {loading ? (
            <div className="text-white/60 text-sm">Loading…</div>
          ) : error ? (
            <div className="text-red-200 text-sm">{error}</div>
          ) : (
            <>
              {/* Overview Section */}
              <div className={(tab === "overview" || isPrinting) ? "space-y-4" : "hidden"}>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 flex items-center gap-4">
                {data?.form_data?.step1?.companyLogoUrl && (
                  <img 
                    src={data.form_data.step1.companyLogoUrl} 
                    alt="Logo" 
                    className="h-14 w-14 object-contain rounded-xl bg-white/5 p-2 border border-white/10"
                  />
                )}
                <div>
                  <div className="text-lg font-semibold">{data?.company_name || "Company"}</div>
                  <div className="text-white/60 text-sm">
                    {data?.country ? `Based in ${data.country}. ` : ""}
                    {data?.legal_structure ? `${data.legal_structure}. ` : ""}
                    {data?.incorporation_year ? `Incorporated ${data.incorporation_year}. ` : ""}
                    {typeof data?.funding_raised === "number" ? `Raised to date $${data.funding_raised}.` : ""}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="text-xs text-white/50">Stage</div>
                  <div className="text-white text-sm">{data?.stage || "—"}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="text-xs text-white/50">Total Score</div>
                  <div className="text-white text-sm">{data?.total_score ?? "—"}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="text-xs text-white/50">Rating</div>
                  <div className="text-white text-sm">{data?.formatted_rating || data?.rating || "—"}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold mb-2">Problem & Solution</div>
                  <div className="text-sm text-white/80 space-y-2">
                    <div>
                      <div className="text-xs text-white/50">Problem</div>
                      <div>{(data?.form_data?.step2 && data.form_data.step2.coreProblem) || "—"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/50">Solution</div>
                      <div>{(data?.form_data?.step2 && data.form_data.step2.solution) || "—"}</div>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold mb-2">Financial Metrics</div>
                  <ul className="text-sm text-white/80 space-y-1">
                    <li>MRR: {metrics.monthlyRevenue ? `$${metrics.monthlyRevenue}` : "—"}</li>
                    <li>Active Users: {metrics.activeUsers ?? "—"}</li>
                    <li>Paying Customers: {metrics.payingCustomers ?? "—"}</li>
                    <li>Burn Rate: {metrics.burnRate ? `$${metrics.burnRate}` : "—"}</li>
                    <li>Amount Raising: {metrics.amountRaising ? `$${metrics.amountRaising}` : "—"}</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold mb-2">Team & Profile</div>
                  <ul className="text-sm text-white/80 space-y-1">
                    <li>Founders: {metrics.foundersCount ?? "—"}</li>
                    <li>Technical Founder: {metrics.hasTechnicalFounder ? "Yes" : "No/Unknown"}</li>
                    <li>
                      Founder Profile:{" "}
                      {data?.founder_profile_url ? (
                        <a href={data.founder_profile_url} target="_blank" rel="noreferrer" className="underline text-sky-300">
                          {data.founder_profile_url}
                        </a>
                      ) : "—"}
                    </li>
                  </ul>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold mb-2">Market & Competition</div>
                  <ul className="text-sm text-white/80 space-y-1">
                    <li>TAM: {(data?.form_data?.step3 && data.form_data.step3.tam) ?? "—"}</li>
                    <li>Competitors: {(data?.form_data?.step3 && data.form_data.step3.competitors) || "—"}</li>
                  </ul>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold mb-2">Round Details</div>
                  <ul className="text-sm text-white/80 space-y-1">
                    <li>Previous Funding: {typeof data?.funding_raised === "number" ? `$${data.funding_raised}` : "—"}</li>
                    <li>Pre‑Money: {(data?.form_data?.step6 && data.form_data.step6.preMoneyValuation) ? `$${data.form_data.step6.preMoneyValuation}` : "—"}</li>
                    <li>Equity Offered: {(data?.form_data?.step6 && data.form_data.step6.equityOffered) ? `${data.form_data.step6.equityOffered}%` : "—"}</li>
                    <li>Use of Funds: {(data?.form_data?.step6 && data.form_data.step6.fundUse) || "—"}</li>
                    <li>Next Round: {(data?.form_data?.step6 && data.form_data.step6.nextRound) || "—"}</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold mb-2">Strategy & Exit</div>
                  <ul className="text-sm text-white/80 space-y-1">
                    <li>Vision: {(data?.form_data?.step7 && data.form_data.step7.vision) || "—"}</li>
                    <li>Exit Strategy: {(data?.form_data?.step8 && data.form_data.step8.exitStrategy) || "—"}</li>
                    <li>Target ROI: {(data?.form_data?.step8 && data.form_data.step8.investorReturn) || "—"}</li>
                    <li>Target Exit Valuation: {(data?.form_data?.step8 && data.form_data.step8.exitValuation) || "—"}</li>
                  </ul>
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold mb-2">Key Documents</div>
                <ul className="text-sm text-white/80 space-y-1">
                  <li>
                    Logo: {(data?.form_data?.step1 && data.form_data.step1.companyLogoUrl) ? (
                      <a className="underline text-sky-300" href={data.form_data.step1.companyLogoUrl} target="_blank" rel="noreferrer">View</a>
                    ) : "—"}
                  </li>
                  <li>
                    Founder Profile: {data?.founder_profile_url ? (
                      <a className="underline text-sky-300" href={data.founder_profile_url} target="_blank" rel="noreferrer">Open</a>
                    ) : "—"}
                  </li>
                </ul>
              </div>
              </div>

              {/* Deal Report Section */}
              <div className={(tab === "report" || isPrinting) ? "space-y-4" : "hidden"}>
                {isPrinting && (
                  <div className="mb-4 pt-8 border-t border-white/20">
                    <h2 className="text-lg font-bold text-white">Deal Report Details</h2>
                  </div>
                )}
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold">Executive Summary</div>
                </div>
                <p className="text-white/80 text-sm">
                  {data?.company_name} shows a {data?.formatted_rating || data?.rating || "—"} profile with a total score of {data?.total_score ?? "—"}.
                  {metrics.amountRaising ? ` The company seeks to raise $${metrics.amountRaising}.` : ""} 
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold mb-2">Risk Assessment</div>
                  <div className="text-xs text-white/60 mb-1">Signal Score</div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500" style={{ width: `${Math.min(100, (Number(data?.total_score||0)/200)*100)}%` }} />
                  </div>
                  <div className="text-xs text-white/60 mt-2">Rating: {data?.formatted_rating || data?.rating || "—"}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold mb-2">ROI Projection</div>
                  {roi ? (
                    <ul className="text-sm text-white/80 space-y-1">
                      <li>MRR: ${roi.mrr}</li>
                      <li>Capital Requested: ${roi.raise}</li>
                      <li>Simple Payback: {roi.paybackMonths} months</li>
                    </ul>
                  ) : (
                    <div className="text-sm text-white/60">Insufficient data for ROI projection.</div>
                  )}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold mb-2">Key Documents</div>
                <div className="text-white/60 text-sm">Documents linking coming soon.</div>
              </div>
              </div>
            </>
          )}
        </div>
        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-white/50">{data?.company_name || "Company"}</div>
          <div className="flex gap-2 no-print">
            <GlowButton variant="secondary" onClick={() => setTab(tab === "overview" ? "report" : "overview")} className="text-xs px-3 py-2">
              {tab === "overview" ? "View Summary Report" : "Back to Overview"}
            </GlowButton>
            <GlowButton onClick={downloadPdf} disabled={isPrinting} className="text-xs px-3 py-2 flex items-center justify-center gap-1.5">
              {isPrinting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isPrinting ? "Generating PDF..." : "Download Full Report"}
            </GlowButton>
          </div>
        </div>
      </GlassCard>

      {/* Hidden container for PDF export */}
      {isPrinting && (
        <div className="fixed top-0 left-0 w-[1200px] z-[-9999] opacity-0 pointer-events-none bg-[#0b1220]">
          <div ref={printRef} className="p-8 w-full bg-[#0b1220]">
            <DealReport company={flatData} result={data} />
          </div>
        </div>
      )}
    </div>
  );
}
