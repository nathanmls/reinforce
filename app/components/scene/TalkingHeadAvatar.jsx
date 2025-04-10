'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { useAuth } from '../../context/AuthContext';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { translations } from '@/translations';
import Script from 'next/script';

// TalkingHead will be loaded dynamically on the client side
let TalkingHead = null;

// Preload the brunette model
useGLTF.preload('/models/brunette.glb');

// BrunetteModel component - this will be used as a fallback if TalkingHead fails
function BrunetteModel({ scale = 1 }) {
  const { scene } = useGLTF('/models/brunette.glb');
  
  // Clone the scene to avoid issues when the model is used in multiple places
  const modelScene = useRef(scene.clone());
  
  useEffect(() => {
    // Apply any model-specific adjustments here if needed
    modelScene.current.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
  }, []);
  
  return (
    <primitive 
      object={modelScene.current} 
      scale={scale} 
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

export default function TalkingHeadAvatar({
  isActive = false,
  intensity = 1,
  audioData = null,
  text = null,
  onAnimationComplete = null,
  language = 'en', // Default language
}) {
  const containerRef = useRef();
  const headRef = useRef(null);
  const avatarContainerRef = useRef(null);
  const { user } = useAuth();
  const { scene } = useThree();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  // Get translations based on language prop
  const t = translations[language] || translations.en;
  const locale = language; // Use language prop as locale

  // Map languages to voice settings
  const getVoiceSettings = useCallback((lang) => {
    const settings = {
      'en': {
        ttsLang: 'en-US',
        ttsVoice: 'en-US-Standard-D',
        lipsyncLang: 'en'
      },
      'pt': {
        ttsLang: 'pt-BR',
        ttsVoice: 'pt-BR-Standard-A',
        lipsyncLang: 'en' // Fallback to English lip-sync
      }
    };
    return settings[lang] || settings['en']; // Default to English
  }, []);

  // Handle script loading
  const handleScriptLoad = useCallback(() => {
    setScriptLoaded(true);
  }, []);

  // Load TalkingHead library dynamically
  useEffect(() => {
    if (typeof window === 'undefined' || !scriptLoaded) return;

    const loadTalkingHeadModule = async () => {
      try {
        // Dynamically import the TalkingHead module from the public directory
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = `
          import * as THREE from 'three';
          import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
          import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
          import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
          import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
          
          // Load TalkingHead module
          const talkingHeadModule = await import('/modules/talkinghead.mjs');
          window.TalkingHeadModule = talkingHeadModule;
        `;
        
        document.head.appendChild(script);
        
        // Wait for the module to load
        const checkInterval = setInterval(() => {
          if (window.TalkingHeadModule) {
            clearInterval(checkInterval);
            TalkingHead = window.TalkingHeadModule.TalkingHead;
            setIsLoaded(true);
          }
        }, 100);
        
        // Set a timeout to prevent infinite checking
        setTimeout(() => {
          clearInterval(checkInterval);
          if (!window.TalkingHeadModule) {
            console.error('Failed to load TalkingHead module: Timeout');
            setLoadFailed(true);
          }
        }, 10000);
        
        return () => {
          clearInterval(checkInterval);
          if (script && document.head.contains(script)) {
            document.head.removeChild(script);
          }
        };
      } catch (error) {
        console.error('Failed to load TalkingHead module:', error);
        setLoadFailed(true);
      }
    };
    
    loadTalkingHeadModule();
  }, [scriptLoaded]);

  // Initialize TalkingHead when the component mounts
  useEffect(() => {
    if (!isLoaded || !containerRef.current || isInitialized || loadFailed || !TalkingHead) return;

    // Create a container for the TalkingHead
    if (!avatarContainerRef.current) {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.overflow = 'hidden';
      container.style.opacity = '0';
      document.body.appendChild(container);
      avatarContainerRef.current = container;
    }

    const initTalkingHead = async () => {
      try {
        // Get voice settings based on language
        const voiceSettings = getVoiceSettings(locale);
        
        // Initialize TalkingHead
        const head = new TalkingHead(avatarContainerRef.current, {
          // TTS settings
          ttsEndpoint: "/api/tts",
          ttsLang: voiceSettings.ttsLang,
          ttsVoice: voiceSettings.ttsVoice,
          lipsyncLang: voiceSettings.lipsyncLang,
          lipsyncModules: ['en', 'fi'], // Load only needed modules
          
          // Configure avatar appearance
          cameraView: 'head',
          modelFPS: 30,
          
          // Configure lighting
          lightAmbientColor: 0xffffff,
          lightAmbientIntensity: 2,
          lightDirectColor: 0x8888aa,
          lightDirectIntensity: 30,
          
          // Configure avatar behavior
          avatarMood: 'neutral',
          avatarIdleEyeContact: 0.3,
          avatarIdleHeadMove: 0.5,
          avatarSpeakingEyeContact: 0.7,
          avatarSpeakingHeadMove: 0.7,
        });

        // Store the instance
        headRef.current = head;
        
        // Load the avatar model
        await head.showAvatar({
          url: '/models/brunette.glb',
          body: 'F', // Female body type
          avatarMood: 'neutral',
          lipsyncLang: voiceSettings.lipsyncLang,
          ttsLang: voiceSettings.ttsLang,
          ttsVoice: voiceSettings.ttsVoice
        }, (ev) => {
          console.log('Loading progress:', ev.loaded / ev.total * 100);
        });

        // Set initialized flag
        setIsInitialized(true);
        
        console.log('TalkingHead initialized successfully');
      } catch (error) {
        console.error('Failed to initialize TalkingHead:', error);
        setLoadFailed(true);
      }
    };

    initTalkingHead();

    // Cleanup function
    return () => {
      if (headRef.current) {
        headRef.current.stop();
        headRef.current = null;
      }
      if (avatarContainerRef.current && document.body.contains(avatarContainerRef.current)) {
        document.body.removeChild(avatarContainerRef.current);
        avatarContainerRef.current = null;
      }
    };
  }, [isLoaded, isInitialized, locale, loadFailed, getVoiceSettings]);

  // Handle speaking when text changes
  useEffect(() => {
    if (!isInitialized || !headRef.current || !text || isSpeaking) return;
    
    const speakText = async () => {
      try {
        setIsSpeaking(true);
        
        // Make the avatar speak
        await headRef.current.speakText(text, {
          avatarMood: isActive ? 'happy' : 'neutral',
          onsubtitles: (subtitle) => {
            console.log('Subtitle:', subtitle);
          }
        });
        
        // Call the completion callback if provided
        if (onAnimationComplete) {
          onAnimationComplete();
        }
        
        setIsSpeaking(false);
      } catch (error) {
        console.error('Error making avatar speak:', error);
        setIsSpeaking(false);
        
        // Call the completion callback even if there's an error
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }
    };
    
    speakText();
  }, [text, isActive, isInitialized, onAnimationComplete, isSpeaking]);

  // Handle animation based on activity state
  useEffect(() => {
    if (!isInitialized || !headRef.current) return;
    
    if (isActive) {
      // When active, make the avatar look at the camera
      headRef.current.makeEyeContact(2000);
      headRef.current.setMood('happy');
    } else {
      // When inactive, return to neutral state
      headRef.current.lookAhead(1000);
      headRef.current.setMood('neutral');
    }
  }, [isActive, isInitialized]);

  // If the TalkingHead library failed to load, fall back to the brunette model
  if (loadFailed) {
    // Call the animation complete callback if text was provided
    if (text && onAnimationComplete) {
      // Use setTimeout to simulate the time it would take to speak the text
      setTimeout(() => {
        onAnimationComplete();
      }, text.length * 50); // Rough estimate: 50ms per character
    }
    
    return (
      <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <BrunetteModel scale={1.5} />
      </group>
    );
  }

  // We're using the TalkingHead library for audio and animation, but we still need to render the 3D model
  // in our Three.js scene for visual representation
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/es-module-shims@1.7.1/dist/es-module-shims.js"
        onLoad={handleScriptLoad}
        strategy="beforeInteractive"
      />
      <Script
        id="importmap"
        type="importmap"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            imports: {
              'three': 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js/+esm',
              'three/addons/': 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/'
            }
          })
        }}
        strategy="beforeInteractive"
      />
      <group ref={containerRef}>
        <BrunetteModel scale={1.5} />
      </group>
    </>
  );
}
