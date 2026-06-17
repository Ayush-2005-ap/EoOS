"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import { Settings, Play, FastForward, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api";

export default function LaunchExperience() {
  const router = useRouter();
  // sequence = 0: Initial black screen ("Every ranking tells a story")
  // sequence = 1: Book Cover + "Ease of Operating School Index 2026"
  // sequence = 2: "Launch EoOS 2026" Button
  // sequence = 3: Countdown (10 to 1)
  // sequence = 4: Grand Reveal (Confetti + Text) + API Trigger
  // sequence = 5: Fading out to reveal homepage
  const [sequence, setSequence] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [showAdmin, setShowAdmin] = useState(false);

  // Audio Refs
  const launchAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (sequence === 0) {
      // Show first quote for 3 seconds, then move to 1
      timeout = setTimeout(() => setSequence(1), 3000);
    } else if (sequence === 1) {
      // Show book cover for 4 seconds, then show button (2)
      timeout = setTimeout(() => setSequence(2), 4000);
    } else if (sequence === 3) {
      // Countdown
      if (countdown > 1) {
        timeout = setTimeout(() => setCountdown((c) => c - 1), 1000);
      } else {
        triggerReveal();
      }
    } else if (sequence === 4) {
      // Grand Reveal duration (6 seconds)
      timeout = setTimeout(() => {
        setSequence(5);
        setTimeout(() => {
          // Use Next.js router for a seamless client-side transition
          router.push("/?launched=true");
        }, 2000); // Wait for fade out
      }, 6000);
    }

    return () => clearTimeout(timeout);
  }, [sequence, countdown]);

  const triggerReveal = async () => {
    setSequence(4);

    // Confetti effect (6 seconds stream from bottom-left)
    const duration = 6000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 8,
        angle: 50,
        spread: 60,
        startVelocity: 70,
        origin: { x: 0, y: 1 },
        colors: ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFFFFF"],
        zIndex: 10000
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Notify backend to unlock website globally
    try {
      await fetch(`${API_BASE_URL}/config/launch`, { method: "POST" });
    } catch (e) {
      console.error("Failed to unlock site globally", e);
    }
  };

  const handleAdminReset = async () => {
    try {
      await fetch(`${API_BASE_URL}/config/reset-launch`, { method: "POST" });
      setSequence(0);
      setCountdown(10);
      if (launchAudioRef.current) { launchAudioRef.current.pause(); launchAudioRef.current.currentTime = 0; }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLaunchClick = () => {
    if (launchAudioRef.current) {
      // Unlock audio instantly (required for mobile/tablets)
      launchAudioRef.current.volume = 0;
      launchAudioRef.current.play().then(() => {
        // Delay exactly 300ms (0.3 sec) as requested before playing for real
        setTimeout(() => {
          if (launchAudioRef.current) {
            launchAudioRef.current.currentTime = 0; // Reset to start of audio
            launchAudioRef.current.volume = 1;      // Unmute
          }
        },);
      }).catch(e => console.log("Audio blocked:", e));
    }
    setSequence(3);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black text-white flex items-center justify-center overflow-hidden transition-opacity duration-[2000ms] ${sequence === 5 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      onClick={() => {
        // Fallback unlock if user clicks anywhere on the screen early
      }}
    >

      {/* Audio Elements */}
      <audio ref={launchAudioRef} src="/launch-audio.mp3" preload="auto" />

      {/* Sequence 0: Quote */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${sequence === 0 ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
        <p className="text-3xl sm:text-5xl font-plus-jakarta font-medium tracking-wide text-white/90 italic">
          "Every ranking tells a story."
        </p>
      </div>

      {/* Sequence 1 & 2: Book Cover & Button */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ${(sequence === 1 || sequence === 2) ? "opacity-100 scale-100 delay-500" : "opacity-0 scale-105 pointer-events-none"}`}>
        <div className="relative w-[280px] sm:w-[400px] aspect-[1/1.4] shadow-2xl shadow-primary/20 rounded-lg overflow-hidden">
          <Image
            src="/cover.png"
            alt="EoOS 2026 Report"
            fill
            className="object-cover"
            priority
          />
        </div>
        <h1 className="mt-12 text-3xl sm:text-5xl font-plus-jakarta font-bold tracking-tight text-center">
          Ease of Operating School Index 2026
        </h1>

        {/* Launch Button */}
        <div className={`mt-12 transition-all duration-1000 ${sequence === 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}`}>
          <button
            onClick={handleLaunchClick}
            className="px-10 py-5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black text-xl font-bold rounded-full shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:shadow-[0_0_60px_rgba(245,158,11,0.6)] hover:scale-105 transition-all"
          >
            Launch EoOS 2026
          </button>
        </div>
      </div>

      {/* Sequence 3: Countdown */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${sequence === 3 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <span key={countdown} className="text-[150px] sm:text-[250px] font-plus-jakarta font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-yellow-600 animate-pulse">
          {countdown}
        </span>
      </div>

      {/* Sequence 4: Grand Reveal */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ${sequence === 4 ? "opacity-100 scale-100" : "opacity-0 scale-110 pointer-events-none"}`}>
        {/* Fake Curtains */}
        <div className={`absolute inset-0 w-1/2 bg-red-950 transition-transform duration-[6000ms] ease-out origin-left ${sequence >= 4 ? "-scale-x-0" : "scale-x-100"}`}></div>
        <div className={`absolute right-0 top-0 bottom-0 w-1/2 bg-red-950 transition-transform duration-[6000ms] ease-out origin-right ${sequence >= 4 ? "-scale-x-0" : "scale-x-100"}`}></div>

        <h2 className="text-6xl sm:text-8xl font-plus-jakarta font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-600 z-10 drop-shadow-2xl text-center">
          EoOS 2026<br />
          <span className="text-4xl sm:text-6xl text-white">Officially Launched</span>
        </h2>
      </div>

      {/* Admin Control Panel - Hidden trigger */}
      <div
        className="absolute bottom-4 right-4 z-50 text-white/20 hover:text-white/80 cursor-pointer p-4 transition-colors"
        onClick={() => setShowAdmin(!showAdmin)}
      >
        <Settings size={24} />
      </div>

      {showAdmin && (
        <div className="absolute bottom-20 right-4 z-50 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col gap-3">
          <p className="text-xs uppercase tracking-wider text-white/50 font-bold mb-1">Launch Controls</p>
          <button onClick={() => triggerReveal()} className="flex items-center gap-2 text-sm hover:text-amber-400 transition-colors">
            <Play size={16} /> Force Start Reveal
          </button>
          <button onClick={() => router.push("/?launched=true")} className="flex items-center gap-2 text-sm hover:text-amber-400 transition-colors">
            <FastForward size={16} /> Skip to Homepage
          </button>
          <button onClick={handleAdminReset} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors">
            <RotateCcw size={16} /> Reset DB State
          </button>
        </div>
      )}

    </div>
  );
}
