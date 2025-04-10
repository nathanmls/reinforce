'use client';

import { useEffect, useState } from 'react';
import { Fragment } from 'react';
import { useSmoothCenter } from '../hooks/useSmoothCenter';

export default function FloatingNav() {
  const sections = [
    'hero',
    'welcome',
    'mentor',
    'meet-tia',
    'coming-soon',
    'about',
    'testimonials',
    'cta',
    'contact',
  ];

  const translations = {
    hero: 'Início',
    welcome: 'Futuro da Educação',
    mentor: 'Mentor AI',
    'meet-tia': 'Conheça Tia',
    'coming-soon': 'Próximas Atualizações',
    about: 'Sobre Nós',
    testimonials: 'Depoimentos',
    cta: 'Fazer Parte',
    contact: 'Contato',
  };

  const [activeSection, setActiveSection] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const [isMeetTiaCloseup, setIsMeetTiaCloseup] = useState(false);
  
  // Listen for scene state changes via custom events
  useEffect(() => {
    const handleSceneStateChange = (event) => {
      if (event.detail && typeof event.detail.isMeetTiaCloseup !== 'undefined') {
        setIsMeetTiaCloseup(event.detail.isMeetTiaCloseup);
      }
    };
    
    // Add event listener only on client side
    if (typeof window !== 'undefined') {
      window.addEventListener('sceneStateChange', handleSceneStateChange);
      return () => {
        window.removeEventListener('sceneStateChange', handleSceneStateChange);
      };
    }
  }, []);

  // Use the smooth center hook
  useSmoothCenter(activeSection, {
    threshold: 50,
    smoothness: 'smooth',
    debounceTime: 150,
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      sections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) {
          const sectionTop = element.offsetTop;
          const sectionHeight = element.offsetHeight;

          if (
            scrollPosition >= sectionTop &&
            scrollPosition < sectionTop + sectionHeight
          ) {
            setActiveSection(section);
            return;
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle temporary highlight effect
  useEffect(() => {
    if (activeSection && !isHovered) {
      setShowHighlight(true);
      const timer = setTimeout(() => {
        setShowHighlight(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activeSection, isHovered]);

  const scrollToSection = (section) => {
    const element = document.getElementById(section);
    if (element) {
      setActiveSection(section);
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Fragment>
      <nav
        className={`fixed left-1/2 bottom-4 md:left-auto md:bottom-1/2 md:right-8 transform ${isMeetTiaCloseup ? 'pointer-events-none' : 'pointer-events-auto'} -translate-x-1/2 md:translate-x-0 md:translate-y-1/2 z-40 transition-opacity duration-300 ${isMeetTiaCloseup ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <ul className="flex md:block space-x-6 md:space-x-0 md:space-y-2 justify-center md:justify-items-end">
          {sections.map((section) => (
            <li key={section}>
              <button
                onClick={() => scrollToSection(section)}
                className="group flex flex-col md:flex-row items-center justify-center w-full"
              >
                <span
                  className={`
                    session-name md:mr-4 text-xs md:text-sm border-2 border-gray-200 transition-all hover:opacity-100 hover:text-gray-800 hover:py-2 hover:bg-[#B3D45A] hover:border-white duration-300 px-2 md:px-3 py-1 bg-black/10 rounded-xl absolute bottom-full mb-2 md:static md:mb-0
                    ${isHovered ? 'opacity-100' : 'opacity-0'}
                    ${isMeetTiaCloseup ? 'pointer-events-none' : 'pointer-events-none'}
                    ${activeSection === section ? 'text-gray-800 bg-white/100 px-3 md:px-4 py-2 rounded-lg' : 'text-white'}
                    ${
                      !isHovered && activeSection === section && showHighlight
                        ? 'opacity-100 border-gray-200'
                        : isHovered
                          ? 'opacity-70 border-white/10'
                          : 'opacity-0'
                    }
                  `}
                >
                  {translations[section]}
                </span>
                <div
                  className={`
                    w-3 h-3 rounded-full transition-all duration-300 border-2 border-gray-900 group-hover:scale-125 
                    ${
                      activeSection === section
                        ? 'bg-[#B3D45A] scale-125'
                        : 'bg-white/50 group-hover:bg-white'
                    }
                  `}
                />
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </Fragment>
  );
}
