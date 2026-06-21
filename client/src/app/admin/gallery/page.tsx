"use client";

import { useState, useEffect } from "react";
import { adminFetch } from "@/utils/api";
import { Image as ImageIcon, Trash2, Upload, Plus } from "lucide-react";

export default function GalleryManager() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");

  const fetchImages = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/media/gallery`);
      const data = await res.json();
      setImages(data.data || []);
    } catch (e) {
      console.error("Failed to fetch gallery", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Image file is required");

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title);

    try {
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/media/gallery`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setFile(null);
        setTitle("");
        fetchImages();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || "Upload failed"}`);
      }
    } catch (e) {
      console.error(e);
      alert("An unexpected error occurred.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/media/gallery/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchImages();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || "Delete failed"}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-plus-jakarta font-extrabold text-primary flex items-center gap-3">
            <ImageIcon className="text-secondary" /> Gallery Manager
          </h1>
          <p className="text-on-surface-variant mt-2 text-[15px]">
            Upload and manage images for the public Voices gallery.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-primary/20 sticky top-8">
            <h3 className="font-bold text-lg text-primary border-b pb-2 mb-4 flex items-center gap-2">
              <Upload size={18} /> Upload Image
            </h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Title (Optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded-xl p-3 bg-surface-container-lowest"
                  placeholder="E.g., Event Day 1"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Image File</label>
                <input
                  required
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full border rounded-xl p-3 bg-surface-container-lowest file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary/10 file:text-secondary hover:file:bg-secondary/20 transition-all cursor-pointer"
                />
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 w-full hover:bg-primary-container disabled:opacity-50 transition-colors mt-4"
              >
                {uploading ? "Uploading..." : <><Plus size={18} /> Add to Gallery</>}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <h3 className="font-bold text-lg text-primary">Current Images</h3>
          {loading ? (
            <p className="text-on-surface-variant">Loading images...</p>
          ) : images.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-outline-variant flex flex-col items-center justify-center text-center">
              <ImageIcon className="text-outline mb-4" size={48} />
              <p className="text-on-surface-variant">No images uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img) => (
                <div key={img.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-outline-variant/30 group relative">
                  <div className="aspect-square relative bg-slate-100">
                    <img src={img.imageUrl} alt={img.title || "Gallery image"} className="w-full h-full object-cover" />
                  </div>
                  {img.title && (
                    <div className="p-3 border-t border-outline-variant/30">
                      <p className="text-sm font-medium text-on-surface truncate">{img.title}</p>
                    </div>
                  )}
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="absolute top-2 right-2 p-2 bg-white/90 text-error rounded-full shadow hover:bg-error hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
