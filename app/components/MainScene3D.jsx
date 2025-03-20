'use client';

import { forwardRef, useEffect, useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import ClientHomeMainScene from './ClientHomeMainScene';
import dynamic from 'next/dynamic';
import { useGLTF, useLoader } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { TextureLoader } from 'three';

// Import ChatInput with client-side only rendering
const ChatInput = dynamic(
  () => import('./ui/ChatInput'),
  { ssr: false }
);

// List of all 3D models to preload
const MODELS_TO_PRELOAD = [
  '/models/GirlChar.glb',
  '/models/carpet.glb'
];

// List of textures to preload
const TEXTURES_TO_PRELOAD = [
  '/images/round-carpet-texture.jpg'
];

// Calculate total assets to load
const TOTAL_ASSETS = MODELS_TO_PRELOAD.length + TEXTURES_TO_PRELOAD.length;

// Preload component to handle asset loading
const AssetPreloader = ({ onProgress }) => {
  // Use a ref to track if assets have been loaded to prevent duplicate loading
  const loadingRef = useRef({
    started: false,
    completed: false,
    assets: {}
  });
  
  // Use a custom loading manager to track progress
  useEffect(() => {
    // Skip if loading has already started or completed
    if (loadingRef.current.started) {
      return;
    }
    
    // Mark loading as started to prevent duplicate loading
    loadingRef.current.started = true;
    
    // Create a loading manager with all callbacks defined
    const manager = new THREE.LoadingManager();
    
    // Track items loaded and total items
    let itemsLoadedCount = 0;
    const totalItems = TOTAL_ASSETS;
    
    // Set up loading manager callbacks
    manager.onStart = (url, itemsLoaded, itemsTotal) => {
      console.log(`[AssetPreloader] Started loading: ${url}`);
    };
    
    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      // Get the actual total (either from the loader or our known total)
      const actualTotal = Math.max(itemsTotal || 0, TOTAL_ASSETS);
      
      // Calculate precise progress percentage (capped at 100)
      const progress = Math.min(Math.round((itemsLoaded / actualTotal) * 100), 100);
      
      // Update loading state with detailed information
      loadingRef.current.assets[url] = { loaded: true, timestamp: Date.now() };
      
      // Report progress to parent component
      if (onProgress && !loadingRef.current.completed) {
        onProgress(progress, {
          url,
          itemsLoaded,
          itemsTotal: actualTotal,
          detail: `Loading asset: ${url.split('/').pop()}`
        });
      }
      
      console.log(`[AssetPreloader] Loading progress: ${progress}%, loaded ${itemsLoaded} of ${actualTotal} assets`);
    };
    
    manager.onLoad = () => {
      // Prevent duplicate completion events
      if (loadingRef.current.completed) return;
      loadingRef.current.completed = true;
      
      if (onProgress) {
        // Report completion with complete flag
        onProgress(100, {
          detail: 'All assets loaded successfully',
          complete: true
        });
      }
      
      console.log('[AssetPreloader] All assets loaded successfully');
    };
    
    manager.onError = (url) => {
      console.error(`[AssetPreloader] Error loading asset: ${url}`);
      
      // Even if there's an error, we want to continue loading other assets
      loadingRef.current.assets[url] = { loaded: false, error: true, timestamp: Date.now() };
      
      // Increment loaded count even for errors to keep progress moving
      itemsLoadedCount++;
      const newProgress = Math.min(Math.round((itemsLoadedCount / totalItems) * 100), 100);
      
      if (onProgress && !loadingRef.current.completed) {
        onProgress(newProgress, {
          url,
          error: true,
          detail: `Error loading: ${url.split('/').pop()} (file not found)`
        });
      }
    };
    
    // Create loaders with the shared manager
    const gltfLoader = new GLTFLoader(manager);
    const textureLoader = new TextureLoader(manager);
    
    // Start loading all models
    MODELS_TO_PRELOAD.forEach(modelPath => {
      gltfLoader.load(
        modelPath, 
        // Only provide success callback, let manager handle progress and errors
        (gltf) => {
          console.log(`[AssetPreloader] Successfully loaded model: ${modelPath}`);
        }
      );
    });
    
    // Start loading all textures
    TEXTURES_TO_PRELOAD.forEach(texturePath => {
      textureLoader.load(
        texturePath,
        // Only provide success callback, let manager handle progress and errors
        (texture) => {
          console.log(`[AssetPreloader] Successfully loaded texture: ${texturePath}`);
        }
      );
    });
    
    // Force completion after a timeout if loading gets stuck
    const forceCompletionTimeout = setTimeout(() => {
      if (!loadingRef.current.completed) {
        console.warn('[AssetPreloader] Force completing asset loading after timeout');
        manager.onLoad();
      }
    }, 10000); // 10 seconds timeout
    
    // Cleanup function
    return () => {
      clearTimeout(forceCompletionTimeout);
    };
  }, [onProgress]); // Only depend on onProgress
  
  return null; // This component doesn't render anything
};

const MainScene3D = forwardRef((props, ref) => {
  // Use refs instead of state to prevent re-renders during loading
  const loadingProgressRef = useRef(0);
  const loadingDetailsRef = useRef({ detail: 'Initializing...' });
  const assetsPreloadedRef = useRef(false);
  
  // Only keep UI-related state that needs to trigger re-renders
  const [showChatInput, setShowChatInput] = useState(false);
  const chatMessageRef = useRef();
  
  // Handle loading progress updates with detailed information
  const handleLoadingProgress = useCallback((progress, details = {}) => {
    // Ensure progress is always between 0 and 100
    const safeProgress = Math.min(Math.max(0, progress), 100);
    
    // Update refs instead of state to prevent re-renders
    loadingProgressRef.current = safeProgress;
    if (details) {
      loadingDetailsRef.current = details;
    }
    
    // Notify parent component about loading progress with detailed information
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sceneLoadingProgress', { 
        detail: { 
          progress: safeProgress,
          ...details
        } 
      }));
    }
    
    // When progress reaches 100%, mark assets as preloaded
    if (safeProgress >= 100 && !assetsPreloadedRef.current) {
      assetsPreloadedRef.current = true;
      
      // Explicitly dispatch a final 100% event to ensure parent knows loading is complete
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sceneLoadingProgress', { 
          detail: { 
            progress: 100,
            detail: 'All assets loaded successfully',
            complete: true
          } 
        }));
      }
    }
  }, []);
  
  // Add debug log to check ref
  useEffect(() => {
    console.log('[MainScene3D] Received ref:', ref);
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
    <div className="w-full h-full">
      {/* We don't need the loading message here anymore since the preloader handles it */}
      
      {/* Canvas Layer */}
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
        <AssetPreloader onProgress={handleLoadingProgress} />
        {/* Don't pass ref directly to ClientHomeMainScene */}
        <ClientHomeMainScene sceneRef={ref} />
      </Canvas>
      
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