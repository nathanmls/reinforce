"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { translations } from './translations';
import Header from './components/Header';
import Footer from './components/Footer';
import MainScene3D from './components/MainScene3D';
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

  return (
    <div className="relative min-h-screen">
      <MainScene3D />
      <div className="relative z-10">
        <Header 
          language={language}
          setLanguage={setLanguage}
          isScrolled={isScrolled}
          setIsLoginModalOpen={setIsLoginModalOpen}
        />
        <main className="flex flex-col items-center justify-center min-h-[70vh] px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-6xl md:text-8xl font-bold text-primary-500 mb-4">404</h1>
            <h2 className="text-2xl md:text-4xl font-semibold mb-6">
              {language === 'pt' ? 'Página não encontrada' : 'Page Not Found'}
            </h2>
            <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
              {language === 'pt' 
                ? 'Oops! Parece que você entrou em um portal para o desconhecido.' 
                : 'Oops! Looks like you stepped through a portal to nowhere.'}
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link 
                href="/" 
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all duration-300"
              >
                {language === 'pt' ? 'Voltar para Home' : 'Back to Home'}
              </Link>
              <button 
                onClick={() => router.back()} 
                className="px-6 py-3 border border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-300"
              >
                {language === 'pt' ? 'Voltar' : 'Go Back'}
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}