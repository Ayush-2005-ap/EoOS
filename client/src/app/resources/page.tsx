"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchStates, ApiStateData } from "@/services/api";
import { Download, Search, FileText, ExternalLink, Loader2, BookOpen, Scale, Database, Lock, Folder } from "lucide-react";
import Link from "next/link";

async function forceDownload(url: string, filename: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank");
  }
}

export default function Resources() {
  const [states, setStates] = useState<ApiStateData[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"publications" | "legal">("publications");
  const [legalTab, setLegalTab] = useState<"CENTRAL" | "STATE">("CENTRAL");
  const [categories, setCategories] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [expandedStateId, setExpandedStateId] = useState<string | null>(null);
  const [expandedCentralTabId, setExpandedCentralTabId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchStates(),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/media/reports`).then(res => res.json())
    ])
      .then(([statesData, reportsJson]) => {
        const sorted = statesData.sort((a, b) => a.name.localeCompare(b.name));
        setStates(sorted);
        const reportsData = (reportsJson.data || []).map((report: any) => ({
          ...report,
          pdfPath: report.pdfPath?.replace("ras.cloudinary.com", "res.cloudinary.com")
        }));
        setReports(reportsData);

        // Fetch Legal Repository Data
        Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/legal/categories`).then(res => res.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/legal/documents`).then(res => res.json())
        ]).then(([cats, docs]) => {
          setCategories(cats.data || []);
          setDocuments(docs.data || []);
          if (cats.data && cats.data.length > 0) setExpandedCentralTabId(cats.data[0].id);
        }).catch(err => console.error("Error fetching legal data", err));

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
                    
                    <button
                      onClick={() => {
                        const url = item.pdfPath.startsWith("http")
                          ? item.pdfPath
                          : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "") : "https://eoos-backend.onrender.com"}${item.pdfPath}`;
                        const filename = item.title ? `${item.title.replace(/\s+/g, "_")}.pdf` : "EoOS_report.pdf";
                        forceDownload(url, filename);
                      }}
                      className="w-full mt-4 py-2.5 px-4 bg-primary text-white hover:bg-primary-container font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      <Download size={14} />
                      Download File
                    </button>
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
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-outline-variant/30 text-center max-w-3xl mx-auto">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Scale size={32} />
                </div>
                <h2 className="font-plus-jakarta text-3xl font-extrabold text-primary mb-3">Legal Repository</h2>
                <p className="text-on-surface-variant text-[15px] leading-relaxed">
                  Access a comprehensive collection of educational laws, acts, and guidelines categorized at both the Central and State levels.
                </p>
                <div className="flex justify-center gap-2 mt-6">
                  <button 
                    onClick={() => setLegalTab("CENTRAL")}
                    className={`px-6 py-2.5 rounded-full font-bold text-[14px] transition-all ${legalTab === "CENTRAL" ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-surface-container hover:bg-slate-200 text-slate-600"}`}
                  >
                    Central Laws
                  </button>
                  <button 
                    onClick={() => setLegalTab("STATE")}
                    className={`px-6 py-2.5 rounded-full font-bold text-[14px] transition-all ${legalTab === "STATE" ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-surface-container hover:bg-slate-200 text-slate-600"}`}
                  >
                    State Laws
                  </button>
                </div>
              </div>

              {legalTab === "CENTRAL" ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-1 space-y-2">
                    {categories.length === 0 ? (
                      <p className="text-slate-400 text-sm italic p-4 text-center">No central law tabs available.</p>
                    ) : categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setExpandedCentralTabId(cat.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl font-bold text-[14px] transition-all border ${expandedCentralTabId === cat.id ? "bg-primary/5 border-primary/20 text-primary" : "bg-white border-transparent text-slate-600 hover:bg-slate-50"}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                  <div className="md:col-span-3">
                    <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 p-6 min-h-[400px]">
                      {expandedCentralTabId ? (
                        <div className="space-y-4">
                          <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2 border-b pb-4">
                            <Folder className="text-secondary" /> 
                            {categories.find(c => c.id === expandedCentralTabId)?.name} Documents
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {documents.filter(d => d.lawType === "CENTRAL" && d.categoryId === expandedCentralTabId).length === 0 ? (
                              <p className="text-slate-400 text-sm col-span-full">No documents in this tab yet.</p>
                            ) : documents.filter(d => d.lawType === "CENTRAL" && d.categoryId === expandedCentralTabId).map(doc => (
                              <button key={doc.id} onClick={() => forceDownload(doc.pdfUrl, `${doc.title?.replace(/\s+/g, "_") || "document"}.pdf`)} className="flex flex-col justify-between bg-slate-50 border border-slate-200 p-4 rounded-xl hover:border-secondary hover:shadow-md transition-all group text-left w-full">
                                <div>
                                  <div className="flex items-start justify-between mb-2">
                                    <FileText className="text-primary opacity-50 group-hover:text-secondary transition-colors" size={20} />
                                    <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded shadow-sm">{doc.size}</span>
                                  </div>
                                  <h4 className="font-bold text-[14px] text-slate-800 line-clamp-3 leading-snug">{doc.title}</h4>
                                </div>
                                <div className="mt-4 flex items-center text-secondary text-[12px] font-bold opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                  <Download size={14} /> Download PDF
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                          <Folder size={48} className="opacity-20 mb-4" />
                          <p>Select a tab from the left to view documents</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative w-full sm:w-72 mx-auto sm:mx-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search states..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-outline-variant/30 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all shadow-sm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStates.length === 0 ? (
                      <p className="text-center py-12 text-slate-400 col-span-full">No states found matching "{searchQuery}"</p>
                    ) : filteredStates.map(state => {
                      const stateDocs = documents.filter(d => d.lawType === "STATE" && d.stateId === state.id);
                      const generalDocs = stateDocs.filter(d => !d.isRule);
                      const ruleDocs = stateDocs.filter(d => d.isRule);
                      const isExpanded = expandedStateId === state.id;
                      
                      return (
                        <div key={state.id} className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col transition-all">
                          <button 
                            onClick={() => setExpandedStateId(isExpanded ? null : state.id)}
                            className={`p-5 flex items-center justify-between text-left transition-colors ${isExpanded ? "bg-primary text-white" : "hover:bg-slate-50"}`}
                          >
                            <div>
                              <h3 className={`font-bold text-[16px] ${isExpanded ? "text-white" : "text-primary"}`}>{state.name}</h3>
                              <p className={`text-[12px] font-medium mt-0.5 ${isExpanded ? "text-primary-container" : "text-slate-400"}`}>
                                {stateDocs.length} Document{stateDocs.length !== 1 ? 's' : ''} available
                              </p>
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${isExpanded ? "bg-white/20 rotate-180" : "bg-slate-100"}`}>
                              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.41 0.589844L6 5.16984L10.59 0.589844L12 1.99984L6 7.99984L0 1.99984L1.41 0.589844Z" fill="currentColor"/>
                              </svg>
                            </div>
                          </button>
                          
                          {isExpanded && (
                            <div className="p-5 bg-slate-50/50 flex-1 border-t border-outline-variant/20">
                              <div className="mb-6">
                                <h4 className="text-[13px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">General Laws & Guidelines</h4>
                                {generalDocs.length === 0 ? (
                                  <p className="text-[13px] text-slate-400 italic">No general documents available.</p>
                                ) : (
                                  <ul className="space-y-2">
                                    {generalDocs.map(doc => (
                                      <li key={doc.id}>
                                        <button onClick={() => forceDownload(doc.pdfUrl, `${doc.title?.replace(/\s+/g, "_") || "document"}.pdf`)} className="flex items-start gap-2 p-3 bg-white border border-slate-200 rounded-lg hover:border-secondary hover:shadow-sm transition-all group w-full text-left">
                                          <FileText className="text-primary/40 shrink-0 mt-0.5 group-hover:text-secondary transition-colors" size={16} />
                                          <div>
                                            <p className="text-[13px] font-bold text-slate-700 leading-snug group-hover:text-primary transition-colors">{doc.title}</p>
                                            <p className="text-[11px] text-slate-400 mt-1">{doc.size}</p>
                                          </div>
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                              
                              <div>
                                <h4 className="text-[13px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">Rules & Regulations</h4>
                                {ruleDocs.length === 0 ? (
                                  <p className="text-[13px] text-slate-400 italic">No rules available.</p>
                                ) : (
                                  <ul className="space-y-2">
                                    {ruleDocs.map(doc => (
                                      <li key={doc.id}>
                                        <button onClick={() => forceDownload(doc.pdfUrl, `${doc.title?.replace(/\s+/g, "_") || "document"}.pdf`)} className="flex items-start gap-2 p-3 bg-white border border-slate-200 rounded-lg hover:border-secondary hover:shadow-sm transition-all group w-full text-left">
                                          <Scale className="text-secondary/40 shrink-0 mt-0.5 group-hover:text-secondary transition-colors" size={16} />
                                          <div>
                                            <p className="text-[13px] font-bold text-slate-700 leading-snug group-hover:text-primary transition-colors">{doc.title}</p>
                                            <p className="text-[11px] text-slate-400 mt-1">{doc.size}</p>
                                          </div>
                                        </button>
                                       </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
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
