import React from "react";
import { motion } from "framer-motion";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Slider } from "../ui/Slider";
import { TrendingUp, Target } from "lucide-react";
import { currencySymbol } from "../../utils/currency";

interface MarketData {
  tam: number | "";
  sam: number | "";
  som: number | "";
  targetCustomer: string;
  competitors: string;
  marketGrowth: number | "";
  competitiveAdvantageScore: number;
  currency?: string;
}

interface StepMarketProps {
  data: MarketData;
  updateData: (data: Partial<MarketData>) => void;
  errors?: Record<string, string>;
  onFieldBlur?: (name: keyof MarketData) => void;
}

export default function StepMarket({ data, updateData, errors = {}, onFieldBlur }: StepMarketProps) {
  // Animation variants
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 w-full max-w-3xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants}>
          <Input
            label="TAM (Total Addressable Market)"
            type="number"
            placeholder="e.g. 1000000000"
            value={data.tam || ""}
            onChange={(e) =>
              updateData({ tam: parseFloat(e.target.value) || "" })
            }
            onBlur={() => onFieldBlur && onFieldBlur("tam")}
            id="field-tam"
            required
            error={errors["tam"]}
            icon={<span className="h-4 w-4 text-white/50">{currencySymbol((data as any).currency)}</span>}
          />
          <p className="mt-1 text-xs text-white/40">Total market demand</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Input
            label="SAM (Serviceable Available Market)"
            type="number"
            placeholder="e.g. 50000000"
            value={data.sam || ""}
            onChange={(e) =>
              updateData({ sam: parseFloat(e.target.value) || "" })
            }
            onBlur={() => onFieldBlur && onFieldBlur("sam")}
            id="field-sam"
            required
            error={errors["sam"]}
            icon={<span className="h-4 w-4 text-white/50">{currencySymbol((data as any).currency)}</span>}
          />
          <p className="mt-1 text-xs text-white/40">Segment you can target</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Input
            label="SOM (Serviceable Obtainable Market)"
            type="number"
            placeholder="e.g. 5000000"
            value={data.som || ""}
            onChange={(e) =>
              updateData({ som: parseFloat(e.target.value) || "" })
            }
            onBlur={() => onFieldBlur && onFieldBlur("som")}
            id="field-som"
            required
            error={errors["som"]}
            icon={<span className="h-4 w-4 text-white/50">{currencySymbol((data as any).currency)}</span>}
          />
          <p className="mt-1 text-xs text-white/40">Realistic market share</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Input
            label="Target Customer Segment"
            placeholder="e.g. Enterprise SaaS companies with >50 employees"
            value={data.targetCustomer || ""}
            onChange={(e) => updateData({ targetCustomer: e.target.value })}
            onBlur={() => onFieldBlur && onFieldBlur("targetCustomer")}
            id="field-targetCustomer"
            required
            error={errors["targetCustomer"]}
            icon={<Target className="h-4 w-4" />}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Input
            label="Market Growth Rate (%)"
            type="number"
            placeholder="e.g. 15"
            value={data.marketGrowth || ""}
            onChange={(e) =>
              updateData({ marketGrowth: parseFloat(e.target.value) || "" })
            }
            onBlur={() => onFieldBlur && onFieldBlur("marketGrowth")}
            id="field-marketGrowth"
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Textarea
          label="Competitor List"
          placeholder="List your main competitors and their weaknesses..."
          rows={4}
          value={data.competitors || ""}
          onChange={(e) => updateData({ competitors: e.target.value })}
          onBlur={() => onFieldBlur && onFieldBlur("competitors")}
          id="field-competitors"
          required
          error={errors["competitors"]}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-white/70">
            Competitive Advantage Score
          </label>
          <span className="rounded-full bg-web3-primary/20 px-3 py-1 text-sm font-bold text-web3-primary">
            {data.competitiveAdvantageScore || 5} / 10
          </span>
        </div>
        <div className="px-2">
          <Slider
            value={[data.competitiveAdvantageScore || 5]}
            onValueChange={(val) =>
              updateData({ competitiveAdvantageScore: val[0] })
            }
            min={1}
            max={10}
            step={1}
          />
        </div>
        <p className="text-xs text-white/40">
          Self-assessment of your moat strength compared to competitors.
        </p>
      </motion.div>
    </motion.div>
  );
}
