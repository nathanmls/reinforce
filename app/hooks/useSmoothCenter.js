import { useEffect, useRef } from 'react';
import { useScroll } from '../context/ScrollContext';

const SMOOTH_SECTIONS = ['hero', 'welcome', 'mentor', 'meet-tia', 'coming-soon'];

export function useSmoothCenter(activeSection, options = {}) {
  const {
    threshold = 0,
    smoothness = 'smooth',
    debounceTime = 150
  } = options;

  const { comingSoonProgress } = useScroll();
  const scrollTimeout = useRef(null);
  const isScrolling = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      isScrolling.current = true;

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
        isScrolling.current = false;
        centerActiveSection();
      }, debounceTime);
    };

    const centerActiveSection = () => {
      if (!activeSection || isScrolling.current) return;

      // Only apply smooth centering to specific sections
      if (!SMOOTH_SECTIONS.includes(activeSection)) {
        return;
      }

      const element = document.getElementById(activeSection);
      if (!element) return;

      const elementRect = element.getBoundingClientRect();
      const elementCenter = elementRect.top + elementRect.height / 2;
      const windowCenter = window.innerHeight / 2;
      const offset = elementCenter - windowCenter;

      // Always center when scrolling stops, but only if there's any offset
      if (offset !== 0) {
        window.scrollBy({
          top: offset,
          behavior: smoothness
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    centerActiveSection();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [activeSection, threshold, smoothness, debounceTime, comingSoonProgress]);
}
