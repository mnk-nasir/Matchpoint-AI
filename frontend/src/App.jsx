import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import DRiskLanding from "./components/sections/DRiskLanding.jsx";
import FundingApplication from "./pages/funding/FundingApplication";
import Startups from "./pages/Startups.jsx";
import Accelerators from "./pages/Accelerators.jsx";
import Investors from "./pages/Investors.jsx";
import InvestorInterest from "./pages/investors/InvestorInterest.jsx";
import AcceleratorInterest from "./pages/accelerators/AcceleratorInterest.jsx";
import InvestorsAdmin from "./pages/admin/InvestorsAdmin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import InvestorLogin from "./pages/investors/InvestorLogin.jsx";
import ForgotPassword from "./pages/investors/ForgotPassword.jsx";
import ResetPassword from "./pages/investors/ResetPassword.jsx";
import InvestorLayout from "./components/investor/InvestorLayout.jsx";
import InvestorDashboardPage from "./pages/investor/Dashboard.jsx";
import DealsPage from "./pages/investor/Deals.jsx";
import WatchlistPage from "./pages/investor/Watchlist.jsx";
import MeetingsPage from "./pages/investor/Meetings.jsx";
import ChatbotPage from "./pages/investor/Chatbot.jsx";
import CompanyDetail from "./pages/investor/CompanyDetail.jsx";
import ProfilePage from "./pages/investor/Profile.jsx";
import PipelinePage from "./pages/investor/Pipeline.jsx";
import ContactsPage from "./pages/investor/Contacts.jsx";
import { Navigate } from "react-router-dom";
import StartupsAndCompanies from "./pages/StartupsAndCompanies.jsx";
import About from "./pages/About.jsx";
import Pricing from "./pages/Pricing.jsx";
import Faqs from "./pages/Faqs.jsx";
import "./styles/App.css";

function App() {
  return (
    <Router>
      <div className="app-root min-h-screen bg-mp-bg text-white">
        <Navbar />
        <main className="app-main pt-20">
          <Routes>
            <Route path="/" element={<DRiskLanding />} />
            <Route path="/funding" element={<FundingApplication />} />
            <Route path="/startups" element={<Startups />} />
            <Route path="/accelerators" element={<Accelerators />} />
            <Route path="/accelerators/interest" element={<AcceleratorInterest />} />
            <Route path="/investors" element={<Investors />} />
            <Route path="/investors/interest" element={<InvestorInterest />} />
            <Route path="/investors/dashboard" element={<Navigate to="/investor/dashboard" />} />
            {/* New investor layout and routes */}
            <Route path="/investor" element={<InvestorLayout />}>
              <Route index element={<Navigate to="dashboard" />} />
              <Route path="dashboard" element={<InvestorDashboardPage />} />
              <Route path="deals" element={<DealsPage />} />
              <Route path="company/:id" element={<CompanyDetail />} />
              <Route path="watchlist" element={<WatchlistPage />} />
              <Route path="meetings" element={<MeetingsPage />} />
              <Route path="chat" element={<ChatbotPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="pipeline" element={<PipelinePage />} />
              <Route path="contacts" element={<ContactsPage />} />
            </Route>
            <Route path="/investors/login" element={<InvestorLogin />} />
            <Route path="/investor/forgot-password" element={<ForgotPassword />} />
            <Route path="/investor/reset-password" element={<ResetPassword />} />
            <Route path="/startups-and-companies" element={<StartupsAndCompanies />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/investors" element={<InvestorsAdmin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/faqs" element={<Faqs />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
