"use client";
import { adminFetch } from "@/utils/api";
import { useState, useEffect } from "react";
import { Users, Plus, Trash2, Edit2, Loader2, Upload } from "lucide-react";

export default function AdminAuthors() {
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    organization: "",
    description: "",
    linkedinUrl: "",
    orcidUrl: "",
    orderIndex: "0",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      const res = await adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/admin/authors`);
      const json = await res.json();
      setAuthors(json.data || []);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("role", formData.role);
    data.append("organization", formData.organization);
    data.append("description", formData.description);
    data.append("linkedinUrl", formData.linkedinUrl);
    data.append("orcidUrl", formData.orcidUrl);
    data.append("orderIndex", formData.orderIndex);
    
    if (avatarFile) {
      data.append("avatar", avatarFile);
    }

    try {
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/admin/authors/${currentId}`
        : `${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/admin/authors`;
      
      const method = isEditing ? "PUT" : "POST";

      const res = await adminFetch(url, {
        method,
        body: data,
      });

      if (res.ok) {
        setShowAdd(false);
        setAvatarFile(null);
        fetchAuthors();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save author");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving author");
    } finally {
      setSubmitting(false);
    }
  };

  const openAdd = () => {
    setIsEditing(false);
    setFormData({ name: "", role: "", organization: "", description: "", linkedinUrl: "", orcidUrl: "", orderIndex: "0" });
    setAvatarFile(null);
    setShowAdd(true);
  };

  const openEdit = (author: any) => {
    setIsEditing(true);
    setCurrentId(author.id);
    setFormData({
      name: author.name,
      role: author.role,
      organization: author.organization,
      description: author.description,
      linkedinUrl: author.linkedinUrl || "",
      orcidUrl: author.orcidUrl || "",
      orderIndex: author.orderIndex.toString(),
    });
    setAvatarFile(null);
    setShowAdd(true);
  };

  const deleteAuthor = async (id: string) => {
    if (!confirm("Are you sure you want to delete this author?")) return;
    try {
      await adminFetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/admin/authors/${id}`, { method: "DELETE" });
      fetchAuthors();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-plus-jakarta font-extrabold text-primary flex items-center gap-3">
            <Users size={32} className="text-secondary" /> Authors & Researchers
          </h1>
          <p className="text-on-surface-variant mt-2 text-[15px]">Manage the researchers displayed on the public About page.</p>
        </div>
        <button 
          onClick={openAdd}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-container transition-colors"
        >
          <Plus size={18} /> Add Author
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-outline-variant/30 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold text-primary mb-6">{isEditing ? "Edit Author" : "Add New Author"}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="e.g. Dr. Aruna Singh" />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2">Role</label>
                <input required type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="e.g. Director of Research" />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2">Organization</label>
                <input required type="text" value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="e.g. Indian Institute of Policy Studies" />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2">Order Index (Sort)</label>
                <input required type="number" value={formData.orderIndex} onChange={e => setFormData({...formData, orderIndex: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2">LinkedIn URL (Optional)</label>
                <input type="url" value={formData.linkedinUrl} onChange={e => setFormData({...formData, linkedinUrl: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-2">ORCID URL (Optional)</label>
                <input type="url" value={formData.orcidUrl} onChange={e => setFormData({...formData, orcidUrl: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="https://orcid.org/..." />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-2">Description / Bio</label>
              <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" rows={3} placeholder="Brief biography..." />
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-2">Avatar Image</label>
              <div className="relative border-2 border-dashed border-outline-variant/50 rounded-xl p-8 text-center hover:bg-surface-container-low/50 transition-colors">
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <Upload className="mx-auto text-secondary mb-2" size={32} />
                <p className="text-sm font-medium text-on-surface-variant">
                  {avatarFile ? avatarFile.name : "Click or drag to upload avatar image"}
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={submitting} className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-container transition-colors flex items-center gap-2">
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {isEditing ? "Update Author" : "Save Author"}
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="bg-surface-container text-on-surface-variant px-6 py-3 rounded-xl font-bold hover:bg-outline-variant/20 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin text-secondary" size={40} /></div>
      ) : authors.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl text-center border border-outline-variant/30 shadow-sm text-on-surface-variant">
          No authors found. Click "Add Author" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {authors.map((author) => (
            <div key={author.id} className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col items-center text-center">
              {author.avatarUrl ? (
                <img src={author.avatarUrl} alt={author.name} className="w-24 h-24 rounded-full object-cover mb-4 border border-outline-variant/20 shadow-sm" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-surface-container-low mb-4 border border-outline-variant/20 shadow-sm flex items-center justify-center">
                  <Users size={32} className="text-on-surface-variant" />
                </div>
              )}
              <h3 className="font-bold text-lg text-primary">{author.name}</h3>
              <p className="text-secondary text-sm font-semibold">{author.role}</p>
              <p className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">{author.organization}</p>
              
              <div className="flex gap-3 mt-6 w-full">
                <button onClick={() => openEdit(author)} className="flex-1 bg-surface-container-low text-primary py-2 rounded-lg font-bold text-sm hover:bg-surface-container transition-colors flex justify-center items-center gap-2">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => deleteAuthor(author.id)} className="flex-1 bg-error/10 text-error py-2 rounded-lg font-bold text-sm hover:bg-error/20 transition-colors flex justify-center items-center gap-2">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
