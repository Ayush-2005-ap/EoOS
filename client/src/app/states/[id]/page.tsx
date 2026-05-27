"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DOMAINS, DomainScores } from "@/data/mockData";
import { fetchStates, fetchStateById, ApiStateData, ApiStateProfile } from "@/services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ArrowLeft, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, RefreshCw, BarChart2, BookOpen, Scale, ChevronRight, Loader2 } from "lucide-react";

export default function StateDashboard() {
  const params = useParams();
  const router = useRouter();
  const stateId = (params.id as string)?.toUpperCase();
  
  const [compareStateId, setCompareStateId] = useState<string>("");
  const [expandedDomain, setExpandedDomain] = useState<string | null>("Access");
  const [activeSummaryTab, setActiveSummaryTab] = useState<'schooling' | 'regulatory'>('schooling');

  const [statesData, setStatesData] = useState<ApiStateData[]>([]);
  const [stateProfile, setStateProfile] = useState<ApiStateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stateId) return;
    Promise.all([fetchStates(), fetchStateById(stateId)])
      .then(([allStates, profile]) => {
        setStatesData(allStates);
        setStateProfile(profile);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load state profile.");
        setIsLoading(false);
      });
  }, [stateId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
        <div className="flex flex-col items-center gap-4 text-primary">
          <Loader2 className="animate-spin" size={48} />
          <p className="font-plus-jakarta font-semibold animate-pulse">Loading State Profile...</p>
        </div>
      </div>
    );
  }

  if (error || !stateProfile) {
    return (
      <>
        <Header />
        <main className="flex-grow pt-16 flex flex-col items-center justify-center min-h-[60vh] bg-surface-container-low/40">
          <div className="text-center space-y-4 bg-white p-8 rounded-2xl border border-outline-variant/30 shadow-xl max-w-md">
            <AlertCircle size={48} className="text-error mx-auto" />
            <h2 className="font-plus-jakarta text-2xl font-extrabold text-primary">State Not Found</h2>
            <p className="text-on-surface-variant text-[14px]">
              We couldn't find a state profile with code "{stateId}". Please double-check the URL or return to the explore page.
            </p>
            <button
              onClick={() => router.push("/explore")}
              className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-[14px] hover:bg-primary-container transition-all"
            >
              Back to Rankings
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const compareState = statesData.find((s) => s.id === compareStateId);

  // Calculate National Averages
  const nationalAverages = (() => {
    const totalStates = statesData.length;
    const sums: Record<string, number> = {};
    DOMAINS.forEach(d => sums[d.id] = 0);
    
    statesData.forEach((s) => {
      DOMAINS.forEach(d => {
        sums[d.id] += s.scores[d.id] || 0;
      });
    });

    const avgs: Record<string, number> = {};
    DOMAINS.forEach(d => {
      avgs[d.id] = totalStates ? parseFloat((sums[d.id] / totalStates).toFixed(1)) : 0;
    });
    return avgs;
  })();

  // Recharts formatted data
  const chartData = DOMAINS.map((domain) => ({
    name: domain.name,
    [stateProfile.name]: stateProfile.domains.find(d => d.domainName === domain.id)?.score || 0,
    "National Average": nationalAverages[domain.id] || 0,
    ...(compareState ? { [compareState.name]: compareState.scores[domain.id] || 0 } : {}),
  }));

  const availableCompareStates = statesData.filter((s) => s.id !== stateProfile.id);
  const activeDomainData = stateProfile.domains.find(d => d.domainName === expandedDomain);

  return (
    <>
      <Header />
      <main className="flex-grow pt-16 bg-surface-container-low/40">
        {/* State dashboard header banner */}
        <section className="py-12 bg-gradient-to-r from-primary to-primary-container text-white border-b border-outline-variant/20 shadow-md">
          <div className="max-w-container-max-width mx-auto px-gutter space-y-6">
            <button
              onClick={() => router.push("/explore")}
              className="inline-flex items-center gap-2 text-secondary-fixed hover:text-white font-semibold text-[13px] transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Rankings Explorer
            </button>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <span className="text-secondary-fixed font-bold text-[12px] uppercase tracking-wider">
                  State Performance Analysis
                </span>
                <h1 className="font-plus-jakarta text-4xl sm:text-5xl font-extrabold text-white">
                  {stateProfile.name}
                </h1>
                <p className="text-on-primary-container text-[14px] uppercase font-bold tracking-widest">
                  {stateProfile.type} • {stateProfile.region} Region
                </p>
              </div>

              {/* Ranks and overall score pills */}
              <div className="flex gap-4">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold text-on-primary-container tracking-wider">
                    Overall Rank
                  </span>
                  <span className="font-plus-jakarta font-extrabold text-3xl text-secondary-fixed">
                    #{stateProfile.baseRank}
                  </span>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold text-on-primary-container tracking-wider">
                    Score
                  </span>
                  <span className="font-plus-jakarta font-extrabold text-3xl text-white">
                    {stateProfile.baseScore}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Executive Summary Section (if data exists) */}
        {(stateProfile.stateOfSchooling || stateProfile.regulatoryFramework) && (
          <section className="max-w-container-max-width mx-auto px-gutter pt-10">
            <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row overflow-hidden">
              {/* Tab Navigation Sidebar */}
              <div className="md:w-1/3 bg-surface-container-low/30 border-b md:border-b-0 md:border-r border-outline-variant/30 p-6 flex flex-col gap-2">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                  State Overview
                </span>
                
                {stateProfile.stateOfSchooling && (
                  <button 
                    onClick={() => setActiveSummaryTab('schooling')}
                    className={`text-left px-5 py-4 rounded-xl font-bold text-[14px] transition-all flex items-center justify-between ${
                      activeSummaryTab === 'schooling' 
                        ? 'bg-primary text-white shadow-md' 
                        : 'text-primary hover:bg-white hover:shadow-sm border border-transparent hover:border-outline-variant/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen size={18} className={activeSummaryTab === 'schooling' ? 'text-secondary-fixed' : 'text-secondary'} />
                      State of Schooling
                    </div>
                    {activeSummaryTab === 'schooling' && <ChevronRight size={16} className="opacity-70" />}
                  </button>
                )}

                {stateProfile.regulatoryFramework && (
                  <button 
                    onClick={() => setActiveSummaryTab('regulatory')}
                    className={`text-left px-5 py-4 rounded-xl font-bold text-[14px] transition-all flex items-center justify-between ${
                      activeSummaryTab === 'regulatory' 
                        ? 'bg-primary text-white shadow-md' 
                        : 'text-primary hover:bg-white hover:shadow-sm border border-transparent hover:border-outline-variant/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Scale size={18} className={activeSummaryTab === 'regulatory' ? 'text-secondary-fixed' : 'text-secondary'} />
                      Regulatory Framework
                    </div>
                    {activeSummaryTab === 'regulatory' && <ChevronRight size={16} className="opacity-70" />}
                  </button>
                )}
              </div>

              {/* Tab Content Area */}
              <div className="md:w-2/3 p-8 md:p-10">
                {activeSummaryTab === 'schooling' && stateProfile.stateOfSchooling && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                    <h3 className="font-plus-jakarta text-2xl font-extrabold text-primary flex items-center gap-3">
                      State of Schooling
                    </h3>
                    <div className="space-y-5 max-h-[320px] overflow-y-auto custom-scrollbar pr-4 text-[14.5px] text-on-surface-variant leading-relaxed">
                      {stateProfile.stateOfSchooling.split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className={idx === 0 ? "font-semibold text-primary text-[15px]" : ""}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {activeSummaryTab === 'regulatory' && stateProfile.regulatoryFramework && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                    <h3 className="font-plus-jakarta text-2xl font-extrabold text-primary flex items-center gap-3">
                      Regulatory Framework
                    </h3>
                    <div className="space-y-5 max-h-[320px] overflow-y-auto custom-scrollbar pr-4 text-[14.5px] text-on-surface-variant leading-relaxed">
                      {stateProfile.regulatoryFramework.split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className="relative pl-4 before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-secondary before:rounded-full">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Dashboard Panels */}
        <section className="max-w-container-max-width mx-auto px-gutter py-10 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Panel: Domain Scores & Comparisons */}
            <div className="lg:col-span-7 space-y-8">
              {/* Comparative Analysis Bar Chart */}
              <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/20 pb-4">
                  <h3 className="font-plus-jakarta text-lg font-extrabold text-primary flex items-center gap-2">
                    <BarChart2 size={18} className="text-secondary" />
                    Comparative Domain Performance
                  </h3>
                  
                  {/* State comparison selector */}
                  <select
                    value={compareStateId}
                    onChange={(e) => setCompareStateId(e.target.value)}
                    className="px-3 py-1.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[13px] font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-secondary/25"
                  >
                    <option value="">Compare with state...</option>
                    {availableCompareStates.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full h-80 text-[12px] font-semibold">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#75777e" />
                      <YAxis domain={[0, 100]} stroke="#75777e" />
                      <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #c5c6ce" }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Bar dataKey={stateProfile.name} fill="#00071b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="National Average" fill="#263780" radius={[4, 4, 0, 0]} />
                      {compareState && (
                        <Bar dataKey={compareState.name} fill="#50639B" radius={[4, 4, 0, 0]} />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Six Domains Performance Breakdown list */}
              <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-sm space-y-4">
                <h3 className="font-plus-jakarta text-lg font-extrabold text-primary pb-3 border-b border-outline-variant/20">
                  Domain Scores Overview
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {DOMAINS.map((domain) => {
                    const score = stateProfile.domains.find(d => d.domainName === domain.id)?.score || 0;
                    const active = expandedDomain === domain.id;
                    return (
                      <div
                        key={domain.id}
                        onClick={() => setExpandedDomain(active ? null : domain.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          active
                            ? "border-secondary bg-secondary/5 shadow-sm"
                            : "border-outline-variant/35 bg-white hover:bg-surface-container-low"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-primary text-[14px]">
                            {domain.name}
                          </span>
                          <span className="text-[12px] font-bold text-on-surface-variant uppercase bg-surface-container px-2 py-0.5 rounded">
                            Avg: {nationalAverages[domain.id]}
                          </span>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="font-plus-jakarta text-3xl font-extrabold text-secondary">
                            {score}
                          </span>
                          <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                            Inspect Indicators
                            {active ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Panel: Selected Domain Accordion/Deep-Dive */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-xl p-8 sticky top-24 space-y-6">
                {expandedDomain && activeDomainData ? (
                  <div className="space-y-6">
                    <div className="border-b border-outline-variant/20 pb-4">
                      <span className="text-secondary font-bold text-[11px] uppercase tracking-widest">
                        Indicator Deep-Dive
                      </span>
                      <h3 className="font-plus-jakarta text-2xl font-extrabold text-primary">
                        {expandedDomain} Domain
                      </h3>
                      <p className="text-on-surface-variant text-[13px] leading-relaxed mt-1">
                        Inspect indicators and sub-indicators scoring for {stateProfile.name}.
                      </p>
                    </div>

                    <div className="space-y-6 max-h-[480px] overflow-y-auto custom-scrollbar pr-2">
                      {activeDomainData.indicators.map((indicator) => (
                        <div key={indicator.indicatorName} className="space-y-3 bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/20">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-primary text-[14px]">
                              {indicator.indicatorName}
                            </h4>
                            <span className="bg-white text-secondary px-2.5 py-0.5 rounded-full text-[12px] font-extrabold shadow-sm border border-outline-variant/20">
                              {indicator.score}%
                            </span>
                          </div>

                          <ul className="space-y-2 border-t border-outline-variant/20 pt-2">
                            {indicator.subIndicators.map((sub, index) => (
                              <li key={index} className="flex gap-2.5 items-start text-[13px]">
                                {sub.score === 1.0 ? (
                                  <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                                ) : sub.score === 0.5 ? (
                                  <RefreshCw size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                ) : (
                                  <AlertCircle size={16} className="text-error shrink-0 mt-0.5" />
                                )}
                                <div className="space-y-0.5">
                                  <p className="text-on-surface font-medium">{sub.name}</p>
                                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                                    Compliance: {sub.status}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
                    <div className="p-4 bg-surface-container-low rounded-full text-outline shadow-sm">
                      <BarChart2 size={32} />
                    </div>
                    <div>
                      <h3 className="font-plus-jakarta text-[16px] font-bold text-primary">
                        No Domain Selected
                      </h3>
                      <p className="text-on-surface-variant text-[13px] max-w-[240px] mx-auto mt-1">
                        Click on any domain card on the left to inspect its indicator breakdown.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
