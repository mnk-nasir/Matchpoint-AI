import React from "react";
import { motion } from "framer-motion";
import { Input } from "../ui/Input";
import { Toggle } from "../ui/Toggle";
import { TrendingUp, Users, Activity } from "lucide-react";
import { currencySymbol } from "../../utils/currency";

interface TractionData {
  monthlyRevenue: number | "";
  revenueGrowth: number | "";
  activeUsers: number | "";
  payingCustomers: number | "";
  retentionRate: number | "";
  hasSignedContracts: boolean;
  hasLOIs: boolean;
  hasPartnerships: boolean;
  currency?: string;
}

interface StepTractionProps {
  data: TractionData;
  updateData: (data: Partial<TractionData>) => void;
  errors?: Record<string, string>;
  onFieldBlur?: (name: keyof TractionData) => void;
}

export default function StepTraction({ data, updateData, errors = {}, onFieldBlur }: StepTractionProps) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Input
            label="Monthly Revenue (MRR)"
            type="number"
            placeholder="0"
            value={data.monthlyRevenue || ""}
            onChange={(e) =>
              updateData({ monthlyRevenue: parseFloat(e.target.value) || "" })
            }
            onBlur={() => onFieldBlur && onFieldBlur("monthlyRevenue")}
            id="field-monthlyRevenue"
            required
            error={errors["monthlyRevenue"]}
            icon={<span className="h-4 w-4 text-white/50">{currencySymbol((data as any).currency)}</span>}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Input
            label="Monthly Revenue Growth (%)"
            type="number"
            placeholder="e.g. 15"
            value={data.revenueGrowth || ""}
            onChange={(e) =>
              updateData({ revenueGrowth: parseFloat(e.target.value) || "" })
            }
            onBlur={() => onFieldBlur && onFieldBlur("revenueGrowth")}
            id="field-revenueGrowth"
            required
            error={errors["revenueGrowth"]}
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Input
            label="Active Users (MAU)"
            type="number"
            placeholder="0"
            value={data.activeUsers || ""}
            onChange={(e) =>
              updateData({ activeUsers: parseFloat(e.target.value) || "" })
            }
            onBlur={() => onFieldBlur && onFieldBlur("activeUsers")}
            id="field-activeUsers"
            required
            error={errors["activeUsers"]}
            icon={<Users className="h-4 w-4" />}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Input
            label="Paying Customers"
            type="number"
            placeholder="0"
            value={data.payingCustomers || ""}
            onChange={(e) =>
              updateData({ payingCustomers: parseFloat(e.target.value) || "" })
            }
            onBlur={() => onFieldBlur && onFieldBlur("payingCustomers")}
            id="field-payingCustomers"
            required
            error={errors["payingCustomers"]}
            icon={<Users className="h-4 w-4 text-web3-primary" />}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-2">
          <Input
            label="Retention Rate (%)"
            type="number"
            placeholder="e.g. 85"
            value={data.retentionRate || ""}
            onChange={(e) =>
              updateData({ retentionRate: parseFloat(e.target.value) || "" })
            }
            onBlur={() => onFieldBlur && onFieldBlur("retentionRate")}
            id="field-retentionRate"
            required
            error={errors["retentionRate"]}
            icon={<Activity className="h-4 w-4" />}
          />
        </motion.div>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/10">
        <h3 className="text-sm font-medium text-white/70">
          Validation & Partnerships
        </h3>
        <motion.div variants={itemVariants}>
          <Toggle
            label="Signed Contracts"
            description="Do you have legally binding contracts with customers?"
            checked={data.hasSignedContracts || false}
            onChange={(checked) => updateData({ hasSignedContracts: checked })}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Toggle
            label="Letters of Intent (LOIs)"
            description="Do you have formal expressions of interest?"
            checked={data.hasLOIs || false}
            onChange={(checked) => updateData({ hasLOIs: checked })}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Toggle
            label="Strategic Partnerships"
            description="Do you have active partnerships with other companies?"
            checked={data.hasPartnerships || false}
            onChange={(checked) => updateData({ hasPartnerships: checked })}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
