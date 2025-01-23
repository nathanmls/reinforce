'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { translations } from '../translations';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import LanguageSelector from './LanguageSelector';
import { getMenuItems } from './Sidebar';

export default function Header({ 
  language, 
  setLanguage, 
  setIsLoginModalOpen,
  isLoginPage = false
}) {
  const router = useRouter();
  const { user, userProfile, logout } = useAuth();
  const t = translations[language];
  const menuItems = getMenuItems(userProfile?.role);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isNearTop, setIsNearTop] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);
  const [isLangSelectorHovered, setIsLangSelectorHovered] = useState(false);
  const inactivityTimeoutRef = useRef(null);

  const resetInactivityTimer = () => {
    setIsActive(true);
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    inactivityTimeoutRef.current = setTimeout(() => {
      setIsActive(false);
    }, 3000);
  };

  useEffect(() => {
    resetInactivityTimer();
    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
      
      // Only hide header when scrolled past top
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
      resetInactivityTimer();
    };

    const handleMouseMove = (e) => {
      setIsNearTop(e.clientY < 100);
      resetInactivityTimer();
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [lastScrollY]);

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header 
      className={`fixed z-50 transition-all duration-300 backdrop-blur ${
        isScrolled || isLoginPage 
          ? 'bg-gray-900/95 shadow-lg mx-2 mt-2 rounded-2xl w-[calc(100%-1rem)]' 
          : 'bg-white/50 w-full'
      } ${(!isVisible || !isActive) && !isNearTop && !isDropdownHovered && !isLangSelectorHovered && isScrolled ? '-translate-y-full -mt-1' : 'translate-y-0'}`}
      onMouseEnter={resetInactivityTimer}
      onMouseMove={resetInactivityTimer}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-4">
            <Logo maxW={150} color={isScrolled || isLoginPage ? '#FFFFFF' : '#222222'} />
          </Link>
          <div className="flex items-center space-x-4">
            <LanguageSelector 
              value={language} 
              onChange={setLanguage} 
              onHoverChange={setIsLangSelectorHovered}
            />
            {!isLoginPage && user ? (
              <div className="relative group">
                <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors hover:text-white ${ isScrolled || isLoginPage ? 'text-white' : 'text-black' }`}>
                  <div className="flex items-center space-x-3">
                    {userProfile?.profileImage ? (
                      <Image
                        src={userProfile.profileImage}
                        alt={userProfile?.name || user.email}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">
                          {(userProfile?.name || user.email || '?')[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span>{userProfile?.name || user.email}</span>
                  </div>
                  <svg
                    className="w-5 h-5 text-white transition-transform group-hover:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div 
                  onMouseEnter={() => setIsDropdownHovered(true)}
                  onMouseLeave={() => setIsDropdownHovered(false)}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  {menuItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.path}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <span className="w-5 h-5 mr-3">{item.icon}</span>
                      {item.name}
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 my-1"></div>
                  <Link
                    href="/painel/account"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {t.nav.account}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {t.nav.logout}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t.nav.login}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
