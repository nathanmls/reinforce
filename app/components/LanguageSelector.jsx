'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { detectUserLanguage } from '../utils/geolocation';

const languages = {
  en: { 
    flag: '/images/flags/uk-circle.svg',
    name: 'English',
    emoji: '🇬🇧'
  },
  pt: { 
    flag: '/images/flags/br-circle.svg',
    name: 'Portuguese',
    emoji: '🇧🇷'
  },
  es: { 
    flag: '/images/flags/es-circle.svg',
    name: 'Spanish',
    emoji: '🇪🇸'
  },
  nl: { 
    flag: '/images/flags/nl-circle.svg',
    name: 'Dutch',
    emoji: '🇳🇱'
  }
};

export default function LanguageSelector({ value, onChange, onHoverChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Initialize language based on geolocation
  useEffect(() => {
    async function initLanguage() {
      if (!value) { // Only detect if no language is set
        const detectedLang = await detectUserLanguage();
        onChange(detectedLang);
      }
    }
    initLanguage();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        onHoverChange?.(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onHoverChange]);

  // Handle hover intent with delay
  let hoverTimeout;
  const handleMouseEnter = () => {
    clearTimeout(hoverTimeout);
    setIsOpen(true);
    onHoverChange?.(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout = setTimeout(() => {
      setIsOpen(false);
      onHoverChange?.(false);
    }, 300); // 300ms delay before closing
  };

  return (
    <div 
      className="relative" 
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 
                 hover:border-white/40 rounded-full p-1.5 flex items-center justify-center 
                 min-w-[40px] transition-all duration-200 ease-in-out"
        aria-label="Select language"
      >
        <div className="w-6 h-6 relative">
          <Image
            src={languages[value].flag}
            alt={languages[value].name}
            width={24}
            height={24}
            className="rounded-full"
          />
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 py-1 w-48 bg-white/95 backdrop-blur-sm 
                      rounded-lg shadow-lg ring-1 ring-black/5 z-50 transform opacity-100 
                      scale-100 transition-all duration-200 ease-in-out">
          {Object.entries(languages).map(([code, { flag, name }]) => (
            <button
              key={code}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center 
                        space-x-3 transition-colors duration-150 ease-in-out
                        ${code === value ? 'bg-gray-50' : ''}`}
              onClick={() => {
                onChange(code);
                setIsOpen(false);
              }}
            >
              <div className="w-6 h-6 relative">
                <Image
                  src={flag}
                  alt={name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </div>
              <span className="text-gray-700">{name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
