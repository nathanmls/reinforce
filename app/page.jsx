'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import Image from 'next/image';
import { translations } from '@/translations';
import { useAuth } from './context/AuthContext';
import LoginModal from './components/LoginModal';
import FloatingNav from './components/FloatingNav';
// import TiaScene from './components/TiaScene';
import PreLoader from './components/PreLoader';
import Header from './components/Header';
import HeroSection from './components/home/HeroSection';
// import TestimonialsSection from './components/home/TestimonialsSection';
import CTASection from './components/home/CTASection';
import ContactSection from './components/home/ContactSection';
import WelcomeSection from './components/home/WelcomeSection';
import MentorSection from './components/home/MentorSection';
import AboutUsSection from './components/home/AboutUsSection';
import MeetTiaSection from './components/home/MeetTiaSection';
import ComingSoonSection from './components/home/ComingSoonSection';
import Footer from './components/Footer';
// import WaveDivider from './components/WaveDivider';
import MainScene3D from './components/MainScene3D';
import { detectUserLanguage } from './utils/geolocation';
import { CameraDebugProvider } from './context/CameraDebugContext';
import CameraDebug from './components/debug/CameraDebug';

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingDetail, setLoadingDetail] = useState('Initializing...');
  const [language, setLanguage] = useState('en');
  const t = translations[language];
  const { user, logout } = useAuth();
  const router = useRouter();
  const mainSceneRef = useRef(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [showMainScene, setShowMainScene] = useState(false);

  const sections = ['about', 'mentor', 'contact', 'testimonials', 'updates'];

  // Handle initial loading - just a quick app initialization phase
  useEffect(() => {
    const loadApp = async () => {
      // App initialization phase (0-30%) with fewer steps for faster initial loading
      const initialSteps = [5, 10, 15, 20, 25, 30];
      setLoadingDetail('Initializing application...');

      // Show incremental progress during initialization - faster now
      for (const progress of initialSteps) {
        setLoadingProgress(progress);
        await new Promise((resolve) => setTimeout(resolve, 100)); // Reduced from 250ms to 100ms
      }

      // Mark initial load as complete and start loading 3D assets
      setInitialLoadComplete(true);
      setLoadingDetail('Loading 3D assets...');

      // Add intermediate progress steps while waiting for asset loading events
      const intermediateSteps = [35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];
      
      // Use a ref to track current progress to avoid dependency issues
      const currentProgressRef = { value: 30 };
      
      // Function to advance progress with delays
      const advanceProgress = async () => {
        for (const step of intermediateSteps) {
          // Check if we should continue advancing
          if (currentProgressRef.value < step) {
            setLoadingProgress(step);
            setLoadingDetail(`Processing assets (${step}%)...`);
            currentProgressRef.value = step;
            await new Promise(resolve => setTimeout(resolve, 300));
          } else {
            // Real loading has caught up, stop artificial progression
            break;
          }
        }
      };
      
      // Listen for real progress updates to update our ref
      const handleRealProgress = (event) => {
        if (event.detail && typeof event.detail.progress === 'number') {
          // Update our reference with the real progress
          currentProgressRef.value = Math.max(currentProgressRef.value, event.detail.progress);
        }
      };
      
      // Add listener for real progress
      window.addEventListener('sceneLoadingProgress', handleRealProgress);
      
      // Start advancing progress in background
      advanceProgress();

      // Safety timeout in case assets don't load
      const safetyTimeout = setTimeout(() => {
        if (currentProgressRef.value < 100) {
          console.log(
            '[HomePage] Safety timeout reached - forcing load completion'
          );
          setLoadingProgress(100);
          setLoadingDetail('Load complete');
          // Give a moment for the final 100% event to be processed
          setTimeout(() => {
            setLoading(false);
            setShowMainScene(true);
          }, 1000); // Reduced from 1500ms to 1000ms
        }
      }, 6000); // Reduced from 8000ms to 6000ms

      return () => {
        clearTimeout(safetyTimeout);
        window.removeEventListener('sceneLoadingProgress', handleRealProgress);
      };
    };

    loadApp();
  }, []); // No dependencies to avoid loops

  // Listen for 3D scene loading progress
  useEffect(() => {
    if (!initialLoadComplete) return;

    // Use a ref to track if we've already completed loading
    const loadingCompletedRef = { current: false };

    const handleSceneLoadingProgress = (event) => {
      // Skip processing if loading is already completed
      if (loadingCompletedRef.current) return;

      if (event.detail && typeof event.detail.progress === 'number') {
        let progress;
        
        // Handle artificial progress events differently
        if (event.detail.artificial) {
          // For artificial events, use the progress value directly
          progress = Math.min(Math.round(event.detail.progress), 100);
        } else {
          // Scale the actual progress from 0-100 to 30-100 (since initialization is 0-30%)
          // Add intermediate steps for smoother progress visualization
          let scaledProgress;
          const actualProgress = event.detail.progress;
          
          // Create more granular progress steps
          if (actualProgress < 25) {
            // Slow initial asset loading progress (30-40%)
            scaledProgress = 30 + (actualProgress * 0.4);
          } else if (actualProgress < 50) {
            // Medium progress (40-60%)
            scaledProgress = 40 + ((actualProgress - 25) * 0.8);
          } else if (actualProgress < 75) {
            // Faster progress (60-80%)
            scaledProgress = 60 + ((actualProgress - 50) * 0.8);
          } else {
            // Final loading stage (80-100%)
            scaledProgress = 80 + ((actualProgress - 75) * 0.8);
          }
          
          progress = Math.min(Math.round(scaledProgress), 100);
        }
        
        setLoadingProgress(progress);

        // Display detailed loading information if available
        if (event.detail.detail) {
          setLoadingDetail(event.detail.detail);
        } else if (event.detail.url) {
          // Show a more user-friendly message for cached assets
          if (event.detail.cached) {
            setLoadingDetail(`Using cached: ${event.detail.url.split('/').pop()}`);
          } else {
            const assetName = event.detail.url.split('/').pop();
            setLoadingDetail(`Loading: ${assetName}`);
          }
        }

        // Log only if progress changes significantly (reduce console spam)
        if (progress % 10 === 0) {
          console.log(`[HomePage] 3D Scene loading progress: ${progress}%`);
        }

        // When 3D scene is fully loaded or we receive a complete flag, complete the loading process
        if ((progress >= 100 || event.detail.complete) && !assetsLoaded) {
          // Mark loading as completed to prevent duplicate processing
          loadingCompletedRef.current = true;

          setAssetsLoaded(true);
          setLoadingDetail('All assets loaded successfully');
          console.log('[HomePage] 3D assets fully loaded');

          // Ensure we reach 100% on the loading bar
          setLoadingProgress(100);

          // Wait a moment to show the 100% state before removing the loader
          setTimeout(() => {
            setLoading(false);
            setShowMainScene(true);
          }, 800); // Reduced from 1000ms to 800ms for faster transition
        }
      }
    };

    window.addEventListener('sceneLoadingProgress', handleSceneLoadingProgress);

    return () => {
      window.removeEventListener(
        'sceneLoadingProgress',
        handleSceneLoadingProgress
      );
    };
  }, [initialLoadComplete, assetsLoaded]);

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
    return (
      <>
        <PreLoader
          loadingProgress={loadingProgress}
          loadingDetail={loadingDetail}
        />
        {/* Preload the 3D scene in the background while showing the loader */}
        <div
          style={{
            position: 'absolute',
            opacity: 0,
            pointerEvents: 'none',
            visibility: 'hidden',
          }}
        >
          <MainScene3D ref={mainSceneRef} />
        </div>
      </>
    );
  }

  return (
    <CameraDebugProvider>
      <div className="relative min-h-screen">
        {/* Canvas in the middle layer */}
        <div className="fixed inset-0 z-10">
          {showMainScene && <MainScene3D ref={mainSceneRef} />}
        </div>

        {/* Main content above the canvas with higher z-index */}
        <div className="relative pointer-events-none z-20 pb-[400px]">
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
            <ComingSoonSection language={language} />
            <AboutUsSection language={language} />
            {/* <TestimonialsSection language={language}/> */}
            <CTASection language={language} />
            <ContactSection language={language} />
          </main>
        </div>

        {/* Footer below the canvas with lower z-index */}
        <Footer />

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
