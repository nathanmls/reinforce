'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ScrollContext = createContext({
  scrollProgress: 0,
  heroProgress: 0,
  welcomeProgress: 0,
  mentorProgress: 0,
  meetTiaProgress: 0,
  comingSoonProgress: 0,
});

export const useScroll = () => useContext(ScrollContext);

export function ScrollProvider({ children }) {
  const [scrollData, setScrollData] = useState({
    scrollProgress: 0,
    heroProgress: 0,
    welcomeProgress: 0,
    mentorProgress: 0,
    meetTiaProgress: 0,
    comingSoonProgress: 0,
  });

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight =
        document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;

      // Calculate overall progress (0 to 1)
      const scrollProgress = Math.min(scrollTop / documentHeight, 1);

      // Get section elements
      const heroSection = document.getElementById('hero');
      const welcomeSection = document.getElementById('welcome');
      const mentorSection = document.getElementById('mentor');
      const meetTiaSection = document.getElementById('meet-tia');
      const comingSoonSection = document.getElementById('coming-soon');

      // Calculate section-specific progress
      const heroProgress = calculateSectionProgress(
        heroSection,
        welcomeSection,
        scrollTop,
        windowHeight
      );
      const welcomeProgress = calculateSectionProgress(
        welcomeSection,
        mentorSection,
        scrollTop,
        windowHeight
      );
      const mentorProgress = calculateSectionProgress(
        mentorSection,
        meetTiaSection,
        scrollTop,
        windowHeight
      );
      const meetTiaProgress = calculateSectionProgress(
        meetTiaSection,
        comingSoonSection,
        scrollTop,
        windowHeight
      );
      const comingSoonProgress = calculateSectionProgress(
        comingSoonSection,
        null,
        scrollTop,
        windowHeight
      );

      // Calculate if the mentor section is centered
      const isMentorCentered = Math.abs(mentorProgress - 0.5) < 0.1;

      setScrollData({
        scrollProgress,
        heroProgress,
        welcomeProgress,
        mentorProgress,
        meetTiaProgress,
        comingSoonProgress,
        isMentorCentered,
      });
    };

    const calculateSectionProgress = (
      startSection,
      endSection,
      scrollTop,
      windowHeight
    ) => {
      if (!startSection) return 0;

      const sectionStart = startSection.offsetTop;
      const sectionEnd = endSection
        ? endSection.offsetTop
        : document.documentElement.scrollHeight;
      const sectionHeight = sectionEnd - sectionStart;

      const progress = (scrollTop - sectionStart) / sectionHeight;
      return Math.max(0, Math.min(1, progress));
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ScrollContext.Provider value={scrollData}>
      {children}
    </ScrollContext.Provider>
  );
}
