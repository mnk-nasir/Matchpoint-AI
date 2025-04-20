import React, { useEffect, useState } from "react";
import ChatContainer from "../../components/investor/chat/ChatContainer";
import CompanyProfileModal from "../../components/investor/CompanyProfileModal";
import { investorService } from "../../services/investor";

export default function ChatbotPage() {
  const [companyMap, setCompanyMap] = useState({}); // name (lowercase) → id
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  useEffect(() => {
    investorService.getRecentStartups(50).then((startups) => {
      const map = {};
      for (const s of startups) {
        const name = (s.company_name || s.name || "").trim();
        if (name && s.id) {
          map[name.toLowerCase()] = { id: s.id, name };
        }
      }
      setCompanyMap(map);
    }).catch(() => {});
  }, []);

  return (
    <div className="relative h-full">
      {/* Full-page chat layout */}
      <div className="flex flex-col h-full gap-2">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            DealScope AI
          </h2>
        </div>
        <div className="flex-1 min-h-0 h-[75vh]">
          <ChatContainer
            title="DealScope AI"
            companyMap={companyMap}
            onCompanyClick={(id) => setSelectedCompanyId(id)}
          />
        </div>
      </div>

      {/* Deal Report Modal */}
      {selectedCompanyId && (
        <CompanyProfileModal
          id={selectedCompanyId}
          onClose={() => setSelectedCompanyId(null)}
        />
      )}
    </div>
  );
}
