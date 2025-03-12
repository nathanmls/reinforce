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

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import BalloonTail from "../BalloonTail";
import { FaArrowCircleLeft } from "react-icons/fa";
import { translations } from "../../translations";

export default function MeetTiaSection({ sceneRef, language = "en" }) {
  const [isTransitioned, setIsTransitioned] = useState(false);
  const [isCloseup, setIsCloseup] = useState(false);

  useEffect(() => {
    // Monitor changes to isMeetTiaCloseup from the scene context
    const checkCloseupState = () => {
      if (sceneRef.current && sceneRef.current.isMeetTiaCloseup !== undefined) {
        setIsCloseup(sceneRef.current.isMeetTiaCloseup);
      }
    };
    
    // Initial check
    checkCloseupState();
    
    // Set up interval to periodically check the state
    const intervalId = setInterval(checkCloseupState, 200);
    
    return () => clearInterval(intervalId);
  }, [sceneRef]);

  const handleTransition = () => {
    setIsTransitioned(true);
    setTimeout(() => {
      if (sceneRef.current) {
        sceneRef.current.transitionWallMeetTia();
      }
    }, 500);
  };

  const handleBack = () => {
    if (sceneRef.current) {
      sceneRef.current.reverseWallMeetTiaTransition();
      setTimeout(() => {
        setIsTransitioned(false);
      }, 500);
    }
  };
  
  const handleLetsBegin = () => {
    if (sceneRef.current && sceneRef.current.transitionToMeetTiaCloseup) {
      console.log('Calling transitionToMeetTiaCloseup');
      sceneRef.current.transitionToMeetTiaCloseup();
      setIsCloseup(true);
    } else {
      console.error('transitionToMeetTiaCloseup not available on sceneRef');
    }
  };
  
  const handleGoBack = () => {
    if (sceneRef.current && sceneRef.current.transitionToMeetTiaInitial) {
      console.log('Calling transitionToMeetTiaInitial');
      sceneRef.current.transitionToMeetTiaInitial();
      setIsCloseup(false);
    } else {
      console.error('transitionToMeetTiaInitial not available on sceneRef');
    }
  };

  return (
    <div id="meet-tia" className="relative pointer-events-none bg-gray-900 h-screen bg-opacity-0">
      {/* Content Overlay - Only visible when not in closeup mode */}
      <AnimatePresence>
        {!isCloseup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex pointer-events-none flex-col items-center justify-center"
          >
            <AnimatePresence>
              {!isTransitioned && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full flex pointer-events-none justify-center"
                >
                  <div className="flex pointer-events-none gap-y-[38vh] flex-col items-center">
                    <div className="bg-white p-6 pointer-events-none flex flex-col items-center text-center rounded-xl shadow-lg max-w-xl mx-4 relative">
                      <h2 className="text-xl font-bold text-gray-800">
                        {translations[language].meetTia.title}
                      </h2>
                      <p className="text-gray-600 mt-2">
                        {translations[language].meetTia.description}
                      </p>
                      <div className="absolute -bottom-3">
                        <BalloonTail color="white" />
                      </div>
                    </div>
                    <div className="py-20 pointer-events-auto">
                      <button
                        onClick={handleLetsBegin}
                        className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors duration-300 mb-2"
                      >
                        Let's Begin!
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Button for Wall Transition */}
      <AnimatePresence>
        {isTransitioned && !isCloseup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-4 pointer-events-auto right-4"
          >
            <button
              onClick={handleBack}
              className="text-black hover:text-gray-800 font-size-20 transition-colors duration-300 flex items-center gap-2"
            >
              <FaArrowCircleLeft />
              <span>{translations[language].meetTia.back}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Go Back Button for Closeup Mode - Only visible when in closeup mode */}
      <AnimatePresence>
        {isCloseup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-4 right-4 pointer-events-auto"
          >
            <button
              onClick={handleGoBack}
              className="text-white hover:text-gray-200 transition-colors duration-300 flex items-center gap-2"
            >
              <FaArrowCircleLeft />
              <span>Go Back</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
