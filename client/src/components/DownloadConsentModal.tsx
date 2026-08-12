import React, { useState } from "react";
import { X, Download, Loader2 } from "lucide-react";

interface DownloadConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  pdfUrl?: string;
  filename?: string;
}

export default function DownloadConsentModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Download Resource",
  description = "Please provide your details below to download the requested resource.",
  pdfUrl,
  filename,
}: DownloadConsentModalProps) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", consent: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showMore, setShowMore] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.consent) {
      setError("Please fill all required fields and provide consent.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api";
      const res = await fetch(`${apiUrl}/export/download-consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, pdfUrl, filename }),
      });

      if (!res.ok) {
        throw new Error("Failed to process consent");
      }

      onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/30 bg-surface-container-low/50">
          <h2 className="font-plus-jakarta text-xl font-bold text-secondary">{title}</h2>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary transition-colors"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-on-surface-variant text-[14px]">
              {description}
            </p>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-[13px] font-semibold">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-primary mb-1.5 uppercase tracking-wider">Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all text-[15px]"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-primary mb-1.5 uppercase tracking-wider">Email Address *</label>
                <input 
                  type="email" 
                  required
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all text-[15px]"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-primary mb-1.5 uppercase tracking-wider">Phone Number</label>
                <input 
                  type="tel" 
                  value={form.phone}
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all text-[15px]"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="flex items-start gap-3 mt-4">
                <input
                  type="checkbox"
                  id="consent"
                  required
                  checked={form.consent}
                  onChange={(e) => setForm({...form, consent: e.target.checked})}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
                />
                <label htmlFor="consent" className="text-[13px] text-on-surface-variant leading-relaxed">
                  I consent to storing my name, email, and phone number in the database.
                  {!showMore ? (
                    <button 
                      type="button"
                      onClick={() => setShowMore(true)}
                      className="text-secondary hover:underline ml-1 font-semibold"
                    >
                      View more
                    </button>
                  ) : (
                    <span className="block mt-1 text-[12px] text-on-surface-variant/80">
                      This information may be used to send you updates on upcoming events and news from the Centre for Civil Society.
                    </span>
                  )}
                </label>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting || !form.consent}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white px-6 py-3.5 rounded-xl font-semibold text-[15px] transition-all flex items-center justify-center gap-2 mt-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Proceed to Download
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
