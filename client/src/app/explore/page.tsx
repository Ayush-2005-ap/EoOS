"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchStates, fetchDomains, ApiStateData, ApiDomain } from "@/services/api";
import { Search, Filter, ArrowUpDown, ChevronRight, Download, Loader2, X, Send } from "lucide-react";

type SortField = "name" | "baseRank" | "baseScore" | string;
type SortOrder = "asc" | "desc";

export default function ExploreRankings() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("baseRank");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  
  const [statesData, setStatesData] = useState<ApiStateData[]>([]);
  const [domainsData, setDomainsData] = useState<ApiDomain[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Email Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState("");
  const [exportForm, setExportForm] = useState({
    name: "",
    email: "",
    phone: "",
    consent: false,
  });

  useEffect(() => {
    // Pick up search query from URL if navigated from header
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const q = urlParams.get("q");
      if (q) setSearchQuery(q);
    }

    Promise.all([fetchStates(), fetchDomains()])
      .then(([states, domains]) => {
        setStatesData(states);
        setDomainsData(domains);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const regions = ["All", "North", "South", "East", "West", "Northeast", "Central"];

  // Sorting Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc"); // Default to desc for score sorts
    }
  };

  // Filter and Sort dataset
  const processedStates = [...statesData]
    .filter((state) => {
      const matchesSearch = state.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = regionFilter === "All" || state.region === regionFilter;
      const matchesType = typeFilter === "All" || state.type === typeFilter;
      return matchesSearch && matchesRegion && matchesType;
    })
    .sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortField === "name") {
        valA = a.name;
        valB = b.name;
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (sortField === "baseRank") {
        valA = a.baseRank;
        valB = b.baseRank;
      } else if (sortField === "baseScore") {
        valA = a.baseScore;
        valB = b.baseScore;
      } else {
        // Domain specific scores
        valA = a.scores[sortField as string] || 0;
        valB = b.scores[sortField as string] || 0;
      }

      if (sortOrder === "asc") {
        return valA - valB;
      } else {
        return valB - valA;
      }
    });

  const handleRowClick = (stateId: string) => {
    router.push(`/states/${stateId.toUpperCase()}`);
  };

  const handleExportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exportForm.name || !exportForm.email || !exportForm.consent) {
      setExportError("Please fill out all required fields and provide consent.");
      return;
    }
    
    setIsExporting(true);
    setExportError("");

    try {
      const escapeCSV = (val: any) => {
        if (val === null || val === undefined) return "";
        const str = String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const headers = ["Rank", "State Name", "Type", "Region", "Overall Score", ...domainsData.map(d => d.name)];
      const rows = processedStates.map((s) => [
        s.baseRank,
        s.name,
        s.type,
        s.region,
        s.baseScore,
        ...domainsData.map(d => s.scores[d.id] || 0)
      ]);
      
      const csvContent = [
        headers.map(escapeCSV).join(","), 
        ...rows.map(r => r.map(escapeCSV).join(","))
      ].join("\n");
      
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const response = await fetch(`${backendUrl}/export/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: exportForm.name,
          email: exportForm.email,
          phone: exportForm.phone,
          consent: exportForm.consent,
          csvData: csvContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send export email.");
      }

      setExportSuccess(true);
      setTimeout(() => {
        setIsExportModalOpen(false);
        setExportSuccess(false);
        setExportForm({ name: "", email: "", phone: "", consent: false });
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setExportError("An error occurred while exporting. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Header />

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/30 bg-surface-container-low/50">
              <h2 className="font-plus-jakarta text-xl font-bold text-primary">Export Rankings</h2>
              <button 
                onClick={() => setIsExportModalOpen(false)}
                className="text-on-surface-variant hover:text-primary transition-colors"
                disabled={isExporting}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {exportSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <Send size={32} />
                  </div>
                  <h3 className="font-plus-jakarta text-xl font-bold text-primary">Email Sent!</h3>
                  <p className="text-on-surface-variant text-[15px]">
                    Your customized CSV report has been emailed to you successfully.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleExportSubmit} className="space-y-5">
                  <p className="text-on-surface-variant text-[14px]">
                    Please provide your details below to receive the dataset export via email.
                  </p>
                  
                  {exportError && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-[13px] font-semibold">
                      {exportError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[13px] font-bold text-primary mb-1.5 uppercase tracking-wider">Full Name *</label>
                      <input 
                        type="text" 
                        required
                        value={exportForm.name}
                        onChange={(e) => setExportForm({...exportForm, name: e.target.value})}
                        className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all text-[15px]"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-primary mb-1.5 uppercase tracking-wider">Email Address *</label>
                      <input 
                        type="email" 
                        required
                        value={exportForm.email}
                        onChange={(e) => setExportForm({...exportForm, email: e.target.value})}
                        className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all text-[15px]"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-primary mb-1.5 uppercase tracking-wider">Phone Number</label>
                      <input 
                        type="tel" 
                        value={exportForm.phone}
                        onChange={(e) => setExportForm({...exportForm, phone: e.target.value})}
                        className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all text-[15px]"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mt-6 p-4 bg-surface-container-low/50 rounded-xl border border-outline-variant/30">
                    <input 
                      type="checkbox" 
                      id="consent"
                      required
                      checked={exportForm.consent}
                      onChange={(e) => setExportForm({...exportForm, consent: e.target.checked})}
                      className="mt-1 shrink-0 w-4 h-4 rounded border-outline-variant text-secondary focus:ring-secondary/30"
                    />
                    <label htmlFor="consent" className="text-[12px] text-on-surface-variant leading-relaxed">
                      I consent to storing my name, email, and phone number in the database to receive updates on upcoming events and news from the Centre for Civil Society.
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isExporting}
                    className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-[15px] hover:bg-primary-container transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Sending Email...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Receive Report via Email
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow pt-16 bg-surface-container-low/40">
        {isLoading ? (
          <div className="min-h-[80vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-primary">
              <Loader2 className="animate-spin" size={48} />
              <p className="font-plus-jakarta font-semibold animate-pulse">Loading Index Data...</p>
            </div>
          </div>
        ) : (
          <>
        <section className="py-12 bg-white border-b border-outline-variant/30">
          <div className="max-w-container-max-width mx-auto px-gutter flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <span className="text-secondary font-bold text-[12px] uppercase tracking-wider">
                Official Data Portal
              </span>
              <h1 className="font-plus-jakarta text-3xl sm:text-4xl font-extrabold text-primary">
                Explore State Rankings
              </h1>
              <p className="text-on-surface-variant text-[15px] max-w-xl">
                Compare overall standings, filter by geographical region, or sort the catalog by individual educational pillars.
              </p>
            </div>
            
            <button 
              onClick={() => setIsExportModalOpen(true)}
              className="bg-primary text-cover hover:bg-primary-container px-6 py-3 rounded-xl font-bold text-[14px] transition-all flex items-center gap-2 shadow-sm"
            >
              <Download size={16} />
              Export Dataset (.CSV)
            </button>
          </div>
        </section>

        {/* Filter Controls Panel */}
        <section className="max-w-container-max-width mx-auto px-gutter py-8 space-y-6">
          <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline w-4.5 h-4.5" />
              <input
                type="text"
                placeholder="Search state or union territory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 transition-all"
              />
            </div>

            {/* Selector Dropdowns */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter size={16} className="text-outline shrink-0" />
                <span className="text-[13px] font-bold text-on-surface-variant whitespace-nowrap uppercase tracking-wider">
                  Region:
                </span>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="w-full sm:w-36 px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-secondary/25"
                >
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r === "All" ? "All Regions" : r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter size={16} className="text-outline shrink-0" />
                <span className="text-[13px] font-bold text-on-surface-variant whitespace-nowrap uppercase tracking-wider">
                  Type:
                </span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full sm:w-36 px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-secondary/25"
                >
                  <option value="All">All Types</option>
                  <option value="STATE">State</option>
                  <option value="UT">UT</option>
                </select>
              </div>
            </div>
          </div>

          {/* Database Grid Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-outline-variant/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-surface-container bg-opacity-40 border-b border-outline-variant/30 select-none">
                    {/* Headers with sort action */}
                    <th 
                      onClick={() => handleSort("baseRank")}
                      className="py-4 px-6 font-plus-jakarta text-[12px] font-bold text-on-surface-variant uppercase tracking-wider cursor-pointer hover:text-primary transition-colors w-24"
                    >
                      <div className="flex items-center gap-1">
                        Rank
                        <ArrowUpDown size={14} className="text-outline" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort("name")}
                      className="py-4 px-6 font-plus-jakarta text-[12px] font-bold text-on-surface-variant uppercase tracking-wider cursor-pointer hover:text-primary transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        State
                        <ArrowUpDown size={14} className="text-outline" />
                      </div>
                    </th>
                    <th className="py-4 px-6 font-plus-jakarta text-[12px] font-bold text-on-surface-variant uppercase tracking-wider text-center w-28">
                      Region
                    </th>
                    <th 
                      onClick={() => handleSort("baseScore")}
                      className="py-4 px-6 font-plus-jakarta text-[12px] font-bold text-on-surface-variant uppercase tracking-wider cursor-pointer hover:text-primary transition-colors text-right w-28"
                    >
                      <div className="flex items-center justify-end gap-1">
                        Score
                        <ArrowUpDown size={14} className="text-outline" />
                      </div>
                    </th>
                    {domainsData.map((domain) => (
                      <th
                        key={domain.id}
                        onClick={() => handleSort(domain.id)}
                        className="py-4 px-4 font-plus-jakarta text-[11px] font-bold text-on-surface-variant uppercase tracking-wider cursor-pointer hover:text-primary transition-colors text-right w-28"
                      >
                        <div className="flex items-center justify-end gap-1">
                          {domain.name}
                          <ArrowUpDown size={12} className="text-outline" />
                        </div>
                      </th>
                    ))}
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {processedStates.map((state) => (
                    <tr
                      key={state.id}
                      onClick={() => handleRowClick(state.id)}
                      className="hover:bg-surface-container-low/40 cursor-pointer transition-all group"
                    >
                      <td className="py-4 px-6 font-plus-jakarta text-[16px] font-extrabold text-primary">
                        #{state.baseRank}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-[15px] text-on-surface group-hover:text-secondary transition-colors">
                          {state.name}
                        </div>
                        <div className="text-[11px] text-on-surface-variant uppercase font-semibold">
                          {state.type}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center text-on-surface-variant text-[14px]">
                        {state.region}
                      </td>
                      <td className="py-4 px-6 text-right font-plus-jakarta text-[15px] font-bold text-secondary">
                        {state.baseScore}
                      </td>
                      {domainsData.map((domain) => {
                        const val = state.scores[domain.id] || 0;
                        return (
                          <td key={domain.id} className="py-4 px-4 text-right font-plus-jakarta text-[14px] font-semibold text-primary/80">
                            {val}
                          </td>
                        );
                      })}
                      <td className="py-4 px-2 text-center text-outline group-hover:text-secondary transition-colors">
                        <ChevronRight size={18} />
                      </td>
                    </tr>
                  ))}
                  {processedStates.length === 0 && (
                    <tr>
                      <td colSpan={11} className="py-16 text-center text-on-surface-variant font-semibold text-[15px]">
                        No matching states found. Try adjusting your search query or filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        </>
        )}
      </main>
      <Footer />
    </>
  );
}
