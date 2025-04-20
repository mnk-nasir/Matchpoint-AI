import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { Building2, Globe, Calendar, Mail, Phone, Image as ImageIcon, AlertCircle } from "lucide-react";
import { currencySymbol } from "../../utils/currency";
import { GlassCard } from "../ui/GlassCard";

interface IdentityData {
  companyName: string;
  legalStructure: string;
  incorporationYear: number | "";
  country: string;
  currency?: string;
  companyLogoUrl?: string;
  capTableSummary: string;
  stage: string;
  previousFunding: number | "";
  contactEmail?: string;
  contactPhone?: string;
  sector?: string;
}

interface StepIdentityProps {
  data: IdentityData;
  updateData: (data: Partial<IdentityData>) => void;
  errors?: Record<string, string>;
  onFieldBlur?: (name: keyof IdentityData) => void;
}

const LEGAL_STRUCTURES = [
  { value: "c-corp", label: "C-Corporation" },
  { value: "s-corp", label: "S-Corporation" },
  { value: "llc", label: "LLC" },
  { value: "partnership", label: "Partnership" },
  { value: "sole-proprietorship", label: "Sole Proprietorship" },
  { value: "other", label: "Other" },
];

const STAGES = [
  { value: "idea", label: "Idea" },
  { value: "mvp", label: "MVP Launched" },
  { value: "pre-seed", label: "Pre-Seed" },
  { value: "seed", label: "Seed" },
  { value: "series-a", label: "Series A" },
  { value: "growth", label: "Growth" },
];

const INDUSTRY_SECTORS = [
  { value: "Fintech", label: "Fintech" },
  { value: "Edtech", label: "Edtech" },
  { value: "Healthtech", label: "Healthtech" },
  { value: "SaaS", label: "SaaS" },
  { value: "E-commerce", label: "E-commerce" },
  { value: "AI / ML", label: "AI / ML" },
  { value: "Agritech", label: "Agritech" },
  { value: "Cleantech", label: "Cleantech" },
  { value: "PropTech", label: "PropTech" },
  { value: "Logistics", label: "Logistics" },
  { value: "Cybersecurity", label: "Cybersecurity" },
  { value: "Gaming", label: "Gaming" },
  { value: "Marketplace", label: "Marketplace" },
  { value: "Media & Entertainment", label: "Media & Entertainment" },
  { value: "Legal Tech", label: "Legal Tech" },
  { value: "HR Tech", label: "HR Tech" },
  { value: "Supply Chain", label: "Supply Chain" },
  { value: "DeepTech", label: "DeepTech" },
  { value: "Consumer", label: "Consumer" },
  { value: "Other", label: "Other" },
];

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  "united states": "USD",
  usa: "USD",
  "u.s.a": "USD",
  "united states of america": "USD",
  "united kingdom": "GBP",
  uk: "GBP",
  "great britain": "GBP",
  england: "GBP",
  india: "INR",
  canada: "CAD",
  australia: "AUD",
  "new zealand": "NZD",
  singapore: "SGD",
  "united arab emirates": "AED",
  uae: "AED",
  "saudi arabia": "SAR",
  japan: "JPY",
  china: "CNY",
  brazil: "BRL",
  mexico: "MXN",
  "south africa": "ZAR",
  germany: "EUR",
  france: "EUR",
  spain: "EUR",
  italy: "EUR",
  netherlands: "EUR",
  belgium: "EUR",
  ireland: "EUR",
  portugal: "EUR",
  eurozone: "EUR",
};

const DEFAULT_CURRENCY = "USD";

export default function StepIdentity({ data, updateData, errors = {}, onFieldBlur }: StepIdentityProps) {
  const [currencyError, setCurrencyError] = useState<string | undefined>();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const resolveCurrency = (countryValue: string) => {
    const key = countryValue.trim().toLowerCase();
    if (!key) {
      setCurrencyError(undefined);
      updateData({ currency: "" });
      return;
    }
    const code = COUNTRY_TO_CURRENCY[key];
    if (code) {
      setCurrencyError(undefined);
      updateData({ currency: code });
    } else {
      setCurrencyError("Country not recognised, defaulting to USD.");
      updateData({ currency: DEFAULT_CURRENCY });
    }
  };

  const handleCountryInput = (value: string) => {
    updateData({ country: value });
    resolveCurrency(value);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 w-full max-w-3xl mx-auto"
    >
      <motion.div variants={itemVariants}>
        <GlassCard className="p-6 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5">
            <Building2 className="text-web3-primary" />
            <h3 className="text-lg font-semibold text-white">Company Basics</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Company Name"
                placeholder="e.g. Acme Innovations Inc."
                value={data.companyName || ""}
                onChange={(e) => updateData({ companyName: e.target.value })}
                onBlur={() => onFieldBlur && onFieldBlur("companyName")}
                id="field-companyName"
                required
                error={errors["companyName"]}
                icon={<Building2 className="h-4 w-4" />}
                autoFocus
              />
            </div>
            <div className="md:col-span-2">
              <Select
                label="Industry / Sector"
                value={data.sector || ""}
                onChange={(e) => updateData({ sector: e.target.value })}
                options={INDUSTRY_SECTORS}
                id="field-sector"
                required
                error={errors["sector" as any]}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-white/70 block mb-1">
                Company Logo <span className="text-red-400 font-bold">*</span>
              </label>
              <div className={`flex items-center gap-6 p-2 rounded-2xl transition-all duration-300 ${errors.companyLogoUrl ? 'bg-red-500/5 ring-1 ring-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]' : ''}`}>
                <div className="relative group">
                  <div className={`h-24 w-24 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-300 ${errors.companyLogoUrl ? 'border-red-500/40 bg-red-500/5' : 'border-white/20 bg-white/5'} group-hover:border-web3-primary/50 group-hover:bg-web3-primary/10`}>
                    {data.companyLogoUrl ? (
                      <img 
                        src={data.companyLogoUrl} 
                        alt="Logo Preview" 
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <ImageIcon className={`h-8 w-8 transition-colors ${errors.companyLogoUrl ? 'text-red-400/50' : 'text-white/20'} group-hover:text-web3-primary/50`} />
                    )}
                  </div>
                  {data.companyLogoUrl && (
                    <button
                      type="button"
                      onClick={() => updateData({ companyLogoUrl: "" })}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg shadow-black/20"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="relative group/input">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) {
                            alert("Logo must be under 10MB");
                            e.target.value = "";
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            updateData({ companyLogoUrl: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="logo-upload"
                    />
                    <div className={`flex items-center justify-center w-full px-6 py-4 border border-white/10 rounded-xl bg-white/5 transition-all duration-300 pointer-events-none ${errors.companyLogoUrl ? 'border-red-500/30' : ''} group-hover/input:bg-white/10`}>
                      <div className="flex flex-col items-center gap-1 text-center">
                        <span className={`text-sm font-semibold ${errors.companyLogoUrl ? 'text-red-400' : 'text-web3-primary'}`}>
                          {errors.companyLogoUrl ? 'Upload Required' : 'Click to upload'}
                        </span>
                        <span className="text-[10px] text-white/40 tracking-wider">PNG, JPG or SVG (Max 10MB)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {errors.companyLogoUrl && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.companyLogoUrl}
                </p>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={itemVariants}>
        <GlassCard className="p-6 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5">
            <Globe className="text-web3-purple" />
            <h3 className="text-lg font-semibold text-white">Registration & Location</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Legal Structure"
              options={LEGAL_STRUCTURES}
              value={data.legalStructure || ""}
              onChange={(e) => updateData({ legalStructure: e.target.value })}
              onBlur={() => onFieldBlur && onFieldBlur("legalStructure")}
              id="field-legalStructure"
              required
              error={errors["legalStructure"]}
            />
            <Input
              label="Incorporation Year"
              type="number"
              placeholder="YYYY"
              value={data.incorporationYear || ""}
              onChange={(e) =>
                updateData({ incorporationYear: parseInt(e.target.value) || "" })
              }
              onBlur={() => onFieldBlur && onFieldBlur("incorporationYear")}
              id="field-incorporationYear"
              required
              error={errors["incorporationYear"]}
              icon={<Calendar className="h-4 w-4" />}
            />
            <Input
              label="Country / HQ"
              placeholder="e.g. United States"
              value={data.country || ""}
              onChange={(e) => handleCountryInput(e.target.value)}
              onBlur={() => onFieldBlur && onFieldBlur("country")}
              id="field-country"
              required
              error={errors["country"]}
              icon={<Globe className="h-4 w-4" />}
            />
            <Input
              label="Currency"
              placeholder={DEFAULT_CURRENCY}
              value={data.currency || ""}
              readOnly
              icon={<span className="text-white/50">{currencySymbol(data.currency)}</span>}
              error={currencyError}
            />
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={itemVariants}>
        <GlassCard className="p-6 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5">
            <Mail className="text-web3-primary" />
            <h3 className="text-lg font-semibold text-white">Contacts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contact Email"
              type="email"
              placeholder="you@company.com"
              value={data.contactEmail || ""}
              onChange={(e) => updateData({ contactEmail: e.target.value })}
              onBlur={() => onFieldBlur && onFieldBlur("contactEmail" as any)}
              id="field-contactEmail"
              required
              error={errors["contactEmail" as any]}
              icon={<Mail className="h-4 w-4" />}
            />
            <Input
              label="Contact Phone"
              type="tel"
              placeholder="+1 555 123 4567"
              value={data.contactPhone || ""}
              onChange={(e) => updateData({ contactPhone: e.target.value })}
              onBlur={() => onFieldBlur && onFieldBlur("contactPhone" as any)}
              id="field-contactPhone"
              required
              error={errors["contactPhone" as any]}
              icon={<Phone className="h-4 w-4" />}
            />
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={itemVariants}>
        <GlassCard className="p-6 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5">
            <Building2 className="text-web3-primary" />
            <h3 className="text-lg font-semibold text-white">Stage & Ownership</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Current Stage"
              options={STAGES}
              value={data.stage || ""}
              onChange={(e) => updateData({ stage: e.target.value })}
              onBlur={() => onFieldBlur && onFieldBlur("stage")}
              id="field-stage"
              required
              error={errors["stage"]}
            />
            <Input
              label={`Previous Funding Raised (${data.currency || DEFAULT_CURRENCY})`}
              type="number"
              placeholder="0"
              value={data.previousFunding || ""}
              onChange={(e) =>
                updateData({ previousFunding: parseFloat(e.target.value) || 0 })
              }
              onBlur={() => onFieldBlur && onFieldBlur("previousFunding")}
              id="field-previousFunding"
              icon={<span className="text-white/50">{currencySymbol(data.currency)}</span>}
            />
            <div className="md:col-span-2">
              <Textarea
                label="Cap Table Summary"
                placeholder="Briefly describe ownership structure (e.g. Founders 60%, Investors 30%, ESOP 10%)"
                rows={4}
                value={data.capTableSummary || ""}
                onChange={(e) => updateData({ capTableSummary: e.target.value })}
                onBlur={() => onFieldBlur && onFieldBlur("capTableSummary" as any)}
                id="field-capTableSummary"
              />
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
