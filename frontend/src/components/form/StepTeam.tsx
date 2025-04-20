import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Toggle } from "../ui/Toggle";
import { GlassCard } from "../ui/GlassCard";
import { Users, Briefcase, Award, GraduationCap, Link2 } from "lucide-react";

interface StepTeamProps {
  data: any;
  updateData: (data: any) => void;
  errors?: Record<string, string>;
  onFieldBlur?: (name: string) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const StepTeam: React.FC<StepTeamProps> = ({ data, updateData, errors = {}, onFieldBlur }) => {
  const [portfolioError, setPortfolioError] = useState<string | undefined>();

  const validatePortfolioUrl = (value: string) => {
    if (!value) {
      setPortfolioError(undefined);
      return;
    }
    try {
      const url = new URL(value);
      if (url.protocol === "http:" || url.protocol === "https:") {
        setPortfolioError(undefined);
      } else {
        setPortfolioError("Please enter a valid URL starting with http or https.");
      }
    } catch {
      setPortfolioError("Please enter a valid URL (e.g. https://www.linkedin.com/in/yourprofile).");
    }
  };

  const handlePortfolioChange = (value: string) => {
    updateData({ founderProfileUrl: value });
    validatePortfolioUrl(value);
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Founder Profile Section */}
      <motion.div variants={item}>
        <GlassCard className="p-6 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5">
            <Award className="text-web3-primary" />
            <h3 className="text-lg font-semibold text-white">
              Founder Profile
            </h3>
          </div>

          <div className="space-y-4">
            <Textarea
              label="Founder Background"
              placeholder="Tell us about your journey, expertise, and what drives you..."
              value={data.founderBackground}
              onChange={(e) => updateData({ founderBackground: e.target.value })}
              rows={4}
              onBlur={() => onFieldBlur && onFieldBlur("founderBackground")}
              id="field-founderBackground"
              required
              error={errors["founderBackground"]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Domain Experience (Years)"
                type="number"
                placeholder="e.g. 7"
                value={data.domainExperience}
                onChange={(e) => updateData({ domainExperience: e.target.value })}
                icon={<Briefcase className="w-4 h-4 text-white/50" />}
                onBlur={() => onFieldBlur && onFieldBlur("domainExperience")}
                id="field-domainExperience"
                required
                error={errors["domainExperience"]}
              />

              <Input
                label="Portfolio/LinkedIn Profile"
                type="url"
                placeholder="https://www.linkedin.com/in/yourprofile"
                value={data.founderProfileUrl || ""}
                onChange={(e) => handlePortfolioChange(e.target.value)}
                icon={<Link2 className="w-4 h-4 text-white/50" />}
                error={portfolioError}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Toggle
                label="Previous Startup Experience"
                description="Have you founded a startup before?"
                checked={data.prevStartupExp || false}
                onChange={(checked) => updateData({ prevStartupExp: checked })}
              />

              <Toggle
                label="Full-time Founder"
                description="Are you working on this full-time?"
                checked={data.isFullTime || false}
                onChange={(checked) => updateData({ isFullTime: checked })}
              />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Team Expansion Section */}
      <motion.div variants={item}>
        <GlassCard className="p-6 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5">
            <Users className="text-web3-purple" />
            <h3 className="text-lg font-semibold text-white">
              Team Expansion
            </h3>
          </div>

          <div className="space-y-4">
            <Textarea
              label="Key Hires Needed"
              placeholder="Who do you need to hire next? (e.g. CTO, Sales Lead, Growth Marketer)"
              value={data.keyHires}
              onChange={(e) => updateData({ keyHires: e.target.value })}
              rows={3}
            />

            <Textarea
              label="Advisory Board"
              placeholder="List any advisors, mentors, or industry experts supporting you..."
              value={data.advisoryBoard}
              onChange={(e) => updateData({ advisoryBoard: e.target.value })}
              rows={3}
            />
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};

export default StepTeam;
