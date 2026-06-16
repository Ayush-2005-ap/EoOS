"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchStates, ApiStateData } from "@/services/api";
import { Download, FileText, Table, BookOpen, ExternalLink, HelpCircle, Loader2, Search } from "lucide-react";
import Link from "next/link";

export default function Resources() {
  const [states, setStates] = useState<ApiStateData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"publications" | "legal">("publications");

  useEffect(() => {
    fetchStates()
      .then((data) => {
        // Sort states alphabetically
        const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
        setStates(sorted);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const filteredStates = states.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const mainDownloads = [
    {
      title: "The Ease of Operating Schools Index 2026",
      type: "Official Report (PDF)",
      size: "14.2 MB",
      desc: "The complete annual report publishing national rankings, domain-wise findings, state profiles, and policy recommendations.",
      icon: BookOpen,
      color: "bg-secondary/10 text-secondary",
    },
    {
      title: "Index Methodology Whitepaper",
      type: "Technical Guide (PDF)",
      size: "3.8 MB",
      desc: "Detailed academic explanation of the scoring rules, indicator definitions, geometric mean aggregation logic, and normalization formulas.",
      icon: FileText,
      color: "bg-primary/10 text-primary",
    },
  ];

  return (
    <>
      <Header />
      <main className="flex-grow pt-16 bg-surface-container-low/40">
        <section className="py-12 bg-white border-b border-outline-variant/30">
          <div className="max-w-container-max-width mx-auto px-gutter space-y-2">
            <span className="text-secondary font-bold text-[12px] uppercase tracking-wider">
              Research Library
            </span>
            <h1 className="font-plus-jakarta text-3xl sm:text-4xl font-extrabold text-primary">
              Resources & Downloads
            </h1>
            <p className="text-on-surface-variant text-[15px] max-w-xl">
              Access raw datasets, academic whitepapers, and our annual national reports. Individual state-wise performance profiles are also available for localized policy analysis.
            </p>
            
            {/* Tabs Navigation */}
            <div className="flex items-center gap-4 pt-6 mt-4 border-t border-outline-variant/30 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab("publications")}
                className={`px-5 py-2.5 rounded-full font-bold text-[14px] whitespace-nowrap transition-all ${
                  activeTab === "publications"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-container hover:bg-outline-variant/20 text-on-surface-variant hover:text-primary"
                }`}
              >
                Publications & Data
              </button>
              <button
                onClick={() => setActiveTab("legal")}
                className={`px-5 py-2.5 rounded-full font-bold text-[14px] whitespace-nowrap transition-all ${
                  activeTab === "legal"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-container hover:bg-outline-variant/20 text-on-surface-variant hover:text-primary"
                }`}
              >
                Legal Repository
              </button>
            </div>
          </div>
        </section>

        <section className="max-w-container-max-width mx-auto px-gutter py-12 space-y-16">
          {activeTab === "publications" ? (
            <>
              {/* Main Downloads Grid */}
          <div>
            <h2 className="font-plus-jakarta text-2xl font-extrabold text-primary mb-6">Featured Publications</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {mainDownloads.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-outline-variant/35 shadow-sm hover:shadow-md transition-shadow p-8 flex flex-col justify-between h-80"
                  >
                    <div className="space-y-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                        <Icon size={24} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-plus-jakarta text-lg font-bold text-primary leading-snug">
                          {item.title}
                        </h3>
                        <span className="inline-block text-[11px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                          {item.type} • {item.size}
                        </span>
                      </div>
                      <p className="text-on-surface-variant text-[13px] leading-relaxed line-clamp-3">
                        {item.desc}
                      </p>
                    </div>
                    
                    <button className="w-full mt-4 py-2.5 px-4 bg-primary text-white hover:bg-primary-container font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
                      <Download size={14} />
                      Download File
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* State Profiles Grid */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-plus-jakarta text-2xl font-extrabold text-primary">State & UT Profiles</h2>
                <p className="text-on-surface-variant text-[14px]">Download 2-page graphical factsheets summarizing the performance of individual regions.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search states..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-outline-variant/30 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all shadow-sm"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-primary bg-white rounded-2xl border border-outline-variant/30">
                <Loader2 className="animate-spin" size={32} />
                <p className="font-plus-jakarta font-semibold animate-pulse text-[14px]">Loading state profiles...</p>
              </div>
            ) : filteredStates.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-outline-variant/30">
                <p className="text-on-surface-variant font-medium">No states found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredStates.map((state) => (
                  <Link key={state.id} href={`/resources/state/${state.id}`} className="block">
                    <div className="bg-white p-4 rounded-xl border border-outline-variant/30 hover:border-secondary/50 hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between h-32">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-primary text-[14px] leading-tight group-hover:text-secondary transition-colors">
                          {state.name}
                        </h3>
                        <FileText size={16} className="text-outline shrink-0 group-hover:text-secondary" />
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-[11px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded uppercase">
                          {state.type}
                        </span>
                        <button className="text-secondary font-bold text-[12px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Download size={12} /> View PDF
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              )}
            </div>
          </>
          ) : (
            /* Legal Repository Tab */
            <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-2xl border border-outline-variant/35 shadow-sm p-8 flex flex-col justify-between max-w-sm w-full relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600 opacity-80" />
                
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600 border border-green-200">
                    <Table size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-plus-jakarta text-xl font-extrabold text-primary leading-snug">
                      Complete State-Wise Laws
                    </h3>
                    <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-on-surface-variant text-[14px] leading-relaxed">
                    A comprehensive, searchable repository containing the complete list of educational laws, acts, and guidelines for every state and UT in India.
                  </p>
                </div>
                
                <button 
                  disabled
                  className="w-full mt-6 py-3 px-4 bg-surface-container text-on-surface-variant font-bold text-[14px] rounded-xl flex items-center justify-center gap-2 cursor-not-allowed border border-outline-variant/30"
                >
                  <Download size={16} />
                  Currently Unavailable
                </button>
              </div>
            </div>
          )}
          
        </section>
      </main>
      <Footer />
    </>
  );
}
