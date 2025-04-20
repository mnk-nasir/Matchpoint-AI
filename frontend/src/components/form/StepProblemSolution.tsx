import React from "react";
import { motion } from "framer-motion";
import { Textarea } from "../ui/Textarea";

interface ProblemSolutionData {
  coreProblem: string;
  solution: string;
  whyNow: string;
  uniqueAdvantage: string;
}

interface StepProblemSolutionProps {
  data: ProblemSolutionData;
  updateData: (data: Partial<ProblemSolutionData>) => void;
  errors?: Record<string, string>;
  onFieldBlur?: (name: keyof ProblemSolutionData) => void;
}

export default function StepProblemSolution({
  data,
  updateData,
  errors = {},
  onFieldBlur,
}: StepProblemSolutionProps) {
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

  // Word counter helper
  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const MAX_WORDS = 300;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 w-full max-w-4xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="md:col-span-2">
          <div className="relative">
            <Textarea
              label="Core Problem"
              placeholder="Describe the specific pain point your customers are facing..."
              rows={3}
              value={data.coreProblem || ""}
              onChange={(e) => {
                const text = e.target.value;
                if (getWordCount(text) <= MAX_WORDS) {
                  updateData({ coreProblem: text });
                }
              }}
              onBlur={() => onFieldBlur && onFieldBlur("coreProblem")}
              id="field-coreProblem"
              required
              error={errors["coreProblem"]}
            />
            <div className="absolute top-0 right-0 text-xs text-white/40 mt-2 mr-1">
              {getWordCount(data.coreProblem || "")} / {MAX_WORDS} words
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-2">
          <Textarea
            label="Your Solution"
            placeholder="How does your product solve this problem uniquely?"
            rows={3}
            value={data.solution || ""}
            onChange={(e) => updateData({ solution: e.target.value })}
            onBlur={() => onFieldBlur && onFieldBlur("solution")}
            id="field-solution"
            required
            error={errors["solution"]}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Textarea
            label="Why Now?"
            placeholder="Why is this the perfect time for your solution? (e.g., market trends, tech shifts)"
            rows={3}
            value={data.whyNow || ""}
            onChange={(e) => updateData({ whyNow: e.target.value })}
            onBlur={() => onFieldBlur && onFieldBlur("whyNow")}
            id="field-whyNow"
            required
            error={errors["whyNow"]}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Textarea
            label="Unique Advantage (Moat)"
            placeholder="What makes your solution defensible? (e.g., IP, network effects, exclusive data)"
            rows={3}
            value={data.uniqueAdvantage || ""}
            onChange={(e) => updateData({ uniqueAdvantage: e.target.value })}
            onBlur={() => onFieldBlur && onFieldBlur("uniqueAdvantage")}
            id="field-uniqueAdvantage"
            required
            error={errors["uniqueAdvantage"]}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
