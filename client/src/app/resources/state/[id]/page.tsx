"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchStates, ApiStateData } from "@/services/api";
import { ArrowLeft, Download, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import DownloadConsentModal from "@/components/DownloadConsentModal";

export default function StateResourceViewer() {
  const params = useParams();
  const router = useRouter();
  const stateId = params.id as string;

  const [stateData, setStateData] = useState<ApiStateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const handleDownloadConfirm = () => {
    if (!stateData?.pdfUrl) return;
    window.location.href = `${stateData.pdfUrl}?download=EoOS_2026_${stateData.name.replace(/\s+/g, '_')}.pdf`;
  };

  useEffect(() => {
    fetchStates()
      .then((data) => {
        const found = data.find((s) => s.id === stateId);
        if (found) {
          setStateData(found);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [stateId]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-container-low pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-bold transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Back to Resources
          </button>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="animate-spin text-secondary mb-4" size={40} />
              <p className="text-on-surface-variant font-bold text-lg">Loading Official Report...</p>
            </div>
          ) : !stateData ? (
            <div className="text-center py-32 bg-white rounded-2xl border border-outline-variant/30 shadow-sm">
              <p className="text-on-surface-variant font-medium text-lg">State not found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/30 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold text-primary bg-cover px-2 py-0.5 rounded uppercase">
                      {stateData.type}
                    </span>
                    <span className="text-[11px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded uppercase">
                      Index 2026
                    </span>
                  </div>
                  <h1 className="font-plus-jakarta text-3xl font-extrabold text-primary flex items-center gap-3">
                    <FileText className="text-secondary" />
                    {stateData.name} State Profile
                  </h1>
                  <p className="text-on-surface-variant text-sm mt-2">
                    Official comparative assessment report and regulatory framework summary.
                  </p>
                </div>
                
                {stateData.pdfUrl && (
                  <button 
                    onClick={() => setIsDownloadModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-secondary text-white px-6 py-3 rounded-xl font-bold hover:bg-[#E6B800] transition-colors shadow-md shrink-0"
                  >
                    <Download size={18} />
                    Download Official PDF
                  </button>
                )}
              </div>

              <div className="bg-slate-100 min-h-[800px] w-full flex items-center justify-center relative">
                {stateData.pdfUrl ? (
                  <iframe 
                    src={`${stateData.pdfUrl}#toolbar=0`} 
                    className="w-full h-[800px] border-none"
                    title={`${stateData.name} PDF Report`}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <FileText size={64} className="text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-500 mb-2">Report Not Available Yet</h3>
                    <p className="text-slate-400 max-w-md">
                      The official PDF report for {stateData.name} has not been uploaded to the repository yet. Please check back later.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Download Modal */}
      <DownloadConsentModal 
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onConfirm={handleDownloadConfirm}
        title={`Download ${stateData?.name} Report`}
        description={`Please provide your details below to download the EoOS 2026 report for ${stateData?.name}.`}
        pdfUrl={stateData?.pdfUrl ? `${stateData.pdfUrl}?download=EoOS_2026_${stateData.name.replace(/\s+/g, '_')}.pdf` : undefined}
        filename={stateData?.name ? `EoOS_2026_${stateData.name.replace(/\s+/g, '_')}.pdf` : undefined}
      />
    </>
  );
}
