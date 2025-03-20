'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../translations';

import WaitlistModal from '../WaitlistModal';

export default function WelcomeSection({ language = 'en' }) {
  const { user } = useAuth();
  const t = translations[language] || translations.en;

  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  return (
    <div id='welcome' className="relative isolate pointer-events-none flex items-center h-screen px-6 pt-14 lg:px-8">
      <div className="mx-auto flex flex-col w-full pointer-events-none max-w-7xl items-start py-32 sm:py-48 lg:py-56">
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-2xl text-left">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t.welcome.title}
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            {t.welcome.subtitle}
          </p>
          <div className="mt-6">
            <dl className="grid max-w-xl grid-cols-2 gap-x-8 gap-y-4 lg:max-w-none lg:grid-cols-2">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <svg className="h-5 w-5 flex-none text-indigo-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clipRule="evenodd" />
                  </svg>
                  {t.welcome.features.personalizedLearning.title}
                </dt>
                <dd className="mt-4 text-base leading-7 text-gray-300">
                  {t.welcome.features.personalizedLearning.description}
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <svg className="h-5 w-5 flex-none text-indigo-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                  </svg>
                  {t.welcome.features.support.title}
                </dt>
                <dd className="mt-4 text-base leading-7 text-gray-300">
                  {t.welcome.features.support.description}
                </dd>
              </div>
            </dl>
          </div>
          <div className="mt-10 pointer-events-auto flex items-center justify-start gap-x-6">
            <button
              onClick={() => setIsWaitlistOpen(true)}
              className="rounded-full bg-[#FFD12A] px-3.5 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {t.welcome.callToAction}
            </button>
          </div>
        </div>
      </div>
      <WaitlistModal isOpen={isWaitlistOpen} setIsOpen={setIsWaitlistOpen} language={language} />
    </div>
  );
}
