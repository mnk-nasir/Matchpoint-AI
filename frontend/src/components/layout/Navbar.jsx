import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/5 bg-[#02030a]/80 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="MATCHPoint logo" className="h-8 w-auto" />
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-white/70 transition-colors hover:text-white">Home</Link>
          <Link to="/pricing" className="text-sm font-medium text-white/70 transition-colors hover:text-white">Pricing</Link>
          <Link to="/about" className="text-sm font-medium text-white/70 transition-colors hover:text-white">About us</Link>
          <Link to="/faqs" className="text-sm font-medium text-white/70 transition-colors hover:text-white">Faqs</Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center">
          <button className="rounded-full bg-gradient-to-r from-[#00f5a0] to-[#00d9f5] px-6 py-2.5 text-sm font-semibold text-[#02030a] transition-all hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,245,160,0.3)]">
            Get In Touch
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 lg:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
        >
          <span
            className={`h-0.5 w-5 rounded-full bg-white transition-transform duration-300 ${isMenuOpen ? "translate-y-2 rotate-45" : ""
              }`}
          />
          <span
            className={`h-0.5 w-5 rounded-full bg-white transition-opacity duration-300 ${isMenuOpen ? "opacity-0" : ""
              }`}
          />
          <span
            className={`h-0.5 w-5 rounded-full bg-white transition-transform duration-300 ${isMenuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`absolute left-0 top-20 w-full overflow-hidden bg-[#02030a]/95 backdrop-blur-xl transition-all duration-300 lg:hidden ${isMenuOpen ? "max-h-[400px] border-b border-white/10" : "max-h-0"
          }`}
      >
        <nav className="flex flex-col p-6 space-y-4">
          <Link
            to="/"
            className="text-base font-medium text-white/80 hover:text-white"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/pricing"
            className="text-base font-medium text-white/80 hover:text-white"
            onClick={() => setIsMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link
            to="/about"
            className="text-base font-medium text-white/80 hover:text-white"
            onClick={() => setIsMenuOpen(false)}
          >
            About us
          </Link>
          <Link
            to="/faqs"
            className="text-base font-medium text-white/80 hover:text-white"
            onClick={() => setIsMenuOpen(false)}
          >
            Faqs
          </Link>
          <button className="mt-4 w-full rounded-full bg-gradient-to-r from-[#00f5a0] to-[#00d9f5] px-6 py-3 text-sm font-semibold text-[#02030a]">
            Get In Touch
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
