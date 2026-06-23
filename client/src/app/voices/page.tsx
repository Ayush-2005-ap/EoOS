"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Quote, Play, ArrowRight, Loader2, X } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const HoverVideoCard = ({ 
  videoUrl, 
  youtubeUrl, 
  category, 
  title 
}: { 
  videoUrl: string, 
  youtubeUrl: string, 
  category: string, 
  title: string 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <a 
      href={youtubeUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="video-card block group relative overflow-hidden rounded-xl bg-surface-container shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full aspect-video">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-primary/40 group-hover:bg-primary/20 transition-all duration-300 flex items-center justify-center">
          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
            <Play className="text-primary fill-primary ml-1" size={28} />
          </div>
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-surface border-t border-outline-variant/10">
        <p className="font-label-sm text-[12px] font-semibold text-secondary mb-1 uppercase tracking-wider">{category}</p>
        <h3 className="font-label-md text-[16px] font-bold text-primary">{title}</h3>
      </div>
    </a>
  );
};

export default function Voices() {
  const [videoStories, setVideoStories] = useState<any[]>([]);
  const [masonryQuotes, setMasonryQuotes] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api";
        const [voicesRes, reviewsRes, galleryRes] = await Promise.all([
          fetch(`${baseUrl}/media/voices`),
          fetch(`${baseUrl}/media/reviews`),
          fetch(`${baseUrl}/media/gallery`)
        ]);
        const voicesData = await voicesRes.json();
        const reviewsData = await reviewsRes.json();
        const galleryData = await galleryRes.json();

        setVideoStories(voicesData.data || []);
        setMasonryQuotes(reviewsData.data || []);
        setGalleryImages(galleryData.data || []);
      } catch (e) {
        console.error("Failed to fetch voices and testimonials:", e);
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

        {/* Video Testimonials Row */}
        <section className="mb-20">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-plus-jakarta text-2xl font-bold text-primary">Field Reports</h2>
            <button className="text-secondary font-bold text-sm flex items-center gap-2 hover:underline">
              View all videos <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {videoStories.map((story, idx) => {
              const vidUrl = story.videoUrl ? `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "") : "https://eoos-backend.onrender.com"}${story.videoUrl}` : "";
              return <HoverVideoCard key={story.id || idx} videoUrl={vidUrl} youtubeUrl={story.youtubeUrl} category={story.category} title={story.title} />;
            })}
          </div>
        </section>

        {/* Testimonials Masonry */}
        <section>
          <h2 className="font-plus-jakarta text-2xl font-bold text-primary mb-8">Voices from the Field</h2>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {masonryQuotes.map((item, idx) => {
              let cardClasses = "";
              if (item.type === "glass") {
                cardClasses = "glass-card p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow break-inside-avoid";
              } else if (item.type === "solid") {
                cardClasses = "bg-primary text-white p-8 rounded-xl shadow-lg break-inside-avoid";
              } else {
                cardClasses = "bg-blue-50 dark:bg-slate-800 p-8 rounded-xl border border-blue-100 dark:border-slate-700 break-inside-avoid";
              }

              return (
                <div key={idx} className={cardClasses}>
                  {item.type === "glass" && <Quote className="text-secondary opacity-50 mb-6 scale-x-[-1]" size={32} />}
                  <p className={`text-lg mb-8 ${item.type === "solid" ? "text-white" : item.type === "glass" ? "text-primary italic" : "text-primary font-semibold"}`}>
                    "{item.quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full overflow-hidden flex flex-shrink-0 items-center justify-center ${item.type === "solid" ? "bg-white/20" : "bg-slate-200"}`}>
                      {item.avatarUrl ? (
                        <img className="w-full h-full object-cover" src={`${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "") : "https://eoos-backend.onrender.com"}${item.avatarUrl}`} alt={item.author} />
                      ) : (
                        <span className="font-bold text-primary">{item.initials || item.author?.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm ${item.type === "solid" ? "text-white" : "text-primary"}`}>{item.author}</h4>
                      <p className={`text-xs mt-1 ${item.type === "solid" ? "text-white/80" : "text-slate-500"}`}>{item.role}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Gallery Infinite Marquee */}
        {galleryImages.length > 0 && (
          <section className="mt-20 overflow-hidden">
            <h2 className="font-plus-jakarta text-2xl font-bold text-primary mb-8">Event Gallery</h2>
            <div className="relative w-full hide-scrollbar overflow-hidden flex items-center py-4">
              <div className="flex gap-6 animate-scroll w-max pr-6">
                {[...galleryImages, ...galleryImages].map((img, idx) => (
                  <motion.div 
                    key={`${img.id}-${idx}`} 
                    onClick={() => setSelectedImage(img)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
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
