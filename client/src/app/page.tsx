"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IndiaMap from "@/components/IndiaMap";
import { STATES_DATA, DOMAINS, DomainScores } from "@/data/mockData";
import { ArrowRight, Play, BookOpen, AlertCircle, BarChart3, TrendingUp, Award } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [activeDomain, setActiveDomain] = useState<string>("Overall");
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);

  // Compute scores and ranks based on selected domain
  const getActiveStateScoresAndRanks = () => {
    if (activeDomain === "Overall") {
      return STATES_DATA.reduce((acc, s) => {
        acc[s.id] = { score: s.baseScore, rank: s.baseRank };
        return acc;
      }, {} as { [key: string]: { score: number; rank: number } });
    }

    const key = activeDomain as keyof DomainScores;
    const sorted = [...STATES_DATA].sort((a, b) => b.scores[key] - a.scores[key]);
    return sorted.reduce((acc, s, index) => {
      acc[s.id] = { score: s.scores[key], rank: index + 1 };
      return acc;
    }, {} as { [key: string]: { score: number; rank: number } });
  };

  const activeScores = getActiveStateScoresAndRanks();
  const hoveredState = STATES_DATA.find((s) => s.id === hoveredStateId);
  const hoveredStateScore = hoveredStateId ? activeScores[hoveredStateId] : null;

  // Filter top 10 states for the preview table
  const topTenStates = [...STATES_DATA]
    .map((s) => ({
      ...s,
      currentScore: activeScores[s.id].score,
      currentRank: activeScores[s.id].rank,
    }))
    .sort((a, b) => a.currentRank - b.currentRank)
    .slice(0, 10);

  const handleStateClick = (stateId: string) => {
    router.push(`/states/${stateId.toLowerCase()}`);
  };

  return (
    <>
      <Header />
      <main className="flex-grow pt-16">
        {/* Section 1: Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-container via-primary to-primary-container text-white py-24 md:py-32">
          {/* Subtle background overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/15 via-transparent to-transparent opacity-50" />
          
          <div className="relative max-w-container-max-width mx-auto px-gutter grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: CTAs and Title */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/20 text-secondary-fixed rounded-full text-[12px] font-bold tracking-wider uppercase border border-secondary/30">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                CCS Research Edition 2024
              </span>
              <h1 className="font-plus-jakarta text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                The State of India's <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-fixed to-secondary-container">
                  Out-of-School
                </span>{" "}
                Education
              </h1>
              <p className="text-on-primary-container text-[16px] sm:text-[18px] leading-relaxed max-w-2xl">
                A research-grade education intelligence platform tracking state-level performance across India. Evaluate official parameters, explore domain statistics, and test custom policies using the weightage simulator.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href="/explore">
                  <button className="w-full sm:w-auto bg-secondary text-white px-8 py-3.5 rounded-xl font-semibold text-[15px] hover:bg-secondary-container transition-all flex items-center justify-center gap-2 shadow-lg shadow-secondary/25 hover:-translate-y-0.5">
                    Explore Rankings
                    <ArrowRight size={18} />
                  </button>
                </Link>
                <Link href="/simulate">
                  <button className="w-full sm:w-auto bg-transparent border-2 border-white/30 text-white hover:bg-white/10 px-8 py-3.5 rounded-xl font-semibold text-[15px] transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5">
                    <Play size={16} fill="white" />
                    Launch Simulator
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Column: 3D Book Animation */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="perspective-1000 group relative">
                {/* Bobbing wrapper */}
                <div className="animate-bobbing transform-style-3d">
                  {/* 3D revolving book container */}
                  <div className="w-[240px] h-[340px] relative transform-style-3d animate-revolve-book shadow-2xl rounded-r-lg">
                    {/* Spine */}
                    <div 
                      className="absolute left-0 top-0 w-[20px] h-full bg-gradient-to-r from-secondary to-secondary-container transform-style-3d shadow-inner" 
                      style={{ transform: "translateX(-10px) rotateY(-90deg)" }}
                    />
                    
                    {/* Front Cover (Fitted to translateZ(10px) with backface-hidden) */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-tr from-primary-container to-secondary-container rounded-r-lg p-6 flex flex-col justify-between border-y border-r border-white/20 select-none backface-hidden"
                      style={{ transform: "translateZ(10px)" }}
                    >
                      <div className="space-y-4">
                        <div className="w-10 h-1 rounded-full bg-secondary" />
                        <p className="font-plus-jakarta text-[12px] font-bold tracking-widest text-secondary-fixed uppercase">
                          CCS Report
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-plus-jakarta text-[22px] font-extrabold text-white leading-tight">
                          Education <br />
                          Out-of-School <br />
                          Index 2024
                        </h3>
                        <p className="text-[11px] text-white/60">
                          Annual National Comparative Research Analysis
                        </p>
                      </div>
                      <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] text-secondary-fixed">CCS Research</span>
                        <BookOpen size={16} className="text-secondary-fixed" />
                      </div>
                    </div>

                    {/* Back Cover (Fitted to translateZ(-10px) rotateY(180deg) with backface-hidden) */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-bl from-primary-container to-primary rounded-l-lg p-6 flex flex-col justify-between border-y border-l border-white/20 select-none backface-hidden"
                      style={{ transform: "translateZ(-10px) rotateY(180deg)" }}
                    >
                      <div className="space-y-4">
                        <div className="w-10 h-1 rounded-full bg-secondary" />
                        <p className="font-plus-jakarta text-[12px] font-bold tracking-widest text-secondary-fixed uppercase">
                          CCS Research
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-plus-jakarta text-[16px] font-extrabold text-white leading-tight">
                          Centre for Civil Society
                        </h3>
                        <p className="text-[10px] text-white/50">
                          Delhi, India
                        </p>
                      </div>
                      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-secondary-fixed">
                        <span>© 2024 CCS</span>
                        <Award size={16} />
                      </div>
                    </div>
                    
                    {/* Book pages edge layer */}
                    <div 
                      className="absolute right-0 top-[4px] bottom-[4px] w-[20px] bg-neutral-200 rounded-r-sm transform-style-3d origin-right -rotate-y-90 border-y border-r border-neutral-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: India Map Explorer */}
        <section className="py-24 bg-surface-container-lowest">
          <div className="max-w-container-max-width mx-auto px-gutter space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="font-plus-jakarta text-3xl sm:text-4xl font-extrabold text-primary">
                Interactive State Performance Explorer
              </h2>
              <p className="text-on-surface-variant text-[15px] sm:text-[16px]">
                Click on any state to inspect its domain rankings, and use the filter bar to recolor the map by specific performance dimensions.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex justify-center border-b border-outline-variant/30 pb-4">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none custom-scrollbar max-w-full">
                <button
                  onClick={() => setActiveDomain("Overall")}
                  className={`px-5 py-2 rounded-full font-semibold text-[13px] transition-all whitespace-nowrap ${
                    activeDomain === "Overall"
                      ? "bg-secondary text-white shadow-sm"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  Overall Index
                </button>
                {DOMAINS.map((domain) => (
                  <button
                    key={domain.id}
                    onClick={() => setActiveDomain(domain.id)}
                    className={`px-5 py-2 rounded-full font-semibold text-[13px] transition-all whitespace-nowrap ${
                      activeDomain === domain.id
                        ? "bg-secondary text-white shadow-sm"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {domain.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Map and Floating Card Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Map Column */}
              <div className="lg:col-span-7 flex flex-col items-center">
                <div className="w-full max-w-[500px] aspect-square relative">
                  <IndiaMap
                    activeDomain={activeDomain}
                    stateScores={activeScores}
                    onStateHover={setHoveredStateId}
                    onStateClick={handleStateClick}
                  />
                </div>
                {/* Legend */}
                <div className="mt-8 w-full max-w-md mx-auto flex flex-col gap-2">
                  <div className="flex justify-between text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    <span>Rank 1</span>
                    <span>Rank 30+</span>
                  </div>
                  <div className="h-3 w-full rounded-full border border-black/5" style={{
                    background: `linear-gradient(to right, #263780, #576A9F, #8FA5C3, #C7DFE7, #F1FCFF)`
                  }} />
                  <div className="flex justify-between text-[11px] font-medium text-on-surface-variant/70">
                    <span>Highest Performance</span>
                    <span>Lowest Performance</span>
                  </div>
                </div>
              </div>

              {/* State Info Card Column */}
              <div className="lg:col-span-5 h-full flex flex-col justify-center">
                {hoveredState && hoveredStateScore ? (
                  <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-xl p-8 space-y-6 animate-fade-in">
                    <div className="flex justify-between items-start border-b border-outline-variant/20 pb-4">
                      <div>
                        <h3 className="font-plus-jakarta text-2xl font-extrabold text-primary">
                          {hoveredState.name}
                        </h3>
                        <p className="text-secondary font-bold text-[14px] uppercase tracking-wider">
                          {hoveredState.type} • {hoveredState.region} India
                        </p>
                      </div>
                      <div className="bg-primary text-white font-plus-jakarta font-extrabold text-xl px-4 py-2 rounded-xl flex flex-col items-center shadow-md">
                        <span className="text-[10px] uppercase font-bold text-on-primary-container tracking-wider">
                          Rank
                        </span>
                        #{hoveredStateScore.rank}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[14px] font-semibold text-on-surface-variant">
                          Active Metric Score ({activeDomain})
                        </span>
                        <span className="text-[16px] font-bold text-primary">
                          {hoveredStateScore.score}
                        </span>
                      </div>
                      
                      {/* Domain performance progress breakdown */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                          All Domains
                        </h4>
                        {DOMAINS.map((domain) => {
                          const val = hoveredState.scores[domain.id as keyof DomainScores];
                          return (
                            <div key={domain.id} className="space-y-1">
                              <div className="flex justify-between text-[13px]">
                                <span className="text-on-surface font-medium">{domain.name}</span>
                                <span className="text-on-surface font-semibold">{val}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-secondary rounded-full"
                                  style={{ width: `${val}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <button 
                        onClick={() => handleStateClick(hoveredState.id)}
                        className="w-full bg-surface-container-low text-primary hover:bg-primary hover:text-white px-5 py-3 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 border border-outline-variant/30"
                      >
                        View Full State Profile
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface-container-low/50 rounded-2xl border border-dashed border-outline-variant/80 p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[380px]">
                    <div className="p-4 bg-white rounded-full shadow-md text-outline">
                      <AlertCircle size={32} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-plus-jakarta text-[18px] font-bold text-primary">
                        No State Selected
                      </h3>
                      <p className="text-on-surface-variant text-[14px] max-w-[280px]">
                        Hover over any state on the map of India to explore its rankings.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Rankings Table Preview */}
        <section className="py-24 bg-surface-container-low">
          <div className="max-w-container-max-width mx-auto px-gutter space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <span className="text-secondary font-bold text-[12px] uppercase tracking-widest">
                  Leaderboard
                </span>
                <h2 className="font-plus-jakarta text-3xl font-extrabold text-primary">
                  National Ranking Preview (Top 10)
                </h2>
              </div>
              <Link href="/explore">
                <button className="bg-primary text-white hover:bg-primary-container px-6 py-3 rounded-xl font-bold text-[14px] transition-all flex items-center gap-2 shadow-sm">
                  View Full Rankings Table
                  <ArrowRight size={16} />
                </button>
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-outline-variant/30 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container bg-opacity-40 border-b border-outline-variant/30">
                      <th className="py-4 px-6 font-plus-jakarta text-[12px] font-bold text-on-surface-variant uppercase tracking-wider w-20">
                        Rank
                      </th>
                      <th className="py-4 px-6 font-plus-jakarta text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                        State
                      </th>
                      <th className="py-4 px-6 font-plus-jakarta text-[12px] font-bold text-on-surface-variant uppercase tracking-wider text-center">
                        Region
                      </th>
                      <th className="py-4 px-6 font-plus-jakarta text-[12px] font-bold text-on-surface-variant uppercase tracking-wider text-right w-36">
                        Overall Score
                      </th>
                      <th className="py-4 px-6 font-plus-jakarta text-[12px] font-bold text-on-surface-variant uppercase tracking-wider text-center w-28">
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {topTenStates.map((state) => (
                      <tr
                        key={state.id}
                        onClick={() => handleStateClick(state.id)}
                        className="hover:bg-surface-container-low/40 cursor-pointer transition-colors group"
                      >
                        <td className="py-4 px-6 font-plus-jakarta text-[16px] font-extrabold text-primary">
                          #{state.currentRank}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-[15px] text-on-surface group-hover:text-secondary transition-colors">
                            {state.name}
                          </div>
                          <div className="text-[11px] text-on-surface-variant">
                            {state.type}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center text-on-surface-variant text-[14px]">
                          {state.region}
                        </td>
                        <td className="py-4 px-6 text-right font-plus-jakarta text-[15px] font-bold text-secondary">
                          {state.currentScore}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-[12px] font-bold">
                            <TrendingUp size={14} />
                            +0.0%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Simulator Teaser */}
        <section className="py-24 bg-gradient-to-r from-primary to-primary-container text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-secondary/15 via-transparent to-transparent opacity-60" />
          
          <div className="relative max-w-container-max-width mx-auto px-gutter grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-secondary-fixed font-bold text-[12px] uppercase tracking-widest">
                Interactive Engine
              </span>
              <h2 className="font-plus-jakarta text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Simulate Your Custom <br />Educational Ranks
              </h2>
              <p className="text-on-primary-container text-[15px] sm:text-[16px] leading-relaxed">
                Researchers and policymakers prioritize different educational criteria. Drag domain weights using our simulator to recalculate state rankings dynamically, honoring all mathematical integrity boundaries (like our 5% floor rule).
              </p>
              <div className="pt-2">
                <Link href="/simulate">
                  <button className="bg-secondary text-white hover:bg-secondary-container px-8 py-3.5 rounded-xl font-bold text-[15px] transition-all flex items-center gap-2 shadow-lg shadow-secondary/20">
                    Open Ranking Simulator
                    <ArrowRight size={18} />
                  </button>
                </Link>
              </div>
            </div>

            {/* Slider Teasers */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 space-y-6">
              <h4 className="font-plus-jakarta text-[15px] font-bold text-secondary-fixed uppercase tracking-wider pb-3 border-b border-white/10">
                Weight Settings Preview
              </h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[13px] font-semibold text-on-primary-container">
                    <span>Domain 1 Weight</span>
                    <span>16%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="75"
                    value="16"
                    disabled
                    className="w-full accent-secondary h-1 bg-white/20 rounded-lg cursor-not-allowed opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[13px] font-semibold text-on-primary-container">
                    <span>Domain 2 Weight</span>
                    <span>17%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="75"
                    value="17"
                    disabled
                    className="w-full accent-secondary h-1 bg-white/20 rounded-lg cursor-not-allowed opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[13px] font-semibold text-on-primary-container">
                    <span>Domain 3 Weight</span>
                    <span>17%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="75"
                    value="17"
                    disabled
                    className="w-full accent-secondary h-1 bg-white/20 rounded-lg cursor-not-allowed opacity-50"
                  />
                </div>
              </div>
              <p className="text-[12px] text-white/50 italic text-center pt-2">
                * Launch the simulator to adjust values and compute results live.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
