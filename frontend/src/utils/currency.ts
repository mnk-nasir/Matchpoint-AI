export function currencySymbol(code?: string): string {
  const normalized = (code || "USD").toUpperCase();
  const map: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    INR: "₹",
    CAD: "CA$",
    AUD: "A$",
    NZD: "NZ$",
    SGD: "S$",
    AED: "AED",
    SAR: "SAR",
    CNY: "¥",
    BRL: "R$",
    MXN: "MX$",
    ZAR: "R",
  };
  return map[normalized] || normalized;
}
