"use client";

import { useState, useEffect } from "react";
import { Mail, Trash2, CheckCircle, Clock } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

export default function QueriesManager() {
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/queries`)
      .then(res => res.json())
      .then(json => {
        setQueries(json.data || []);
        setLoading(false);
      });
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/queries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchQueries();
    } catch (e) {
      console.error(e);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/queries/${deleteConfirmId}`, { method: "DELETE" });
      setDeleteConfirmId(null);
      fetchQueries();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-plus-jakarta font-extrabold text-primary flex items-center gap-3">
            <Mail className="text-secondary" /> Inbox / Queries
          </h1>
          <p className="text-on-surface-variant mt-2 text-[15px]">Manage incoming messages from the Contact Us form.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
            <Clock size={16} />
            {queries.filter(q => q.status === "OPEN").length} Open
          </div>
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
            <CheckCircle size={16} />
            {queries.filter(q => q.status === "CLOSED").length} Resolved
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? <p>Loading queries...</p> : queries.map((query) => (
          <div key={query.id} className={`bg-white p-6 rounded-2xl shadow-sm border ${query.status === 'OPEN' ? 'border-primary/30 border-l-4 border-l-primary' : 'border-outline-variant/30 opacity-75'} flex flex-col`}>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-800">{query.subject || "No Subject"}</h3>
                <p className="text-sm font-bold text-primary mt-1">{query.name} <span className="text-slate-400 font-normal">({query.email})</span></p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block mb-2">{new Date(query.createdAt).toLocaleString()}</span>
                {query.status === "OPEN" ? (
                  <button 
                    onClick={() => handleUpdateStatus(query.id, "CLOSED")}
                    className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-md font-bold hover:bg-amber-200 transition-colors"
                  >
                    Mark as Resolved
                  </button>
                ) : (
                  <button 
                    onClick={() => handleUpdateStatus(query.id, "OPEN")}
                    className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md font-bold hover:bg-slate-200 transition-colors"
                  >
                    Reopen
                  </button>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm whitespace-pre-wrap">
              {query.message}
            </div>

            <div className="mt-4 flex justify-end">
               <button onClick={() => setDeleteConfirmId(query.id)} className="p-2 text-slate-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
                <Trash2 size={16} /> Delete Query
              </button>
            </div>
          </div>
        ))}
        {!loading && queries.length === 0 && <p className="text-slate-500">Inbox is empty. No queries yet.</p>}
      </div>

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        title="Delete Query?"
        message="Are you sure you want to delete this query? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
