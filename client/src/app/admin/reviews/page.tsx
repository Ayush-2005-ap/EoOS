"use client";

import { useState, useEffect } from "react";
import { adminFetch } from "@/utils/api";
import { Plus, Trash2, MessageSquare, Newspaper, ExternalLink, Calendar, User, Tag } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

// ─── Types ────────────────────────────────────────────────────────────────────
type Review = {
  id: string;
  author: string;
  role: string;
  quote: string;
  avatarUrl?: string;
  initials?: string;
  type: string;
  createdAt: string;
};

type PressRelease = {
  id: string;
  publication: string;
  link: string;
  author: string;
  date: string;
  summary: string;
  coverageType: string;
  createdAt: string;
};

const BASE = process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api";

// ─── Reviews Tab ─────────────────────────────────────────────────────────────
function ReviewsTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [author, setAuthor] = useState("");
  const [role, setRole] = useState("");
  const [quote, setQuote] = useState("");
  const [type, setType] = useState("glass");
  const [initials, setInitials] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = () => {
    adminFetch(`${BASE}/media/reviews`)
      .then(r => r.json())
      .then(j => { setReviews(j.data || []); setLoading(false); });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !quote) return alert("Author and Quote are required");
    const fd = new FormData();
    fd.append("author", author); fd.append("role", role);
    fd.append("quote", quote); fd.append("type", type);
    fd.append("initials", initials);
    if (avatar) fd.append("avatar", avatar);
    const res = await adminFetch(`${BASE}/media/reviews`, { method: "POST", body: fd });
    if (res.ok) {
      setAuthor(""); setRole(""); setQuote(""); setType("glass"); setInitials(""); setAvatar(null);
      setShowAdd(false); fetchReviews();
    } else { const err = await res.json(); alert(err.error || "Failed"); }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    await adminFetch(`${BASE}/media/reviews/${deleteConfirmId}`, { method: "DELETE" });
    setDeleteConfirmId(null); fetchReviews();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setShowAdd(!showAdd)} className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-container transition-colors">
          <Plus size={18} /> Add Review
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-lg border border-primary/20 space-y-4">
          <h3 className="font-bold text-lg text-primary border-b pb-2">Add New Review</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required type="text" placeholder="Author Name" className="p-3 border rounded-lg" value={author} onChange={e => setAuthor(e.target.value)} />
            <input type="text" placeholder="Role / Title" className="p-3 border rounded-lg" value={role} onChange={e => setRole(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Initials (e.g. AS)" className="p-3 border rounded-lg" value={initials} onChange={e => setInitials(e.target.value)} />
            <select className="p-3 border rounded-lg bg-white" value={type} onChange={e => setType(e.target.value)}>
              <option value="glass">Glass (Dark)</option>
              <option value="solid">Solid (Brand)</option>
              <option value="light">Light (White)</option>
            </select>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Avatar Image (Optional)</label>
              <input type="file" accept="image/*" className="w-full text-sm p-1.5 border rounded-lg bg-slate-50" onChange={e => setAvatar(e.target.files ? e.target.files[0] : null)} />
            </div>
          </div>
          <textarea required placeholder="Testimonial quote..." className="w-full p-3 border rounded-lg min-h-[100px]" value={quote} onChange={e => setQuote(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg">Save Review</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? <p>Loading reviews...</p> : reviews.map((review) => (
          <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col relative">
            <button onClick={() => setDeleteConfirmId(review.id)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-error/10 hover:text-error rounded-lg transition-colors">
              <Trash2 size={16} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              {review.avatarUrl ? (
                <img src={review.avatarUrl.startsWith("http") ? review.avatarUrl : `${BASE.replace("/api","")}${review.avatarUrl}`} alt={review.author} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                  {review.initials || review.author.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-bold text-primary text-sm">{review.author}</p>
                <p className="text-xs text-slate-500">{review.role}</p>
              </div>
            </div>
            <p className="text-slate-700 italic text-[15px] mb-6 flex-1">&ldquo;{review.quote}&rdquo;</p>
            <div className="mt-auto border-t border-slate-100 pt-4 flex justify-between items-center">
              <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded-md uppercase">{review.type}</span>
              <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {!loading && reviews.length === 0 && <p className="text-slate-500 col-span-full">No reviews added yet.</p>}
      </div>

      <ConfirmModal isOpen={!!deleteConfirmId} title="Delete Review?" message="Are you sure you want to delete this review?" onConfirm={confirmDelete} onCancel={() => setDeleteConfirmId(null)} />
    </div>
  );
}

// ─── Press Release Tab ────────────────────────────────────────────────────────
function PressReleaseTab() {
  const [items, setItems] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [publication, setPublication] = useState("");
  const [link, setLink] = useState("");
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState("");
  const [summary, setSummary] = useState("");
  const [coverageType, setCoverageType] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = () => {
    adminFetch(`${BASE}/media/press-releases`)
      .then(r => r.json())
      .then(j => { setItems(j.data || []); setLoading(false); });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publication || !link) return alert("Publication name and link are required");
    const res = await adminFetch(`${BASE}/media/press-releases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publication, link, author, date, summary, coverageType }),
    });
    if (res.ok) {
      setPublication(""); setLink(""); setAuthor(""); setDate(""); setSummary(""); setCoverageType("");
      setShowAdd(false); fetchItems();
    } else { const err = await res.json(); alert(err.error || "Failed"); }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    await adminFetch(`${BASE}/media/press-releases/${deleteConfirmId}`, { method: "DELETE" });
    setDeleteConfirmId(null); fetchItems();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setShowAdd(!showAdd)} className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-700 transition-colors">
          <Plus size={18} /> Add Press Release
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-lg border border-amber-200 space-y-4">
          <h3 className="font-bold text-lg text-amber-700 border-b border-amber-100 pb-2 flex items-center gap-2">
            <Newspaper size={18} /> Add Press Release Entry
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Journal / Publication *</label>
              <input required type="text" placeholder="e.g. EducationWorld" className="w-full p-3 border rounded-lg" value={publication} onChange={e => setPublication(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Author</label>
              <input type="text" placeholder="e.g. Prajwal EW" className="w-full p-3 border rounded-lg" value={author} onChange={e => setAuthor(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Article Link *</label>
            <input required type="url" placeholder="https://..." className="w-full p-3 border rounded-lg" value={link} onChange={e => setLink(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date</label>
              <input type="date" className="w-full p-3 border rounded-lg bg-white" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Coverage Type</label>
              <input type="text" placeholder="e.g. Independent coverage, Written by CCS" className="w-full p-3 border rounded-lg" value={coverageType} onChange={e => setCoverageType(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Summary (~30 words)</label>
            <textarea placeholder="Brief summary of the coverage..." className="w-full p-3 border rounded-lg min-h-[90px] resize-none" value={summary} onChange={e => setSummary(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors">Save Entry</button>
          </div>
        </form>
      )}

      {/* Table view */}
      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        {loading ? (
          <p className="p-8 text-slate-500">Loading...</p>
        ) : items.length === 0 ? (
          <p className="p-8 text-slate-500">No press releases added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase tracking-wide">Publication</th>
                  <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase tracking-wide">Author</th>
                  <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase tracking-wide">Date</th>
                  <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase tracking-wide">Coverage Type</th>
                  <th className="text-left p-4 font-bold text-slate-600 text-xs uppercase tracking-wide">Summary</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <a href={item.link} target="_blank" rel="noreferrer" className="font-bold text-primary hover:underline flex items-center gap-1.5">
                        {item.publication}
                        <ExternalLink size={12} className="text-slate-400 flex-shrink-0" />
                      </a>
                    </td>
                    <td className="p-4 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <User size={12} className="text-slate-400" />
                        {item.author || <span className="text-slate-300 italic">—</span>}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        {item.date ? new Date(item.date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : <span className="text-slate-300 italic">—</span>}
                      </span>
                    </td>
                    <td className="p-4">
                      {item.coverageType ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-[11px] font-semibold">
                          <Tag size={10} /> {item.coverageType}
                        </span>
                      ) : <span className="text-slate-300 italic">—</span>}
                    </td>
                    <td className="p-4 text-slate-500 max-w-[260px]">
                      <p className="line-clamp-2 text-xs leading-relaxed">{item.summary || <span className="italic text-slate-300">—</span>}</p>
                    </td>
                    <td className="p-4">
                      <button onClick={() => setDeleteConfirmId(item.id)} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal isOpen={!!deleteConfirmId} title="Delete Press Release?" message="Are you sure you want to delete this press release entry? This cannot be undone." onConfirm={confirmDelete} onCancel={() => setDeleteConfirmId(null)} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReviewsManager() {
  const [activeTab, setActiveTab] = useState<"reviews" | "press-release">("reviews");

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30">
        <h1 className="text-3xl font-plus-jakarta font-extrabold text-primary flex items-center gap-3">
          <MessageSquare className="text-secondary" /> Reviews &amp; Press
        </h1>
        <p className="text-on-surface-variant mt-2 text-[15px]">Manage testimonial reviews and press release coverage displayed on the public site.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-outline-variant/30">
        <button
          onClick={() => setActiveTab("reviews")}
          className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-colors flex items-center gap-2 ${
            activeTab === "reviews"
              ? "bg-white border border-b-white text-primary shadow-sm -mb-px"
              : "text-slate-500 hover:text-primary"
          }`}
        >
          <MessageSquare size={16} /> Testimonial Reviews
        </button>
        <button
          onClick={() => setActiveTab("press-release")}
          className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-colors flex items-center gap-2 ${
            activeTab === "press-release"
              ? "bg-white border border-b-white text-amber-700 shadow-sm -mb-px"
              : "text-slate-500 hover:text-amber-700"
          }`}
        >
          <Newspaper size={16} /> Press Releases
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "reviews" ? <ReviewsTab /> : <PressReleaseTab />}
    </div>
  );
}
