import React from "react";
import { motion } from "framer-motion";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { GlassCard } from "../ui/GlassCard";
import { TrendingUp, Rocket, Target, Clock } from "lucide-react";
import { currencySymbol } from "../../utils/currency";

interface StepExitProps {
  data: any;
  updateData: (data: any) => void;
  errors?: Record<string, string>;
  onFieldBlur?: (name: string) => void;
}

const EXIT_STRATEGIES = [
  { value: "acquisition", label: "Acquisition (M&A)" },
  { value: "ipo", label: "IPO (Public Listing)" },
  { value: "merger", label: "Merger" },
  { value: "buyback", label: "Management Buyback" },
  { value: "secondary", label: "Secondary Sale" },
];

const StepExit: React.FC<StepExitProps> = ({ data, updateData, errors = {}, onFieldBlur }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <GlassCard className="p-6 space-y-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Rocket className="text-web3-primary" />
          Exit Strategy & Returns
        </h3>
        
        <p className="text-sm text-white/60">
          Investors need to understand how and when they will realize a return on their investment.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Preferred Exit Strategy"
            options={EXIT_STRATEGIES}
            value={data.exitStrategy}
            onChange={(e) => updateData({ exitStrategy: e.target.value })}
            onBlur={() => onFieldBlur && onFieldBlur("exitStrategy")}
            id="field-exitStrategy"
            required
            error={errors["exitStrategy"]}
          />

          <Input
            label="Timeline to Exit"
            placeholder="e.g. 5-7 years"
            value={data.exitTimeline}
            onChange={(e) => updateData({ exitTimeline: e.target.value })}
            icon={<Clock className="w-4 h-4 text-white/50" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label={`Expected Exit Valuation (${data.currency || "USD"})`}
            type="number"
            placeholder="e.g. 50000000"
            value={data.exitValuation}
            onChange={(e) => updateData({ exitValuation: e.target.value })}
            icon={<span className="text-white/50">{currencySymbol(data.currency)}</span>}
          />

          <div className="relative">
            <Input
              label="Investor Return Projection (ROI)"
              type="number"
              placeholder="e.g. 10"
              value={data.investorReturn}
              onChange={(e) => updateData({ investorReturn: e.target.value })}
              onBlur={() => onFieldBlur && onFieldBlur("investorReturn")}
              id="field-investorReturn"
              required
              error={errors["investorReturn"]}
              icon={<span className="text-white/50">x</span>}
            />
            <p className="text-xs text-white/40 mt-2">
              Projected multiple on invested capital (MOIC).
            </p>
          </div>
        </div>

        {/* Dynamic ROI Calculation/Feedback */}
        {data.investorReturn && Number(data.investorReturn) > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-web3-primary/10 border border-web3-primary/20 flex items-start gap-3">
            <Target className="w-5 h-5 text-web3-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-web3-primary">Return Projection</h4>
              <p className="text-xs text-white/70 mt-1">
                A <strong>{data.investorReturn}x</strong> return implies that a {currencySymbol(data.currency)}100k investment would grow to{" "}
                <strong>
                  {currencySymbol(data.currency)}
                  {(100000 * Number(data.investorReturn)).toLocaleString()}
                </strong>.
                {Number(data.investorReturn) >= 10 && " This is an attractive return profile for VCs."}
                {Number(data.investorReturn) >= 5 && Number(data.investorReturn) < 10 && " This is a solid return profile for early-stage investors."}
              </p>
            </div>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};

export default StepExit;
