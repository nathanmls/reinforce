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
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="h-full bg-gray-50">
      <div className="mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
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
                title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
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
            <h1 className="text-2xl font-semibold text-gray-800">Elementary School AI Mentor</h1>
            <p className="text-gray-600 mt-2">
              Your friendly AI mentor is here to help you learn and understand new things.
              Just speak naturally and ask any questions you have!
            </p>
          </div>
          <div 
            ref={contentRef}
            className={`p-6 ${isFullScreen ? 'p-0 fixed inset-0 z-50 bg-white overflow-auto' : ''}`}
          >
            <VoiceAssistant />
            {!isFullScreen && (
              <div className="mt-8 bg-blue-50 p-6 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Tips for a Great Learning Experience:</h2>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <span className="mr-2">👋</span>
                    Speak clearly and naturally
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">❓</span>
                    Ask specific questions about your topic
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">🎯</span>
                    Take your time to understand the answers
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">🔄</span>
                    Feel free to ask for clarification
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
