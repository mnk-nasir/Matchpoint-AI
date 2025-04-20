import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#02030a]">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-sm text-white/60" style={{ fontFamily: "'Space Mono', monospace" }}>
            © {new Date().getFullYear()} MATCHPoint. All rights reserved.
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/pricing" className="text-sm text-white/70 hover:text-white">Pricing</Link>
            <Link to="/about" className="text-sm text-white/70 hover:text-white">About</Link>
            <Link to="/faqs" className="text-sm text-white/70 hover:text-white">FAQs</Link>
            <a href="/investors/login" className="text-sm text-white/70 hover:text-white">Investor Login</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
