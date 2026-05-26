"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Quote, Play, ArrowRight } from "lucide-react";
import { useRef } from "react";

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
  const videoStories = [
    {
      category: "Impact Study: Oslo",
      title: "The Future of Digital Equity",
      videoUrl: "/videos/sample1.mp4",
      youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ"
    },
    {
      category: "Policy Forum",
      title: "Collaborative Governance Models",
      videoUrl: "/videos/sample2.mp4",
      youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ"
    },
    {
      category: "Teacher Spotlight",
      title: "Classroom Data Implementation",
      videoUrl: "/videos/sample1.mp4",
      youtubeUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ"
    }
  ];

  const masonryQuotes = [
    {
      quote: "The Index has fundamentally shifted how we advocate for resource allocation. It's no longer just anecdotal; we have the empirical weight of the CCS Research behind every request.",
      author: "Dr. Elias Thorne",
      role: "Director of Policy, North Rhine Education Council",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2s5LX_XX2jI3p1lOYStRXxosRpIue2LtSEcR7mEL5xkfcfDB_s7m-wCoBxGg3ZCPCqdPBLfPVyz8tKVwb2AlxWdFoxwZ6kb5038l1bV1Dkpj5ZYfo7dGWZS4dKgxXVpHhtFF0-loe7hLFPJF7Nj85iWWJ189gQI94SaXAPg5YqQqKZD2QKMcVg1tkgk-8lVPouUbrdMXgKpIdq4eVyIcfgXhrwLgGZ7n742y6lgstD4AkYEY35s0BbYCCSRBnfzydJXAFxzl1T-M_",
      type: "glass"
    },
    {
      quote: "Understanding the discrepancy between urban and rural data infrastructure was our biggest challenge. EoOS gave us the roadmap to bridge that gap.",
      author: "Sarah Jenkins",
      role: "Infrastructure Lead, EdTech Global",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4U-sWMWXh8psf4VmGylGOLl2yYicuAgiQgWCTdvzB2XeyQfErMvc4_3SWh8mM3HI5iOTXTEdwrvHvU-eNwJF2_ahSC703g_1YW4aHoQL_SZZ0rbw8rHzYlsBJS3ujoHQTdO88-9gg3E22TC7bct7-g0myRLIyHfnKP7XOrEHk6Z1VOuKwi8UONcy6zczxlZwb22S1Z70ie608ZKfaoQ9q9-Yu6KQNiF3VfXgGof59MggvYZoiJANpURd2_SSwu_2N0PzF955ZvK63",
      type: "solid"
    },
    {
      quote: "The transparency of the data methodology is what sets this project apart. As a researcher, I need to know the 'how' as much as the 'what'. CCS delivers on both fronts.",
      author: "Marcus Vong",
      role: "Senior Data Analyst, OpenSource Analytics",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB47AdFRCbBH1F7h8HXJHMhAUE7LUBeLlHkl4VYZxnI-TDl6lSO0pGOo5HVaLh2y0_1JbVVTdF8B8KnHojCKjeLKfi2s3BmLvHGFC07YIgw3RCx0oO7NqZvveoFjCbzgqzP5-II_XzUVxQ9o_w58VINGZzvg8xQrZxZ6jNg_mpN9yEYs2XU1HQWED03u-s-e2asm5q6GpxO1DMX0Wubbggmz4przz_PcJ3jmLlNmjhh4iIVGr366MXHn-Sj74jStTVedxNzZZ6RX9Ij",
      type: "glass"
    },
    {
      quote: "Integrating these findings into our curriculum was the most impactful decision we made this year. The qualitative insights helped us understand the 'why' behind the low engagement scores.",
      author: "Helena Frost",
      role: "Head of Faculty, Helsinki Institute",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDL7ts7AypzO77oh2AqSKaHuN-lomCRGhuhBKOfQ-PnhNUq9LKOBGoPqabzFxnJfPpBWfXQ-n_yXZtxGscet-R2JTbs1dU_0sZWLy-CR9H7lWHt17Zks0CxuA6O-CECZFVc9BvZFLWMTdRult3g82J5bq8qENmXzCufrUUnDnlnt0H9WbLRmiPSB5itHbbhJGNUDMlM4G_pEJdh5Bqb3NxajTPgYaHvcn4kWIQQwU81lKgN3ETxWfDRB0MlMjXWuI6htksQMX-8hUub",
      type: "glass"
    },
    {
      quote: "A masterclass in presenting complex social data with human empathy. Truly transformative.",
      author: "James Lowery",
      role: "Public Policy Advocate",
      avatar: null,
      initials: "JL",
      type: "light"
    }
  ];

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
            {videoStories.map((story, idx) => (
              <HoverVideoCard key={idx} {...story} />
            ))}
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
                      {item.avatar ? (
                        <img className="w-full h-full object-cover" src={item.avatar} alt={item.author} />
                      ) : (
                        <span className="font-bold text-primary">{item.initials}</span>
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

      </main>
      <Footer />
    </>
  );
}
