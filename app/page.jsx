"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// import Image from 'next/image';
import { translations } from './translations';
import { useAuth } from './context/AuthContext';
import LoginModal from './components/LoginModal';
import FloatingNav from './components/FloatingNav';
// import TiaScene from './components/TiaScene';
import PreLoader from './components/PreLoader';
import Header from './components/Header';
import HeroSection from './components/home/HeroSection';
import TestimonialsSection from './components/home/TestimonialsSection';
import CTASection from './components/home/CTASection';
import WelcomeSection from './components/home/WelcomeSection';
import MentorSection from './components/home/MentorSection';
import AboutUsSection from './components/home/AboutUsSection';
import MeetTiaSection from './components/home/MeetTiaSection';
import ComingSoonSection from './components/home/ComingSoonSection';
import ContactSection from './components/home/ContactSection';
import Footer from './components/Footer';
import WaveDivider from './components/WaveDivider'; 
import MainScene3D from './components/MainScene3D';
import { detectUserLanguage } from './utils/geolocation';
import { CameraDebugProvider } from './context/CameraDebugContext';
import CameraDebug from './components/debug/CameraDebug';

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [language, setLanguage] = useState('en'); 
  const t = translations[language];
  const { user, logout } = useAuth();
  const router = useRouter();
  const mainSceneRef = useRef(null);

  const sections = ['about', 'mentor', 'contact', 'testimonials', 'updates'];

  // Handle initial loading
  useEffect(() => {
    const loadApp = async () => {
      const steps = [20, 40, 60, 80, 100];
      for (const progress of steps) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoadingProgress(progress);
      }
      // Keep loading true for a moment to allow the fade out animation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    };

    loadApp();
  }, []);

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

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const success = await logout();
      if (success) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Debug log when component mounts and ref changes
  useEffect(() => {
    console.log('[HomePage] Component mounted');
    console.log('[HomePage] MainScene ref:', mainSceneRef);
  }, []);

  useEffect(() => {
    console.log('[HomePage] MainScene ref changed:', mainSceneRef.current);
  }, [mainSceneRef.current]);

  if (loading) {
    return <PreLoader loadingProgress={loadingProgress} />;
  }

  return (
    <CameraDebugProvider>
      <div className="relative min-h-screen">
        <MainScene3D ref={mainSceneRef} />  
        <div className="relative pointer-events-none z-10">
          <FloatingNav sections={sections} translations={t.nav} />
          <Header 
            language={language}
            setLanguage={setLanguage}
            isScrolled={isScrolled}
            setIsLoginModalOpen={setIsLoginModalOpen}
          />
          <main className="bg-transparent flex flex-col">
            <CameraDebug />
            <HeroSection language={language} />
            <WelcomeSection language={language} />
            <MentorSection language={language} />
            <MeetTiaSection sceneRef={mainSceneRef} language={language} />
            <ComingSoonSection />
            <AboutUsSection />
            <TestimonialsSection />
            <CTASection />
            <ContactSection />
            <Footer />
          </main>
        </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        language={language}
      />
    </div>
    </CameraDebugProvider>
  );
}
