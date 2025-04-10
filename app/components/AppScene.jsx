'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, Html } from '@react-three/drei';
import { Suspense, useRef, useMemo, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useAuth } from '../context/AuthContext';
import { mentorService } from '../services/mentorService';
import HomeworkList from './homework/HomeworkList';
import { USER_ROLES } from '../config/roles';
import ClientOnlyTalkingHead from './scene/ClientOnlyTalkingHead';
import AppSceneCamera from './scene/AppSceneCamera';

// Add React Fast Refresh handler to preserve Three.js state
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Store Three.js objects in window for persistence across HMR
  window.__THREE_FIBER_STORE = window.__THREE_FIBER_STORE || {
    scenes: new Map(),
    cameras: new Map(),
    renderers: new Map(),
    canvasProps: new Map(),
  };
}

// Simple solid color background
const SceneBackground = () => {
  return (
    <mesh position={[0, 0, -10]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial color="#5A1A8A" side={THREE.DoubleSide} />
    </mesh>
  );
};

// Simple solid color floor
const SolidFloor = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <circleGeometry args={[6, 64]} />
      <meshStandardMaterial color="#B4D45A" />
    </mesh>
  );
};

// Static lighting setup
const SceneLighting = () => {
  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-10, 10, 5]} intensity={1} />
      <pointLight position={[0, 5, 0]} intensity={1} />
    </>
  );
};

// Homework component for 3D scene
const HomeworkPanel = ({ studentId }) => {
  return (
    <Html
      transform
      position={[4.5, 0.5, -5]}
      rotation={[0, Math.PI * -0.08, 0]}
      scale={0.1}
      occlude={false}
      distanceFactor={15}
      zIndexRange={[100, 0]}
      prepend
      center
    >
      <div className="homework-panel" style={{ 
        width: '800px', 
        height: '600px', 
        padding: '20px', 
        background: 'rgba(255, 255, 255, 0.9)', 
        borderRadius: '10px', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
        overflow: 'auto',
        transform: 'translateZ(0)', // Force GPU acceleration
        backfaceVisibility: 'hidden' // Prevent flicker
      }}>
        <HomeworkList studentId={studentId} />
      </div>
    </Html>
  );
};

// Main AppScene component
function AppScene({ 
  isActive = false, 
  intensity = 1,
  dialogHistory = [],
  onSendMessage,
  typingSpeed = 20,
  language = 'en',
  conversationStatus = 'disconnected',
  onStartConversation = () => {},
  onStopConversation = () => {}
}) {
  const { user, userRole } = useAuth();
  const [assignedMentors, setAssignedMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSpeechText, setCurrentSpeechText] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessageIndex, setLastMessageIndex] = useState(-1);

  useEffect(() => {
    const fetchMentors = async () => {
      if (!user) return;

      setLoading(true);
      try {
        if (userRole === USER_ROLES.STUDENT) {
          // Fetch mentors assigned to this student
          const mentors = await mentorService.getMentorsByStudent(user.uid);
          setAssignedMentors(mentors);
        } else if (userRole === USER_ROLES.MANAGER) {
          // Fetch mentors assigned to this manager
          const mentors = await mentorService.getMentorsByManager(user.uid);
          setAssignedMentors(mentors);
        } else if (userRole === USER_ROLES.ADMINISTRATOR) {
          // Fetch all mentors
          const mentors = await mentorService.getAllMentors();
          setAssignedMentors(mentors);
        }
      } catch (error) {
        console.error('Error fetching mentors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [user, userRole]);

  // Handle speaking the latest AI message
  useEffect(() => {
    if (!dialogHistory || dialogHistory.length === 0 || isSpeaking) return;
    
    // Find the latest AI message that hasn't been spoken yet
    const aiMessages = dialogHistory.filter(msg => msg.role === 'assistant');
    if (aiMessages.length > 0 && aiMessages.length - 1 > lastMessageIndex) {
      const latestMessage = aiMessages[aiMessages.length - 1];
      // Limit text length to prevent performance issues
      const maxTextLength = 150;
      const truncatedText = latestMessage.content.length > maxTextLength 
        ? latestMessage.content.substring(0, maxTextLength) + '...' 
        : latestMessage.content;
      
      setCurrentSpeechText(truncatedText);
      setIsSpeaking(true);
      setLastMessageIndex(aiMessages.length - 1);
    }
  }, [dialogHistory, isSpeaking, lastMessageIndex]);

  // Handle animation completion
  const handleAnimationComplete = useCallback(() => {
    console.log('Animation completed');
    setIsSpeaking(false);
    setCurrentSpeechText(null);
  }, []);

  // Add a key to force Canvas remount when needed
  const [canvasKey, setCanvasKey] = useState(0);

  // Add a special effect to handle HMR for React Three Fiber
  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;
    
    // This will be our module hot accept handler
    const handleHotUpdate = () => {
      console.log('Hot update detected, preserving Three.js state');
      // We don't need to increment canvasKey here as we're preserving state
    };
    
    // Register for module hot updates
    if (module.hot) {
      module.hot.accept('./AppScene', handleHotUpdate);
      
      // Optional: Force a single remount on initial load to ensure clean state
      if (canvasKey === 0) {
        setTimeout(() => setCanvasKey(1), 100);
      }
    }
    
    return () => {
      // Cleanup if needed
    };
  }, [canvasKey]);

  return (
    <div className="app-scene-container" style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas
        key={canvasKey}
        shadows
        camera={{ position: [0, 1, 3], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ 
          antialias: true,
          preserveDrawingBuffer: true, // Important for HMR
          powerPreference: 'high-performance'
        }}
        onCreated={(state) => {
          // Store references to Three.js objects for HMR
          if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            window.__THREE_FIBER_STORE.scenes.set('main', state.scene);
            window.__THREE_FIBER_STORE.cameras.set('main', state.camera);
            window.__THREE_FIBER_STORE.renderers.set('main', state.gl);
            window.__THREE_FIBER_STORE.canvasProps.set('main', {
              shadows: true,
              camera: { position: [0, 1, 3], fov: 50 }
            });
          }
        }}
      >
        <Suspense fallback={null}>
          <AppSceneCamera 
            intensity={0.1} 
            smoothing={8} 
            orbitRadius={1.5}
            orbitCenter={new THREE.Vector3(0, 0.8, 0)}
            enabled={true}
          />
          <SceneLighting />
          <SceneBackground />
          <SolidFloor />
          
          {/* Replace TalkingHeadAvatar with ClientOnlyTalkingHead */}
          <ClientOnlyTalkingHead 
            isActive={isActive || isSpeaking} 
            intensity={intensity}
            text={currentSpeechText}
            onAnimationComplete={handleAnimationComplete}
            language={language}
          />
          
          {/* Homework panel */}
          {user && <HomeworkPanel studentId={userRole === USER_ROLES.STUDENT ? user.uid : null} />}
          
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.4}
            scale={10}
            blur={1.5}
          />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default AppScene;
