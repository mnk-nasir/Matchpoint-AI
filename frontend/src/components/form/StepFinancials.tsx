import React from "react";
import { motion } from "framer-motion";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { GlassCard } from "../ui/GlassCard";
import { Tooltip } from "../ui/Tooltip";
import { DollarSign, Percent } from "lucide-react";
import { currencySymbol } from "../../utils/currency";

interface StepFinancialsProps {
  data: any;
  updateData: (data: any) => void;
  errors?: Record<string, string>;
  onFieldBlur?: (name: string) => void;
}

const StepFinancials: React.FC<StepFinancialsProps> = ({ data, updateData, errors = {}, onFieldBlur }) => {
  const currencyCode: string = data.currency || "USD";
  const currencySymbolValue = currencySymbol(currencyCode);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Amount Raising */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="text-web3-primary" />
            Funding Request
          </h3>

          <Input
            label={`Amount Raising (${currencySymbolValue})`}
            type="number"
            placeholder="e.g. 500000"
            value={data.amountRaising}
            onChange={(e) => updateData({ amountRaising: e.target.value })}
            onBlur={() => onFieldBlur && onFieldBlur("amountRaising")}
            id="field-amountRaising"
            required
            error={errors["amountRaising"]}
            icon={<span className="text-white/50">{currencySymbolValue}</span>}
          />

          <div className="flex items-center gap-2">
            <Input
              label={`Pre-money Valuation (${currencySymbolValue})`}
              type="number"
              placeholder="e.g. 2000000"
              value={data.preMoneyValuation}
              onChange={(e) => updateData({ preMoneyValuation: e.target.value })}
              onBlur={() => onFieldBlur && onFieldBlur("preMoneyValuation")}
              id="field-preMoneyValuation"
              required
              error={errors["preMoneyValuation"]}
              icon={<span className="text-white/50">{currencySymbolValue}</span>}
            />
            <div className="pt-8">
              <Tooltip content="The value of your company before this round of investment." />
            </div>
          </div>

          <div className="relative">
            <Input
              label="Equity Offered (%)"
              type="number"
              placeholder="e.g. 15"
              value={data.equityOffered}
              onChange={(e) => updateData({ equityOffered: e.target.value })}
              onBlur={() => onFieldBlur && onFieldBlur("equityOffered")}
              id="field-equityOffered"
              required
              error={errors["equityOffered"]}
              icon={<span className="text-white/50">%</span>}
            />
            {data.amountRaising && data.preMoneyValuation && (
              <p className="text-xs text-white/50 mt-2">
                Implied Post-Money:{" "}
                <span className="text-web3-primary font-bold">
                  {currencySymbolValue}
                  {(Number(data.preMoneyValuation) + Number(data.amountRaising)).toLocaleString()}
                </span>
              </p>
            )}
          </div>
        </GlassCard>

        {/* Use of Funds */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Use of Funds</h3>
          <Textarea
            label="Breakdown of how you will use the capital"
            placeholder="e.g. 40% Product Development, 30% Marketing, 30% Operations..."
            value={data.fundUse}
            onChange={(e) => updateData({ fundUse: e.target.value })}
            rows={5}
            onBlur={() => onFieldBlur && onFieldBlur("fundUse")}
            id="field-fundUse"
            required
            error={errors["fundUse"]}
          />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Expected Next Round"
              placeholder="e.g. Series A in 18 months"
              value={data.nextRound}
              onChange={(e) => updateData({ nextRound: e.target.value })}
            />
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default StepFinancials;
