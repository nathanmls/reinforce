'use client';

import { forwardRef, useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import ClientHomeMainScene from './ClientHomeMainScene';
import dynamic from 'next/dynamic';

// Import ChatInput with client-side only rendering
const ChatInput = dynamic(
  () => import('./ui/ChatInput'),
  { ssr: false }
);

const MainScene3D = forwardRef((props, ref) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showChatInput, setShowChatInput] = useState(false);
  const chatMessageRef = useRef();
  
  // Add debug log to check ref
  useEffect(() => {
    console.log('[MainScene3D] Received ref:', ref);
    
    // Simulate loading completion
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [ref]);
  
  // Expose the chatMessageRef to the global window object for communication
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.chatMessageRef = chatMessageRef;
      
      // Listen for scene state changes
      const handleSceneStateChange = (event) => {
        if (event.detail && event.detail.isMeetTiaCloseup !== undefined) {
          setShowChatInput(event.detail.isMeetTiaCloseup);
        }
      };
      
      window.addEventListener('sceneStateChange', handleSceneStateChange);
      
      return () => {
        window.removeEventListener('sceneStateChange', handleSceneStateChange);
      };
    }
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
          <div className="text-white text-xl">Loading 3D scene...</div>
        </div>
      )}
      
      {/* Canvas Layer - Bottom layer */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Canvas
          camera={{ 
            position: [-5, -7, 8],
            fov: 75,
            near: 0.1,
            far: 1000
          }}
          shadows
          style={{ width: '100%', height: '100%' }}
        >
          {/* Don't pass ref directly to ClientHomeMainScene */}
          <ClientHomeMainScene sceneRef={ref} />
        </Canvas>
      </div>
      
      {/* UI Layer - Top layer with specific positioning for UI elements */}
      {showChatInput && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
          <ChatInput 
            onSendMessage={(message) => {
              // Add the message to the chat
              if (chatMessageRef.current) {
                chatMessageRef.current(message);
                
                // Add a mock response from Tia after a delay
                setTimeout(() => {
                  chatMessageRef.current({
                    speaker: 'Tia',
                    message: "I'm just a demo. In the real app, I would respond to your message!"
                  });
                }, 1000);
              }
            }}
            position={{ bottom: '20px' }}
          />
        </div>
      )}
    </div>
  );
});

MainScene3D.displayName = 'MainScene3D';

export default MainScene3D;