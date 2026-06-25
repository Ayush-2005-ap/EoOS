"use client";

import { useState, useEffect } from "react";
import { adminFetch } from "@/utils/api";
import { fetchStates, ApiStateData } from "@/services/api";
import { Plus, Trash2, Scale, Download, Folder, FileText } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

export default function LegalManager() {
  const [activeTab, setActiveTab] = useState<"CENTRAL" | "STATE">("CENTRAL");
  const [states, setStates] = useState<ApiStateData[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  const [showDocForm, setShowDocForm] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [isRule, setIsRule] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState<{ id: string, type: "category" | "document" } | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsRes, docsRes, statesRes] = await Promise.all([
        adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/legal/categories`).then(r => r.json()),
        adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/legal/documents?lawType=${activeTab}`).then(r => r.json()),
        activeTab === "STATE" && states.length === 0 ? fetchStates() : Promise.resolve(states)
      ]);
      setCategories(catsRes.data || []);
      setDocuments(docsRes.data || []);
      if (activeTab === "STATE" && states.length === 0) {
        setStates(statesRes.sort((a: ApiStateData, b: ApiStateData) => a.name.localeCompare(b.name)));
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName) return;
    try {
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/legal/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName })
      });
      if (res.ok) {
        setCategoryName("");
        setShowCategoryForm(false);
        fetchData();
      } else {
        alert("Failed to create category");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle || !docFile) return alert("Title and PDF are required");
    if (activeTab === "CENTRAL" && !selectedCategoryId) return alert("Please select a category tab");
    if (activeTab === "STATE" && !selectedStateId) return alert("Please select a state");

    const formData = new FormData();
    formData.append("title", docTitle);
    formData.append("lawType", activeTab);
    formData.append("pdf", docFile);
    if (activeTab === "CENTRAL") formData.append("categoryId", selectedCategoryId);
    if (activeTab === "STATE") {
      formData.append("stateId", selectedStateId);
      formData.append("isRule", isRule.toString());
    }

    try {
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/legal/documents`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setDocTitle("");
        setDocFile(null);
        setSelectedCategoryId("");
        setSelectedStateId("");
        setIsRule(false);
        setShowDocForm(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Upload failed");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    const { id, type } = deleteConfirmId;
    try {
      const endpoint = type === "category" ? `/legal/categories/${id}` : `/legal/documents/${id}`;
      await adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}${endpoint}`, { method: "DELETE" });
      setDeleteConfirmId(null);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30">
        <h1 className="text-3xl font-plus-jakarta font-extrabold text-primary flex items-center gap-3">
          <Scale className="text-secondary" /> Legal Repository Manager
        </h1>
        <p className="text-on-surface-variant mt-2 text-[15px]">Organize Central Laws into tabs and manage State-wise legal frameworks.</p>
        
        <div className="flex gap-4 mt-8 border-b">
          <button 
            className={`pb-3 px-2 font-bold text-[15px] border-b-2 transition-colors ${activeTab === "CENTRAL" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            onClick={() => setActiveTab("CENTRAL")}
          >
            Central Laws
          </button>
          <button 
            className={`pb-3 px-2 font-bold text-[15px] border-b-2 transition-colors ${activeTab === "STATE" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            onClick={() => setActiveTab("STATE")}
          >
            State Laws
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">
          {activeTab === "CENTRAL" ? "Manage Central Documents" : "Manage State Documents"}
        </h2>
        <div className="flex gap-3">
          {activeTab === "CENTRAL" && (
            <button 
              onClick={() => { setShowCategoryForm(!showCategoryForm); setShowDocForm(false); }}
              className="bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-700 transition-colors"
            >
              <Folder size={18} /> New Tab
            </button>
          )}
          <button 
            onClick={() => { setShowDocForm(!showDocForm); setShowCategoryForm(false); }}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-container transition-colors"
          >
            <Plus size={18} /> Upload Document
          </button>
        </div>
      </div>

      {showCategoryForm && activeTab === "CENTRAL" && (
        <form onSubmit={handleCreateCategory} className="bg-white p-6 rounded-2xl shadow-lg border border-primary/20 space-y-4">
          <h3 className="font-bold text-lg text-primary border-b pb-2">Create New Category Tab</h3>
          <input 
            required 
            type="text" 
            placeholder="Tab Name (e.g. NEP, Constitution of India)" 
            className="w-full p-3 border rounded-lg" 
            value={categoryName} 
            onChange={e => setCategoryName(e.target.value)} 
          />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowCategoryForm(false)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg">Create Tab</button>
          </div>
        </form>
      )}

      {showDocForm && (
        <form onSubmit={handleUploadDoc} className="bg-white p-6 rounded-2xl shadow-lg border border-primary/20 space-y-4">
          <h3 className="font-bold text-lg text-primary border-b pb-2">Upload {activeTab === "CENTRAL" ? "Central" : "State"} Document</h3>
          
          <input 
            required 
            type="text" 
            placeholder="Document Title" 
            className="w-full p-3 border rounded-lg" 
            value={docTitle} 
            onChange={e => setDocTitle(e.target.value)} 
          />
          
          {activeTab === "CENTRAL" ? (
            <select required className="w-full p-3 border rounded-lg" value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)}>
              <option value="">-- Select Category Tab --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          ) : (
            <div className="space-y-4">
              <select required className="w-full p-3 border rounded-lg" value={selectedStateId} onChange={e => setSelectedStateId(e.target.value)}>
                <option value="">-- Select State --</option>
                {states.map(state => (
                  <option key={state.id} value={state.id}>{state.name}</option>
                ))}
              </select>
              <label className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50 cursor-pointer">
                <input type="checkbox" checked={isRule} onChange={e => setIsRule(e.target.checked)} className="w-5 h-5 accent-primary" />
                <span className="font-medium text-slate-700">This document goes into the "Rules" sub-tab</span>
              </label>
            </div>
          )}

          <input 
            required 
            type="file" 
            accept=".pdf"
            className="w-full p-3 border rounded-lg bg-slate-50" 
            onChange={e => setDocFile(e.target.files ? e.target.files[0] : null)} 
          />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowDocForm(false)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg">Upload PDF</button>
          </div>
        </form>
      )}

      {/* Categories List for Central */}
      {activeTab === "CENTRAL" && categories.length > 0 && (
        <div className="mb-8">
          <h3 className="font-bold text-slate-600 mb-3 text-sm uppercase tracking-wider">Existing Tabs</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-2 bg-white border border-outline-variant/50 px-3 py-1.5 rounded-full shadow-sm">
                <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                <button onClick={() => setDeleteConfirmId({ id: cat.id, type: "category" })} className="text-slate-400 hover:text-error transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <p>Loading documents...</p> : documents.map((doc) => (
          <div key={doc.id} className="bg-white p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between h-full group">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                  {doc.lawType === "CENTRAL" ? doc.category?.name : (doc.isRule ? `${doc.state?.name} (Rules)` : doc.state?.name)}
                </span>
                <button onClick={() => setDeleteConfirmId({ id: doc.id, type: "document" })} className="text-slate-300 group-hover:text-error transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              <h3 className="font-bold text-[15px] text-primary leading-snug line-clamp-2 mt-2" title={doc.title}>{doc.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{doc.size} • {new Date(doc.createdAt).toLocaleDateString()}</p>
            </div>
            <a 
              href={doc.pdfUrl}
              target="_blank" 
              rel="noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-lg transition-colors border border-slate-200"
            >
              <FileText size={14} /> View File
            </a>
          </div>
        ))}
        {!loading && documents.length === 0 && <p className="text-slate-500 col-span-full">No documents uploaded for {activeTab === "CENTRAL" ? "Central Laws" : "State Laws"} yet.</p>}
      </div>

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        title={`Delete ${deleteConfirmId?.type === 'category' ? 'Tab' : 'Document'}?`}
        message={`Are you sure you want to delete this ${deleteConfirmId?.type}? ${deleteConfirmId?.type === 'category' ? 'All documents inside it will also be deleted!' : 'This action cannot be undone.'}`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
