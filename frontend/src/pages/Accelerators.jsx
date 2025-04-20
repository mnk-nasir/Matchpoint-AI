import React from "react";
import AcceleratorsHero from "../features/accelerators/Hero.jsx";
import { FeatureCards, CTA } from "../features/accelerators/Sections.jsx";

export default function Accelerators() {
  return (
    <section className="min-h-screen text-white" style={{ backgroundColor: "#050a12" }}>
      <AcceleratorsHero />
      <div className="mx-auto max-w-5xl px-6 py-16">
        <FeatureCards />
        <CTA />
      </div>
    </section>
  );
}
