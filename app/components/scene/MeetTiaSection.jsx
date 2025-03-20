"use client";

import { animated, useSpring } from "@react-spring/three";
import { useRef, useEffect, useState } from 'react';
import ClientOnlyPortal from './ClientOnlyPortal';
import TiaPortalModel from "./TiaPortalModel";
import ClientOnlyDialogChatHistory from "./ClientOnlyDialogChatHistory";
import ClientOnlyTextPlane from './ClientOnlyTextPlane';
import { useScene } from "@/context/SceneContext";

const MeetTiaSection = ({ 
  meetTiaSpring, 
  isExplorationMode,
  tiaPortalSpring 
}) => {
  // Get the isMeetTiaCloseup state from the scene context
  const { isMeetTiaCloseup } = useScene();
  const [isPortalHovered, setIsPortalHovered] = useState(false);
  
  // Create a spring animation for the portal-text visibility
  const portalTextSpring = useSpring({
    scale: isPortalHovered ? 1 : 0,
    opacity: isPortalHovered ? 1 : 0,
    config: {
      mass: 1,
      tension: 280,
      friction: 60
    }
  });
  
  // Handle hover events from the portal
  const handlePortalHover = (isHovered) => {
    setIsPortalHovered(isHovered);
  };
  
  // Notify about scene state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Dispatch an event when isMeetTiaCloseup changes
      window.dispatchEvent(new CustomEvent('sceneStateChange', {
        detail: { isMeetTiaCloseup }
      }));
      
      console.log('[MeetTiaSection] Scene state changed:', { isMeetTiaCloseup });
    }
  }, [isMeetTiaCloseup]);
  
  // Dialog history for the chat animation
  const dialogHistory = [
    { speaker: "You", message: "Hello Tia! How can you help me learn?" },
    { speaker: "Tia", message: "I'm your AI learning companion! I can guide you through complex topics." },
    { speaker: "You", message: "That sounds great! What topics do you cover?" },
    { speaker: "Tia", message: "Everything from programming to science, math, and more. What interests you?" },
    { speaker: "You", message: "I'd like to learn about artificial intelligence." },
    { speaker: "Tia", message: "Perfect! Let's start with the fundamentals of AI and machine learning." }
  ];
  return (
    <group position={[0, 0, 0]}>
      <animated.group
        position={meetTiaSpring.position}
        scale={meetTiaSpring.scale}
        opacity={meetTiaSpring.opacity}
      >
        {/* Only the Tia portal is visible in this section */}
        <group> 
          {/* Tia Portal - centered and facing the camera */}
          <animated.group
            position={tiaPortalSpring.position}
            rotation={tiaPortalSpring.rotation}
            scale={tiaPortalSpring.scale}
          >
            <ClientOnlyPortal
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              // Remove fixed scale to inherit from parent animated.group
              wireframe={isExplorationMode}
              onHoverChange={handlePortalHover}
            >
              <TiaPortalModel
                position={[0, -1.5, -0.5]}
                rotation={[0, 0, 0]}
                scale={2.5}
                wireframe={isExplorationMode}
              />
            </ClientOnlyPortal>
            
            {/* Portal text that appears on hover */}
            <animated.group
              position={[0, 2, 0]} // Position above the portal
              scale={portalTextSpring.scale}
              opacity={portalTextSpring.opacity}
            >
              <ClientOnlyTextPlane 
                text="Meet Tia, Your AI Tutor"
                textColor="#000000"
                backgroundColor="rgba(240, 240, 240, 1)"
                width={2.5}
                height={0.6}
                fontSize={100}
                fontWeight="bold"
                borderRadius={25}
                borderColor="rgba(171, 39, 210, 0.8)"
                borderWidth={3}
              />
            </animated.group>
            
            {/* Dialog chat history with letter-by-letter animation - only shown when in closeup mode */}
            {isMeetTiaCloseup && (
              <ClientOnlyDialogChatHistory 
                position={[2.5, 0, 0.2]}
                rotation={[0, -0.2, 0]}
                scale={0.7}
                dialogHistory={dialogHistory}
                typingSpeed={15}
                delayBetweenMessages={1500}
                width={4}
                height={3}
                backgroundColor="rgba(226,226,226,0.7)"
                borderColor="rgba(0,0,0,1)"
                onSendMessage={typeof window !== 'undefined' ? window.chatMessageRef : null}
              />
            )}
          </animated.group>
        </group>
      </animated.group>
    </group>
  );
};

export default MeetTiaSection;
