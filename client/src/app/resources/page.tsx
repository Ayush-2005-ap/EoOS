import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Download, FileText, Table, BookOpen, ExternalLink, HelpCircle } from "lucide-react";

export default function Resources() {
  const downloads = [
    {
      title: "CCS Education Out-of-School Index Report 2024",
      type: "PDF Report",
      size: "14.2 MB",
      desc: "The complete annual report publishing national rankings, domain-wise findings, state profiles, and policy recommendations.",
      icon: BookOpen,
      color: "bg-secondary/10 text-secondary",
    },
    {
      title: "Index Methodology Whitepaper",
      type: "PDF Technical Guide",
      size: "3.8 MB",
      desc: "Detailed academic explanation of the scoring rules, indicator definitions, geometric mean aggregation logic, and normalization formulas.",
      icon: FileText,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Complete State-Wise Scores Dataset 2024",
      type: "Excel Workbook (.xlsx)",
      size: "8.5 MB",
      desc: "Full flat data sheet containing all 80+ sub-indicator raw scores, normalized scores, and domain aggregates for all 36 states and UTs.",
      icon: Table,
      color: "bg-green-50 text-green-700 border border-green-200",
    },
  ];

  return (
    <>
      <Header />
      <main className="flex-grow pt-16 bg-surface-container-low/40">
        <section className="py-12 bg-white border-b border-outline-variant/30">
          <div className="max-w-container-max-width mx-auto px-gutter space-y-2">
            <span className="text-secondary font-bold text-[12px] uppercase tracking-wider">
              Research Library
            </span>
            <h1 className="font-plus-jakarta text-3xl sm:text-4xl font-extrabold text-primary">
              Resources & Downloads
            </h1>
            <p className="text-on-surface-variant text-[15px] max-w-xl">
              Access raw datasets, academic whitepapers, and our annual national reports to verify our research findings.
            </p>
          </div>
        </section>

        <section className="max-w-container-max-width mx-auto px-gutter py-12 space-y-12">
          {/* Main Downloads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {downloads.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-outline-variant/35 shadow-sm hover:shadow-md transition-shadow p-8 flex flex-col justify-between h-80"
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                      <Icon size={24} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-plus-jakarta text-lg font-bold text-primary leading-snug">
                        {item.title}
                      </h3>
                      <span className="inline-block text-[11px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                        {item.type} • {item.size}
                      </span>
                    </div>
                    <p className="text-on-surface-variant text-[13px] leading-relaxed line-clamp-3">
                      {item.desc}
                    </p>
                  </div>
                  
                  <button className="w-full mt-4 py-2.5 px-4 bg-primary text-white hover:bg-primary-container font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
                    <Download size={14} />
                    Download File
                  </button>
                </div>
              );
            })}
          </div>

          {/* Academic Transparency / Open Data callout */}
          <div className="bg-gradient-to-r from-primary to-primary-container text-white rounded-2xl p-8 shadow-xl border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 lg:max-w-2xl">
              <h3 className="font-plus-jakarta text-xl font-extrabold text-white flex items-center gap-2">
                <HelpCircle size={20} className="text-secondary-fixed" />
                Commitment to Open Science & Research Transparency
              </h3>
              <p className="text-on-primary-container text-[14px] leading-relaxed">
                All algorithms, raw source data, and scoring rules for the EoOS Index are public domain. We encourage external researchers, academics, and state education departments to audit our code and methodologies.
              </p>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-primary hover:bg-surface-container-low px-6 py-3 rounded-xl font-bold text-[14px] transition-all flex items-center gap-2 shrink-0 shadow-md"
            >
              Auditing Github Codebase
              <ExternalLink size={14} />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
