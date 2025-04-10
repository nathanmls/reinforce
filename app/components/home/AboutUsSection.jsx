'use client';

import Link from 'next/link';
import Image from 'next/image';
import { translations } from '@/translations';

export default function AboutUsSection({ language = 'en' }) {
  const t = translations[language] || translations.en;
  return (
    <div
      id="about"
      className="bg-[#5A1A8A] flex items-center pointer-events-auto min-h-screen bg-opacity-1 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl bg-white px-6 py-10 rounded-2xl lg:px-8">
        <div className="mx-auto grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center">
            <Image
              src="/images/teacher-call.jpg"
              alt="Reinforce educators interacting with students"
              width={600}
              height={400}
              className="object-cover rounded-xl shadow-lg"
              priority
            />
          </div>
          
          <div className="text-start">
            <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl mb-6">
              {t.about.title}
            </h2>
            
            <div className="space-y-6">
              <p className="text-lg leading-8 text-black">
                {t.about.description}
              </p>
              
              <p className="text-lg leading-8 text-black">
                <span className="font-semibold">{t.about.forStudentsTitle}</span> {t.about.forStudentsDescription}
              </p>
              
              <p className="text-lg leading-8 text-black">
                <span className="font-semibold">{t.about.forSchoolsTitle}</span> {t.about.forSchoolsDescription}
              </p>
              
              <p className="text-lg leading-8 text-black font-medium italic">
                "{t.about.quote}"
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-start gap-6">
                <Link
                  href="/waitlist"
                  className="rounded-lg bg-[#B3D45A] font-bold border-4 border-[#8EAC3A] px-5 py-3 text-base font-semibold text-gray-900 shadow-md hover:bg-[#BAE541] transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {t.about.joinWaitlist}
                </Link>
                
                <Link
                  href="/how-it-works"
                  className="text-[#5A1A8A] hover:text-[#AB27D2] font-medium flex items-center transition-all duration-300"
                >
                  {t.about.discoverMore} <span className="ml-2">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
