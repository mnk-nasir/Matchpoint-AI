import React, { useState, useMemo, useEffect } from "react";
import { GlassCard } from "../../components/ui/GlassCard";
import { GlowButton } from "../../components/ui/GlowButton";
import { Search, Filter, Download, Users, Building2, Mail, Phone, MapPin, Tag } from "lucide-react";
import { investorService } from "../../services/investor";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Fetch from API
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await investorService.getContacts();
        setContacts(data);
      } catch (err) {
        console.error("Failed to load contacts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  // Derive all unique roles for the filter dropdown
  const uniqueRoles = useMemo(() => {
    const roles = new Set(contacts.map(c => c.role).filter(Boolean));
    return ["All", ...Array.from(roles)];
  }, [contacts]);

  // Filter contacts based on search and role
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === "All" || c.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [contacts, searchTerm, roleFilter]);

  // Handle Export to CSV
  const handleExportCSV = () => {
    if (filteredContacts.length === 0) return;

    // Define CSV headers
    const headers = ["Name", "Role", "Company", "Email", "Phone", "Country", "Tags", "Notes"];
    
    // Map data to CSV rows
    const csvRows = filteredContacts.map(c => [
      `"${c.name}"`,
      `"${c.role}"`,
      `"${c.company}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${c.country}"`,
      `"${c.tags.join(', ')}"`,
      `"${c.notes}"`
    ]);

    // Combine headers and rows
    const csvOutput = [headers.join(","), ...csvRows.map(r => r.join(","))].join("\n");
    
    // Create Blob and trigger download
    const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "matchpoint_contacts_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-white/50">Loading contacts...</div>;
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" /> Contacts Management
          </h1>
          <p className="text-sm text-white/60">Manage your entire network of founders and key startup executives.</p>
        </div>
        <GlowButton 
          variant="secondary" 
          onClick={handleExportCSV}
          className="text-xs px-4 py-2 flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Export (CSV)
        </GlowButton>
      </div>

      {/* Control Bar (Search & Filters) */}
      <GlassCard className="p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-96 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Search by name, company, or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
          />
        </div>
        
        <div className="w-full sm:w-auto flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/40" />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer hover:bg-white/10 transition-all"
          >
            {uniqueRoles.map(role => (
              <option key={role} value={role} className="bg-slate-900 text-white">{role === "All" ? "All Roles" : role}</option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* Contacts Table */}
      <GlassCard className="flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-white/50 uppercase bg-white/[0.02] border-b border-white/10 sticky top-0">
              <tr>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Company</th>
                <th className="px-6 py-4 font-medium">Info</th>
                <th className="px-6 py-4 font-medium">Tags</th>
                <th className="px-6 py-4 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                    No contacts found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredContacts.map(contact => (
                  <tr key={contact.id} className="hover:bg-white/[0.02] transition-colors group">
                    
                    {/* Name and Role */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white tracking-tight">{contact.name}</div>
                          <div className="text-xs text-indigo-400 font-medium mt-0.5">{contact.role}</div>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-white/80">
                        <Building2 className="w-4 h-4 text-white/30" />
                        <span className="font-medium">{contact.company}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {contact.country}
                      </div>
                    </td>

                    {/* Info (Email/Phone) */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                          <Mail className="w-3.5 h-3.5 text-white/30" />
                          <span className="truncate max-w-[150px]">{contact.email}</span>
                        </a>
                        <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                          <Phone className="w-3.5 h-3.5 text-white/30" />
                          <span>{contact.phone}</span>
                        </a>
                      </div>
                    </td>

                    {/* Tags */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {contact.tags.map((tag, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-semibold text-white/70 uppercase tracking-wider">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Notes */}
                    <td className="px-6 py-4">
                      <p className="text-white/60 text-xs leading-relaxed max-w-xs line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                        {contact.notes}
                      </p>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/10 bg-white/[0.01] text-xs text-white/40 flex justify-between items-center">
          <span>Showing {filteredContacts.length} contacts</span>
        </div>
      </GlassCard>
    </div>
  );
}
