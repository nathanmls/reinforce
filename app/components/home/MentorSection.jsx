'use client';

import Link from 'next/link';
import { translations } from '../../translations';

export default function MentorSection({ language = 'en' }) {
  const t = translations[language] || translations.en;

  return (
    <div id='mentor' className="relative isolate flex items-center h-screen px-6 pt-14 lg:px-8">
      <div className="mx-auto flex flex-col w-full max-w-6xl items-end text-left py-32 sm:py-48 lg:py-56">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t.mentor.title}
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            {t.mentor.subtitle}
          </p>
        </div>
        <div className="mt-6 max-w-2xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-2">
            <div className="relative space-x-2 pl-9">
              <dt className="inline font-semibold text-gray-300">
                <svg className="absolute left-1 top-1 h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clipRule="evenodd" />
                </svg>
                {t.mentor.features.personalizedMaterial.title}
              </dt>
              <dd className="inline text-gray-300">{t.mentor.features.personalizedMaterial.description}</dd>
            </div>
            <div className="relative space-x-2 pl-9">
              <dt className="inline font-bold text-gray-300">
                <svg className="absolute left-1 top-1 h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 001.33 0l1.713-3.293a.783.783 0 01.642-.413 41.102 41.102 0 003.55-.414c1.437-.231 2.43-1.489 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zM6.75 6a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 2.5a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" clipRule="evenodd" />
                </svg>
                {t.mentor.features.totalFlexibility.title}
              </dt>
              <dd className="inline text-gray-300">{t.mentor.features.totalFlexibility.description}</dd>
            </div>
            <div className="relative space-x-2 pl-9">
              <dt className="inline font-bold text-gray-300">
                <svg className="absolute left-1 top-1 h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 001.33 0l1.713-3.293a.783.783 0 01.642-.413 41.102 41.102 0 003.55-.414c1.437-.231 2.43-1.489 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zM6.75 6a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 2.5a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" clipRule="evenodd" />
                </svg>
                {t.mentor.features.support.title}
              </dt>
              <dd className="inline text-gray-300">{t.mentor.features.support.description}</dd>
            </div>
          </dl>
        </div>
        <div className="mt-10">
          <Link
            href="/how-it-works"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {t.mentor.callToAction}
          </Link>
        </div>
      </div>
    </div>
  );
}
