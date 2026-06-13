"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Layers, FileText, Video, MessageSquare, LogOut, Mail, Users } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token && pathname !== "/admin/login") {
      router.push("/admin/login");
    } else {
      setIsAuthChecking(false);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  if (isAuthChecking) return <div className="h-screen flex items-center justify-center bg-slate-50">Loading...</div>;

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { name: "States Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Domains Engine", href: "/admin/domains", icon: <Layers size={20} /> },
    { name: "Queries / Inbox", href: "/admin/queries", icon: <Mail size={20} /> },
    { name: "Reports (PDFs)", href: "/admin/reports", icon: <FileText size={20} /> },
    { name: "Voices (Videos)", href: "/admin/voices", icon: <Video size={20} /> },
    { name: "Reviews", href: "/admin/reviews", icon: <MessageSquare size={20} /> },
    { name: "Authors", href: "/admin/authors", icon: <Users size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 pt-16">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-10">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-white font-plus-jakarta font-extrabold text-xl tracking-tight">Admin Console</h2>
          <p className="text-xs text-slate-400 mt-1">EoOS Management</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? "bg-primary text-white font-bold shadow-lg shadow-primary/20" : "hover:bg-slate-800 hover:text-white font-medium"}`}
              >
                {item.icon}
                <span className="text-[14px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
            <LayoutDashboard size={20} />
            <span className="text-[14px] font-medium">Back to Site</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center w-full gap-3 px-4 py-3 rounded-xl hover:bg-error/20 hover:text-error transition-colors text-slate-400 font-bold">
            <LogOut size={20} />
            <span className="text-[14px]">Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-surface-container-low/30 relative">
        {children}
      </main>
    </div>
  );
}
