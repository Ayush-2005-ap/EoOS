"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Upload, Database, Settings, RefreshCw, CheckCircle2, AlertTriangle, FileSpreadsheet } from "lucide-react";

export default function AdminPortal() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [recomputing, setRecomputing] = useState(false);
  const [recomputeSuccess, setRecomputeSuccess] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus("idle");
    }
  };

  const submitFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploadStatus("uploading");
    setTimeout(() => {
      // Mock validation logic
      if (file.name.endsWith(".csv") || file.name.endsWith(".xlsx")) {
        setUploadStatus("success");
      } else {
        setUploadStatus("error");
      }
    }, 1500);
  };

  const handleRecompute = () => {
    setRecomputing(true);
    setRecomputeSuccess(false);
    setTimeout(() => {
      setRecomputing(false);
      setRecomputeSuccess(true);
    }, 2000);
  };

  return (
    <>
      <Header />
      <main className="flex-grow pt-16 bg-surface-container-low/40">
        <section className="py-12 bg-white border-b border-outline-variant/30">
          <div className="max-w-container-max-width mx-auto px-gutter space-y-2">
            <span className="text-secondary font-bold text-[12px] uppercase tracking-wider">
              Management Console
            </span>
            <h1 className="font-plus-jakarta text-3xl sm:text-4xl font-extrabold text-primary">
              Admin Portal
            </h1>
            <p className="text-on-surface-variant text-[15px] max-w-xl">
              Upload yearly research datasets, edit metadata, and trigger system recomputations for the official national index database.
            </p>
          </div>
        </section>

        <section className="max-w-container-max-width mx-auto px-gutter py-12">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
            
            {/* Left Side: Operations Cards */}
            <div className="lg:col-span-8 space-y-8 w-full">
              {/* Dataset upload section */}
              <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-xl p-8 space-y-6">
                <h3 className="font-plus-jakarta text-xl font-extrabold text-primary pb-3 border-b border-outline-variant/20 flex items-center gap-2">
                  <Database size={20} className="text-secondary" />
                  Upload Year-Wise Dataset
                </h3>

                <form onSubmit={submitFile} className="space-y-6">
                  <div className="border-2 border-dashed border-outline-variant/80 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-4 bg-surface-container-low/30 hover:bg-surface-container-low/60 transition-colors">
                    <FileSpreadsheet size={40} className="text-outline" />
                    <div className="space-y-1">
                      <p className="font-bold text-primary text-[14px]">
                        Drag and drop your spreadsheet here
                      </p>
                      <p className="text-[11px] text-on-surface-variant">
                        Supports Excel Workbooks (.xlsx) or comma-separated values (.csv)
                      </p>
                    </div>
                    <input
                      type="file"
                      id="dataset-upload"
                      accept=".csv, .xlsx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="dataset-upload"
                      className="px-4 py-2 bg-white border border-outline-variant text-[13px] font-bold text-primary rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors"
                    >
                      Browse Local Files
                    </label>
                    {file && (
                      <p className="text-[13px] font-semibold text-secondary mt-2">
                        Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-on-surface-variant">
                      <Settings size={16} />
                      Target Year: 2024 (Active)
                    </div>
                    
                    <button
                      type="submit"
                      disabled={!file || uploadStatus === "uploading"}
                      className="bg-primary text-white hover:bg-primary-container px-6 py-3 rounded-xl font-bold text-[14px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                    >
                      <Upload size={15} />
                      Upload and Validate
                    </button>
                  </div>
                </form>

                {/* Upload status message feedback */}
                {uploadStatus === "uploading" && (
                  <div className="p-4 bg-surface-container-high/50 border border-outline-variant/30 rounded-xl text-[14px] font-medium text-primary flex items-center gap-3">
                    <RefreshCw size={16} className="animate-spin text-secondary" />
                    Parsing and validating spreadsheet headers and rows compliance...
                  </div>
                )}
                {uploadStatus === "success" && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-[14px] font-medium text-green-700 flex items-center gap-3">
                    <CheckCircle2 size={16} />
                    File validated successfully! Schema matches the 4-level scoring hierarchy.
                  </div>
                )}
                {uploadStatus === "error" && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-[14px] font-medium text-error flex items-center gap-3">
                    <AlertTriangle size={16} />
                    Invalid file format. Please upload a valid CSV or XLSX spreadsheet.
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Recomputation Trigger */}
            <div className="lg:col-span-4 w-full">
              <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-xl p-8 space-y-6 sticky top-24">
                <h3 className="font-plus-jakarta text-lg font-extrabold text-primary pb-3 border-b border-outline-variant/20">
                  Ranking Engine Controls
                </h3>
                
                <p className="text-[13px] text-on-surface-variant leading-relaxed">
                  Triggering recomputation runs the multi-stage aggregation code across all states for 2024, updates official ranks, and purges the Redis cache.
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleRecompute}
                    disabled={recomputing}
                    className="w-full py-3 bg-secondary text-white hover:bg-secondary-container font-bold text-[14px] rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-secondary/15 disabled:opacity-50"
                  >
                    <RefreshCw size={15} className={recomputing ? "animate-spin" : ""} />
                    {recomputing ? "Aggregating metrics..." : "Recompute Index & Cache"}
                  </button>
                </div>

                {recomputeSuccess && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-[13px] font-medium text-green-700 flex items-center gap-2">
                    <CheckCircle2 size={15} className="shrink-0" />
                    Redis cache updated. Rankings live on dashboard!
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
