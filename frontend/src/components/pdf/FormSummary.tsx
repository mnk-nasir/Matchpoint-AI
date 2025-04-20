import React from "react";

export default function FormSummary({ data }: { data: any }) {
  const sections: Array<{ title: string; fields: Array<{ key: string; label: string }> }> = [
    {
      title: "Company Identity",
      fields: [
        { key: "companyName", label: "Company Name" },
        { key: "legalStructure", label: "Legal Structure" },
        { key: "incorporationYear", label: "Incorporation Year" },
        { key: "country", label: "Country" },
        { key: "currency", label: "Currency" },
        { key: "stage", label: "Stage" },
        { key: "previousFunding", label: "Previous Funding" },
        { key: "contactEmail", label: "Contact Email" },
        { key: "contactPhone", label: "Contact Phone" },
        { key: "capTableSummary", label: "Cap Table Summary" },
      ],
    },
    {
      title: "Problem & Solution",
      fields: [
        { key: "coreProblem", label: "Core Problem" },
        { key: "solution", label: "Solution" },
        { key: "whyNow", label: "Why Now" },
        { key: "uniqueAdvantage", label: "Unique Advantage" },
      ],
    },
    {
      title: "Market",
      fields: [
        { key: "tam", label: "TAM" },
        { key: "sam", label: "SAM" },
        { key: "som", label: "SOM" },
        { key: "targetCustomer", label: "Target Customer" },
        { key: "competitors", label: "Competitors" },
        { key: "marketGrowth", label: "Market Growth" },
        { key: "competitiveAdvantageScore", label: "Competitive Advantage Score" },
      ],
    },
    {
      title: "Traction",
      fields: [
        { key: "monthlyRevenue", label: "Monthly Revenue" },
        { key: "revenueGrowth", label: "Revenue Growth" },
        { key: "activeUsers", label: "Active Users" },
        { key: "payingCustomers", label: "Paying Customers" },
        { key: "retentionRate", label: "Retention Rate" },
        { key: "hasSignedContracts", label: "Signed Contracts" },
        { key: "hasLOIs", label: "LOIs" },
        { key: "hasPartnerships", label: "Partnerships" },
      ],
    },
    {
      title: "Team",
      fields: [
        { key: "foundersCount", label: "Founders Count" },
        { key: "hasTechnicalFounder", label: "Technical Founder" },
        { key: "teamSize", label: "Team Size" },
        { key: "isFullTime", label: "Full Time" },
        { key: "keyHires", label: "Key Hires" },
        { key: "advisoryBoard", label: "Advisory Board" },
        { key: "founderBackground", label: "Founder Background" },
        { key: "domainExperience", label: "Domain Experience" },
        { key: "prevStartupExp", label: "Previous Startup Experience" },
        { key: "founderProfileUrl", label: "Founder Profile URL" },
      ],
    },
    {
      title: "Funding",
      fields: [
        { key: "amountRaising", label: "Amount Raising" },
        { key: "preMoneyValuation", label: "Pre-money Valuation" },
        { key: "equityOffered", label: "Equity Offered" },
        { key: "fundUse", label: "Use of Funds" },
        { key: "burnRate", label: "Burn Rate" },
        { key: "nextRound", label: "Next Round Plan" },
      ],
    },
    {
      title: "Exit",
      fields: [
        { key: "exitStrategy", label: "Exit Strategy" },
        { key: "investorReturn", label: "Investor Return" },
        { key: "exitValuation", label: "Exit Valuation" },
        { key: "exitTimeline", label: "Exit Timeline" },
      ],
    },
  ];

  const formatValue = (val: any) => {
    if (val === true) return "Yes";
    if (val === false) return "No";
    if (val === null || val === undefined || val === "") return "—";
    return String(val);
    // For file uploads: if present as File or URL, you can add link display here
  };

  return (
    <div className="space-y-4">
      {sections.map((sec) => (
        <div key={sec.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/60 mb-2">{sec.title}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {sec.fields.map((f) => (
              <div key={f.key} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-white/50">{f.label}</div>
                <div className="font-medium text-white break-words">{formatValue(data?.[f.key])}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

