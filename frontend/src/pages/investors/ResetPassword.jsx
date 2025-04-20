import React, { useState, useEffect } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { Input } from "../../components/ui/Input";
import { GlowButton } from "../../components/ui/GlowButton";
import { Lock, AlertCircle, CheckCircle } from "lucide-react";
import { authService } from "../../services/auth";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [uid, setUid] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const qUid = searchParams.get("uid");
    const qToken = searchParams.get("token");
    if (qUid && qToken) {
      setUid(qUid);
      setToken(qToken);
    } else {
      setError("Invalid or missing password reset token.");
    }
  }, [searchParams]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    setLoading(true);
    try {
      await authService.resetPassword(uid, token, password);
      setSuccess("Your password has been successfully reset! You can now log in.");
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Failed to reset password.");
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
          Set New Password
        </h1>
        <p className="mt-3 text-white/70" style={{ fontFamily: "'Space Mono', monospace" }}>
          Enter a new secure password for your account.
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
          
          {!success && uid && token ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={<Lock className="h-4 w-4" />}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                icon={<Lock className="h-4 w-4" />}
              />
              <GlowButton type="submit" disabled={loading} className="w-full">
                {loading ? "Resetting…" : "Reset Password"}
              </GlowButton>
            </form>
          ) : success ? (
            <div className="text-center mt-4 space-y-4">
              <GlowButton onClick={() => navigate("/investors/login")} className="w-full">
                Go to Sign In
              </GlowButton>
            </div>
          ) : null}
        </GlassCard>
      </div>
    </section>
  );
}
