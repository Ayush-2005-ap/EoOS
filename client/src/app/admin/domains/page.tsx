import { adminFetch } from "@/utils/api";
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, ArrowRight, Edit2 } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

export default function DomainsEngine() {
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Domain Form
  const [showAdd, setShowAdd] = useState(false);
  const [newDomain, setNewDomain] = useState({ id: "", name: "", description: "", defaultWeight: 16 });

  // Edit Domain Form
  const [editingDomainId, setEditingDomainId] = useState<string | null>(null);
  const [editDomainData, setEditDomainData] = useState({ name: "", description: "", defaultWeight: 16 });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = () => {
    adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/admin/hierarchy`)
      .then(res => res.json())
      .then(json => {
        setDomains(json.data || []);
        setLoading(false);
      });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/admin/domains`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDomain),
      });
      if (res.ok) {
        setNewDomain({ id: "", name: "", description: "", defaultWeight: 16 });
        setShowAdd(false);
        fetchDomains();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    try {
      const payload = {
        ...editDomainData,
        defaultWeight: isNaN(editDomainData.defaultWeight) ? 0 : editDomainData.defaultWeight
      };
      
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/admin/domains/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setEditingDomainId(null);
        fetchDomains();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update");
      }
    } catch (e: any) {
      console.error(e);
      alert("Error: " + e.message);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/admin/domains/${deleteConfirmId}`, { method: "DELETE" });
      setDeleteConfirmId(null);
      fetchDomains();
    } catch (e) {
      console.error(e);
    }
  };

  const startEditing = (domain: any) => {
    setEditingDomainId(domain.id);
    setEditDomainData({ name: domain.name, description: domain.description || "", defaultWeight: domain.defaultWeight });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-plus-jakarta font-extrabold text-primary">Domains Engine</h1>
          <p className="text-on-surface-variant mt-2 text-[15px]">Manage the top-level scoring domains (e.g. Access, Equity, Quality).</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-container transition-colors"
        >
          <Plus size={18} /> Add New Domain
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-lg border border-primary/20 space-y-4 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-lg text-primary border-b pb-2">Create Domain</h3>
          <div className="grid grid-cols-2 gap-4">
            <input required type="text" placeholder="ID (e.g., Innovation)" className="p-3 border rounded-lg" value={newDomain.id} onChange={e => setNewDomain({...newDomain, id: e.target.value})} />
            <input required type="text" placeholder="Name (e.g., Tech Innovation)" className="p-3 border rounded-lg" value={newDomain.name} onChange={e => setNewDomain({...newDomain, name: e.target.value})} />
            <input required type="text" placeholder="Description" className="p-3 border rounded-lg col-span-2" value={newDomain.description} onChange={e => setNewDomain({...newDomain, description: e.target.value})} />
            <input required type="number" step="0.1" placeholder="Weight (%)" className="p-3 border rounded-lg" value={newDomain.defaultWeight} onChange={e => setNewDomain({...newDomain, defaultWeight: parseFloat(e.target.value)})} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg">Save Domain</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading ? <p>Loading domains...</p> : domains.map(domain => (
          <div key={domain.id} className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30 group">
            {editingDomainId === domain.id ? (
              <form onSubmit={(e) => handleEdit(e, domain.id)} className="space-y-4">
                <div className="flex items-center gap-3 border-b pb-2 mb-2">
                  <span className="font-bold text-lg text-primary">Editing ID: {domain.id}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" placeholder="Name" className="p-3 border rounded-lg" value={editDomainData.name} onChange={e => setEditDomainData({...editDomainData, name: e.target.value})} />
                  <input required type="number" step="0.1" placeholder="Weight (%)" className="p-3 border rounded-lg" value={editDomainData.defaultWeight} onChange={e => setEditDomainData({...editDomainData, defaultWeight: parseFloat(e.target.value)})} />
                  <input required type="text" placeholder="Description" className="p-3 border rounded-lg col-span-2" value={editDomainData.description} onChange={e => setEditDomainData({...editDomainData, description: e.target.value})} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setEditingDomainId(null)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg">Update Domain</button>
                </div>
              </form>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-xl text-primary">{domain.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{domain.description}</p>
                  <div className="mt-3 flex gap-4">
                    <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-md">Weight: {domain.defaultWeight}%</span>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{domain.indicators?.length || 0} Indicators</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button onClick={() => startEditing(domain)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => setDeleteConfirmId(domain.id)} className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                  <Link href={`/admin/domains/${domain.id}`} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors ml-2">
                    Manage Indicators <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        title="Delete Domain?"
        message="Are you sure? This will delete all indicators inside it! This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
