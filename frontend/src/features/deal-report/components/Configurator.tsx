import React from "react";
import SectionHeader from "./SectionHeader";
import { valueOrDash } from "../lib/format";
import { currencySymbol } from "../../../utils/currency";

export default function Configurator({ company }: { company: any }) {
  const symbol = currencySymbol(company?.currency);
  const sharesOffered = company?.equityOffered;
  const investmentNeeded = company?.amountRaising;
  const desiredPre = company?.preMoneyValuation;
  const desiredPost =
    Number.isFinite(Number(desiredPre)) && Number.isFinite(Number(investmentNeeded))
      ? Number(desiredPre) + Number(investmentNeeded)
      : company?.desiredValuationPost;
  const exitMultiple = (() => {
    const exitVal = Number(company?.exitValuation);
    const base = Number(desiredPre) || Number(investmentNeeded);
    if (Number.isFinite(exitVal) && exitVal > 0 && Number.isFinite(base) && base > 0) {
      return +(exitVal / base).toFixed(2);
    }
    return company?.exitMultiple;
  })();
  const roiMultiple = company?.roiMultiple ?? company?.investorReturn;

  const itemsLeft = [
    ["Shares Offered", sharesOffered ?? "—"],
    [`Investment Needed (${symbol})`, investmentNeeded ?? "—"],
    ["Exit / Sale Event (x)", exitMultiple ?? "—"],
  ];
  const itemsRight = [
    [`Desired Valuation - Pre (${symbol})`, desiredPre ?? "—"],
    [`Desired Valuation - Post (${symbol})`, desiredPost ?? "—"],
    ["Investor Exit Return (x)", company?.investorReturn ?? "—"],
    ["ROI Multiple", roiMultiple ?? "—"],
  ];
  return (
    <div>
      <SectionHeader title="CONFIGURATOR" className="mb-3" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="space-y-3">
          {itemsLeft.map(([k, v]) => (
            <div key={k as string} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-white/60">{k}</div>
              <div className="font-semibold text-white">{String(valueOrDash(v))}</div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {itemsRight.map(([k, v]) => (
            <div key={k as string} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs text-white/60">{k}</div>
              <div className="font-semibold text-white">{String(valueOrDash(v))}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
