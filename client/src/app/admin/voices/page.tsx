"use client";

import { useState, useEffect } from "react";
import { adminFetch } from "@/utils/api";
import { Plus, Trash2, Video, ExternalLink } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

export default function VoicesManager() {
  const [voices, setVoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState<File | null>(null); // Thumbnail
  const [videoFile, setVideoFile] = useState<File | null>(null); // Hover Video

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = () => {
    adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/media/voices`)
      .then(res => res.json())
      .then(json => {
        setVoices(json.data || []);
        setLoading(false);
      });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !youtubeUrl || !file) return alert("Title, YouTube URL, and Thumbnail Image are required");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("youtubeUrl", youtubeUrl);
    formData.append("thumbnail", file);
    if (videoFile) formData.append("video", videoFile);

    try {
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/media/voices`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setTitle("");
        setCategory("General");
        setYoutubeUrl("");
        setFile(null);
        setVideoFile(null);
        setShowAdd(false);
        fetchVoices();
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
    try {
      await adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/media/voices/${deleteConfirmId}`, { method: "DELETE" });
      setDeleteConfirmId(null);
      fetchVoices();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-plus-jakarta font-extrabold text-primary flex items-center gap-3">
            <Video className="text-secondary" /> Voices Manager
          </h1>
          <p className="text-on-surface-variant mt-2 text-[15px]">Upload video thumbnails and link them to YouTube.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-container transition-colors"
        >
          <Plus size={18} /> Add Video
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleUpload} className="bg-white p-6 rounded-2xl shadow-lg border border-primary/20 space-y-4">
          <h3 className="font-bold text-lg text-primary border-b pb-2">Add New Voice</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              required 
              type="text" 
              placeholder="Video Title" 
              className="w-full p-3 border rounded-lg" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
            />
            <input 
              required 
              type="text" 
              placeholder="Category (e.g. Impact Study: Oslo)" 
              className="w-full p-3 border rounded-lg" 
              value={category} 
              onChange={e => setCategory(e.target.value)} 
            />
          </div>
          
          <input 
            required 
            type="url" 
            placeholder="YouTube URL (e.g. https://youtube.com/watch?v=...)" 
            className="w-full p-3 border rounded-lg" 
            value={youtubeUrl} 
            onChange={e => setYoutubeUrl(e.target.value)} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload Thumbnail Image *</label>
              <input 
                required 
                type="file" 
                accept="image/*"
                className="w-full p-3 border rounded-lg bg-slate-50" 
                onChange={e => setFile(e.target.files ? e.target.files[0] : null)} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload Hover Video (.mp4)</label>
              <input 
                type="file" 
                accept="video/mp4"
                className="w-full p-3 border rounded-lg bg-slate-50" 
                onChange={e => setVideoFile(e.target.files ? e.target.files[0] : null)} 
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg">Save Video</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <p>Loading voices...</p> : voices.map((voice) => (
          <div key={voice.id} className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col">
            <div className="h-40 bg-slate-200 relative">
              <img 
                src={`${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "") : "https://eoos-backend.onrender.com"}${voice.thumbnailPath}`} 
                alt={voice.title} 
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setDeleteConfirmId(voice.id)} 
                className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-error hover:text-white text-error rounded-lg transition-colors backdrop-blur-sm"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <span className="text-xs font-bold text-primary mb-1 uppercase">{voice.category}</span>
              <h3 className="font-bold text-[15px] text-slate-800 line-clamp-2 mb-4">{voice.title}</h3>
              <div className="mt-auto">
                <a 
                  href={voice.youtubeUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:underline"
                >
                  Watch on YouTube <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        ))}
        {!loading && voices.length === 0 && <p className="text-slate-500 col-span-full">No videos added yet.</p>}
      </div>

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        title="Delete Voice/Video?"
        message="Are you sure you want to delete this voice/video? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
