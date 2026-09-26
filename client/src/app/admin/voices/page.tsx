"use client";

import { useState, useEffect } from "react";
import { adminFetch } from "@/utils/api";
import { Plus, Trash2, Video, ExternalLink, Newspaper, PlayCircle } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

// ─── Helper: any YouTube URL → embed URL ─────────────────────────────────────
function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return `https://www.youtube.com/embed${u.pathname}`;
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
    if (u.pathname.startsWith("/embed/")) return url;
  } catch { /* fall through */ }
  return url;
}

// ─── Helper: extract src from an <iframe> embed code ─────────────────────────
function extractEmbedUrl(input: string): string {
  const match = input.match(/src=["']([^"']+)["']/);
  if (match) return match[1];
  return toEmbedUrl(input.trim());
}

export default function VoicesManager() {
  const [voices, setVoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [pressReleaseUrl, setPressReleaseUrl] = useState("");

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const BASE = process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api";

  useEffect(() => { fetchVoices(); }, []);

  const fetchVoices = () => {
    adminFetch(`${BASE}/media/voices`)
      .then(r => r.json())
      .then(j => { setVoices(j.data || []); setLoading(false); });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !youtubeUrl) return alert("Title and YouTube URL are required");

    const res = await adminFetch(`${BASE}/media/voices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        category,
        youtubeUrl: extractEmbedUrl(youtubeUrl),
        pressReleaseUrl: pressReleaseUrl.trim() ? extractEmbedUrl(pressReleaseUrl) : "",
      }),
    });

    if (res.ok) {
      setTitle(""); setCategory("General"); setYoutubeUrl(""); setPressReleaseUrl("");
      setShowAdd(false); fetchVoices();
    } else {
      const err = await res.json();
      alert(err.error || "Upload failed");
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    await adminFetch(`${BASE}/media/voices/${deleteConfirmId}`, { method: "DELETE" });
    setDeleteConfirmId(null); fetchVoices();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-plus-jakarta font-extrabold text-primary flex items-center gap-3">
            <Video className="text-secondary" /> Voices Manager
          </h1>
          <p className="text-on-surface-variant mt-2 text-[15px]">
            Add YouTube videos by pasting a URL or embed code — no file uploads needed.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-container transition-colors"
        >
          <Plus size={18} /> Add Video
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <form onSubmit={handleUpload} className="bg-white p-6 rounded-2xl shadow-lg border border-primary/20 space-y-5">
          <h3 className="font-bold text-lg text-primary border-b pb-3">Add New Voice / Field Report</h3>

          {/* Title + Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Video Title *</label>
              <input
                required type="text" placeholder="e.g. Impact Study: Oslo Fieldwork"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={title} onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Category</label>
              <input
                type="text" placeholder="e.g. Impact Study, Field Report"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={category} onChange={e => setCategory(e.target.value)}
              />
            </div>
          </div>

          {/* Main YouTube URL */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-1.5">
              <PlayCircle size={12} className="text-red-500" /> YouTube URL or Embed Code *
            </label>
            <textarea
              required
              rows={2}
              placeholder={`Paste a YouTube link:\nhttps://www.youtube.com/watch?v=...\n\nOr paste an <iframe> embed code directly`}
              className="w-full p-3 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Accepts: <code>https://youtu.be/…</code>, <code>https://youtube.com/watch?v=…</code>, or a full <code>&lt;iframe&gt;</code> tag
            </p>
          </div>

          {/* Press Release URL (optional) */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-amber-700 uppercase tracking-wide">
              <Newspaper size={14} />
              Press Release Embed URL
              <span className="font-normal text-amber-500 normal-case text-xs">(optional)</span>
            </label>
            <p className="text-xs text-amber-600">
              If set, this video appears as a featured embed in the <strong>Field Reports</strong> section on the public Voices page.
            </p>
            <textarea
              rows={2}
              placeholder={`Paste a YouTube link or <iframe> embed code`}
              className="w-full p-3 border border-amber-300 rounded-lg bg-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
              value={pressReleaseUrl} onChange={e => setPressReleaseUrl(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors">Save Video</button>
          </div>
        </form>
      )}

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-slate-500 col-span-full">Loading voices...</p>
        ) : voices.map((voice) => (
          <div key={voice.id} className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col">
            {/* YouTube Thumbnail Preview */}
            <div className="relative aspect-video bg-slate-100">
              <iframe
                src={voice.youtubeUrl}
                title={voice.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              {/* Badges */}
              {voice.pressReleaseUrl && (
                <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1 z-10">
                  <Newspaper size={9} /> Press Release
                </span>
              )}
              <button
                onClick={() => setDeleteConfirmId(voice.id)}
                className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-500 hover:text-white text-red-500 rounded-lg transition-colors backdrop-blur-sm z-10"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="p-5 flex-1 flex flex-col gap-2">
              <span className="text-xs font-bold text-primary uppercase">{voice.category}</span>
              <h3 className="font-bold text-[15px] text-slate-800 line-clamp-2">{voice.title}</h3>

              <div className="mt-auto flex flex-col gap-2">
                <a
                  href={voice.youtubeUrl}
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:underline"
                >
                  Open on YouTube <ExternalLink size={13} />
                </a>
                {voice.pressReleaseUrl && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
                    <Newspaper size={12} /> Featured as Press Release embed
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {!loading && voices.length === 0 && (
          <p className="text-slate-500 col-span-full">No videos added yet. Click &ldquo;Add Video&rdquo; to get started.</p>
        )}
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
