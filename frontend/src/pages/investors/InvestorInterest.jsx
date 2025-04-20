import React, { useState } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { GlowButton } from "../../components/ui/GlowButton";
import { User, Linkedin, Mail, Phone, Building2, Briefcase, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { leadsService } from "../../services/leads";

export default function InvestorInterest() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: "",
    linkedin: "",
    email: "",
    phone: "",
    firm: "",
    role: "",
    focus: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const update = (patch) => setData((d) => ({ ...d, ...patch }));

  const validate = () => {
    const e = {};
    if (!data.name.trim()) e.name = "Name is required";
    if (!data.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) e.email = "Valid email required";
    if (data.linkedin && !/^https?:\/\/(www\.)?linkedin\.com\/.*$/i.test(data.linkedin))
      e.linkedin = "Enter a valid LinkedIn URL";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      name: data.name,
      linkedin: data.linkedin || undefined,
      email: data.email,
      phone: data.phone || undefined,
      firm: data.firm || undefined,
      role: data.role || undefined,
      focus: data.focus || undefined,
    };
    try {
      await leadsService.submitInvestorLead(payload);
      setSubmitted(true);
    } catch (err) {
      alert(err?.message || "Failed to submit. Please try again.");
    }
  };

  if (submitted) {
    return (
      <section className="min-h-screen text-white" style={{ backgroundColor: "#050a12" }}>
        <div className="mx-auto max-w-2xl px-6 py-24">
          <GlassCard className="p-8 space-y-6">
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              Thanks for Registering Your Interest
            </h1>
            <p className="text-white/70" style={{ fontFamily: "'Space Mono', monospace" }}>
              We’ve captured your details. Our team will get in touch shortly.
            </p>
            <div className="flex gap-3">
              <GlowButton onClick={() => navigate("/investors")}>Back to Investors</GlowButton>
              <GlowButton variant="secondary" onClick={() => navigate("/")}>Home</GlowButton>
            </div>
          </GlassCard>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen text-white" style={{ backgroundColor: "#050a12" }}>
      <div className="mx-auto max-w-3xl px-6 py-24">
        <div
          className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] bg-white/5"
          style={{ borderColor: "rgba(255,255,255,0.12)", fontFamily: "'Space Mono', monospace" }}
        >
          Investor Interest
        </div>
        <h1 className="mt-6 text-4xl sm:text-5xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          Tell Us About You
        </h1>
        <p className="mt-3 text-white/70" style={{ fontFamily: "'Space Mono', monospace" }}>
          Short form for investors and funds — just the essentials.
        </p>

        <GlassCard className="p-6 mt-8">
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="inv-name"
              label="Full Name"
              placeholder="Jane Doe"
              value={data.name}
              onChange={(e) => update({ name: e.target.value })}
              error={errors.name}
              required
              icon={<User className="h-4 w-4" />}
            />
            <Input
              id="inv-linkedin"
              label="LinkedIn Profile"
              placeholder="https://www.linkedin.com/in/..."
              value={data.linkedin}
              onChange={(e) => update({ linkedin: e.target.value })}
              error={errors.linkedin}
              icon={<Linkedin className="h-4 w-4" />}
            />
            <Input
              id="inv-email"
              label="Email"
              type="email"
              placeholder="you@firm.com"
              value={data.email}
              onChange={(e) => update({ email: e.target.value })}
              error={errors.email}
              required
              icon={<Mail className="h-4 w-4" />}
            />
            <Input
              id="inv-phone"
              label="Phone"
              type="tel"
              placeholder="+1 555 123 4567"
              value={data.phone}
              onChange={(e) => update({ phone: e.target.value })}
              icon={<Phone className="h-4 w-4" />}
            />
            <Input
              id="inv-firm"
              label="Firm (optional)"
              placeholder="Your firm"
              value={data.firm}
              onChange={(e) => update({ firm: e.target.value })}
              icon={<Building2 className="h-4 w-4" />}
            />
            <Input
              id="inv-role"
              label="Role (optional)"
              placeholder="Partner, Analyst, etc."
              value={data.role}
              onChange={(e) => update({ role: e.target.value })}
              icon={<Briefcase className="h-4 w-4" />}
            />
            <div className="md:col-span-2">
              <Textarea
                id="inv-focus"
                label="Focus (optional)"
                placeholder="Stages, sectors, geo, or anything else."
                rows={3}
                value={data.focus}
                onChange={(e) => update({ focus: e.target.value })}
              />
              <div className="mt-2 text-xs text-white/50 inline-flex items-center gap-1">
                <Info className="h-3 w-3" />
                We’ll only use this information to follow up about Match Point.
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end pt-2">
              <GlowButton type="submit">Submit Interest</GlowButton>
            </div>
          </form>
        </GlassCard>
      </div>
    </section>
  );
}
