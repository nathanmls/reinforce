// app/components/home/HeroSection.jsx
"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import WaitlistModal from "../../components/WaitlistModal";
import { translations } from "../../translations";

export default function HeroSection({ language = 'pt' }) {
  const { user } = useAuth();
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const t = translations[language] || translations.pt;

  return (
    <div id='hero' className="relative isolate bg-transparent flex items-center h-screen px-6 pt-14 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl justify-start py-32 sm:py-48 lg:py-56">
        <div className="text-start max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-[--text-color] sm:text-5xl">
            {t?.hero?.title || translations.pt.hero.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-[--text-color]">
            {t?.hero?.subtitle || translations.pt.hero.subtitle}
          </p>
          <div className="mt-10 pointer-events-auto flex items-center justify-start gap-x-6">
            <button
              onClick={() => setIsWaitlistOpen(true)}
              className="rounded-lg bg-[#B3D45A] font-bold border-4 border-[#8EAC3A] px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-[#BAE541] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {t?.hero?.waitlist || translations.pt.hero.waitlist}
            </button>
          </div>
        </div>
      </div>

      <WaitlistModal
        isOpen={isWaitlistOpen}
        setIsOpen={setIsWaitlistOpen}
        language={language}
      />
    </div>
  );
}
