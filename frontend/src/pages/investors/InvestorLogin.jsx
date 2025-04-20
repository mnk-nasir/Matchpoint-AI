import React, { useState } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { Input } from "../../components/ui/Input";
import { GlowButton } from "../../components/ui/GlowButton";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { authService } from "../../services/auth";
import { useNavigate } from "react-router-dom";

export default function InvestorLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.login(email, password);
      navigate("/investor/dashboard");
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen text-white" style={{ backgroundColor: "#050a12" }}>
      <div className="mx-auto max-w-md px-6 py-24">
        <div
          className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] bg-white/5"
          style={{ borderColor: "rgba(255,255,255,0.12)", fontFamily: "'Space Mono', monospace" }}
        >
          Investor Login
        </div>
        <h1 className="mt-6 text-4xl sm:text-5xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          Sign In
        </h1>
        <p className="mt-3 text-white/70" style={{ fontFamily: "'Space Mono', monospace" }}>
          Access your investor dashboard and insights.
        </p>

        <GlassCard className="p-6 mt-8">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}
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
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={<Lock className="h-4 w-4" />}
              />
              <div className="mt-2 text-right">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/investor/forgot-password");
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  Forgot password?
                </a>
              </div>
            </div>
            <GlowButton type="submit" disabled={loading} className="w-full mt-2">
              {loading ? "Signing in…" : "Sign In"}
            </GlowButton>
          </form>
        </GlassCard>
      </div>
    </section>
  );
}
