import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import RequireInvestor from "./RequireInvestor";

export default function InvestorLayout() {
  const location = useLocation();
  const isChatPage = location?.pathname?.startsWith("/investor/chat");
  return (
    <RequireInvestor>
      <div className="min-h-screen bg-[#050a12] text-white flex relative">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
          <Topbar />
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </RequireInvestor>
  );
}
