export function deriveStrengths(data: any) {
  const strengths: string[] = [];
  if (Number(data?.monthlyRevenue) > 0) strengths.push("Revenue generating");
  if (Number(data?.revenueGrowth) > 0) strengths.push("Positive revenue growth");
  if (Number(data?.activeUsers) > 1000) strengths.push("Strong user traction");
  if (Number(data?.payingCustomers) > 0) strengths.push("Paying customers");
  if (data?.hasSignedContracts || data?.hasLOIs) strengths.push("Commercial validation");
  if (data?.hasTechnicalFounder) strengths.push("Technical founding capacity");
  if (Number(data?.domainExperience) >= 5) strengths.push("Deep domain experience");
  if (Number(data?.investorReturn) >= 5) strengths.push("Attractive ROI target");
  return strengths.length ? strengths : ["Strength signals under review"];
}

export function deriveWeaknesses(data: any) {
  const weaknesses: string[] = [];
  if (!data?.hasSignedContracts && !data?.hasLOIs) weaknesses.push("Limited commercial commitments");
  if (Number(data?.monthlyRevenue) === 0) weaknesses.push("Pre‑revenue");
  if (!data?.isFullTime) weaknesses.push("Founder not full‑time");
  if (!String(data?.competitors || "").trim()) weaknesses.push("Competitive landscape unclear");
  if (Number(data?.retentionRate) === 0) weaknesses.push("Retention not established");
  if (Number(data?.previousFunding) === 0 && Number(data?.monthlyRevenue) === 0) weaknesses.push("No funding and no revenue");
  return weaknesses.length ? weaknesses : ["No critical gaps detected"];
}

export function deriveSummary(data: any, score: number): string {
  const name = String(data?.companyName || "").trim() || "The company";
  const stage = String(data?.stage || "").trim() || null;
  const country = String(data?.country || "").trim() || null;
  const sector = String(data?.sector || "").trim() || null;
  const mrr = Number(data?.monthlyRevenue || 0);
  const growth = Number(data?.revenueGrowth || 0);
  const users = Number(data?.activeUsers || 0);
  const payers = Number(data?.payingCustomers || 0);
  const prev = Number(data?.previousFunding || 0);
  const raising = Number(data?.amountRaising || 0);
  const pre = Number(data?.preMoneyValuation || 0);
  const equity = Number(data?.equityOffered || 0);
  const loi = Boolean(data?.hasLOIs);
  const contracts = Boolean(data?.hasSignedContracts);
  const tech = Boolean(data?.hasTechnicalFounder);
  const exitStrategy = String(data?.exitStrategy || "").trim() || null;
  const roi = Number(data?.investorReturn || 0);
  const exitVal = Number(data?.exitValuation || 0);
  const parts: string[] = [];
  let intro = `${name}`;
  if (stage && country && sector) intro += ` is a ${stage.toLowerCase()} venture in ${country}, operating in ${sector}.`;
  else if (stage && country) intro += ` is a ${stage.toLowerCase()} venture in ${country}.`;
  else if (stage && sector) intro += ` is a ${stage.toLowerCase()} venture in ${sector}.`;
  else intro += ` is building its business.`;
  parts.push(intro);
  const traction: string[] = [];
  if (mrr > 0) traction.push(`MRR ${Math.round(mrr).toLocaleString()}`);
  if (growth > 0) traction.push(`${Math.round(growth)}% revenue growth`);
  if (users > 0) traction.push(`${Math.round(users).toLocaleString()} active users`);
  if (payers > 0) traction.push(`${Math.round(payers).toLocaleString()} paying customers`);
  if (traction.length) parts.push(`Traction signals include ${traction.join(", ")}.`);
  const mv: string[] = [];
  if (loi) mv.push("LOIs");
  if (contracts) mv.push("signed contracts");
  if (mv.length) parts.push(`Commercial validation via ${mv.join(" and ")}.`);
  const round: string[] = [];
  if (prev > 0) round.push(`previous funding ${Math.round(prev).toLocaleString()}`);
  if (raising > 0) round.push(`raising ${Math.round(raising).toLocaleString()}`);
  if (pre > 0) round.push(`pre-money ${Math.round(pre).toLocaleString()}`);
  if (equity > 0) round.push(`equity offered ${equity.toFixed(1)}%`);
  if (round.length) parts.push(`Round economics: ${round.join(", ")}.`);
  const team: string[] = [];
  if (tech) team.push("technical founder present");
  if (team.length) parts.push(`Team profile: ${team.join(", ")}.`);
  const exit: string[] = [];
  if (exitStrategy) exit.push(`exit strategy ${exitStrategy}`);
  if (roi > 0) exit.push(`target ROI ${roi}x`);
  if (exitVal > 0) exit.push(`target exit valuation ${Math.round(exitVal).toLocaleString()}`);
  if (exit.length) parts.push(`Exit planning: ${exit.join(", ")}.`);
  parts.push(`Signal score ${Math.round(score)} out of 200 indicates overall attractiveness subject to diligence.`);
  return parts.join(" ");
}
