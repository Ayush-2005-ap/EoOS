"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, MessageSquare, Star } from "lucide-react";

export default function ReviewsManager() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/media/reviews`)
      .then(res => res.json())
      .then(json => {
        setReviews(json.data || []);
        setLoading(false);
      });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !reviewText) return alert("Name and Text are required");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/media/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewerName, reviewText, rating }),
      });
      if (res.ok) {
        setReviewerName("");
        setReviewText("");
        setRating(5);
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/media/reviews/${id}`, { method: "DELETE" });
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
              placeholder="Reviewer Name (e.g. Dr. A. Sharma)" 
              className="p-3 border rounded-lg" 
              value={reviewerName} 
              onChange={e => setReviewerName(e.target.value)} 
            />
            
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50">
              <span className="text-sm font-bold text-slate-500">Rating:</span>
              <input 
                type="number" 
                min="1" 
                max="5" 
                step="0.5"
                className="w-20 p-1 border rounded text-center" 
                value={rating} 
                onChange={e => setRating(parseFloat(e.target.value))} 
              />
              <Star size={16} className="text-amber-400 fill-amber-400" />
            </div>
          </div>

          <textarea 
            required 
            placeholder="Review text..." 
            className="w-full p-3 border rounded-lg min-h-[100px]" 
            value={reviewText} 
            onChange={e => setReviewText(e.target.value)} 
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
              onClick={() => handleDelete(review.id)} 
              className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-error/10 hover:text-error rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
            
            <div className="flex items-center gap-2 mb-4">
              {[...Array(Math.floor(review.rating || 5))].map((_, i) => (
                <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
            
            <p className="text-slate-700 italic text-[15px] mb-6 flex-1">"{review.reviewText}"</p>
            
            <div className="mt-auto border-t border-slate-100 pt-4 flex justify-between items-center">
              <span className="font-bold text-primary">{review.reviewerName}</span>
              <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {!loading && reviews.length === 0 && <p className="text-slate-500 col-span-full">No reviews added yet.</p>}
      </div>
    </div>
  );
}
