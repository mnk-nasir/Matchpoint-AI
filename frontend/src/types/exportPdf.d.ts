declare module "../../utils/exportPdf" {
  export function exportElementToPdf(
    el: HTMLElement,
    filename?: string,
    opts?: any
  ): Promise<void>;
}
