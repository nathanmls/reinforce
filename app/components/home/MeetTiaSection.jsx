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

export default function MeetTiaSection({ sceneRef, language = "en" }) {
  const [isTransitioned, setIsTransitioned] = useState(false);

  useEffect(() => {}, []);

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

  return (
    <div id="meet-tia" className="relative bg-gray-900 h-screen bg-opacity-0">
      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatePresence>
          {!isTransitioned && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full flex justify-center"
            >
              <div className="flex gap-y-[38vh] flex-col items-center">
              <div className="bg-white p-6 flex flex-col items-center text-center rounded-xl shadow-lg max-w-xl mx-4 relative">
                <h2 className="text-xl font-bold text-gray-800">
                  {language === "en"
                    ? <>I'm Tia, your AI mentor.<br />I'm here to guide you through your reinforcement learning journey.</>
                    : <>Eu sou a Tia, sua mentora de IA.<br />Estou aqui para guiá-lo em sua jornada de aprendizado por reforço.</>}
                </h2>
                <div className="absolute -bottom-3">
                  <BalloonTail color="white" />
                </div>
              </div>
              <div className=" py-20">
                <button
                  onClick={handleTransition}
                  className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors duration-300 mb-2"
                >
                  {language === "en" ? "Let's Begin!" : "Vamos Começar!"}
                </button>
                </div>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Back Button */}
      <AnimatePresence>
        {isTransitioned && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-4 right-4"
          >
            <button
              onClick={handleBack}
              className="text-black hover:text-gray-800 font-size-20 transition-colors duration-300 flex items-center gap-2"
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
