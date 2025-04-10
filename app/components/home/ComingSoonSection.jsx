'use client';

import Link from 'next/link';
import { useState } from 'react';
import WaitlistModal from '../WaitlistModal';
import { translations } from '@/translations';
import { motion } from 'framer-motion';

export default function ComingSoonSection({ language = 'pt' }) {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const t = translations[language].comingSoon;

  return (
    <div
      id="coming-soon"
      className="bg-gradient-to-b pointer-events-auto from-white to-indigo-50 relative isolate flex items-center min-h-screen px-6 py-24 lg:px-8"
    >
      <div className="mx-auto w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold tracking-tight text-indigo-900 uppercase sm:text-5xl">
            {t.title}
          </h2>
          <p className="mt-4 text-xl leading-8 text-indigo-700">{t.subtitle}</p>
        </motion.div>

        <div className="mt-10">
          <dl className="grid grid-cols-1 gap-y-24 gap-x-8 pt-12 lg:gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {t.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="h-28 w-28 rounded-full -mt-24 bg-gray-200 flex items-center justify-center mx-auto mb-4">
                    <img
                      src={`/images/${getFeatureIcon(index)}`}
                      alt={feature.title}
                      className="h-32 w-32 object-scale-down"
                    />
                  </div>
                  <dt className="text-lg font-semibold leading-7 text-indigo-800 text-center">
                    {feature.title}
                  </dt>
                  <dd className="mt-3 text-base leading-7 text-gray-700 text-center">
                    <p>{feature.description}</p>
                  </dd>
                </div>
              </motion.div>
            ))}
          </dl>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <button
            onClick={() => setIsWaitlistOpen(true)}
            className="rounded-lg bg-[#B3D45A] font-bold border-4 border-[#8EAC3A] px-6 py-3 text-base font-semibold text-gray-900 shadow-md hover:bg-[#BAE541] focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all duration-300 w-full sm:w-auto"
          >
            {t.waitlist}
          </button>
          <Link
            href="/about"
            className="text-base font-semibold leading-6 text-indigo-800 hover:text-indigo-600 transition-colors duration-300 flex items-center gap-1"
          >
            {t.learnMore}{' '}
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </motion.div>
      </div>
      <WaitlistModal isOpen={isWaitlistOpen} setIsOpen={setIsWaitlistOpen} />
    </div>
  );
}

// Helper function to get the appropriate icon for each feature
function getFeatureIcon(index) {
  const icons = [
    'vr-assistance.png',
    'group-assistance.png',
    'ai-vision.png',
    'phone-app.png',
  ];
  return icons[index] || 'default-icon.png';
}
