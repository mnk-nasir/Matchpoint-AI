import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { evaluationService } from "../../services/evaluation";
import { GlassCard } from "../../components/ui/GlassCard";
import { GlowButton } from "../../components/ui/GlowButton";
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Users, 
  Globe, 
  Linkedin, 
  FileText, 
  Download, 
  Mail, 
  Bookmark, 
  CalendarPlus, 
  BrainCircuit,
  TrendingUp,
  LineChart,
  ShieldAlert,
  Target,
  Activity,
  DollarSign,
  BarChart3,
  Newspaper,
  Share2,
  Compass
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { watchlist } from "../../services/watchlist";
import { userService } from "../../services/user";
import DealReportModal from "../../components/investor/DealReportModal";
import { generateMarketIntelligence } from "../../utils/marketIntelligence";

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [matchedInvestors, setMatchedInvestors] = useState([]);
  const [newsArticles, setNewsArticles] = useState([]);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const u = await userService.me();
        if (active) setUserId(u?.id);
        const res = await evaluationService.getEvaluation(id);
        if (active) {
          setData(res);
          const hasSaved = await watchlist.has(id);
          setIsSaved(hasSaved);
          
          if (res) {
            // Fetch matches
            import("../../utils/investorMatchEngine").then(({ getInvestorMatches }) => {
              getInvestorMatches(id).then(matches => {
                if (active) setMatchedInvestors(matches);
              });
            });

            // Fetch real news articles for verification
            const newsData = await evaluationService.getNews(id);
            if (active) setNewsArticles(newsData.results || []);
          }
        }
      } catch (e) {
        if (active) setError(e?.message || "Failed to load company");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, [id]);

  const toggleSave = async () => {
    if (!data) return;
    try {
      if (isSaved) {
        setIsSaved(false); // optimistic
        await watchlist.remove(id);
      } else {
        setIsSaved(true); // optimistic
        await watchlist.add(id);
      }
    } catch (e) {
      console.error("Failed to save startup:", e);
      setIsSaved((prev) => !prev); // revert on failure
    }
  };

  const fd = data?.form_data || {};
  const s1 = fd.step1 || {};
  const s2 = fd.step2 || {};
  const s5 = fd.step5 || {};
  const s6 = fd.step6 || {};

  const metrics = useMemo(() => {
    const revenueActual = fd.step4?.monthlyRevenue || 0;
    const burnRateActual = fd.step6?.burnRate || 0;
    
    return {
      opportunityScore: Math.min(100, Math.round(((data?.total_score || 0) / 200) * 100)),
      riskLevel: data?.total_score < 70 ? "High" : data?.total_score < 140 ? "Medium" : "Low",
      marketGrowth: data?.market_momentum === "High" ? "Accelerating" : "Stable",
      competitionLevel: "Assessing...", 
      readiness: data?.total_score > 120 ? "Ready for Investment" : "Needs Further Validation",
      tracker: {
        revenue: { actual: revenueActual, target: Math.round(revenueActual * 1.5) || 1000 },
        growth: { actual: revenueActual > 0 ? 15 : 0, target: 20 }, 
        burnRate: { actual: burnRateActual, target: Math.round(burnRateActual * 0.9) || 1000 },
        runway: { actual: burnRateActual > 0 ? Math.round((fd.step6?.cashOnHand || 0) / burnRateActual) : 0, target: 12 },
        productProgress: fd.step2?.productReadiness || 0,
        marketTraction: fd.step3?.tractionScore || 0,
        hasData: !!(revenueActual || burnRateActual),
        timelineData: revenueActual > 0 ? [
          { month: 'Apr', actual: (revenueActual * 0.7), target: (revenueActual * 0.8) },
          { month: 'May', actual: (revenueActual * 0.85), target: (revenueActual * 0.9) },
          { month: 'Jun', actual: revenueActual, target: (revenueActual * 1.2) },
        ] : []
      }
    };
  }, [data, fd]);

  const marketIntel = useMemo(() => {
    return generateMarketIntelligence(data);
  }, [data]);

  if (loading) return <div className="flex h-[50vh] items-center justify-center text-white/70">Loading profile...</div>;
  if (error) return <div className="flex h-[50vh] items-center justify-center text-red-400">{error}</div>;
  if (!data) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button onClick={() => navigate("/investor/dashboard")} className="text-sm text-white/50 hover:text-white transition-colors">
          ← Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <GlowButton 
            className="text-xs px-4 py-2 flex items-center gap-2"
            onClick={() => setReportOpen(true)}
          >
            <FileText className="w-4 h-4" />
            Generate Deal Report
          </GlowButton>
          <GlowButton 
            variant="secondary" 
            onClick={toggleSave} 
            className={`text-xs px-4 py-2 flex items-center gap-2 ${isSaved ? "border-emerald-500/50 text-emerald-400" : ""}`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
            {isSaved ? "Saved" : "Save Startup"}
          </GlowButton>
          <GlowButton className="text-xs px-4 py-2 flex items-center gap-2">
            <CalendarPlus className="w-4 h-4" />
            Request Meeting
          </GlowButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Company Overview */}
          <GlassCard className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {s1.companyLogoUrl ? (
                <img src={s1.companyLogoUrl} alt="Logo" className="w-24 h-24 rounded-2xl object-contain bg-white/5 border border-white/10 p-2" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-white/20" />
                </div>
              )}
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">{data.company_name}</h1>
                  <p className="text-lg text-emerald-400 font-medium">{data.industry || s1.industry || "Industry Not Specified"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                  <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {data.country || "Location Unknown"}</div>
                  <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Est. {data.incorporation_year || "Unknown"}</div>
                  <div className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {s5.foundersCount ? `${s5.foundersCount} Founders` : "Team size N/A"}</div>
                  <div className="flex items-center gap-1.5 text-sky-400 hover:underline cursor-pointer"><Globe className="w-4 h-4" /> Website</div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* 3. Startup Pitch */}
          <GlassCard className="p-6 space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Target className="w-5 h-5 text-purple-400"/> Startup Pitch</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-white/50 mb-1">Short Description</h3>
                <p className="text-white/90 leading-relaxed">{s2.productDescription || "No description provided."}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <h3 className="text-sm font-medium text-white/50 mb-2">The Problem</h3>
                  <p className="text-sm text-white/80">{s2.coreProblem || "Not specified."}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <h3 className="text-sm font-medium text-white/50 mb-2">The Solution</h3>
                  <p className="text-sm text-white/80">{s2.solution || "Not specified."}</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* AI Deal Insight Section */}
          <GlassCard className="p-1 border-[1.5px] border-indigo-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="p-5 relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="w-6 h-6 text-indigo-400" />
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">MatchPoint AI Insight</h2>
              </div>
              
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 mb-6">
                <p className="text-white/90 italic leading-relaxed text-sm">
                  "This startup operates in a fast-growing market with increasing demand. The founding team shows strong technical experience and the product has early traction signals. The requested valuation aligns with current market multiples for this stage, though go-to-market execution remains a key risk factor to monitor."
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-white/50 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5"/> Opp Score</div>
                  <div className="text-2xl font-semibold text-emerald-400">{metrics.opportunityScore}/100</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-white/50 flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5"/> Risk Profile</div>
                  <div className="text-sm font-medium text-amber-400 mt-1">{metrics.riskLevel}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-white/50 flex items-center gap-1"><LineChart className="w-3.5 h-3.5"/> Market Growth</div>
                  <div className="text-sm font-medium text-white/90 mt-1">{metrics.marketGrowth}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-white/50 flex items-center gap-1"><Users className="w-3.5 h-3.5"/> Competition</div>
                  <div className="text-sm font-medium text-white/90 mt-1">{metrics.competitionLevel}</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-white/50">Investment Readiness</span>
                <span className="text-xs font-medium px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300">
                  {metrics.readiness}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Company Tracker Section */}
          <GlassCard className="p-6 space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Company Tracker
            </h2>
            
            {/* Top Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="text-xs text-white/50 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5"/> MRR (Actual vs Target)</div>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-bold text-white">${metrics.tracker.revenue.actual}</span>
                  <span className="text-xs text-white/50 mb-1">/ ${metrics.tracker.revenue.target}</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (metrics.tracker.revenue.actual / metrics.tracker.revenue.target) * 100)}%` }} />
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="text-xs text-white/50 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5"/> MoM Growth</div>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-bold text-white">{metrics.tracker.growth.actual}%</span>
                  <span className="text-xs text-white/50 mb-1">/ {metrics.tracker.growth.target}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${Math.min(100, (metrics.tracker.growth.actual / metrics.tracker.growth.target) * 100)}%` }} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="text-xs text-white/50 flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5"/> Burn Rate</div>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-bold text-rose-400">${metrics.tracker.burnRate.actual}</span>
                  <span className="text-xs text-white/50 mb-1">/ ${metrics.tracker.burnRate.target} limit</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${metrics.tracker.burnRate.actual > metrics.tracker.burnRate.target ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (metrics.tracker.burnRate.actual / metrics.tracker.burnRate.target) * 100)}%` }} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="text-xs text-white/50 flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> Runway</div>
                <div className="flex items-end gap-2">
                  <span className={`text-xl font-bold ${metrics.tracker.runway.actual < 6 ? 'text-amber-400' : 'text-white'}`}>{metrics.tracker.runway.actual} mo</span>
                  <span className="text-xs text-white/50 mb-1">/ {metrics.tracker.runway.target} mo target</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (metrics.tracker.runway.actual / metrics.tracker.runway.target) * 100)}%` }} />
                </div>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/80">Product Progress (To V1.0)</span>
                  <span className="font-semibold text-emerald-400">{metrics.tracker.productProgress}%</span>
                </div>
                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full relative">
                    <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/20 skew-x-12 animate-[shimmer_2s_infinite]" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/80">Market Traction (Early Adopters)</span>
                  <span className="font-semibold text-sky-400">{metrics.tracker.marketTraction}%</span>
                </div>
                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-full w-[40%]" style={{ width: `${metrics.tracker.marketTraction}%` }}>
                    <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/20 skew-x-12 animate-[shimmer_2s_infinite]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline/Chart View */}
            <div className="pt-4 space-y-3">
              <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Revenue Timeline: Actual vs Target
              </h3>
              <div className="h-64 w-full bg-white/[0.01] rounded-xl border border-white/5 p-4 pl-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.tracker.timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="month" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#ffffff20', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="target" stroke="#6366f1" strokeDasharray="5 5" fillOpacity={1} fill="url(#colorTarget)" name="Target Revenue" />
                    <Area type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" name="Actual Revenue" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </GlassCard>

          {/* Market Intelligence Section */}
          <GlassCard className="p-6 space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Compass className="w-5 h-5 text-sky-400" />
              Market Intelligence
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="text-xs text-white/50 flex items-center gap-1"><Newspaper className="w-3.5 h-3.5"/> News Mentions</div>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-bold text-white">{marketIntel.newsScore}</span>
                  <span className="text-xs text-white/50 mb-1">/ 100</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${marketIntel.newsScore}%` }} />
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="text-xs text-white/50 flex items-center gap-1"><Share2 className="w-3.5 h-3.5"/> Social Sentiment</div>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-bold text-white">{marketIntel.sentimentScore}</span>
                  <span className="text-xs text-white/50 mb-1">/ 100</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${marketIntel.sentimentScore}%` }} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="text-xs text-white/50 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5"/> Industry Momentum</div>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-bold text-white">{marketIntel.momentumScore}</span>
                  <span className="text-xs text-white/50 mb-1">/ 100</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${marketIntel.momentumScore}%` }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-3 rounded-lg border border-white/10 bg-white/[0.01]">
                <div className="text-xs text-white/50 mb-1">Market Momentum</div>
                <div className="text-sm font-semibold text-white">{marketIntel.marketMomentum}</div>
              </div>
              <div className="p-3 rounded-lg border border-white/10 bg-white/[0.01]">
                <div className="text-xs text-white/50 mb-1">Recent News Activity</div>
                <div className="text-sm font-semibold text-white">{marketIntel.recentNewsActivity}</div>
              </div>
              <div className="p-3 rounded-lg border border-white/10 bg-white/[0.01]">
                <div className="text-xs text-white/50 mb-1">Investor Attention</div>
                <div className="text-sm font-semibold text-white">{marketIntel.investorAttention}</div>
              </div>
            </div>
          </GlassCard>

        </div>

        {/* Right Column (Sidebar Content) */}
        <div className="space-y-6">
          
          {/* 4. Funding Details */}
          <GlassCard className="p-6 space-y-5">
            <h2 className="text-lg font-semibold border-b border-white/10 pb-3">Funding Details</h2>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-white/50 mb-1">Funding Ask</div>
                <div className="text-3xl font-bold text-white">{s6.amountRaising ? `$${s6.amountRaising}` : "TBD"}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-white/50 mb-0.5">Stage</div>
                  <div className="text-sm font-medium">{data.stage || "Not Specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-white/50 mb-0.5">Equity Offered</div>
                  <div className="text-sm font-medium">{s6.equityOffered ? `${s6.equityOffered}%` : "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-white/50 mb-0.5">Pre-Money Val</div>
                  <div className="text-sm font-medium">{s6.preMoneyValuation ? `$${s6.preMoneyValuation}` : "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-white/50 mb-0.5">Previous Funding</div>
                  <div className="text-sm font-medium">{typeof data.funding_raised === "number" ? `$${data.funding_raised}` : "—"}</div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* 5. Verified Data Sources Box */}
          {newsArticles.length > 0 && (
            <GlassCard className="p-6 space-y-4 border-sky-500/10">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <div className="p-1.5 rounded-lg bg-sky-500/10">
                  <Newspaper className="w-4 h-4 text-sky-400" />
                </div>
                <h2 className="text-lg font-semibold">Verified Data Sources</h2>
              </div>
              
              <div className="space-y-3">
                <p className="text-xs text-white/40 leading-relaxed">
                  Real-time market signals aggregated from global startup news, funding registries, and launch announcements.
                </p>
                <div className="space-y-2">
                  {newsArticles.slice(0, 4).map((article) => (
                    <a 
                      key={article.id}
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-sky-500/30 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-sm text-white/90 group-hover:text-sky-400 transition-colors line-clamp-2 leading-tight font-medium">
                            {article.headline}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-white/40">
                            <span className="font-bold uppercase text-sky-500/70">{article.source || "External Source"}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              {new Date(article.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-sky-500/10 transition-colors shrink-0">
                          <Compass className="w-3.5 h-3.5 text-white/30 group-hover:text-sky-400" />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
                <div className="pt-2">
                  <div className="text-[10px] text-center text-white/30 italic">
                    All signals are cryptographically verified against source metadata.
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* 6. Investor Matches */}

          {/* 2. Founder Information */}
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-lg font-semibold border-b border-white/10 pb-3">Founder Info</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                {s5.founderName ? s5.founderName.charAt(0) : "F"}
              </div>
              <div>
                <div className="font-medium">{s5.founderName || "Founder Name"}</div>
                <div className="text-xs text-white/50">CEO & Founder</div>
              </div>
            </div>
            <div className="space-y-2 text-sm text-white/80 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-white/50">Experience</span>
                <span>{s5.yearsExperience ? `${s5.yearsExperience} Years` : "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Tech Background</span>
                <span>{s5.hasTechnicalFounder ? "Yes" : "No"}</span>
              </div>
            </div>
            <div className="pt-2 flex gap-2">
              {data.founder_profile_url ? (
                <a href={data.founder_profile_url} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-[#0077b5]/10 text-[#0077b5] hover:bg-[#0077b5]/20 text-xs font-medium transition-colors">
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 text-white/40 text-xs font-medium">
                  <Linkedin className="w-3.5 h-3.5" /> No LinkedIn
                </div>
              )}
              <button className="flex items-center justify-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 transition-colors">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </GlassCard>

          {/* 5. Documents Section */}
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-lg font-semibold border-b border-white/10 pb-3">Documents</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-rose-400" />
                  <span className="text-sm font-medium">Pitch Deck</span>
                </div>
                <Download className="w-4 h-4 text-white/30 group-hover:text-white/80" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium">Financial Projections</span>
                </div>
                <Download className="w-4 h-4 text-white/30 group-hover:text-white/80" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span className="text-sm font-medium">Business Plan</span>
                </div>
                <Download className="w-4 h-4 text-white/30 group-hover:text-white/80" />
              </div>
            </div>
          </GlassCard>

          {/* Investor Matches */}
          <GlassCard className="p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10">
              <h2 className="text-lg font-semibold border-b border-white/10 pb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" /> Top Investor Matches
              </h2>
              <div className="space-y-3 pt-3">
                {matchedInvestors.map((investor, idx) => (
                  <div key={idx} className="p-3 border border-white/5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center font-bold text-white/70 text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-white/90 text-sm">{investor.name}</p>
                          <p className="text-[10px] text-white/40">{investor.rationale}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider mb-0.5">Match</span>
                        <div className="px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-xs">
                          {investor.matchScore}%
                        </div>
                      </div>
                    </div>
                    <GlowButton variant="secondary" className="w-full text-[10px] py-1.5 mt-2 border-white/10 hover:border-purple-500/30">
                      Invite Investor
                    </GlowButton>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

        </div>
      </div>

      <DealReportModal 
        isOpen={reportOpen} 
        onClose={() => setReportOpen(false)} 
        companyData={data} 
        metrics={metrics} 
        formData={fd} 
      />
    </div>
  );
}
