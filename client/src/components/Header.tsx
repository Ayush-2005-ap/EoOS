"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Search } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Explore", href: "/explore" },
    { name: "Simulate", href: "/simulate" },
    { name: "Resources", href: "/resources" },
    { name: "Voices", href: "/voices" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-outline-variant/30 transition-all">
      <div className="flex justify-between items-center h-16 px-gutter max-w-container-max-width mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1">
          <span className="font-plus-jakarta text-2xl font-extrabold text-primary tracking-tight">
            EoOS
          </span>
          <span className="font-plus-jakarta text-2xl font-extrabold text-[#ffcb05] tracking-tight">
            Index
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`font-inter text-[14px] font-semibold transition-colors pb-1 ${
                  active
                    ? "text-secondary border-b-2 border-secondary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Search & Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input
              type="text"
              placeholder="Search insights..."
              className="pl-9 pr-4 py-1.5 bg-surface-container-low border-none rounded-full text-[13px] focus:outline-none focus:ring-2 focus:ring-secondary/20 w-44 transition-all"
            />
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-primary hover:text-secondary p-1"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-outline-variant/30 bg-white/95 backdrop-blur-md px-6 py-4 space-y-3 shadow-lg absolute w-full left-0">
          <nav className="flex flex-col space-y-2">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-inter py-2 text-[15px] font-semibold ${
                    active ? "text-secondary pl-2 border-l-4 border-secondary" : "text-on-surface-variant"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="pt-4 border-t border-outline-variant/20 flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input
                type="text"
                placeholder="Search insights..."
                className="pl-9 pr-4 py-2 bg-surface-container-low border-none rounded-full text-[14px] focus:outline-none focus:ring-2 focus:ring-secondary/20 w-full"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
