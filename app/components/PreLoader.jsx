'use client';

import { useEffect, useState, useRef, memo } from 'react';
import { LogoIconPreload } from './Logo';

const PreLoader = memo(function PreLoader({
  loadingProgress = 0,
  loadingDetail = 'Loading...',
}) {
  const [shouldFadeOut, setShouldFadeOut] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const prevProgressRef = useRef(0);
  const loadingStartTime = useRef(Date.now());

  // Detect if assets are loading from cache (very fast progress)
  useEffect(() => {
    if (loadingProgress > 30 && loadingProgress - prevProgressRef.current > 20) {
      setIsCached(true);
    }
    prevProgressRef.current = loadingProgress;
  }, [loadingProgress]);

  useEffect(() => {
    // Start fade out when loading progress reaches 100%
    if (loadingProgress >= 100) {
      setShouldFadeOut(true);

      // After the fade out animation completes, set isHidden to true
      const timer = setTimeout(() => {
        setIsHidden(true);
      }, 1000); // Slightly faster than the original 1200ms

      return () => clearTimeout(timer);
    }
  }, [loadingProgress]);

  // Calculate loading time for analytics
  useEffect(() => {
    return () => {
      if (loadingProgress >= 100) {
        const loadTime = Date.now() - loadingStartTime.current;
        console.log(`[PreLoader] Total loading time: ${loadTime}ms`);
      }
    };
  }, [loadingProgress]);

  // If hidden, don't render the component at all
  if (isHidden) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#AB27D2] transition-all duration-1000 ease-in-out ${
        shouldFadeOut
          ? 'opacity-0 scale-110 pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
    >
      <div className="relative flex flex-col items-center">
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-32 h-32 animate-pulse">
            <div className="absolute tranform scale-75 inset-0">
              <LogoIconPreload />
            </div>
          </div>
          <div className="mt-8 w-72">
            <div className="relative h-2 bg-black/20 rounded-full overflow-hidden">
              <div
                className="absolute inset-0 bg-[#FFD12A] rounded-full"
                style={{
                  width: `${Math.min(Math.max(0, loadingProgress), 100)}%`,
                  transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-white/70 text-xs font-medium">
                {isCached ? 'Using cached assets...' : loadingDetail}
              </span>
              <span className="text-white text-xs font-medium">
                {Math.round(Math.min(Math.max(0, loadingProgress), 100))}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PreLoader;
