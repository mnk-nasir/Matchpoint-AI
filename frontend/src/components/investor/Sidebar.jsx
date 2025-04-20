import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Briefcase, Star, Calendar, MessageSquare, Kanban, Users } from "lucide-react";

const items = [
  { to: "/investor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/investor/pipeline", label: "Deal Pipeline", icon: Kanban },
  { to: "/investor/deals", label: "Deals", icon: Briefcase },
  { to: "/investor/watchlist", label: "Watchlist", icon: Star },
  { to: "/investor/contacts", label: "Contacts", icon: Users },
  { to: "/investor/chat", label: "DealScope AI", icon: MessageSquare },
  { to: "/investor/meetings", label: "Meetings", icon: Calendar },
];

export default function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-white/10 bg-white/[0.03] hidden md:flex flex-col sticky top-0 h-screen overflow-y-auto">
      <div className="p-4 text-sm font-semibold text-white/70 tracking-[0.2em] uppercase">Investor</div>
      <nav className="p-2 space-y-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"}`
            }
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
