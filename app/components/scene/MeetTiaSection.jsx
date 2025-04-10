'use client';

import { animated, useSpring } from '@react-spring/three';
import { useRef, useEffect, useState } from 'react';
import ClientOnlyPortal from './ClientOnlyPortal';
import PortalModel from './PortalModel';
import ClientOnlyDialogChatHistory from './ClientOnlyDialogChatHistory';
import ClientOnly3DChatInput from './ClientOnly3DChatInput';
import ClientOnlyTextPlane from './ClientOnlyTextPlane';
import { useScroll } from '@/context/ScrollContext';
import { useScene } from '@/context/SceneContext';
import { Html } from '@react-three/drei';
import { translations } from '@/translations';
import BalloonTail from '@/components/BalloonTail';

const MeetTiaSection = ({
  meetTiaSpring,
  isExplorationMode,
  tiaPortalSpring,
  language = 'en',
}) => {
  // State to track when Tia has been clicked
  const [tiaClicked, setTiaClicked] = useState(false);
  // Get the isMeetTiaCloseup state from the scene context
  const { isMeetTiaCloseup } = useScene();
  const [isPortalHovered, setIsPortalHovered] = useState(false);
  const { meetTiaProgress, mentorProgress } = useScroll();
  const isMeetTiaCentered = mentorProgress > 0.7 && meetTiaProgress < 0.9;
  const isMobile = window.innerWidth < 768;

  // Create spring animations for the portal-text and button visibility
  const portalTextSpring = useSpring({
    scale: isMeetTiaCentered && !isMeetTiaCloseup ? 1 : 0,
    opacity: isMeetTiaCentered ? 1 : 0,
    config: { mass: 1, tension: 280, friction: 60 }
  });
  
  // Separate spring for the Let's Begin button with smoother transition
  const buttonSpring = useSpring({
    scale: isMeetTiaCentered && !isMeetTiaCloseup ? 0.3 : 0,
    opacity: isMeetTiaCentered && !isMeetTiaCloseup ? 1 : 0,
    config: { mass: 1, tension: 180, friction: 50 } // Slightly different config for smoother feel
  });

  // Handle hover events from the portal
  const handlePortalHover = (isHovered) => {
    setIsPortalHovered(isHovered);
  };

  // Notify about scene state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Dispatch an event when isMeetTiaCloseup changes
      window.dispatchEvent(
        new CustomEvent('sceneStateChange', {
          detail: { isMeetTiaCloseup },
        })
      );

      console.log('[MeetTiaSection] Scene state changed:', {
        isMeetTiaCloseup,
      });
    }
  }, [isMeetTiaCloseup]);

  // Dialog history for the chat animation
  const dialogHistory = [
    { speaker: 'You', message: 'Hello Tia! How can you help me learn?' },
    {
      speaker: 'Tia',
      message:
        "I'm your AI learning companion! I can guide you through complex topics.",
    },
    { speaker: 'You', message: 'That sounds great! What topics do you cover?' },
    {
      speaker: 'Tia',
      message:
        'Everything from programming to science, math, and more. What interests you?',
    },
    {
      speaker: 'You',
      message: "I'd like to learn about artificial intelligence.",
    },
    {
      speaker: 'Tia',
      message:
        "Perfect! Let's start with the fundamentals of AI and machine learning.",
    },
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
              {/* Position the model directly without extra group wrapper */}
              <PortalModel
                modelPath="/models/rp-tia.glb"
                position={[0, -3, -0.5]}
                rotation={[0, 0, 0]}
                scale={2.3}
                wireframe={isExplorationMode}
                roughness={0.7}
                metalness={0.1}
                envMapIntensity={0.8}
                normalScale={1.5}
                aoMapIntensity={0.9}
                emissiveIntensity={0.6}
                idleAnimation="idle"
                clickAnimation="waving"
                onAnimationComplete={() => {
                  console.log('Waving animation completed');
                  setTiaClicked(true);
                }}
              />
            </ClientOnlyPortal>

            {/* Portal text that appears on hover */}
            <animated.group
              position={[0, 2, 0]} // Position above the portal
              scale={isMeetTiaCentered ? 0 : portalTextSpring.scale}
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
            
            {/* Translated title and description with different font sizes */}
            <animated.group
              position={[0, 2, 0]} // Adjusted position for better alignment
              scale={portalTextSpring.scale}
              opacity={portalTextSpring.opacity}
              backgroundColor="rgba(240, 240, 240, 1)"
            >
              <ClientOnlyTextPlane
                textTitle={translations[language].meetTia.title}
                textSubtitle={translations[language].meetTia.description}
                textColor="#000000"
                backgroundColor="rgba(255, 255, 255, 1)"
                width={isMobile ? 2.5 : 3.0}
                height={0.7}
                fontSize={70}
                titleSize={isMobile ? 130 : 90}
                subtitleSize={isMobile ? 90 : 70}
                fontWeight="bold"
                subtitleWeight="normal"
                borderRadius={15}
                borderColor="rgb(171, 171, 171)"
                borderWidth={0}
                textAlign="center"
                padding={0.02}
                responsive={false}
                verticalOffset={0.00} // Move text slightly upward
                paragraphSpacing={0.2} // Control spacing between title and description
              />
              
              {/* Balloon tail positioned below the text plane */}
              <group position={[0, -0.405, 0]}>
                <Html transform scale={0.2} position={[0, 0, 0]} center>
                  <BalloonTail 
                    width={120}
                    height={26} 
                    color="white" 
                  />
                </Html>
              </group>
            </animated.group>

            {/* Let's Begin button - only shown when in meet tia section and not in closeup mode */}
            <group position={[0, -1.6, 0]}>
              {/* Only render the Html component when it should be visible */}
              {(isMeetTiaCentered && !isMeetTiaCloseup) && (
                <Html
                  transform
                  position={[0, 0, 0]}
                  rotation={[0, 0, 0]}
                  scale={0.3} // Use fixed scale instead of animated
                  prepend
                  center
                  zIndexRange={[100, 0]}
                  sprite
                  // Add pointer-events-auto to ensure clicks work
                  style={{
                    opacity: buttonSpring.opacity,
                    pointerEvents: buttonSpring.opacity.to(v => v < 0.1 ? 'none' : 'auto')
                  }}
                >
                  <button
                    onClick={() => {
                      // Use the same action as in home/MeetTiaSection.jsx's handleLetsBegin
                      if (typeof window !== 'undefined') {
                        // Direct method call if sceneRef is available via window
                        if (window.sceneRef && window.sceneRef.current && 
                            window.sceneRef.current.transitionToMeetTiaCloseup) {
                          console.log('Calling transitionToMeetTiaCloseup');
                          window.sceneRef.current.transitionToMeetTiaCloseup();
                        } else {
                          // Fallback to event dispatch
                          window.dispatchEvent(
                            new CustomEvent('meetTiaAction', {
                              detail: { action: 'beginCloseup' }
                            })
                          );
                        }
                      }
                    }}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: 'rgba(59, 130, 246, 0.9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '9999px',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.9)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.9)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Let's Begin!
                  </button>
                </Html>
              )}
            </group>
          

            {/* Dialog chat history with letter-by-letter animation - only shown when in closeup mode */}
            {isMeetTiaCloseup && (
              <>
                <ClientOnlyDialogChatHistory
                  position={[2.5, 0.2, 0.2]}
                  rotation={[0, -0.2, 0]}
                  scale={0.7}
                  dialogHistory={dialogHistory}
                  typingSpeed={15}
                  delayBetweenMessages={1500}
                  width={4}
                  height={3}
                  backgroundColor="rgba(226,226,226,0.9)"
                  borderColor="rgba(0,0,0,1)"
                  onSendMessage={
                    typeof window !== 'undefined' ? window.chatMessageRef : null
                  }
                />
                
                {/* 3D Chat Input positioned below the dialog history */}
                <ClientOnly3DChatInput
                  position={[2.5, -1.1, 0.2]}
                  rotation={[0, -0.2, 0]}
                  scale={0.7}
                  onSendMessage={(message) => {
                    // Use the same message handler as the dialog history
                    if (typeof window !== 'undefined' && window.chatMessageRef) {
                      window.chatMessageRef.current(message);
                    }
                  }}
                />
              </>
            )}
          </animated.group>
        </group>
      </animated.group>
    </group>
  );
};

export default MeetTiaSection;
