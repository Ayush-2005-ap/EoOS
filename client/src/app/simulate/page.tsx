"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchStates, fetchDomains, ApiStateData, ApiDomain } from "@/services/api";
import { RefreshCw, ArrowUp, ArrowDown, Minus, Info, Download, Award, Loader2 } from "lucide-react";

interface SimulatedState {
  id: string;
  name: string;
  type: string;
  simulatedScore: number;
  simulatedRank: number;
  rankChange: number;
  scores: Record<string, number>;
}

export default function Simulator() {
  // Initialize weights dynamically
  const [weights, setWeights] = useState<{ [key: string]: number }>({});
  const [domainsData, setDomainsData] = useState<ApiDomain[]>([]);

  const [activeView, setActiveView] = useState<string>("OVERALL");
  const [indicatorWeights, setIndicatorWeights] = useState<Record<string, Record<string, number>>>({});
  const [modifiedIndicatorOrder, setModifiedIndicatorOrder] = useState<Record<string, string[]>>({});

  const [modifiedOrder, setModifiedOrder] = useState<string[]>([]);
  const [simulatedRankings, setSimulatedRankings] = useState<SimulatedState[]>([]);
  const [initialRankings, setInitialRankings] = useState<Record<string, number>>({});
  const [statesData, setStatesData] = useState<ApiStateData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchStates(), fetchDomains()])
      .then(([states, domains]) => {
        setStatesData(states);
        setDomainsData(domains);
        const initialWeights: { [key: string]: number } = {};
        domains.forEach((d) => {
          initialWeights[d.id] = d.defaultWeight;
        });
        setWeights(initialWeights);

        const rawInitial = states.map((state) => {
          let score = 0;
          for (const d in initialWeights) {
            score += (state.scores[d] || 0) * (initialWeights[d] / 100);
          }
          return {
            id: state.id,
            name: state.name,
            simulatedScore: parseFloat(score.toFixed(2)),
          };
        });

        rawInitial.sort((a, b) => {
          if (b.simulatedScore !== a.simulatedScore) {
            return b.simulatedScore - a.simulatedScore;
          }
          return a.name.localeCompare(b.name);
        });

        const initRanks: Record<string, number> = {};
        rawInitial.forEach((state, index) => {
          initRanks[state.id] = index + 1;
        });
        setInitialRankings(initRanks);

        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  // Reset to defaults
  const handleReset = () => {
    if (activeView === "OVERALL") {
      const initialWeights: { [key: string]: number } = {};
      domainsData.forEach((d) => {
        initialWeights[d.id] = d.defaultWeight;
      });
      setWeights(initialWeights);
      setModifiedOrder([]);
    } else {
      const indicators = statesData[0]?.indicators?.[activeView] || [];
      const defaultW = 100 / indicators.length;
      const newWeights: Record<string, number> = {};
      indicators.forEach(ind => newWeights[ind.name] = defaultW);
      setIndicatorWeights(prev => ({ ...prev, [activeView]: newWeights }));
      setModifiedIndicatorOrder(prev => ({ ...prev, [activeView]: [] }));
    }
  };

  const handleGenericSliderChange = (
    id: string,
    newValue: number,
    currentWeights: Record<string, number>,
    allIds: string[],
    currentOrder: string[],
    onUpdate: (newWeights: Record<string, number>, newOrder: string[]) => void
  ) => {
    const clampedNewValue = Math.max(0, Math.min(100, newValue));
    const delta = currentWeights[id] - clampedNewValue;
    if (Math.abs(delta) < 0.01) return;

    const newOrder = currentOrder.filter((item) => item !== id);
    const newWeights = { ...currentWeights };
    newWeights[id] = clampedNewValue;

    let deltaToDistribute = delta;
    let pool = allIds.filter((item) => item !== id && !newOrder.includes(item));
    let orderIndex = newOrder.length - 1;

    let iterations = 0;
    while (Math.abs(deltaToDistribute) > 0.01 && iterations < 50) {
      iterations++;
      if (pool.length === 0) {
        if (orderIndex >= 0) {
          pool.push(newOrder[orderIndex]);
          orderIndex--;
        } else break;
      }

      let usablePool = pool.filter((item) => {
        if (deltaToDistribute > 0) return newWeights[item] < 100;
        return newWeights[item] > 0;
      });

      if (usablePool.length === 0) {
        pool = [];
        continue;
      }

      let poolSum = usablePool.reduce((sum, item) => sum + newWeights[item], 0);
      const distributeEqually = poolSum === 0 && deltaToDistribute > 0;

      let newDelta = 0;
      for (const item of usablePool) {
        const share = distributeEqually
          ? (deltaToDistribute / usablePool.length)
          : (deltaToDistribute * (newWeights[item] / poolSum));

        const target = newWeights[item] + share;
        if (target < 0) {
          newDelta += target;
          newWeights[item] = 0;
        } else if (target > 100) {
          newDelta += (target - 100);
          newWeights[item] = 100;
        } else {
          newWeights[item] = target;
        }
      }
      deltaToDistribute = newDelta;
      if (Math.abs(deltaToDistribute) > 0.01) pool = [];
    }

    for (const key in newWeights) {
      newWeights[key] = Math.round(newWeights[key] * 10) / 10;
    }

    const finalTotal = Object.values(newWeights).reduce((a, b) => a + b, 0);
    if (Math.abs(finalTotal - 100) > 0.01) {
      const diff = 100 - finalTotal;
      let adjustId = allIds.find(item => item !== id && !newOrder.includes(item) && newWeights[item] + diff >= 0 && newWeights[item] + diff <= 100);
      if (!adjustId) {
        adjustId = allIds.find(item => item !== id && newWeights[item] + diff >= 0 && newWeights[item] + diff <= 100);
      }
      if (adjustId) newWeights[adjustId] = Math.round((newWeights[adjustId] + diff) * 10) / 10;
    }

    newOrder.unshift(id);
    onUpdate(newWeights, newOrder);
  };

  const handleSliderChange = (domainId: string, newValue: number) => {
    handleGenericSliderChange(
      domainId, newValue, weights, domainsData.map(d => d.id), modifiedOrder,
      (newW, newO) => { setWeights(newW); setModifiedOrder(newO); }
    );
  };

  const handleIndicatorSliderChange = (domainId: string, indicatorName: string, newValue: number) => {
    const curW = indicatorWeights[domainId] || {};
    const curO = modifiedIndicatorOrder[domainId] || [];
    handleGenericSliderChange(
      indicatorName, newValue, curW, Object.keys(curW), curO,
      (newW, newO) => {
        setIndicatorWeights(prev => ({ ...prev, [domainId]: newW }));
        setModifiedIndicatorOrder(prev => ({ ...prev, [domainId]: newO }));
      }
    );
  };

  // Recalculate ranks on weight changes or when statesData changes
  useEffect(() => {
    if (statesData.length === 0) return;

    let defaultDomainRanks: Record<string, number> = {};
    if (activeView !== "OVERALL") {
      const sortedByDomain = [...statesData].sort((a, b) => {
        const sA = a.scores[activeView] || 0;
        const sB = b.scores[activeView] || 0;
        if (sB !== sA) return sB - sA;
        return a.name.localeCompare(b.name);
      });
      sortedByDomain.forEach((s, idx) => {
        defaultDomainRanks[s.id] = idx + 1;
      });
    }

    const rawSimulated = statesData.map((state) => {
      let score = 0;
      
      if (activeView === "OVERALL") {
        for (const d in weights) {
          score += (state.scores[d] || 0) * (weights[d] / 100);
        }
      } else {
        const dId = activeView;
        const curW = indicatorWeights[dId];
        if (curW && state.indicators && state.indicators[dId]) {
          for (const ind of state.indicators[dId]) {
            score += (ind.score || 0) * ((curW[ind.name] || 0) / 100);
          }
        } else {
          score = state.scores[dId] || 0;
        }
      }

      return {
        id: state.id,
        name: state.name,
        type: state.type,
        simulatedScore: parseFloat(score.toFixed(2)),
        scores: state.scores,
      };
    });

    // Sort descending by score, resolve tie alphabetically
    rawSimulated.sort((a, b) => {
      if (b.simulatedScore !== a.simulatedScore) {
        return b.simulatedScore - a.simulatedScore;
      }
      return a.name.localeCompare(b.name);
    });

    // Assign ranks and compute difference from default
    const finalSimulated: SimulatedState[] = rawSimulated.map((state, index) => {
      const simulatedRank = index + 1;
      let originalRank = 0;
      if (activeView === "OVERALL") {
        const baseState = statesData.find((s) => s.id === state.id)!;
        originalRank = initialRankings[state.id] || baseState.baseRank;
      } else {
        originalRank = defaultDomainRanks[state.id];
      }
      
      const rankChange = originalRank - simulatedRank; // positive = rank improved

      return {
        ...state,
        simulatedRank,
        rankChange,
      };
    });

    setSimulatedRankings(finalSimulated);
  }, [weights, statesData, initialRankings, activeView, indicatorWeights]);

  // Export CSV of custom rankings
  const exportSimulatedCSV = () => {
    const headers = ["Simulated Rank", "State Name", "Simulated Score", "Rank Change", "Original Rank"];
    const rows = simulatedRankings.map((s) => {
      let originalRank = 0;
      if (activeView === "OVERALL") {
        const baseState = statesData.find((sd) => sd.id === s.id)!;
        originalRank = initialRankings[s.id] || baseState?.baseRank || 0;
      } else {
        originalRank = s.simulatedRank + s.rankChange;
      }
      return [
        s.simulatedRank,
        s.name,
        s.simulatedScore,
        s.rankChange > 0 ? `+${s.rankChange}` : s.rankChange,
        originalRank
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const domainName = activeView === "OVERALL" ? "Overall" : domainsData.find(d => d.id === activeView)?.name || activeView;
    link.setAttribute("download", `Simulated_Rankings_${domainName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
        <div className="flex flex-col items-center gap-4 text-primary">
          <Loader2 className="animate-spin" size={48} />
          <p className="font-plus-jakarta font-semibold animate-pulse">Loading Simulator...</p>
        </div>
      </div>
    );
  }

  const totalWeight = activeView === "OVERALL" 
    ? Object.values(weights).reduce((sum, w) => sum + w, 0)
    : Object.values(indicatorWeights[activeView] || {}).reduce((sum, w) => sum + w, 0);

  return (
    <>
      <Header />
      <main className="flex-grow pt-16 bg-surface-container-low/40">
        <section className="py-12 bg-white border-b border-outline-variant/30">
          <div className="max-w-container-max-width mx-auto px-gutter flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <span className="text-secondary font-bold text-[12px] uppercase tracking-wider">
                Simulated Sandbox
              </span>
              <h1 className="font-plus-jakarta text-3xl sm:text-4xl font-extrabold text-primary">
                Build Your Own Ranking
              </h1>
              <p className="text-on-surface-variant text-[15px] max-w-xl">
                {activeView === "OVERALL" 
                  ? "Adjust domain weightages to see how overall standings shift. Ranks are recalculated dynamically on the client."
                  : "Adjust indicator weightages within this domain to see how the domain-specific rankings change."}
              </p>
            </div>
            <button
              onClick={exportSimulatedCSV}
              className="bg-primary text-white hover:bg-primary-container px-6 py-3 rounded-xl font-bold text-[14px] transition-all flex items-center gap-2 shadow-sm"
            >
              <Download size={16} />
              Export Ranks (.CSV)
            </button>
          </div>
        </section>

        {/* Live Simulation Workspace */}
        <section className="max-w-container-max-width mx-auto px-gutter py-10">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">

            {/* Left Controls: Sliders Panel */}
            <aside className="lg:col-span-5 w-full lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-xl p-8 space-y-8">
                
                {/* VIEW SELECTOR */}
                <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-6">
                  <button
                    onClick={() => setActiveView("OVERALL")}
                    className={`px-4 py-2.5 rounded-lg font-bold text-[13px] whitespace-nowrap transition-colors ${activeView === "OVERALL" ? "bg-primary text-white shadow-md" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-transparent"}`}
                  >
                    Overall Rank
                  </button>
                  
                  <div className="relative flex-1">
                    <select
                      value={activeView === "OVERALL" ? "" : activeView}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        setActiveView(val);
                        if (!indicatorWeights[val] && statesData.length > 0) {
                          const indicators = statesData[0]?.indicators?.[val] || [];
                          if (indicators.length > 0) {
                            const defaultW = 100 / indicators.length;
                            const newWeights: Record<string, number> = {};
                            indicators.forEach(ind => newWeights[ind.name] = defaultW);
                            setIndicatorWeights(prev => ({...prev, [val]: newWeights}));
                          }
                        }
                      }}
                      className={`w-full appearance-none px-4 py-2.5 pr-10 rounded-lg font-bold text-[13px] outline-none transition-colors cursor-pointer ${
                        activeView !== "OVERALL" 
                          ? "bg-primary text-white shadow-md border border-primary" 
                          : "bg-surface-container-low text-on-surface-variant border border-transparent hover:bg-surface-container"
                      }`}
                    >
                      <option value="" disabled>Select a Domain to Drill Down...</option>
                      {domainsData.map((d) => (
                        <option key={d.id} value={d.id} className="text-black bg-white font-semibold">
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${activeView !== "OVERALL" ? "text-white" : "text-on-surface-variant"}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                  <h3 className="font-plus-jakarta text-xl font-extrabold text-primary">
                    Weight Adjustments
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">
                      Total
                    </span>
                    <span className="bg-secondary text-white font-plus-jakarta font-extrabold text-sm px-3.5 py-1.5 rounded-full shadow-sm">
                      {Math.round(totalWeight)}%
                    </span>
                  </div>
                </div>

                {/* Slider inputs */}
                <div className="space-y-6">
                  {activeView === "OVERALL" ? (
                    domainsData.map((domain) => {
                      const currentVal = weights[domain.id] || 0;
                      return (
                        <div key={domain.id} className="space-y-2">
                          <div className="flex justify-between items-center text-[14px]">
                            <label className="font-bold text-primary">{domain.name}</label>
                            <span className="text-secondary font-bold font-plus-jakarta">
                              {Number(currentVal.toFixed(2))}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.1"
                            value={currentVal}
                            onChange={(e) => handleSliderChange(domain.id, parseFloat(e.target.value))}
                            className="w-full accent-secondary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] font-bold text-on-surface-variant tracking-wider">
                            <span>MIN: 0%</span>
                            <span>MAX: 100%</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    Object.keys(indicatorWeights[activeView] || {}).map((indicatorName) => {
                      const currentVal = indicatorWeights[activeView][indicatorName] || 0;
                      return (
                        <div key={indicatorName} className="space-y-2">
                          <div className="flex justify-between items-center text-[14px]">
                            <label className="font-bold text-primary">{indicatorName}</label>
                            <span className="text-secondary font-bold font-plus-jakarta">
                              {Number(currentVal.toFixed(2))}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.1"
                            value={currentVal}
                            onChange={(e) => handleIndicatorSliderChange(activeView, indicatorName, parseFloat(e.target.value))}
                            className="w-full accent-secondary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] font-bold text-on-surface-variant tracking-wider">
                            <span>MIN: 0%</span>
                            <span>MAX: 100%</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Controls Action footer */}
                <div className="border-t border-outline-variant/20 pt-6 space-y-4">
                  <button
                    onClick={handleReset}
                    className="w-full py-3 px-4 border border-primary text-primary hover:bg-surface-container-low transition-colors rounded-xl font-bold text-[14px] flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={15} />
                    Reset to Default Weights
                  </button>

                  <div className="flex gap-2.5 bg-surface-container-low/60 rounded-xl p-4 border border-outline-variant/20">
                    <Info size={16} className="text-secondary shrink-0 mt-0.5" />
                    <p className="text-[12px] text-on-surface-variant leading-relaxed">
                      <strong>Smart Distribution:</strong> Modifying a slider locks its value and automatically adjusts the remaining unlocked weights proportionally to maintain exactly 100%.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Controls: Recalculated Rankings Grid */}
            <section className="lg:col-span-7 w-full">
              <div className="bg-white rounded-2xl shadow-xl border border-outline-variant/30 overflow-hidden">
                <div className="p-6 border-b border-outline-variant/30 bg-surface-container-low/40">
                  <h3 className="font-plus-jakarta text-lg font-extrabold text-primary">
                    {activeView === "OVERALL" ? "Simulated National Standings" : `Simulated ${domainsData.find(d => d.id === activeView)?.name || "Domain"} Standings`}
                  </h3>
                  <p className="text-[12px] text-on-surface-variant font-medium">
                    Calculated in real-time based on weight settings.
                  </p>
                </div>

                {totalWeight === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-red-50 text-red-500 flex items-center justify-center rounded-full">
                      <Info size={32} />
                    </div>
                    <h4 className="font-plus-jakarta font-extrabold text-xl text-primary">
                      {activeView === "OVERALL" ? "Domain Weight is Already 100%" : "Indicator Weight is 0%"}
                    </h4>
                    <p className="text-on-surface-variant max-w-md">
                      You need to distribute the weight to generate a valid ranking. Please ensure total weight is 100%.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-[620px] custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container bg-opacity-35 border-b border-outline-variant/30 select-none sticky top-0 bg-white z-10">
                          <th className="py-3.5 px-6 font-plus-jakarta text-[11px] font-bold text-on-surface-variant uppercase tracking-wider w-20">
                            Rank
                          </th>
                          <th className="py-3.5 px-6 font-plus-jakarta text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                            State
                          </th>
                          <th className="py-3.5 px-6 font-plus-jakarta text-[11px] font-bold text-on-surface-variant uppercase tracking-wider text-center w-32">
                            CCS Rank
                          </th>
                          <th className="py-3.5 px-6 font-plus-jakarta text-[11px] font-bold text-on-surface-variant uppercase tracking-wider text-right w-24">
                            Score
                          </th>
                          <th className="py-3.5 px-6 font-plus-jakarta text-[11px] font-bold text-on-surface-variant uppercase tracking-wider text-center w-28">
                            Change
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20">
                        {simulatedRankings.map((state) => {
                          const originalRank = initialRankings[state.id] || statesData.find((o) => o.id === state.id)!.baseRank;
                          const improvement = state.rankChange;

                          return (
                            <tr
                              key={state.id}
                              className="hover:bg-surface-container-low/30 transition-colors"
                            >
                              <td className="py-3.5 px-6 font-plus-jakarta text-[15px] font-extrabold text-primary">
                                #{state.simulatedRank}
                              </td>
                              <td className="py-3.5 px-6">
                                <div className="font-bold text-[14px] text-primary">
                                  {state.name}
                                </div>
                                <div className="text-[10px] text-on-surface-variant uppercase font-semibold">
                                  {state.type}
                                </div>
                              </td>
                              <td className="py-3.5 px-6 text-center font-plus-jakarta text-[14px] font-bold text-on-surface-variant">
                                #{originalRank}
                              </td>
                              <td className="py-3.5 px-6 text-right font-plus-jakarta text-[14px] font-bold text-secondary">
                                {state.simulatedScore}
                              </td>
                              <td className="py-3.5 px-6 text-center">
                                {improvement > 0 ? (
                                  <span className="inline-flex items-center gap-0.5 text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full text-[12px] font-bold">
                                    <ArrowUp size={12} className="stroke-[3]" />
                                    {improvement}
                                  </span>
                                ) : improvement < 0 ? (
                                  <span className="inline-flex items-center gap-0.5 text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full text-[12px] font-bold">
                                    <ArrowDown size={12} className="stroke-[3]" />
                                    {Math.abs(improvement)}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 text-on-surface-variant bg-surface-container px-2.5 py-0.5 rounded-full text-[12px] font-bold">
                                    <Minus size={12} className="stroke-[3]" />
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
