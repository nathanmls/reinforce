'use client';

import { useEffect, useState } from 'react';
import { LogoIcon } from './Logo';

export default function PreLoader({ loadingProgress = 0 }) {
  const [shouldFadeOut, setShouldFadeOut] = useState(false);

  useEffect(() => {
    if (loadingProgress >= 100) {
      setShouldFadeOut(true);
    }
  }, [loadingProgress]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#AB27D2] transition-all duration-1000 ease-in-out ${
        shouldFadeOut ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
      }`}
    >
      <div className="relative flex flex-col items-center">
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-32 h-32">
            <div className="absolute tranform scale-75 inset-0">
              <LogoIcon />
            </div>
          </div>
          <div className="mt-8 w-48">
            <div className="relative h-1 bg-black/20 rounded-full overflow-hidden">
              <div 
                className="absolute inset-0 bg-[#FFD12A] transition-all duration-700 ease-out rounded-full"
                style={{ 
                  width: `${loadingProgress}%`,
                  transition: 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-white/50 text-xs">Loading</span>
              <span className="text-white text-xs font-medium">{Math.round(loadingProgress)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
