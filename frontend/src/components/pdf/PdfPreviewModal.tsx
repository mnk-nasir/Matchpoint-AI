import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Loader2 } from "lucide-react";
import { exportElementToPdf } from "../../utils/exportPdf";
import DealReport from "../report/DealReport";

export default function PdfPreviewModal({
  open,
  onClose,
  loading,
  autoDownload,
  onAutoDownloadComplete,
  data,
  totalScore,
  percentage,
  grade,
  formattedTime,
  sectionBreakdown,
  historyPoints,
  strengths,
  weaknesses,
  metaItems,
}: {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  autoDownload?: boolean;
  onAutoDownloadComplete?: () => void;
  data: any;
  totalScore: number;
  percentage: number;
  grade: { label: string; color: string };
  formattedTime: string;
  sectionBreakdown: Array<{ key: string; label: string; score: number; outOf: number }>;
  historyPoints: Array<{ x: number; y: number }>;
  strengths: string[];
  weaknesses: string[];
  metaItems: Array<{ label: string; value: string }>;
}) {
  const printableRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const name = (data?.companyName || "startup").toString().trim().replace(/\s+/g, "_");
      const ts = new Date().toISOString().slice(0, 10);
      const file = `Results_${name}_${ts}.pdf`;
      const el = printableRef.current;
      if (!el) return;
      await exportElementToPdf(el, file, {
        // Use white background to match report styling
        backgroundColor: "#ffffff",
        scale: Math.min(3, window.devicePixelRatio * 2),
      });
      onClose();
      onAutoDownloadComplete && onAutoDownloadComplete();
    } catch (e) {
      console.error("PDF export failed", e);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (open && !loading && autoDownload) {
      // Kick off automatic download once preview is ready
      handleDownload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loading, autoDownload]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto scrollbar-hide rounded-2xl border border-white/10 bg-slate-900 p-4 md:p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-white/80 font-semibold">PDF Preview</div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-white/10 text-white/70 hover:text-white transition"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-white/60 mb-4">
              Review the content below. When ready, click Download to open your browser’s PDF dialog.
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-white/70" />
                <span className="ml-2 text-white/70">Preparing PDF preview…</span>
              </div>
            ) : (
              <div className="printable" ref={printableRef}>
                <DealReport
                  company={data}
                  metaItems={metaItems}
                  sectionBreakdown={sectionBreakdown}
                  strengths={strengths}
                  weaknesses={weaknesses}
                  percentage={percentage}
                  historyPoints={historyPoints}
                />
              </div>
            )}

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition"
              >
                Close
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-web3-primary text-white hover:opacity-90 transition disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isDownloading ? "Downloading..." : "Download as PDF"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
