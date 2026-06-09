"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

export default function IndicatorDetails() {
  const params = useParams();
  const router = useRouter();
  const indicatorId = params.id as string;

  const [indicator, setIndicator] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New Sub-Indicator Form
  const [showAdd, setShowAdd] = useState(false);
  const [newSub, setNewSub] = useState({ name: "", maxScore: 1.0 });

  useEffect(() => {
    fetchIndicator();
  }, [indicatorId]);

  const fetchIndicator = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/admin/hierarchy`)
      .then(res => res.json())
      .then(json => {
        let foundInd = null;
        for (const d of json.data || []) {
          for (const i of d.indicators || []) {
            if (i.id === indicatorId) {
              foundInd = i;
              foundInd.domainName = d.name;
              break;
            }
          }
          if (foundInd) break;
        }
        setIndicator(foundInd);
        setLoading(false);
      });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/admin/sub-indicators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ indicatorId, ...newSub }),
      });
      if (res.ok) {
        setNewSub({ name: "", maxScore: 1.0 });
        setShowAdd(false);
        fetchIndicator();
      } else {
        alert("Failed to create sub-indicator");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this sub-indicator? This will delete all raw data for all states tied to it!")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/admin/sub-indicators/${id}`, { method: "DELETE" });
      fetchIndicator();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!indicator) return <div className="p-8">Indicator not found.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold transition-colors"
      >
        <ArrowLeft size={16} /> Back to Domain
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex justify-between items-center">
        <div>
          <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">{indicator.domainName}</p>
          <h1 className="text-3xl font-plus-jakarta font-extrabold text-primary">{indicator.name}</h1>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-container transition-colors"
        >
          <Plus size={18} /> Add Sub-Indicator
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-lg border border-primary/20 space-y-4">
          <h3 className="font-bold text-lg text-primary border-b pb-2">Create Sub-Indicator</h3>
          <div className="flex gap-4">
            <input required type="text" placeholder="Name (e.g. % of schools with electricity)" className="flex-1 p-3 border rounded-lg" value={newSub.name} onChange={e => setNewSub({...newSub, name: e.target.value})} />
            <input required type="number" step="0.1" placeholder="Max Score (e.g. 1.0)" className="w-32 p-3 border rounded-lg" value={newSub.maxScore} onChange={e => setNewSub({...newSub, maxScore: parseFloat(e.target.value)})} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg">Save Sub-Indicator</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {indicator.subIndicators.map((sub: any) => (
          <div key={sub.id} className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-slate-800">{sub.name}</h3>
              <p className="text-xs font-bold text-slate-500 mt-1">Max Score: {sub.maxScore}</p>
            </div>
            <button onClick={() => handleDelete(sub.id)} className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
