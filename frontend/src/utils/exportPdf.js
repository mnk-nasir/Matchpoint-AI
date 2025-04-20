import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportElementToPdf(el, filename = "document.pdf", opts = {}) {
  if (!el) throw new Error("exportElementToPdf: element is required");
  const {
    margin = 10, // mm
    scale = Math.min(3, window.devicePixelRatio * 2), // higher scale for clarity
    format = "a4",
    orientation = "portrait",
    backgroundColor = "#0b1220",
    ignoreSelector,
  } = opts;

  // Make sure element is visible and sized
  const canvas = await html2canvas(el, {
    scale,
    backgroundColor,
    useCORS: true,
    logging: false,
    windowWidth: document.documentElement.clientWidth,
    ignoreElements: ignoreSelector
      ? (element) => {
          try {
            return element.matches?.(ignoreSelector);
          } catch {
            return false;
          }
        }
      : undefined,
  });

  const pdf = new jsPDF({ orientation, unit: "mm", format });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Calculate image dimensions to fit within page margins
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;
  const imgWidthPx = canvas.width;
  const imgHeightPx = canvas.height;
  const mmPerPx = 25.4 / 96; // approx conversion
  const imgWidthMm = imgWidthPx * mmPerPx;
  // Scale factor from original image mm to printed mm
  const ratio = usableWidth / imgWidthMm;
  // Height (in original px) that fits on one PDF page
  const pxPerPage = Math.max(1, Math.floor(usableHeight / (mmPerPx * ratio)));

  let y = 0;
  let isFirst = true;
  while (y < imgHeightPx) {
    const sliceH = Math.min(pxPerPage, imgHeightPx - y);
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = imgWidthPx;
    sliceCanvas.height = sliceH;
    const ctx = sliceCanvas.getContext("2d");
    ctx.drawImage(canvas, 0, y, imgWidthPx, sliceH, 0, 0, imgWidthPx, sliceH);
    const sliceData = sliceCanvas.toDataURL("image/jpeg", 0.98);

    const renderW = usableWidth;
    const renderH = (sliceH * mmPerPx) * ratio;

    if (!isFirst) pdf.addPage();
    pdf.addImage(sliceData, "JPEG", margin, margin, renderW, renderH);

    y += sliceH;
    isFirst = false;
  }

  pdf.save(filename);
}
