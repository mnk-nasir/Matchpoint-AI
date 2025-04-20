export function valueOrDash(val: any) {
  if (val === null || val === undefined) return "—";
  if (typeof val === "string" && val.trim() === "") return "—";
  if (typeof val === "number" && Object.is(val, 0)) return "—";
  return val;
}

export function countOrDash(count?: number) {
  if (count === undefined || count === null) return "—";
  if (count === 0) return "—";
  return String(count);
}
