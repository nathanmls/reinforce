"use client";

import { useState } from "react";
import { useSpring } from "@react-spring/three";

/**
 * Custom hook to create and manage all animation springs for the scene
 * @param {Object} scrollProgress - Object containing all scroll progress values
 * @param {boolean} isWallTransitioned - Whether the wall has been transitioned
 * @returns {Object} All animation springs for the scene
 */
export const useSceneAnimationSprings = (scrollProgress, isWallTransitioned) => {
  const { heroProgress, welcomeProgress, mentorProgress, meetTiaProgress } = scrollProgress;
  // Track if we're in closeup mode (for Let's Begin/Go Back buttons)
  const [isMeetTiaCloseup, setIsMeetTiaCloseup] = useState(false);

  // Hero section springs
  const heroSpring = useSpring({
    scale: heroProgress > 0.7 ? 0 : 1, // Hide in Welcome section - Not remove
    opacity: heroProgress > 0.7 ? 0 : 1, // Hide in Welcome section - Not remove
    config: { mass: 1, tension: 170, friction: 26 },
  });

  // Welcome/mentor section springs - hide everything except Tia portal
  const welcomementorSpring = useSpring({
    scale: mentorProgress > 0.7 ? 0 : 1, // Hide in MeetTia section
    opacity: mentorProgress > 0.7 ? 0 : 1, // Hide in MeetTia section
    position: mentorProgress > 0.7 ? [-20, -20, -20] : [0, 0, 0], // Move away in MeetTia section
    config: { mass: 1, tension: 170, friction: 26 },
  });
  
  // Tia portal springs - keep visible in MeetTia section
  const tiaPortalSpring = useSpring({
    // Scale increases when in closeup mode (z: 0) and decreases when further away (z: 3)
    scale: 1, // Reduced scale values to make portal smaller
    opacity: 1, // Always visible
    position: isMeetTiaCloseup ? [-1.4, -7, -3] : (mentorProgress > 0.7 ? [0, -7, -5] : [1.5, -7, -2.5]), // Move closer in closeup mode
    rotation: isMeetTiaCloseup ? [0, Math.PI * 0.05, 0]: (mentorProgress > 0.7 ? [0, Math.PI * 0, 0] : [0, Math.PI * -0.15, 0]), // Face camera in MeetTia section
    config: { mass: 1, tension: 170, friction: 26 },
  });

  // Meet Tia section springs
  const meetTiaSpring = useSpring({
    scale: 1,
    opacity: mentorProgress > 0.7 ? 1 : 0,
    position: mentorProgress > 0.7 ? [0, 0, 0] : [0, 0, 0],
    config: { mass: 1, tension: 170, friction: 26 },
  });

  // Girl model springs
  const girlModelSpring = useSpring({
    scale: mentorProgress > 0.7 ? 0 : 1, // Hide in MeetTia section
    opacity: mentorProgress > 0.7 ? 0 : 1, // Hide in MeetTia section
    position: mentorProgress > 0.7 ? [-20, -20, -20] : [0, 0, 0], // Move away in MeetTia section
    config: { mass: 1, tension: 170, friction: 26 },
  });

  // Tia model springs
  const tiaModelSpring = useSpring({
    position: mentorProgress > 0.75 ? [1, -9.5, 3] : [1, -11, 3],
    rotation: [0, Math.PI * -0.28, 0],
    scale: mentorProgress > 0.7 ? 3 : 20,
    opacity: mentorProgress > 0.7 ? 1 : 1,
    config: {
      mass: 1.2,
      tension: 180,
      friction: 0,
      clamp: true,
    },
  });

  // No more wallMeetTiaSpring - removed as requested

  return {
    heroSpring,
    welcomementorSpring,
    meetTiaSpring,
    girlModelSpring,
    tiaModelSpring,
    tiaPortalSpring,
    isMeetTiaCloseup,
    setIsMeetTiaCloseup
  };
};

export default useSceneAnimationSprings;
