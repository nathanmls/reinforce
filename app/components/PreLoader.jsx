'use client';

import { useEffect, useState } from 'react';
import { LogoIcon } from './Logo';

export default function PreLoader({ loadingProgress = 0, loadingDetail = 'Loading...' }) {
  const [shouldFadeOut, setShouldFadeOut] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    // Start fade out when loading progress reaches 100%
    if (loadingProgress >= 100) {
      setShouldFadeOut(true);
      
      // After the fade out animation completes, set isHidden to true
      const timer = setTimeout(() => {
        setIsHidden(true);
      }, 1200); // Slightly longer than the transition duration (1000ms)
      
      return () => clearTimeout(timer);
    }
  }, [loadingProgress]);

  // If hidden, don't render the component at all
  if (isHidden) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#AB27D2] transition-all duration-1000 ease-in-out ${
        shouldFadeOut ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div className="relative flex flex-col items-center">
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-32 h-32">
            <div className="absolute tranform scale-75 inset-0">
              <LogoIcon />
            </div>
          </div>
          <div className="mt-8 w-72">
            <div className="relative h-1 bg-black/20 rounded-full overflow-hidden">
              <div 
                className="absolute inset-0 bg-[#FFD12A] transition-all duration-700 ease-out rounded-full"
                style={{ 
                  width: `${Math.min(Math.max(0, loadingProgress), 100)}%`,
                  transition: 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-white/50 text-xs">{loadingDetail}</span>
              <span className="text-white text-xs font-medium">{Math.round(Math.min(Math.max(0, loadingProgress), 100))}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
