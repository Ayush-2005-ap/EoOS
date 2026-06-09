"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Save, Activity, ArrowLeft } from "lucide-react";

export default function StateScoreEditor() {
  const params = useParams();
  const router = useRouter();
  const stateId = params.id as string;

  const [hierarchy, setHierarchy] = useState<any[]>([]);
  const [stateData, setStateData] = useState<any>(null);
  const [stateScores, setStateScores] = useState<any>(null);

  const [openDomains, setOpenDomains] = useState<Record<string, boolean>>({});
  const [openIndicators, setOpenIndicators] = useState<Record<string, boolean>>({});
  const [editValues, setEditValues] = useState<Record<string, number>>({});

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ stateOfSchooling: "", regulatoryFramework: "" });

  const toggleDomain = (id: string) => setOpenDomains(p => ({ ...p, [id]: !p[id] }));
  const toggleIndicator = (id: string) => setOpenIndicators(p => ({ ...p, [id]: !p[id] }));

  useEffect(() => {
    // Fetch generic hierarchy
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/admin/hierarchy`)
      .then(res => res.json())
      .then(json => setHierarchy(json.data || []));

    // Fetch this state's generic info
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/states`)
      .then(res => res.json())
      .then(json => {
        const found = json.data?.find((s: any) => s.id === stateId);
        if (found) {
          setStateData(found);
          setProfileData({
            stateOfSchooling: found.stateOfSchooling || "",
            regulatoryFramework: found.regulatoryFramework || ""
          });
        }
      });

    fetchStateScores();
  }, [stateId]);

  const fetchStateScores = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/admin/states/${stateId}/scores`);
      const json = await res.json();
      setStateScores(json.data);
      
      const newEditVals: Record<string, number> = {};
      json.data.subIndicatorData.forEach((sub: any) => {
        newEditVals[sub.subIndicatorId] = sub.score;
      });
      setEditValues(newEditVals);
    } catch (e) {
      console.error(e);
    }
  };

  const handleIndicatorSave = async (indicatorId: string, subIndicators: any[]) => {
    try {
      const payload = subIndicators.map((sub: any) => ({
        subIndicatorId: sub.id,
        score: editValues[sub.id] || 0,
      }));

      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/admin/states/${stateId}/indicators/${indicatorId}/scores`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subIndicators: payload }),
      });
      await fetchStateScores();
      alert("Indicator scores saved and recalculated successfully!");
    } catch (e) {
      console.error(e);
      alert("Error saving indicator scores.");
    }
  };

  const handleProfileSave = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/admin/states/${stateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      if (res.ok) {
        setIsEditingProfile(false);
        setStateData({ ...stateData, ...profileData });
      } else {
        alert("Failed to update profile");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!stateScores || !hierarchy.length) return <div className="p-8 text-slate-500 font-medium">Loading Scoring Engine...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-24">
      
      <button 
        onClick={() => router.push("/admin")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold transition-colors"
      >
        <ArrowLeft size={16} /> Back to States List
      </button>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-outline-variant/30 p-8">
        <div className="flex justify-between items-start border-b border-outline-variant/30 pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-plus-jakarta font-extrabold text-primary flex items-center gap-3">
              <Activity className="text-secondary" />
              {stateData?.name || stateId}
            </h1>
            <p className="text-on-surface-variant mt-2 text-[14px]">Edit raw sub-indicator data. The system will automatically recalculate Indicator, Domain, and Overall scores.</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Overall Score</p>
            <p className="text-4xl font-extrabold text-secondary">{stateData?.baseScore ?? "..."}</p>
          </div>
        </div>

        {/* State Profile Section */}
        <div className="mb-8 p-6 bg-slate-50 border border-outline-variant/50 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">State Profile</h2>
            {!isEditingProfile ? (
              <button onClick={() => setIsEditingProfile(true)} className="text-sm font-bold text-primary hover:underline">
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => setIsEditingProfile(false)} className="text-sm font-bold text-slate-500 hover:underline">
                  Cancel
                </button>
                <button onClick={handleProfileSave} className="text-sm font-bold text-white bg-primary px-3 py-1 rounded-md">
                  Save
                </button>
              </div>
            )}
          </div>

          {isEditingProfile ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">State of Schooling</label>
                <textarea 
                  className="w-full p-3 border rounded-lg outline-none focus:border-primary text-sm" 
                  rows={3} 
                  placeholder="Enter details about the state of schooling..."
                  value={profileData.stateOfSchooling}
                  onChange={e => setProfileData(p => ({ ...p, stateOfSchooling: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Regulatory Framework</label>
                <textarea 
                  className="w-full p-3 border rounded-lg outline-none focus:border-primary text-sm" 
                  rows={3} 
                  placeholder="Enter details about the regulatory framework..."
                  value={profileData.regulatoryFramework}
                  onChange={e => setProfileData(p => ({ ...p, regulatoryFramework: e.target.value }))}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">State of Schooling</h3>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{stateData?.stateOfSchooling || <span className="italic text-slate-400">No data provided.</span>}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Regulatory Framework</h3>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{stateData?.regulatoryFramework || <span className="italic text-slate-400">No data provided.</span>}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {hierarchy.map(domain => {
            const dScore = stateScores.domainScores.find((d: any) => d.domainId === domain.id)?.score || 0;
            
            return (
              <div key={domain.id} className="border border-outline-variant/40 rounded-xl overflow-hidden shadow-sm">
                <div 
                  className="bg-slate-50 p-5 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => toggleDomain(domain.id)}
                >
                  <div className="flex items-center gap-3">
                    {openDomains[domain.id] ? <ChevronDown size={20} className="text-slate-500" /> : <ChevronRight size={20} className="text-slate-500" />}
                    <span className="font-bold text-[16px] text-primary">{domain.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] uppercase font-bold text-slate-400">Locked Domain Score</span>
                    <span className="font-extrabold text-xl text-slate-800">{dScore}</span>
                  </div>
                </div>

                {openDomains[domain.id] && (
                  <div className="bg-white">
                    {domain.indicators.map((ind: any) => {
                      const iScore = stateScores.indicatorScores.find((i: any) => i.indicatorId === ind.id)?.score || 0;
                      
                      return (
                        <div key={ind.id} className="border-t border-outline-variant/20">
                          <div 
                            className="p-4 pl-12 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => toggleIndicator(ind.id)}
                          >
                            <div className="flex items-center gap-3">
                              {openIndicators[ind.id] ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                              <span className="font-bold text-[14px] text-slate-700">{ind.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] uppercase font-bold text-slate-400">Locked Indicator Score</span>
                              <span className="font-bold text-[16px] text-slate-600">{iScore}</span>
                            </div>
                          </div>

                          {openIndicators[ind.id] && (
                            <div className="bg-slate-50/50 p-4 pl-20 space-y-3 border-t border-outline-variant/10">
                              {ind.subIndicators.map((sub: any) => {
                                return (
                                  <div key={sub.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-4 border border-outline-variant/30 rounded-lg shadow-sm">
                                    <span className="text-[13px] text-slate-600 font-medium flex-1">
                                      {sub.name}
                                    </span>
                                    <div className="flex items-center gap-3">
                                      <span className="text-[11px] font-bold text-slate-400 uppercase mr-2">Raw Value (Max {sub.maxScore}):</span>
                                      <input 
                                        type="number" 
                                        step="0.1" 
                                        min="0" 
                                        max={sub.maxScore}
                                        className="w-24 p-2 border border-outline-variant/50 focus:border-primary rounded-lg text-center text-[14px] font-bold text-slate-800 outline-none"
                                        value={editValues[sub.id] ?? 0}
                                        onChange={(e) => setEditValues(p => ({ ...p, [sub.id]: parseFloat(e.target.value) }))}
                                      />
                                    </div>
                                  </div>
                                )
                              })}
                              
                              <div className="flex justify-end pt-4 mt-2 border-t border-outline-variant/20">
                                <button 
                                  onClick={() => handleIndicatorSave(ind.id, ind.subIndicators)}
                                  className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary-container transition-colors shadow-sm font-bold text-[14px]"
                                >
                                  <Save size={16} />
                                  Save & Recalculate Indicator
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
