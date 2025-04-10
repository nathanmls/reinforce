'use client';

import VoiceAssistant from '../../../components/voice-assistant';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

export default function ElementaryChatPage() {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const contentRef = useRef(null);

  const toggleFullScreen = async () => {
    if (!document.fullscreenElement) {
      await contentRef.current.requestFullscreen();
      setIsFullScreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <Link
            href="/painel/mentors"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-6 h-6 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Mentors
          </Link>
          <button
            onClick={toggleFullScreen}
            className="text-gray-600 hover:text-gray-900 transition-colors"
            title={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
          >
            {isFullScreen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 9L4 4m0 0l5 5m-5-5v6m16-6l-5 5m5-5v6m0 6l-5-5m5 5h-6m-6 0l5-5m-5 5v-6"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            )}
          </button>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mt-2">
          Elementary School AI Mentor
        </h1>
        <p className="text-gray-600 mt-2">
          Your friendly AI mentor is here to help you learn and understand new
          things. Just speak naturally and ask any questions you have!
        </p>
      </div>

      {/* Main content area - fills the remaining height */}
      <div
        ref={contentRef}
        className={`flex-1 flex overflow-hidden ${isFullScreen ? 'fixed inset-0 z-50 bg-white' : ''}`}
      >
        <VoiceAssistant />
      </div>

      {/* Tips section - only visible when not in fullscreen */}
      {!isFullScreen && (
        <div className="p-4 bg-blue-50 border-t border-blue-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Tips for a Great Learning Experience:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center">
              <span className="mr-2 text-xl">👋</span>
              <span>Speak clearly and naturally</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2 text-xl">❓</span>
              <span>Ask specific questions about your topic</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2 text-xl">🎯</span>
              <span>Take your time to understand the answers</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2 text-xl">🔄</span>
              <span>Feel free to ask for clarification</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
