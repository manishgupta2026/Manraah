"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/frontend/components/ui/Logo";
import { signOut } from "@/backend/auth/client";

export default function PublicFooter() {
  const router = useRouter();

  const handleGetStarted = async () => {
    try {
      await signOut();
    } catch {
      // ignore
    }
    router.push("/category-selection");
  };

  const handleSelectCategory = (catId: string) => {
    try {
      document.cookie = `userType=${catId}; path=/; max-age=86400`;
    } catch {
      // ignore
    }
    router.push("/category-selection");
  };

  return (
    <footer className="bg-[#262235] text-surface/90 pt-16 pb-12 px-6 border-t border-white/10 select-none">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-sm">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-5 text-left">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
              <Logo variant="white" size="md" className="h-8 sm:h-9" />
            </Link>
            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              A private, compassionate mental wellness retreat combining 24/7 AI companion care, verified peer listeners, licensed therapists, and category-based personalization.
            </p>

            {/* Social Media Links */}
            <div className="pt-1">
              <p className="text-[11px] font-heading font-bold text-white/50 uppercase tracking-wider mb-2.5">
                Follow Our Journey
              </p>
              <div className="flex items-center gap-2">
                <a
                  href="#"
                  aria-label="X (Twitter)"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors text-xs"
                >
                  𝕏
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors text-xs"
                >
                  <span className="material-symbols-outlined text-sm">photo_camera</span>
                </a>
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors text-xs"
                >
                  <span className="material-symbols-outlined text-sm">work</span>
                </a>
                <a
                  href="#"
                  aria-label="Community"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors text-xs"
                >
                  <span className="material-symbols-outlined text-sm">forum</span>
                </a>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3 text-left">
            <h4 className="font-heading font-bold text-white text-xs uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">How it Works</Link></li>
              <li><Link href="/features" className="hover:text-white transition-colors">Features Overview</Link></li>
              <li><Link href="/stories" className="hover:text-white transition-colors">Member Stories</Link></li>
              <li><Link href="/features?tab=ai" className="hover:text-white transition-colors">AI Companion</Link></li>
              <li><Link href="/features?tab=human" className="hover:text-white transition-colors">Human Companion</Link></li>
              <li><Link href="/features?tab=pro" className="hover:text-white transition-colors">Professional Care</Link></li>
              <li><Link href="/features?tab=mood" className="hover:text-white transition-colors">Mood Tracker</Link></li>
              <li><Link href="/features?tab=journal" className="hover:text-white transition-colors">Reflective Journal</Link></li>
              <li><Link href="/features?tab=meditation" className="hover:text-white transition-colors">Meditation &amp; Sleep</Link></li>
            </ul>
          </div>

          {/* Categories Links */}
          <div className="space-y-3 text-left">
            <h4 className="font-heading font-bold text-white text-xs uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li><Link href="/for-you" className="hover:text-white transition-colors">Pathways Overview (/for-you)</Link></li>
              <li><Link href="/for-you?selected=student" className="hover:text-white transition-colors">Students &amp; Academics</Link></li>
              <li><Link href="/for-you?selected=working_professional" className="hover:text-white transition-colors">Working Professionals</Link></li>
              <li><Link href="/for-you?selected=parent" className="hover:text-white transition-colors">Parents &amp; Families</Link></li>
              <li><Link href="/for-you?selected=couple" className="hover:text-white transition-colors">Couples &amp; Relationships</Link></li>
              <li><Link href="/category-selection" className="hover:text-white transition-colors">All Life Categories →</Link></li>
            </ul>
          </div>

          {/* Trust & Legal Links */}
          <div className="space-y-3 text-left">
            <h4 className="font-heading font-bold text-white text-xs uppercase tracking-wider">Trust &amp; Legal</h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/privacy-and-trust" className="hover:text-white transition-colors">Privacy &amp; Trust Center</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">Frequently Asked Questions (FAQ)</Link></li>
              <li><Link href="/security" className="hover:text-white transition-colors">Security Standards</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><button onClick={handleGetStarted} className="hover:text-white transition-colors text-left cursor-pointer">Get Started</button></li>
            </ul>
          </div>
        </div>

        {/* Calm Crisis Helpline Notice */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-white/75 space-y-1.5 text-left">
          <div className="font-heading font-bold text-white/90 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-mint">favorite</span>
            <span>24/7 Immediate Support Notice</span>
          </div>
          <p className="leading-relaxed">
            If you or someone you know is in immediate crisis or emotional distress, please reach out to professional emergency resources: call <span className="font-bold text-white underline decoration-white/30">[National Crisis Helpline Placeholder — e.g., 988 in US/Canada, 14416 Tele-MANAS in India, or 112 in EU]</span>. Manraah is an everyday supportive wellness companion, not an emergency medical intervention service.
          </p>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <p>© 2026 Manraah. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Crafted with compassion for mind &amp; soul</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
