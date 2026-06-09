"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Trophy, Plus, Trash2 } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

export default function AdminDashboard() {
  const [states, setStates] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add state form
  const [showAdd, setShowAdd] = useState(false);
  const [newState, setNewState] = useState({ id: "", name: "", type: "STATE", region: "North" });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchDomainsAndStates();
  }, []);

  const fetchDomainsAndStates = async () => {
    try {
      const [domRes, statRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/admin/hierarchy`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/states`)
      ]);
      const domJson = await domRes.json();
      const statJson = await statRes.json();

      setDomains(domJson.data || []);
      
      const sorted = (statJson.data || []).sort((a: any, b: any) => a.baseRank - b.baseRank);
      setStates(sorted);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleCreateState = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/admin/states`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newState),
      });
      if (res.ok) {
        setNewState({ id: "", name: "", type: "STATE", region: "North" });
        setShowAdd(false);
        fetchDomainsAndStates();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create state");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/admin/states/${deleteConfirmId}`, { method: "DELETE" });
      setDeleteConfirmId(null);
      fetchDomainsAndStates();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-plus-jakarta font-extrabold text-primary">States Overview</h1>
          <p className="text-on-surface-variant mt-2 text-[15px]">Select a state to modify its raw sub-indicator scores and regenerate rankings.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-4 rounded-xl flex items-center gap-4 mr-4">
            <Trophy size={28} className="text-primary" />
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wider">Total States tracked</p>
              <p className="text-2xl font-extrabold text-primary">{states.length}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-container transition-colors"
          >
            <Plus size={18} /> Add State
          </button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleCreateState} className="bg-white p-6 rounded-2xl shadow-lg border border-primary/20 space-y-4 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-lg text-primary border-b pb-2">Add New State / UT</h3>
          <div className="grid grid-cols-2 gap-4">
            <input required type="text" placeholder="ID (e.g. DL for Delhi)" className="p-3 border rounded-lg uppercase" value={newState.id} onChange={e => setNewState({...newState, id: e.target.value})} />
            <input required type="text" placeholder="Full Name" className="p-3 border rounded-lg" value={newState.name} onChange={e => setNewState({...newState, name: e.target.value})} />
            
            <select className="p-3 border rounded-lg bg-slate-50" value={newState.type} onChange={e => setNewState({...newState, type: e.target.value})}>
              <option value="STATE">State</option>
              <option value="UT">Union Territory</option>
            </select>
            
            <select className="p-3 border rounded-lg bg-slate-50" value={newState.region} onChange={e => setNewState({...newState, region: e.target.value})}>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
              <option value="Central">Central</option>
              <option value="NorthEast">North-East</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg">Save State</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-outline-variant/30 overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 border-b border-outline-variant/30">
              <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-widest sticky left-0 bg-slate-50 z-10">Rank</th>
              <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-widest sticky left-16 bg-slate-50 z-10">State / UT</th>
              <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-widest">Type</th>
              <th className="p-4 text-[12px] font-bold text-secondary uppercase tracking-widest bg-secondary/5">Overall Score</th>
              {domains.map(dom => (
                <th key={dom.id} className="p-4 text-[12px] font-bold text-primary uppercase tracking-widest">
                  {dom.name}
                </th>
              ))}
              <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5 + domains.length} className="p-8 text-center text-slate-400">Loading states...</td></tr>
            ) : states.map((state) => (
              <tr key={state.id} className="border-b border-outline-variant/10 hover:bg-slate-50 transition-colors group">
                <td className="p-4 font-bold text-slate-700 sticky left-0 bg-white group-hover:bg-slate-50 z-10">#{state.baseRank}</td>
                <td className="p-4 font-bold text-primary sticky left-16 bg-white group-hover:bg-slate-50 z-10">
                  <Link href={`/admin/states/${state.id}`} className="hover:underline hover:text-blue-600 cursor-pointer transition-colors">
                    {state.name}
                  </Link>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-[11px] font-bold uppercase ${state.type === 'STATE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {state.type}
                  </span>
                </td>
                <td className="p-4 font-extrabold text-secondary bg-secondary/5">{state.baseScore}</td>
                {domains.map(dom => {
                  const val = state.scores?.[dom.id];
                  return (
                    <td key={dom.id} className="p-4 font-bold text-slate-600">
                      {val !== undefined ? val : "-"}
                    </td>
                  );
                })}
                <td className="p-4 text-right flex items-center justify-end gap-2">
                  <button 
                    onClick={() => setDeleteConfirmId(state.id)}
                    className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete State"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        title="Delete State?"
        message={`Are you sure you want to delete this state? This will remove all its score data permanently!`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
