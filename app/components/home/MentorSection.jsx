'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { translations } from '@/translations';
import { FiBook, FiAward, FiHelpCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function MentorSection({ language = 'en' }) {
  const t = translations[language] || translations.en;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on a mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768; // 768px is the md breakpoint in Tailwind
      setIsMobile(mobile);
      // Set expanded state to false on mobile initially
      if (mobile) {
        setIsExpanded(false);
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <div
      id="mentor"
      className="relative isolate pointer-events-none flex items-start md:items-center h-screen px-6 lg:px-8"
    >
      <div className="mx-auto pointer-events-none flex flex-col w-full max-w-6xl items-end text-left py-24">
        <div
          className={`p-8 md:max-w-lg max-w-2xl transition-all ${isMobile && !isExpanded ? 'bg-white text-gray-800 backdrop-blur-sm rounded-2xl' : 'text-white'}`}
        >
          <h2
            onClick={() => (isMobile ? setIsExpanded(!isExpanded) : null)}
            className={`text-3xl pointer-events-auto font-bold tracking-tight sm:text-4xl ${isMobile ? 'cursor-pointer' : ''} flex items-center`}
          >
            {t.mentor.title}
          </h2>
          <motion.div
            className="overflow-hidden"
            animate={{
              height: isMobile ? (isExpanded ? 'auto' : '40px') : 'auto',
              opacity: isMobile ? (isExpanded ? 1 : 0.8) : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <p className="mt-6 text-lg leading-8">
              {t.mentor.subtitle}
            </p>
            <div className="mt-6">
            <dl className="grid max-w-xl grid-cols-2 gap-x-8 gap-y-4 text-center lg:grid-cols-2">
              <div className="flex bg-white/80 backdrop-blur-sm p-6 rounded-2xl flex-col">
                <dt className="inline font-bold text-gray-900">
                  <FiBook className="h-12 w-12 text-gray-900 mx-auto" />
                  {t.mentor.features.personalizedMaterial.title}
                </dt>
                {/* <dd className="inline text-gray-900">
                  {t.mentor.features.personalizedMaterial.description}
                </dd> */}
              </div>
              <div className="flex bg-white/80 backdrop-blur-sm p-6 rounded-2xl flex-col">
                <dt className="inline font-bold text-gray-900">
                  <FiAward className="h-12 w-12 text-gray-900 mx-auto" />
                  {t.mentor.features.totalFlexibility.title}
                </dt>
                {/* <dd className="inline text-gray-900">
                  {t.mentor.features.totalFlexibility.description}
                </dd> */}
              </div>
              <div className="flex bg-white/80 backdrop-blur-sm p-6 rounded-2xl flex-col">
                <dt className="inline font-bold text-gray-900">
                  <FiAward className="h-12 w-12 text-gray-900 mx-auto" />
                  {t.mentor.features.gamification.title}
                </dt>
                {/* <dd className="inline text-gray-900">
                  {t.mentor.features.gamification.description}
                </dd> */}
              </div>
              <div className="flex bg-white/80 backdrop-blur-sm p-6 rounded-2xl flex-col">
                <dt className="inline font-bold text-gray-900">
                  <FiHelpCircle className="h-12 w-12 text-gray-900 mx-auto" />
                  {t.mentor.features.homeworkAssistance.title}
                </dt>
                {/* <dd className="inline text-gray-900">
                  {t.mentor.features.homeworkAssistance.description}
                </dd> */}
              </div>
            </dl>
          </div>
          <div className="mt-10 mb-4 pointer-events-auto">
            <Link
              href="/how-it-works"
              className="rounded-lg bg-[#B3D45A] font-bold border-4 border-[#8EAC3A] px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-[#BAE541] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {t.mentor.callToAction}
            </Link>
            </div>
          </motion.div>
        </div>
        {isMobile && (
          <>
            <motion.div
              className={`bg-[url('/assets/drop.svg')] rotate-180 pointer-events-auto -mb-8 h-4 w-full bg-contain bg-center bg-no-repeat flex items-end justify-center`}
              animate={{ opacity: isExpanded ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            ></motion.div>
            <motion.div
              onClick={() => (isMobile ? setIsExpanded(!isExpanded) : null)}
              className="pointer-events-auto self-center font-bold z-10 bottom-10 text-xl bg-white inline-block cursor-pointer rounded-full h-8 w-8 flex items-center justify-center"
              animate={{
                rotate: isExpanded ? 45 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              +
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
