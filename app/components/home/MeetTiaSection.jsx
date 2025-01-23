/**
 * MeetTiaSection Component
 * 
 * A section that introduces Tia, the virtual mentor, with an interactive 3D scene
 * and transition effects. This component combines 2D UI elements with a 3D scene
 * to create an engaging introduction experience.
 * 
 * Features:
 * - Interactive 3D scene with transition effects
 * - Smooth opacity transitions for UI elements
 * - Demo mode with start/back controls
 * - Responsive layout for all screen sizes
 */

'use client';

import { useRef, useState } from 'react';
// import Link from 'next/link';
// import TiaScene from '../TiaScene';
import BalloonTail from '../BalloonTail';

export default function MeetTiaSection() {
  // State for managing transitions and visibility
  const [isTransitioned, setIsTransitioned] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(true);
  const sceneRef = useRef(null);

  /**
   * Handles the start demo button click
   * Initiates the vignette transition and hides the text content
   */
  const handleExperimenteClick = () => {
    if (sceneRef.current) {
      setIsTextVisible(false);
      sceneRef.current.transitionVignette();
    }
  };

  /**
   * Handles the back button click
   * Reverses the transition and shows the text content after a delay
   */
  const handleVoltarClick = () => {
    if (sceneRef.current) {
      setIsTransitioned(false);
      sceneRef.current.reverseTransition();
      // Delay showing the text until the transition is complete
      setTimeout(() => {
        setIsTextVisible(true);
      }, 1000);
    }
  };

  /**
   * Callback for when the transition completes
   * Updates the transition state to show/hide UI elements
   */
  const handleTransitionComplete = (transitioned) => {
    setIsTransitioned(transitioned);
  };

  return (
    <div id='meet-tia' className="relative bg-gray-900 h-screen bg-opacity-0">
      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`max-w-2xl text-center px-6 z-10 transition-opacity duration-500 ${isTextVisible ? 'opacity-100' : 'opacity-0'}`}>
          {/* Welcome Message */}
          <h2 className="text-2xl font-bold py-4 px-6 bg-white rounded-xl text-black sm:text-2xl">
            Oi, eu sou a Tia! Sua Mentora Virtual. <br/>
            Como posso te ajudar hoje?
          </h2>

          {/* Decorative BalloonTail */}
          <div className="align-center flex justify-center w-full text-center" >
            <BalloonTail 
              color={'white'} 
              width={60} 
              height={15} 
              className="text-white absolute bg-white color-[#B3D45A] mx-auto -mt-0.5" 
            />
          </div>

          {/* Spacer for proper content positioning */}
          <div className="h-[40vh]" />
          
          {/* Action Buttons */}
          <div className="flex items-center my-12 justify-center gap-x-6">
            <button
              onClick={handleExperimenteClick}
              disabled={isTransitioned}
              className="rounded-md bg-[#B3D45A] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#a1c150] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Start Demo
            </button>
          </div>
        </div>
      </div>

      {/* Back Button - Only visible after transition */}
      <div className={`absolute bottom-6 right-6 transition-opacity duration-500 ${isTransitioned ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button
          onClick={handleVoltarClick}
          className="bg-indigo-600 text-white px-5 py-3 rounded-md hover:bg-indigo-500 transition-colors duration-200 flex items-center gap-2 z-50"
        >
          <span aria-hidden="true">←</span>
          Voltar
        </button>
      </div>
    </div>
  );
}