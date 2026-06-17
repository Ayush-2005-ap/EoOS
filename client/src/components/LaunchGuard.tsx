"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api";
const ENABLE_LAUNCH_MODE = process.env.NEXT_PUBLIC_ENABLE_LAUNCH_MODE === "true";

export default function LaunchGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const forceLaunched = searchParams.get("launched") === "true";

  const [isLaunched, setIsLaunched] = useState(forceLaunched);
  const [isChecking, setIsChecking] = useState(!forceLaunched);

  // If launch mode is disabled, or we are on the /launch admin route, bypass.
  const shouldBypass = !ENABLE_LAUNCH_MODE || pathname === "/launch" || pathname.startsWith("/api");

  useEffect(() => {
    if (shouldBypass || forceLaunched) {
      setIsChecking(false);
      return;
    }

    const checkLaunchStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/config/launch-status`);
        const data = await res.json();
        if (data.isLaunched) {
          setIsLaunched(true);
        }
      } catch (err) {
        console.error("Failed to check launch status", err);
      } finally {
        setIsChecking(false);
      }
    };

    checkLaunchStatus();

    // Poll every 3 seconds to check if launched
    const interval = setInterval(checkLaunchStatus, 3000);
    return () => clearInterval(interval);
  }, [shouldBypass, forceLaunched]);

  if (shouldBypass) {
    return <>{children}</>;
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  // Cross-fade to children if launched
  return (
    <>
      {/* The actual app */}
      <div
        className={`transition-opacity duration-1000 ${isLaunched ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none h-0 overflow-hidden"
          }`}
      >
        {children}
      </div>

      {/* Launching Soon Wall */}
      {!isLaunched && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
          <div className="text-center space-y-6 px-6">
            <h1 className="font-plus-jakarta text-4xl sm:text-6xl font-extrabold text-primary">
              Ease of Operating School Index 2026
            </h1>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
            <p className="text-xl sm:text-2xl text-on-surface-variant font-medium animate-pulse">
              Launching Soon
            </p>
          </div>
        </div>
      )}
    </>
  );
}
