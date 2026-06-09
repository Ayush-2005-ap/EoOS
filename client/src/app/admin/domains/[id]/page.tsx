"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, ArrowRight, ArrowLeft } from "lucide-react";

export default function DomainDetails() {
  const params = useParams();
  const router = useRouter();
  const domainId = params.id as string;

  const [domain, setDomain] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New Indicator Form
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetchDomain();
  }, [domainId]);

  const fetchDomain = () => {
    fetch("http://localhost:4000/api/admin/hierarchy")
      .then(res => res.json())
      .then(json => {
        const found = (json.data || []).find((d: any) => d.id === domainId);
        setDomain(found);
        setLoading(false);
      });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/admin/indicators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId, name: newName }),
      });
      if (res.ok) {
        setNewName("");
        setShowAdd(false);
        fetchDomain();
      } else {
        alert("Failed to create indicator");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete indicator and all its sub-indicators?")) return;
    try {
      await fetch(`http://localhost:4000/api/admin/indicators/${id}`, { method: "DELETE" });
      fetchDomain();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!domain) return <div className="p-8">Domain not found.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <button 
        onClick={() => router.push("/admin/domains")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold transition-colors"
      >
        <ArrowLeft size={16} /> Back to Domains
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-plus-jakarta font-extrabold text-primary">{domain.name}</h1>
          <p className="text-on-surface-variant mt-2 text-[15px]">{domain.description}</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-container transition-colors"
        >
          <Plus size={18} /> Add Indicator
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-lg border border-primary/20 space-y-4">
          <h3 className="font-bold text-lg text-primary border-b pb-2">Create Indicator for {domain.name}</h3>
          <input required type="text" placeholder="Indicator Name (e.g. Pupil Teacher Ratio)" className="w-full p-3 border rounded-lg" value={newName} onChange={e => setNewName(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg">Save Indicator</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {domain.indicators.map((ind: any) => (
          <div key={ind.id} className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-lg text-slate-800">{ind.name}</h3>
              <p className="text-xs font-bold text-slate-500 mt-2 bg-slate-100 inline-block px-2 py-1 rounded">
                {ind.subIndicators?.length || 0} Sub-Indicators
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={() => handleDelete(ind.id)} className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors">
                <Trash2 size={18} />
              </button>
              <Link href={`/admin/indicators/${ind.id}`} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
                Manage Sub-Indicators <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
