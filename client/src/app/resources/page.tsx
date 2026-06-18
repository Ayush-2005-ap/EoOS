"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchStates, ApiStateData } from "@/services/api";
import { Download, Search, FileText, ExternalLink, Loader2, BookOpen, Scale, Database, Lock } from "lucide-react";
import Link from "next/link";

export default function Resources() {
  const [states, setStates] = useState<ApiStateData[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"publications" | "legal">("publications");

  useEffect(() => {
    Promise.all([
      fetchStates(),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/media/reports`).then(res => res.json())
    ])
      .then(([statesData, reportsJson]) => {
        const sorted = statesData.sort((a, b) => a.name.localeCompare(b.name));
        setStates(sorted);
        setReports(reportsJson.data || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const filteredStates = states.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));


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
              {reports.length > 0 ? reports.map((item, idx) => {
                const Icon = idx % 2 === 0 ? BookOpen : FileText;
                const color = idx % 2 === 0 ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary";
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-outline-variant/35 shadow-sm hover:shadow-md transition-shadow p-8 flex flex-col justify-between h-80"
                  >
                    <div className="space-y-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
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
                        {item.description}
                      </p>
                    </div>
                    
                    <a 
                      href={item.pdfPath.startsWith("http") ? item.pdfPath : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "") : "https://eoos-backend.onrender.com"}${item.pdfPath}`}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="w-full mt-4 py-2.5 px-4 bg-primary text-white hover:bg-primary-container font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      <Download size={14} />
                      Download File
                    </a>
                  </div>
                );
              }) : (
                <p className="col-span-3 text-slate-500 py-12 text-center">No featured publications available.</p>
              )}
            </div>
          </div>

          {/* Raw Dataset Link Box */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl border border-outline-variant/35 shadow-sm hover:shadow-md transition-shadow p-8 flex flex-col justify-between h-auto max-w-sm">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-secondary/10 text-secondary">
                  <Database size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-plus-jakarta text-lg font-bold text-primary leading-snug">
                    Field Research Dataset
                  </h3>
                </div>
                <p className="text-on-surface-variant text-[13px] leading-relaxed line-clamp-3">
                  Comprehensive breakdown of raw scoring data and rules across all 30 evaluated states and union territories.
                </p>
              </div>
              
              <Link 
                href="/resources/dataset"
                className="w-full mt-6 py-2.5 px-4 bg-primary text-white hover:bg-primary-container font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Database size={14} />
                View Full Dataset
              </Link>
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
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-plus-jakarta text-2xl font-extrabold text-primary">State-Wise Legal Repositories</h2>
                  <p className="text-on-surface-variant text-[14px]">Download the complete list of educational laws, acts, and guidelines for individual states and UTs.</p>
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
                  <p className="font-plus-jakarta font-semibold animate-pulse text-[14px]">Loading states...</p>
                </div>
              ) : filteredStates.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-outline-variant/30">
                  <p className="text-on-surface-variant font-medium">No states found matching "{searchQuery}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredStates.map((state) => (
                    <div key={state.id} className="bg-white rounded-xl border border-outline-variant/35 shadow-sm p-5 flex flex-col justify-between relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-80" />
                      
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/5 text-primary border border-primary/20">
                            <Scale size={18} />
                          </div>
                          <span className="inline-block text-[10px] font-bold text-secondary bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Coming Soon
                          </span>
                        </div>
                        
                        <div>
                          <h3 className="font-plus-jakarta text-[15px] font-bold text-primary leading-tight">
                            {state.name} Laws
                          </h3>
                          <span className="text-[11px] font-semibold text-on-surface-variant uppercase mt-1 block">
                            {state.type}
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        disabled
                        className="w-full mt-5 py-2 px-3 bg-surface-container/50 text-on-surface-variant/70 font-bold text-[12px] rounded-lg flex items-center justify-center gap-1.5 cursor-not-allowed border border-outline-variant/30"
                      >
                        <Download size={14} />
                        Unavailable
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
        </section>
      </main>
      <Footer />
    </>
  );
}
