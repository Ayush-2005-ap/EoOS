"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, FileText, Download } from "lucide-react";

export default function ReportsManager() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = () => {
    fetch("http://localhost:4000/api/media/reports")
      .then(res => res.json())
      .then(json => {
        setReports(json.data || []);
        setLoading(false);
      });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) return alert("Title and PDF are required");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("pdf", file);

    try {
      const res = await fetch("http://localhost:4000/api/media/reports", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setTitle("");
        setFile(null);
        setShowAdd(false);
        fetchReports();
      } else {
        const err = await res.json();
        alert(err.error || "Upload failed");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      await fetch(`http://localhost:4000/api/media/reports/${id}`, { method: "DELETE" });
      fetchReports();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-plus-jakarta font-extrabold text-primary flex items-center gap-3">
            <FileText className="text-secondary" /> Reports Manager
          </h1>
          <p className="text-on-surface-variant mt-2 text-[15px]">Upload and manage official PDF reports.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-container transition-colors"
        >
          <Plus size={18} /> Upload Report
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleUpload} className="bg-white p-6 rounded-2xl shadow-lg border border-primary/20 space-y-4">
          <h3 className="font-bold text-lg text-primary border-b pb-2">Upload New Report</h3>
          <input 
            required 
            type="text" 
            placeholder="Report Title (e.g. Annual State of Schooling 2024)" 
            className="w-full p-3 border rounded-lg" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
          />
          <input 
            required 
            type="file" 
            accept=".pdf"
            className="w-full p-3 border rounded-lg bg-slate-50" 
            onChange={e => setFile(e.target.files ? e.target.files[0] : null)} 
          />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg">Upload PDF</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? <p>Loading reports...</p> : reports.map((report) => (
          <div key={report.id} className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-800 line-clamp-2">{report.title}</h3>
              <p className="text-xs text-slate-400 mt-2">Added: {new Date(report.createdAt).toLocaleDateString()}</p>
              
              <a 
                href={`http://localhost:4000${report.pdfPath}`} 
                target="_blank" 
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-secondary hover:underline"
              >
                <Download size={16} /> View PDF
              </a>
            </div>
            
            <button onClick={() => handleDelete(report.id)} className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors ml-4">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {!loading && reports.length === 0 && <p className="text-slate-500">No reports uploaded yet.</p>}
      </div>
    </div>
  );
}
