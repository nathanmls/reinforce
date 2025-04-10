'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { translations } from '@/translations';
import { motion, AnimatePresence } from 'framer-motion';
import WaitlistModal from '../WaitlistModal';

export default function WelcomeSection({ language = 'en' }) {
  const { user } = useAuth();
  const t = translations[language] || translations.en;

  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
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
      id="welcome"
      className="relative isolate pointer-events-none flex items-start md:items-center h-screen px-6 pt-14 lg:px-8"
    >
      <div className="mx-auto flex flex-col w-full text-center pointer-events-none items-center max-w-7xl md:items-start md:py-32 py-8 lg:py-56">

        <div
          className={`p-8 md:max-w-lg max-w-2xl text-left transition-all ${isMobile && !isExpanded ? 'bg-white text-gray-800 backdrop-blur-sm rounded-2xl' : 'text-white'}`}
        >
          <h2
            onClick={() => (isMobile ? setIsExpanded(!isExpanded) : null)}
            className={`text-3xl pointer-events-auto font-bold tracking-tight sm:text-4xl ${isMobile ? 'cursor-pointer' : ''} flex items-center`}
          >
            {t.welcome.title}
          </h2>

          <motion.div
            className="overflow-hidden"
            animate={{
              height: isMobile ? (isExpanded ? 'auto' : '40px') : 'auto',
              opacity: isMobile ? (isExpanded ? 1 : 0.8) : 1,
            }}
            transition={{
              height: { duration: 0.5, ease: 'easeInOut' },
              opacity: { duration: 0.3 },
            }}
          >
            <p className="mt-6 text-lg leading-8">{t.welcome.subtitle}</p>
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: isMobile ? (isExpanded ? 1 : 0) : 1,
                y: isMobile ? (isExpanded ? 0 : 10) : 0,
              }}
              transition={{
                duration: 0.4,
                delay: 0.1,
              }}
            >
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-4 lg:max-w-none">
                <motion.div
                  className="flex bg-white/80 backdrop-blur-sm p-6 rounded-2xl flex-col"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: isMobile ? (isExpanded ? 1 : 0) : 1,
                    y: isMobile ? (isExpanded ? 0 : 10) : 0,
                  }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <svg
                      className="h-12 w-12 flex-none text-gray-900"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t.welcome.features.personalizedLearning.title}
                  </dt>
                  <dd className="mt-4 text-base leading-7 text-gray-900">
                    {t.welcome.features.personalizedLearning.description}
                  </dd>
                </motion.div>
                <motion.div
                  className="flex bg-white/80 backdrop-blur-sm p-6 rounded-2xl flex-col"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: isMobile ? (isExpanded ? 1 : 0) : 1,
                    y: isMobile ? (isExpanded ? 0 : 10) : 0,
                  }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <svg
                      className="h-12 w-12 flex-none text-gray-900"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t.welcome.features.support.title}
                  </dt>
                  <dd className="mt-4 text-base leading-7 text-gray-900">
                    {t.welcome.features.support.description}
                  </dd>
                </motion.div>
              </dl>
            </motion.div>
            <motion.div
              className="mt-10 pointer-events-auto flex items-center justify-start gap-x-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: isMobile ? (isExpanded ? 1 : 0) : 1,
                y: isMobile ? (isExpanded ? 0 : 10) : 0,
              }}
              transition={{
                duration: 0.4,
                delay: 0.4,
              }}
            >
              <button
                onClick={() => setIsWaitlistOpen(true)}
                className="rounded-lg bg-[#B3D45A] font-bold border-4 border-[#8EAC3A] px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-[#BAE541] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {t.welcome.callToAction}
              </button>
            </motion.div>
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
              className="pointer-events-auto font-bold z-10 bottom-10 text-xl bg-white inline-block cursor-pointer rounded-full h-8 w-8 flex items-center justify-center"
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
      <WaitlistModal
        isOpen={isWaitlistOpen}
        setIsOpen={setIsWaitlistOpen}
        language={language}
      />
    </div>
  );
}
