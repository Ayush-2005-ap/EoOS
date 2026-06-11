"use client";
import { adminFetch } from "@/utils/api";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

export default function DomainDetails() {
  const params = useParams();
  const router = useRouter();
  const domainId = params.id as string;

  const [domain, setDomain] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New Indicator Form
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchDomain();
  }, [domainId]);

  const fetchDomain = () => {
    adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/admin/hierarchy`)
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
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/admin/indicators`, {
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

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/admin/indicators/${deleteConfirmId}`, { method: "DELETE" });
      setDeleteConfirmId(null);
      fetchDomain();
    } catch (e) {
      console.error(e);
    }
  };

  const [editingIndicatorId, setEditingIndicatorId] = useState<string | null>(null);
  const [editIndicatorName, setEditIndicatorName] = useState("");

  const handleEditIndicator = async (indId: string) => {
    try {
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/admin/indicators/${indId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editIndicatorName }),
      });
      if (res.ok) {
        setEditingIndicatorId(null);
        fetchDomain();
      } else {
        alert("Failed to update indicator");
      }
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
            {editingIndicatorId === ind.id ? (
              <div className="flex-1 mr-4 flex gap-2">
                <input 
                  type="text" 
                  value={editIndicatorName} 
                  onChange={(e) => setEditIndicatorName(e.target.value)} 
                  className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-secondary/20 outline-none"
                  autoFocus
                />
                <button onClick={() => handleEditIndicator(ind.id)} className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm">Save</button>
                <button onClick={() => setEditingIndicatorId(null)} className="px-4 py-2 text-slate-500 font-bold text-sm">Cancel</button>
              </div>
            ) : (
              <div>
                <h3 className="font-extrabold text-lg text-slate-800">{ind.name}</h3>
                <p className="text-xs font-bold text-slate-500 mt-2 bg-slate-100 inline-block px-2 py-1 rounded">
                  {ind.subIndicators?.length || 0} Sub-Indicators
                </p>
              </div>
            )}
            
            {editingIndicatorId !== ind.id && (
              <div className="flex items-center gap-3">
                <button onClick={() => { setEditingIndicatorId(ind.id); setEditIndicatorName(ind.name); }} className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </button>
                <button onClick={() => setDeleteConfirmId(ind.id)} className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
                <Link href={`/admin/indicators/${ind.id}`} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
                  Manage Sub-Indicators <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        title="Delete Indicator?"
        message="Are you sure you want to delete this indicator and all its sub-indicators? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
