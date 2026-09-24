"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SleepSupportView from "./SleepSupportView";
import MeditationView from "./MeditationView";

interface SleepMeditationViewProps {
  defaultTab?: "sleep" | "meditation";
}

export default function SleepMeditationView({ defaultTab }: SleepMeditationViewProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const resolveInitialTab = (): "sleep" | "meditation" => {
    if (defaultTab) return defaultTab;
    const tabQuery = searchParams?.get("mode");
    if (tabQuery === "meditation") return "meditation";
    if (tabQuery === "sleep") return "sleep";
    if (pathname.includes("/meditation")) return "meditation";
    return "sleep";
  };

  const [activeTab, setActiveTab] = useState<"sleep" | "meditation">(resolveInitialTab);

  useEffect(() => {
    if (pathname.includes("/meditation")) {
      setActiveTab("meditation");
    } else if (pathname.includes("/sleep") && !pathname.includes("/sleep-meditation")) {
      setActiveTab("sleep");
    }
  }, [pathname]);

  const handleTabChange = (tab: "sleep" | "meditation") => {
    setActiveTab(tab);
  };

  return (
    <div className="w-full min-w-0 flex flex-col gap-5 select-none animate-fade-in">
      {/* Sub-Tab Navigation Header Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-1">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-[#102F27] border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs">
          <button
            type="button"
            onClick={() => handleTabChange("sleep")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-heading font-black transition-all cursor-pointer ${
              activeTab === "sleep"
                ? "bg-[#006C56] dark:bg-[#00A982] text-white dark:text-[#071C17] shadow-xs"
                : "text-[#5A756C] dark:text-[#A9C5BC] hover:text-[#006C56] dark:hover:text-[#88F7D6] hover:bg-[#F4FAF7] dark:hover:bg-[#14382F]"
            }`}
          >
            <span className="material-symbols-outlined text-lg">bedtime</span>
            <span>Sleep Support</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("meditation")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-heading font-black transition-all cursor-pointer ${
              activeTab === "meditation"
                ? "bg-[#006C56] dark:bg-[#00A982] text-white dark:text-[#071C17] shadow-xs"
                : "text-[#5A756C] dark:text-[#A9C5BC] hover:text-[#006C56] dark:hover:text-[#88F7D6] hover:bg-[#F4FAF7] dark:hover:bg-[#14382F]"
            }`}
          >
            <span className="material-symbols-outlined text-lg">self_improvement</span>
            <span>Meditation</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#5A756C] dark:text-[#A9C5BC] font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-[#006C56] dark:bg-[#00A982]"></span>
          <span>{activeTab === "sleep" ? "Ambient sleep audio & wind-down" : "4-7-8 breathing & Solfeggio soundscapes"}</span>
        </div>
      </div>

      {/* Render Active View */}
      <div className="w-full min-w-0">
        {activeTab === "sleep" ? <SleepSupportView /> : <MeditationView />}
      </div>
    </div>
  );
}
