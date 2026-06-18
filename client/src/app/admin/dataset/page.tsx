"use client";

import { useState, useEffect } from "react";
import { adminFetch } from "@/utils/api";
import { Upload, Database } from "lucide-react";

export default function DatasetManager() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Excel file is required");

    setLoading(true);
    setUploadStatus(null);
    const formData = new FormData();
    formData.append("excel", file);

    try {
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/media/dataset`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setFile(null);
        setUploadStatus("Dataset successfully uploaded and parsed!");
      } else {
        const err = await res.json();
        setUploadStatus(`Error: ${err.error || "Upload failed"}`);
      }
    } catch (e) {
      console.error(e);
      setUploadStatus("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30">
        <div>
          <h1 className="text-3xl font-plus-jakarta font-extrabold text-primary flex items-center gap-3">
            <Database className="text-secondary" /> Raw Dataset Upload
          </h1>
          <p className="text-on-surface-variant mt-2 text-[15px]">
            Upload the raw field dataset as an Excel (.xlsx) file. It will be securely parsed and displayed in the Resources section.
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-primary/20 space-y-6">
        <h3 className="font-bold text-lg text-primary border-b pb-2">Upload Excel Dataset</h3>
        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-on-surface mb-2">Excel File (.xlsx, .xls)</label>
            <input 
              required 
              type="file" 
              accept=".xlsx, .xls"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="w-full border rounded-xl p-3 bg-surface-container-lowest file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary/10 file:text-secondary hover:file:bg-secondary/20 transition-all cursor-pointer"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 w-full sm:w-auto hover:bg-primary-container disabled:opacity-50 transition-colors"
          >
            {loading ? "Parsing and Uploading..." : <><Upload size={18} /> Upload and Parse</>}
          </button>
          
          {uploadStatus && (
            <p className={`text-sm font-semibold p-4 rounded-xl ${uploadStatus.startsWith("Error") ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
              {uploadStatus}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
