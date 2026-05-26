import Link from "next/link";
import { Share2, Mail, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full py-12 mt-auto bg-white border-t border-outline-variant/50 z-10">
      <div className="max-w-container-max-width mx-auto px-gutter grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Branding & Tagline */}
        <div className="col-span-1 md:col-span-1 space-y-4">
          <Link href="/" className="flex items-center gap-1">
            <span className="font-plus-jakarta text-xl font-extrabold text-primary tracking-tight">
              EoOS
            </span>
            <span className="font-plus-jakarta text-xl font-extrabold text-secondary tracking-tight">
              Index
            </span>
          </Link>
          <p className="text-on-surface-variant text-[14px] leading-relaxed">
            India&apos;s first data-driven framework for tracking, analyzing, and resolving education access gaps across states and union territories.
          </p>
        </div>

        {/* Column 2: The Index */}
        <div className="space-y-4">
          <h5 className="font-plus-jakarta text-[14px] font-bold text-primary">The Index</h5>
          <ul className="space-y-2">
            <li>
              <Link href="/about" className="text-on-surface-variant hover:text-primary transition-opacity text-[14px]">
                Methodology
              </Link>
            </li>
            <li>
              <Link href="/explore" className="text-on-surface-variant hover:text-primary transition-opacity text-[14px]">
                State Rankings
              </Link>
            </li>
            <li>
              <Link href="/simulate" className="text-on-surface-variant hover:text-primary transition-opacity text-[14px]">
                Ranking Simulator
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Quick Links */}
        <div className="space-y-4">
          <h5 className="font-plus-jakarta text-[14px] font-bold text-primary">Quick Links</h5>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-on-surface-variant hover:text-primary transition-opacity text-[14px] inline-flex items-center gap-1">
                Data Portal <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <a href="#" className="text-on-surface-variant hover:text-primary transition-opacity text-[14px]">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="text-on-surface-variant hover:text-primary transition-opacity text-[14px]">
                Terms of Service
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact */}
        <div className="space-y-4">
          <h5 className="font-plus-jakarta text-[14px] font-bold text-primary">Contact</h5>
          <ul className="space-y-2">
            <li className="text-on-surface-variant text-[14px]">
              research@ccsindia.org
            </li>
            <li>
              <Link href="/contact" className="text-on-surface-variant hover:text-primary transition-opacity text-[14px]">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-container-max-width mx-auto px-gutter mt-12 pt-8 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-[13px] text-on-surface-variant">
          © {new Date().getFullYear()} Centre for Civil Society (CCS) Research. All rights reserved.
        </div>
        <div className="flex gap-4">
          <a
            href="#"
            className="text-on-surface-variant hover:text-primary p-2 bg-surface-container-low rounded-full transition-all"
            aria-label="Share platform"
          >
            <Share2 size={16} />
          </a>
          <a
            href="mailto:research@ccsindia.org"
            className="text-on-surface-variant hover:text-primary p-2 bg-surface-container-low rounded-full transition-all"
            aria-label="Email support"
          >
            <Mail size={16} />
          </a>
        </div>
      </div>
    </footer>
  );
}
