'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { translations } from '@/translations';
import Header from './components/Header';
import Footer from './components/Footer';
import { detectUserLanguage } from './utils/geolocation';

export default function NotFound() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const router = useRouter();
  const t = translations[language];

  // Handle language detection
  useEffect(() => {
    const initLanguage = async () => {
      const detectedLang = await detectUserLanguage();
      setLanguage(detectedLang);
    };
    initLanguage();
  }, []);

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Create a footer trigger element
  useEffect(() => {
    // Create a trigger element for the footer
    if (
      typeof window !== 'undefined' &&
      !document.getElementById('footer-trigger')
    ) {
      const trigger = document.createElement('div');
      trigger.id = 'footer-trigger';
      trigger.style.position = 'absolute';
      trigger.style.bottom = '400px';
      trigger.style.left = '0';
      trigger.style.width = '100%';
      trigger.style.height = '1px';
      trigger.style.zIndex = '5';
      document.body.appendChild(trigger);

      console.log('[NotFound] Created footer trigger element');
    }
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <div className="relative min-h-screen">
      <Header
        language={language}
        setLanguage={setLanguage}
        isScrolled={isScrolled}
        setIsLoginModalOpen={setIsLoginModalOpen}
      />
      <div className="relative z-20 pointer-events-none pb-[400px]">
        <main className="bg-gray-200 rounded-b-2xl flex flex-col items-center justify-center h-screen min-h-[70vh] px-4 pointer-events-auto">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="relative">
              <h1 className="text-8xl md:text-9xl font-bold text-primary-500 mb-4 opacity-10">
                404
              </h1>
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                  y: [0, -5, 0, 5, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: 'easeInOut',
                }}
              >
                <h1 className="text-7xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
                  404
                </h1>
              </motion.div>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="text-2xl md:text-4xl font-semibold mb-6"
            >
              {language === 'pt' ? 'Página não encontrada' : 'Page Not Found'}
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-lg mb-8 text-gray-600 dark:text-gray-300"
            >
              {language === 'pt'
                ? 'Oops! Parece que você entrou em um portal para o desconhecido.'
                : 'Oops! Looks like you stepped through a portal to nowhere.'}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col md:flex-row gap-4 justify-center"
            >
              <Link
                href="/"
                className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                {language === 'pt' ? 'Voltar para Home' : 'Back to Home'}
              </Link>
              <button
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-500 text-gray-900 dark:text-gray-100 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                {language === 'pt' ? 'Voltar' : 'Go Back'}
              </button>
            </motion.div>
          </motion.div>

          {/* Create an invisible element with id="contact" to trigger the footer */}
          <div id="contact" style={{ height: '1px', width: '100%' }} />
        </main>
      </div>
      <Footer />
    </div>
  );
}
