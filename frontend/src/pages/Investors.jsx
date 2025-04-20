import React from "react";
import InvestorsHero from "../features/investors/Hero.jsx";
import { FeatureCards } from "../features/investors/Sections.jsx";
import InvestorsCTA from "../features/investors/CTA.jsx";

export default function Investors() {
  return (
    <section className="min-h-screen text-white" style={{ backgroundColor: "#050a12" }}>
      <InvestorsHero />
      <div className="mx-auto max-w-5xl px-6 py-16">
        <FeatureCards />
        <InvestorsCTA />
      </div>
    </section>
  );
}
