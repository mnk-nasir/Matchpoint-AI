import React, { useState, useRef, useEffect } from "react";
import { GlowButton } from "../ui/GlowButton";
import { authService } from "../../services/auth";
import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";

export default function Topbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const logout = () => {
    authService.logout();
    navigate("/investors/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 border-b border-white/10 bg-white/[0.03] flex items-center justify-between px-4">
      <div className="text-sm font-semibold text-white/80">Match Point — Investor</div>
      <div 
        className="relative" 
        ref={dropdownRef}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
        >
          <User className="w-4 h-4" />
          Profile
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-[#111827] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 py-1">
            <button
              onClick={() => {
                navigate("/investor/profile");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors text-left"
            >
              <User className="w-4 h-4" />
              My Profile
            </button>
            <div className="h-px w-full bg-white/10 my-1" />
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

