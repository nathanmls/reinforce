'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';

const navigation = {
  main: [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ],
  social: [
    {
      name: 'Instagram',
      href: '#',
      icon: (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      href: '#',
      icon: (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.418-4.814a2.507 2.507 0 0 1 1.768-1.768C5.746 5 12 5 12 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ],
};

export default function Footer() {
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMainPage, setIsMainPage] = useState(false);
  const footerRef = useRef(null);

  // Check if we're on the main page and set up scroll listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if we're on the main page (/)
    const pathname = window.location.pathname;
    const mainPage = pathname === '/' || pathname === '';
    setIsMainPage(mainPage);

    // If not on main page, always show footer
    if (!mainPage) {
      setIsVisible(true);
      return;
    }

    // On main page, show footer based on scroll position
    const handleScroll = () => {
      // Calculate how far down the page we've scrolled
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Calculate the threshold - show footer when we're close to the bottom
      // Adjust the 500px value to control how soon the footer appears
      const showThreshold = documentHeight - windowHeight - 500;

      // Set visibility based on scroll position
      setIsVisible(scrollPosition > showThreshold);

      // Debug
      if (scrollPosition > showThreshold && !isVisible) {
        console.log('[Footer] Showing footer, scrolled near bottom');
      } else if (scrollPosition <= showThreshold && isVisible) {
        console.log('[Footer] Hiding footer, scrolled away from bottom');
      }
    };

    // Initial check
    handleScroll();

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);

    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isVisible]);

  // Handle video playback
  useEffect(() => {
    // Ensure video plays automatically with proper attributes
    if (videoRef.current) {
      // Set required attributes for autoplay to work in most browsers
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;

      // Try to play the video with error handling
      videoRef.current.play().catch((error) => {
        console.error('Video autoplay failed:', error);
        // Don't treat this as a critical error - video will play when user interacts
      });
    }
  }, []);

  return (
    <footer
      ref={footerRef}
      className={`bg-[#5A1A8A] bg-[url('/images/pattern-b.png')] bg-repeat animate-moveBackground text-white fixed bottom-0 w-full min-h-[400px] pt-[100px] h-[500px] z-10 ${
        isVisible
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Background */}
      <div className="absolute z-0 w-full h-[900px] -mt-20 left-0"></div>

      {/* Content */}
      <div className="flex flex-col items-start relative z-0 max-w-7xl mx-auto px-6 py-20 sm:py-24 lg:px-8">
        {/* Logo Section */}
        <div className="pb-10 md:pb-4">
          <Logo maxW={150} color="white" iconColor="white" />
        </div>

        {/* Divider */}
        <div className="block md:hidden bg-white/20 h-[1px] w-full"></div>

        {/* Navigation and Social Links */}
        <div className="flex justify-between w-full items-center">
          {/* Main Navigation */}
          <div className="flex flex-col md:flex-row py-10 md:py-6 gap-6 opacity-80">
            {navigation.main.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-[#C7DF88]"
              >
                {item.name}
              </Link>
            ))}
            <a
              href="mailto:info@reinforce.com"
              className="text-white hover:text-[#C7DF88]"
            >
              Contact us
            </a>
          </div>

          {/* Social Links - Desktop */}
          <div className="hidden md:flex gap-8">
            {navigation.social.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-white hover:text-[#C7DF88]"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-7 w-7" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="bg-white/20 h-[1px] w-full"></div>

        {/* Social Links - Mobile */}
        <div className="flex md:hidden gap-8 mt-10">
          {navigation.social.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-white hover:text-[#C7DF88]"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-10 w-10" aria-hidden="true" />
            </a>
          ))}
        </div>

        {/* Copyright and Legal */}
        <div className="mt-10 md:mt-8 opacity-50 md:opacity-90 flex flex-col-reverse sm:flex-row justify-between w-full gap-6">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} Reinforce. Todos os direitos
            reservados.
          </p>
          <div className="flex gap-6 text-xs">
            <Link href="/privacy-policy" className="hover:text-[#C7DF88]">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-[#C7DF88]">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
