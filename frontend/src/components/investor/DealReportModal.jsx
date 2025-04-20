import React, { useRef, useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { GlowButton } from "../ui/GlowButton";
import { X, Download, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import DealReport from "../../features/deal-report/DealReport";

export default function DealReportModal({ isOpen, onClose, companyData, metrics, formData }) {
  const reportRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  if (!isOpen || !companyData) return null;

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#0f172a" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${companyData.company_name || 'Startup'}_Deal_Report.pdf`);
    } catch (e) {
      console.error("PDF Export failed:", e);
    } finally {
      setExporting(false);
    }
  };

  const s2 = formData?.step2 || {};
  const s4 = formData?.step4 || {};
  const s6 = formData?.step6 || {};

  // Create an adapter mapping the nested formData properties back to the flat structure DealReport expects
  const mappedCompany = {
    ...companyData,
    companyName: companyData.company_name,
    companyLogoUrl: formData?.step1?.companyLogoUrl,
    industry: companyData.industry,
    country: companyData.country,
    incorporationYear: companyData.incorporation_year,
    productDescription: s2.productDescription,
    coreProblem: s2.coreProblem,
    solution: s2.solution,
    hasTechnicalFounder: formData?.step5?.hasTechnicalFounder,
    teamSize: formData?.step5?.teamSize || 1,
    foundersCount: formData?.step5?.foundersCount || 1,
    monthlyRevenue: s4.monthlyRevenue || 0,
    amountRaising: s6.amountRaising || 0,
    preMoneyValuation: s6.preMoneyValuation || 0,
    equityOffered: s6.equityOffered || 0,
    previousFunding: companyData.funding_raised || 0,
    stage: companyData.stage,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[95vh] flex flex-col rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-[#0f172a]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">AI Deal Report</h2>
              <p className="text-sm text-white/50">MatchPoint Generated Analysis for {companyData.company_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <GlowButton 
              variant="secondary" 
              onClick={handleExportPDF} 
              disabled={exporting}
              className="text-xs px-4 py-2 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {exporting ? "Generating PDF..." : "Export Report (PDF)"}
            </GlowButton>
            <button onClick={onClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar bg-[#0f172a]">
          {/* Wrapper ensuring standard document sizing and preventing text bleeds for html2canvas */}
          <div className="max-w-5xl mx-auto" ref={reportRef}>
             <DealReport 
                company={mappedCompany} 
                result={{ 
                  total_score: companyData.total_score,
                  ai_strengths: [],
                  ai_risks: [],
                  ai_summary: metrics.readiness 
                }} 
             />
          </div>
        </div>
      </div>
    </div>
  );
}
