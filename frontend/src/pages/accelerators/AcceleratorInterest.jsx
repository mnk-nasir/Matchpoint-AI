import React, { useState } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { GlowButton } from "../../components/ui/GlowButton";
import { Building2, Globe, User, Mail, Phone, Info, CalendarClock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { leadsService } from "../../services/leads";

export default function AcceleratorInterest() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    programName: "",
    website: "",
    contactName: "",
    email: "",
    phone: "",
    cohortSize: "",
    focus: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const update = (patch) => setData((d) => ({ ...d, ...patch }));

  const validate = () => {
    const e = {};
    if (!data.programName.trim()) e.programName = "Program name is required";
    if (!data.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) e.email = "Valid email required";
    if (data.website && !/^https?:\/\/.+/i.test(data.website)) e.website = "Enter a valid website URL";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const payload = {
      program_name: data.programName,
      website: data.website || undefined,
      contact_name: data.contactName || undefined,
      email: data.email,
      phone: data.phone || undefined,
      cohort_size: data.cohortSize ? Number(data.cohortSize) : undefined,
      focus: data.focus || undefined,
    };
    try {
      await leadsService.submitAcceleratorLead(payload);
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
              Thanks for Registering Your Program
            </h1>
            <p className="text-white/70" style={{ fontFamily: "'Space Mono', monospace" }}>
              We’ll reach out to discuss how Match Point supports cohorts and pipeline.
            </p>
            <div className="flex gap-3">
              <GlowButton onClick={() => navigate("/accelerators")}>Back to Accelerators</GlowButton>
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
          Accelerator Program Interest
        </div>
        <h1 className="mt-6 text-4xl sm:text-5xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          Share Your Program Details
        </h1>
        <p className="mt-3 text-white/70" style={{ fontFamily: "'Space Mono', monospace" }}>
          A short form for accelerators — just key details to start.
        </p>

        <GlassCard className="p-6 mt-8">
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="acc-program"
              label="Program Name"
              placeholder="Example Accelerator"
              value={data.programName}
              onChange={(e) => update({ programName: e.target.value })}
              error={errors.programName}
              required
              icon={<Building2 className="h-4 w-4" />}
            />
            <Input
              id="acc-website"
              label="Website"
              placeholder="https://example.com"
              value={data.website}
              onChange={(e) => update({ website: e.target.value })}
              error={errors.website}
              icon={<Globe className="h-4 w-4" />}
            />
            <Input
              id="acc-contact"
              label="Contact Name"
              placeholder="Jane Doe"
              value={data.contactName}
              onChange={(e) => update({ contactName: e.target.value })}
              icon={<User className="h-4 w-4" />}
            />
            <Input
              id="acc-email"
              label="Email"
              type="email"
              placeholder="you@accelerator.com"
              value={data.email}
              onChange={(e) => update({ email: e.target.value })}
              error={errors.email}
              required
              icon={<Mail className="h-4 w-4" />}
            />
            <Input
              id="acc-phone"
              label="Phone"
              type="tel"
              placeholder="+1 555 123 4567"
              value={data.phone}
              onChange={(e) => update({ phone: e.target.value })}
              icon={<Phone className="h-4 w-4" />}
            />
            <Input
              id="acc-cohort"
              label="Cohort Size (optional)"
              type="number"
              placeholder="e.g. 15"
              value={data.cohortSize}
              onChange={(e) => update({ cohortSize: e.target.value })}
              icon={<CalendarClock className="h-4 w-4" />}
            />
            <div className="md:col-span-2">
              <Textarea
                id="acc-focus"
                label="Program Focus (optional)"
                placeholder="Sectors, stage focus, support areas…"
                rows={3}
                value={data.focus}
                onChange={(e) => update({ focus: e.target.value })}
              />
              <div className="mt-2 text-xs text-white/50 inline-flex items-center gap-1">
                <Info className="h-3 w-3" />
                We’ll only use this information to respond to your enquiry.
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
