import React, { useState, useEffect } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { investorService } from "../../services/investor";
import { Building2, TrendingUp, ShieldAlert, DollarSign } from "lucide-react";

const STAGES = [
  "New Startups",
  "Reviewing",
  "Shortlisted",
  "Due Diligence",
  "Negotiation",
  "Invested",
  "Rejected"
];

export default function Pipeline() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const pipelineData = await investorService.getPipeline();
        // The endpoint returns list of PipelineStage serializers 
        // We remap them to put startup_name, etc. at the top level
        const mapped = pipelineData.map(p => ({
          ...p,
          id: p.startup, // Primary ID used for drag/drop
          name: p.startup_name,
          industry: p.startup_industry,
          logo_url: p.startup_logo_url,
          funding_ask: p.startup_funding_ask,
          risk_score: p.startup_risk_score,
          pipelineStage: p.stage
        }));
        setStartups(mapped);
      } catch (err) {
        console.error("Failed to load pipeline data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("startupId", id);
    // Add a slight transparency to the dragged item
    setTimeout(() => {
      e.target.classList.add("opacity-50");
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove("opacity-50");
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("startupId");
    
    // Update local state directly for speedy UI
    setStartups(prev => 
      prev.map(s => {
        if (s.id === id) {
          return { ...s, pipelineStage: newStage };
        }
        return s;
      })
    );
    
    // Fire off backend sync
    try {
      await investorService.updatePipelineStage(id, newStage);
    } catch (e) {
      console.error("Failed syncing pipeline to backend:", e);
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-white/50">Loading pipeline...</div>;
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Deal Pipeline</h1>
          <p className="text-sm text-white/60">Drag and drop startups to track their progress.</p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-4 h-full min-h-[600px] items-stretch">
          {STAGES.map(stage => (
            <div 
              key={stage}
              className="w-80 flex-shrink-0 flex flex-col rounded-xl bg-white/[0.02] border border-white/5"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20 rounded-t-xl">
                <h3 className="font-semibold text-white/90 text-sm">{stage}</h3>
                <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full">
                  {startups.filter(s => s.pipelineStage === stage).length}
                </span>
              </div>
              
              {/* Droppable Area */}
              <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                {startups.filter(s => s.pipelineStage === stage).map(startup => (
                  <div
                    key={startup.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, startup.id)}
                    onDragEnd={handleDragEnd}
                    className="cursor-grab active:cursor-grabbing transform transition-transform hover:-translate-y-1"
                  >
                    <GlassCard className="p-4 space-y-3 pointer-events-none">
                      <div className="flex items-start gap-3">
                        {startup.logo_url ? (
                          <img 
                            src={startup.logo_url} 
                            alt={startup.name} 
                            className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 p-1 object-contain"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex flex-shrink-0 items-center justify-center">
                            <Building2 className="w-5 h-5 text-white/20" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white truncate text-sm">{startup.name || "Unknown"}</h4>
                          <p className="text-xs text-white/50 truncate flex items-center gap-1">
                            {startup.industry || "General"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider text-white/40 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> Ask
                          </span>
                          <span className="text-xs font-medium text-emerald-400">
                            {startup.funding_ask ? `$${startup.funding_ask}` : "TBD"}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider text-white/40 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> Risk
                          </span>
                          <span className="text-xs font-medium text-amber-400">
                            {startup.risk_score || "—"}/200
                          </span>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                ))}
                
                {startups.filter(s => s.pipelineStage === stage).length === 0 && (
                  <div className="h-24 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-white/30 text-xs">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
