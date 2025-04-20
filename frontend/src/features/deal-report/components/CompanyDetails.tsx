import React from "react";
import SectionHeader from "./SectionHeader";
import { valueOrDash } from "../lib/format";

export default function CompanyDetails({
  company,
}: {
  company: any;
}) {
  return (
    <div>
      <SectionHeader title="COMPANY DETAILS" />
      <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
        <div className="text-white/60">Phase</div>
        <div className="text-white">{valueOrDash(company?.stage)}</div>
        <div className="text-white/60">Sector</div>
        <div className="text-white">{valueOrDash(company?.sector || "Data / Information")}</div>
        <div className="text-white/60">Sub-Sector</div>
        <div className="text-white">{valueOrDash(company?.subSector || "Data Sources / Information Libraries")}</div>
        <div className="text-white/60">Description</div>
        <div className="text-white">{valueOrDash(company?.description)}</div>
      </div>
    </div>
  );
}
