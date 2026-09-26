"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Quote, ArrowRight, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Helper: convert any YouTube URL to an embed URL ──────────────────────────
function toYouTubeEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    // https://youtu.be/VIDEO_ID
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    // https://www.youtube.com/watch?v=VIDEO_ID
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
    // Already an embed URL
    if (u.pathname.startsWith("/embed/")) return url;
  } catch {
    // fall through
  }
  return url;
}


export default function Voices() {
  const [videoStories, setVideoStories] = useState<any[]>([]);
  const [pressReleases, setPressReleases] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api";
        const [voicesRes, pressRes, galleryRes] = await Promise.all([
          fetch(`${baseUrl}/media/voices`),
          fetch(`${baseUrl}/media/press-releases`),
          fetch(`${baseUrl}/media/gallery`)
        ]);
        const voicesData = await voicesRes.json();
        const pressData = await pressRes.json();
        const galleryData = await galleryRes.json();

        setVideoStories(voicesData.data || []);
        setPressReleases(pressData.data || []);
        setGalleryImages(galleryData.data || []);
      } catch (e) {
        console.error("Failed to fetch voices data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-32 pb-16 min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={48} />
        </main>
        <Footer />
      </>
    );
  }

  // Collect voices that have a pressReleaseUrl set
  const pressReleaseEmbeds = videoStories.filter(
    (v) => v.pressReleaseUrl && v.pressReleaseUrl.trim() !== ""
  );

  return (
    <>
      <Header />
      <style dangerouslySetInnerHTML={{__html: `
        .glass-card {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(0, 7, 27, 0.05);
        }
        .dark .glass-card {
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .yt-embed-wrapper {
          position: relative;
          padding-bottom: 56.25%; /* 16:9 */
          height: 0;
          overflow: hidden;
          border-radius: 1rem;
          box-shadow: 0 8px 40px rgba(0,0,0,0.12);
        }
        .yt-embed-wrapper iframe {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          border: 0;
          border-radius: 1rem;
        }
      `}} />
      <main className="pt-32 pb-16 max-w-container-max-width mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <header className="mb-16 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span className="font-label-sm text-[12px] font-bold uppercase tracking-wider text-secondary">Qualitative Research</span>
          </div>
          <h1 className="font-plus-jakarta text-4xl sm:text-5xl font-extrabold text-primary mb-6 leading-tight">
            Stories Behind the Data
          </h1>
          <p className="font-body-lg text-lg text-on-surface-variant">
            While the EoOS Index quantifies institutional progress, these narratives provide the essential context—the human experience that drives policy change and educational reform.
          </p>
        </header>

        {/* Field Reports Section */}
        <section className="mb-20">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-plus-jakarta text-2xl font-bold text-primary">Field Reports</h2>
            <button className="text-secondary font-bold text-sm flex items-center gap-2 hover:underline">
              View all videos <ArrowRight size={16} />
            </button>
          </div>

          {/* ── Press Release YouTube Embeds ── */}
          {pressReleaseEmbeds.length > 0 && (
            <div className="mb-10 space-y-8">
              {pressReleaseEmbeds.map((story, idx) => (
                <motion.div
                  key={story.id || idx}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="w-full"
                >
                  {/* Label */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 text-[11px] font-bold uppercase tracking-wider rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                      Press Release
                    </span>
                    {story.category && story.category !== "General" && (
                      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">{story.category}</span>
                    )}
                  </div>
                  {/* Title */}
                  {story.title && (
                    <h3 className="font-plus-jakarta text-xl font-bold text-primary mb-4">{story.title}</h3>
                  )}
                  {/* Responsive YouTube Embed */}
                  <div className="yt-embed-wrapper">
                    <iframe
                      src={toYouTubeEmbedUrl(story.pressReleaseUrl)}
                      title={story.title || "Press Release Video"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </motion.div>
              ))}
              {/* Divider before video cards */}
              {videoStories.length > 0 && (
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex-1 h-px bg-outline-variant/30"></div>
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">More Stories</span>
                  <div className="flex-1 h-px bg-outline-variant/30"></div>
                </div>
              )}
            </div>
          )}

          {/* ── Video Cards Grid (YouTube iframes) ── */}
          {videoStories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videoStories.map((story, idx) => (
                <motion.div
                  key={story.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.07 }}
                  className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 bg-white border border-outline-variant/10"
                >
                  <div className="yt-embed-wrapper">
                    <iframe
                      src={story.youtubeUrl}
                      title={story.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-4 border-t border-outline-variant/10">
                    <p className="text-[11px] font-bold text-secondary uppercase tracking-wider mb-1">{story.category}</p>
                    <h3 className="text-[15px] font-bold text-primary line-clamp-2">{story.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </section>

        {/* Press Release Section */}
        <section className="mb-20">
          <h2 className="font-plus-jakarta text-2xl font-bold text-primary mb-8">Press Release</h2>

          {pressReleases.length === 0 ? (
            <p className="text-on-surface-variant">No press releases available yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pressReleases.map((item, idx) => (
                <motion.a
                  key={item.id || idx}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="group glass-card p-6 rounded-xl hover:shadow-md transition-all duration-300 flex flex-col gap-3 cursor-pointer"
                >
                  {/* Top row: publication + coverage type */}
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-plus-jakarta font-bold text-primary text-[15px] group-hover:underline leading-snug">
                      {item.publication}
                    </span>
                    {item.coverageType && (
                      <span className="flex-shrink-0 inline-block px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                        {item.coverageType}
                      </span>
                    )}
                  </div>

                  {/* Summary */}
                  {item.summary && (
                    <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">{item.summary}</p>
                  )}

                  {/* Footer: author + date */}
                  <div className="flex items-center gap-4 mt-auto pt-3 border-t border-outline-variant/10 text-xs text-slate-500">
                    {item.author && (
                      <span className="flex items-center gap-1">
                        <Quote size={10} className="opacity-40" />
                        {item.author}
                      </span>
                    )}
                    {item.date && (
                      <span className="ml-auto">
                        {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </section>

        {/* Gallery Infinite Marquee */}
        {galleryImages.length > 0 && (
          <section className="mt-20 overflow-hidden">
            <h2 className="font-plus-jakarta text-2xl font-bold text-primary mb-4">Event Gallery</h2>
            <p className="text-base font-semibold text-gray-800 mb-1">
              EoOS Index 2026 launched at Reforming India&apos;s School Education (RISE) for Viksit Bharat event
            </p>
            <p className="text-sm text-gray-500 mb-6">19 June 2026 | IIC New Delhi</p>
            <div className="relative w-full hide-scrollbar overflow-hidden flex items-center py-4">
              <div className="flex gap-6 animate-scroll w-max pr-6">
                {[...galleryImages, ...galleryImages].map((img, idx) => (
                  <motion.div 
                    key={`${img.id}-${idx}`} 
                    onClick={() => setSelectedImage(img)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative group rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer w-[280px] md:w-[350px] aspect-[4/3] flex-shrink-0"
                  >
                    <img 
                      src={img.imageUrl} 
                      alt={img.title || "Event Image"} 
                      className="w-full h-full object-cover rounded-xl transform transition-transform duration-700 ease-out group-hover:scale-110" 
                    />
                    {img.title && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                        <p className="text-white font-semibold text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                          {img.title}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-sm"
          >
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-[110]"
            >
              <X size={32} />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              src={selectedImage.imageUrl} 
              alt={selectedImage.title || "Gallery Image"} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl z-[105]"
              onClick={(e) => e.stopPropagation()}
            />
            {selectedImage.title && (
              <div className="absolute bottom-6 left-0 right-0 text-center z-[110]">
                <p className="text-white text-xl font-medium drop-shadow-lg">{selectedImage.title}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
