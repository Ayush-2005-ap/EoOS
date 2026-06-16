"use client";

import { useState, useEffect } from "react";
import { adminFetch } from "@/utils/api";
import { Plus, Trash2, MessageSquare, Star } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

export default function ReviewsManager() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [author, setAuthor] = useState("");
  const [role, setRole] = useState("");
  const [quote, setQuote] = useState("");
  const [type, setType] = useState("glass");
  const [initials, setInitials] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = () => {
    adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/media/reviews`)
      .then(res => res.json())
      .then(json => {
        setReviews(json.data || []);
        setLoading(false);
      });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !quote) return alert("Author and Quote are required");

    const formData = new FormData();
    formData.append("author", author);
    formData.append("role", role);
    formData.append("quote", quote);
    formData.append("type", type);
    formData.append("initials", initials);
    if (avatar) formData.append("avatar", avatar);

    try {
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/media/reviews`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setAuthor("");
        setRole("");
        setQuote("");
        setType("glass");
        setInitials("");
        setAvatar(null);
        setShowAdd(false);
        fetchReviews();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create review");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/media/reviews/${deleteConfirmId}`, { method: "DELETE" });
      setDeleteConfirmId(null);
      fetchReviews();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-plus-jakarta font-extrabold text-primary flex items-center gap-3">
            <MessageSquare className="text-secondary" /> Reviews Manager
          </h1>
          <p className="text-on-surface-variant mt-2 text-[15px]">Manage official reviews and feedback to display on the site.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-container transition-colors"
        >
          <Plus size={18} /> Add Review
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-lg border border-primary/20 space-y-4">
          <h3 className="font-bold text-lg text-primary border-b pb-2">Add New Review</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              required 
              type="text" 
              placeholder="Author Name (e.g. Dr. A. Sharma)" 
              className="p-3 border rounded-lg" 
              value={author} 
              onChange={e => setAuthor(e.target.value)} 
            />
            <input 
              type="text" 
              placeholder="Role / Title" 
              className="p-3 border rounded-lg" 
              value={role} 
              onChange={e => setRole(e.target.value)} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" 
              placeholder="Initials (e.g. AS)" 
              className="p-3 border rounded-lg" 
              value={initials} 
              onChange={e => setInitials(e.target.value)} 
            />
            <select 
              className="p-3 border rounded-lg bg-white"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option value="glass">Glass (Dark)</option>
              <option value="solid">Solid (Brand)</option>
              <option value="light">Light (White)</option>
            </select>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Avatar Image (Optional)</label>
              <input 
                type="file" 
                accept="image/*"
                className="w-full text-sm p-1.5 border rounded-lg bg-slate-50" 
                onChange={e => setAvatar(e.target.files ? e.target.files[0] : null)} 
              />
            </div>
          </div>

          <textarea 
            required 
            placeholder="Testimonial quote..." 
            className="w-full p-3 border rounded-lg min-h-[100px]" 
            value={quote} 
            onChange={e => setQuote(e.target.value)} 
          />

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg">Save Review</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? <p>Loading reviews...</p> : reviews.map((review) => (
          <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col relative">
            <button 
              onClick={() => setDeleteConfirmId(review.id)} 
              className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-error/10 hover:text-error rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              {review.avatarUrl ? (
                <img src={`${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "") : "https://eoos-backend.onrender.com"}${review.avatarUrl}`} alt={review.author} className="w-10 h-10 rounded-full object-cover" />
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
            
            <p className="text-slate-700 italic text-[15px] mb-6 flex-1">"{review.quote}"</p>
            
            <div className="mt-auto border-t border-slate-100 pt-4 flex justify-between items-center">
              <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded-md uppercase">{review.type}</span>
              <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {!loading && reviews.length === 0 && <p className="text-slate-500 col-span-full">No reviews added yet.</p>}
      </div>

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        title="Delete Review?"
        message="Are you sure you want to delete this review? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
