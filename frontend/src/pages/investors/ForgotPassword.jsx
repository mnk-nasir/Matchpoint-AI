import React, { useState } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { Input } from "../../components/ui/Input";
import { GlowButton } from "../../components/ui/GlowButton";
import { Mail, AlertCircle, CheckCircle } from "lucide-react";
import { authService } from "../../services/auth";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSuccess("If your email is registered, you will receive a reset link shortly.");
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen text-white bg-mp-bg">
      <div className="mx-auto max-w-md px-6 py-24">
        <div
          className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] bg-white/5"
          style={{ borderColor: "rgba(255,255,255,0.12)", fontFamily: "'Space Mono', monospace" }}
        >
          Password Reset
        </div>
        <h1 className="mt-6 text-4xl sm:text-5xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          Forgot Password
        </h1>
        <p className="mt-3 text-white/70" style={{ fontFamily: "'Space Mono', monospace" }}>
          Enter your email to receive a password reset link.
        </p>

        <GlassCard className="p-6 mt-8">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
              <CheckCircle className="h-4 w-4" /> {success}
            </div>
          )}
          
          {!success ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="investor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<Mail className="h-4 w-4" />}
              />
              <GlowButton type="submit" disabled={loading} className="w-full">
                {loading ? "Sending link…" : "Send Reset Link"}
              </GlowButton>
              <div className="mt-4 text-center">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/investors/login");
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  Back to Sign In
                </a>
              </div>
            </form>
          ) : (
            <div className="text-center mt-4 space-y-4">
              <GlowButton onClick={() => navigate("/investors/login")} className="w-full">
                Return to Sign In
              </GlowButton>
            </div>
          )}
        </GlassCard>
      </div>
    </section>
  );
}
