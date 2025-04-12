'use client';

import { forwardRef, useEffect, useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import ClientHomeMainScene from './ClientHomeMainScene';
import dynamic from 'next/dynamic';
import { useGLTF, useLoader } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

// List of all 3D models to preload
const MODELS_TO_PRELOAD = [
  // Critical models (high priority - load first)
  { path: '/models/girl-char.glb', priority: 'high' },
];

// Calculate total assets to load
const TOTAL_ASSETS = MODELS_TO_PRELOAD.length;

// Cache for loaded assets to prevent duplicate loading
const assetCache = typeof window !== 'undefined' ? new Map() : null;

// Preload component to handle asset loading
const AssetPreloader = ({ onProgress }) => {
  // Use a ref to track if assets have been loaded to prevent duplicate loading
  const loadingRef = useRef({
    started: false,
    completed: false,
    assets: {},
    lastReportedProgress: 0
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
      const progress = Math.min(
        Math.round((itemsLoaded / actualTotal) * 100),
        100
      );

      // Add intermediate progress reports for smoother loading experience
      // This creates more progress events even when actual loading hasn't changed
      if (progress > loadingRef.current.lastReportedProgress + 5 || progress === 100) {
        // Update loading state with detailed information
        loadingRef.current.assets[url] = { loaded: true, timestamp: Date.now() };
        loadingRef.current.lastReportedProgress = progress;

        // Report progress to parent component
        if (onProgress && !loadingRef.current.completed) {
          onProgress(progress, {
            url,
            itemsLoaded,
            itemsTotal: actualTotal,
            detail: `Loading asset: ${url.split('/').pop()}`,
          });
        }

        console.log(
          `[AssetPreloader] Loading progress: ${progress}%, loaded ${itemsLoaded} of ${actualTotal} assets`
        );
      } else {
        // For smaller progress increments, create artificial progress points
        // This helps provide a smoother loading experience
        const artificialProgress = loadingRef.current.lastReportedProgress + 2;
        if (artificialProgress < progress) {
          setTimeout(() => {
            if (!loadingRef.current.completed) {
              onProgress(artificialProgress, {
                detail: `Processing assets...`,
                artificialStep: true
              });
              loadingRef.current.lastReportedProgress = artificialProgress;
            }
          }, 200);
        }
      }
    };

    manager.onLoad = () => {
      // Prevent duplicate completion events
      if (loadingRef.current.completed) return;
      loadingRef.current.completed = true;

      if (onProgress) {
        // Report completion with complete flag
        onProgress(100, {
          detail: 'All assets loaded successfully',
          complete: true,
        });
      }

      console.log('[AssetPreloader] All assets loaded successfully');
    };

    manager.onError = (url) => {
      console.error(`[AssetPreloader] Error loading asset: ${url}`);

      // Even if there's an error, we want to continue loading other assets
      loadingRef.current.assets[url] = {
        loaded: false,
        error: true,
        timestamp: Date.now(),
      };

      // Increment loaded count even for errors to keep progress moving
      itemsLoadedCount++;
      const newProgress = Math.min(
        Math.round((itemsLoadedCount / totalItems) * 100),
        100
      );

      if (onProgress && !loadingRef.current.completed) {
        onProgress(newProgress, {
          url,
          error: true,
          detail: `Error loading: ${url.split('/').pop()} (file not found)`,
        });
      }
    };

    // Create loaders with the shared manager
    const gltfLoader = new GLTFLoader(manager);

    // Helper function to check cache before loading
    const loadAsset = (loader, path, priority) => {
      // Check if asset is already in cache
      if (assetCache && assetCache.has(path)) {
        console.log(`[AssetPreloader] Using cached asset: ${path}`);
        // Simulate progress event for cached assets
        setTimeout(() => {
          itemsLoadedCount++;
          const newProgress = Math.min(
            Math.round((itemsLoadedCount / totalItems) * 100),
            100
          );
          onProgress(newProgress, {
            url: path,
            itemsLoaded: itemsLoadedCount,
            itemsTotal: totalItems,
            detail: `Using cached: ${path.split('/').pop()}`,
            cached: true,
          });
          
          // If all items are loaded from cache, trigger onLoad
          if (itemsLoadedCount >= totalItems && !loadingRef.current.completed) {
            manager.onLoad();
          }
        }, 0);
        return assetCache.get(path);
      }

      // Load the asset
      loader.load(
        path,
        (asset) => {
          console.log(`[AssetPreloader] Successfully loaded: ${path}`);
          // Cache the loaded asset
          if (assetCache) {
            assetCache.set(path, asset);
          }
        }
      );
    };

    // Load assets in priority order (high, medium, low)
    const loadAssetsByPriority = (assets, loader, priority) => {
      return assets
        .filter(asset => asset.priority === priority)
        .forEach(asset => loadAsset(loader, asset.path, asset.priority));
    };

    // First load high priority assets
    loadAssetsByPriority(MODELS_TO_PRELOAD, gltfLoader, 'high');

    // Then load medium priority assets with a slight delay
    setTimeout(() => {
      loadAssetsByPriority(MODELS_TO_PRELOAD, gltfLoader, 'medium');
    }, 100);

    // Force completion after a timeout if loading gets stuck
    const forceCompletionTimeout = setTimeout(() => {
      if (!loadingRef.current.completed) {
        console.warn(
          '[AssetPreloader] Force completing asset loading after timeout'
        );
        manager.onLoad();
      }
    }, 7000); // Reduced from 10 seconds to 7 seconds

    // Cleanup function
    return () => {
      clearTimeout(forceCompletionTimeout);
    };
  }, [onProgress]); // Only depend on onProgress

  // Add resource hints for critical assets
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Add preload hints for high priority assets
    const addResourceHint = (url, as) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = as;
      document.head.appendChild(link);
    };

    // Preload high priority models
    MODELS_TO_PRELOAD
      .filter(asset => asset.priority === 'high')
      .forEach(asset => addResourceHint(asset.path, 'fetch'));
    
    return () => {
      // Clean up resource hints when component unmounts
      document.querySelectorAll('link[rel="preload"]').forEach(el => {
        if (el.as === 'fetch' || el.as === 'image') {
          el.remove();
        }
      });
    };
  }, []);

  return null; // This component doesn't render anything
};

const MainScene3D = forwardRef((props, ref) => {
  // Use refs instead of state to prevent re-renders during loading
  const loadingProgressRef = useRef(0);
  const loadingDetailsRef = useRef({ detail: 'Initializing...' });
  const assetsPreloadedRef = useRef(false);

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
      window.dispatchEvent(
        new CustomEvent('sceneLoadingProgress', {
          detail: {
            progress: safeProgress,
            ...details,
          },
        })
      );
    }

    // When progress reaches 100%, mark assets as preloaded
    if (safeProgress >= 100 && !assetsPreloadedRef.current) {
      assetsPreloadedRef.current = true;

      // Explicitly dispatch a final 100% event to ensure parent knows loading is complete
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('sceneLoadingProgress', {
            detail: {
              progress: 100,
              detail: 'All assets loaded successfully',
              complete: true,
            },
          })
        );
      }
    }
  }, []);

  // Create artificial progress steps to prevent jumping from 30% to 100%
  useEffect(() => {
    if (!assetsPreloadedRef.current) {
      // Start artificial progress after a short delay
      const startDelay = setTimeout(() => {
        // Create artificial progress steps
        const progressSteps = [35, 42, 50, 58, 65, 72, 80, 88, 95];
        let stepIndex = 0;
        
        const progressInterval = setInterval(() => {
          // Stop if assets are already loaded or we've reached the end of our steps
          if (assetsPreloadedRef.current || stepIndex >= progressSteps.length) {
            clearInterval(progressInterval);
            return;
          }
          
          // Only dispatch artificial progress if real progress hasn't caught up
          if (loadingProgressRef.current < progressSteps[stepIndex]) {
            // Dispatch artificial progress event
            window.dispatchEvent(
              new CustomEvent('sceneLoadingProgress', {
                detail: {
                  progress: progressSteps[stepIndex],
                  detail: 'Processing assets...',
                  artificial: true,
                },
              })
            );
            
            console.log(`[MainScene3D] Artificial progress: ${progressSteps[stepIndex]}%`);
          }
          
          stepIndex++;
        }, 500); // Update every 500ms for smooth progression
        
        // Clean up interval
        return () => {
          clearInterval(progressInterval);
          clearTimeout(startDelay);
        };
      }, 1000); // Start after 1 second
      
      return () => clearTimeout(startDelay);
    }
  }, []);

  // Add debug log to check ref
  useEffect(() => {
    console.log('[MainScene3D] Received ref:', ref);
    
    // Expose the scene reference to the window object for the 3D button to access
    if (typeof window !== 'undefined') {
      window.sceneRef = ref;
    }
    
    return () => {
      // Clean up when component unmounts
      if (typeof window !== 'undefined') {
        window.sceneRef = undefined;
      }
    };
  }, [ref]);

  // Expose the chatMessageRef to the global window object for communication
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Listen for scene state changes
      const handleSceneStateChange = (event) => {
        if (event.detail && event.detail.isMeetTiaCloseup !== undefined) {
        }
      };

      // Listen for meet Tia actions from the 3D scene
      const handleMeetTiaAction = (event) => {
        if (event.detail && event.detail.action === 'beginCloseup') {
          console.log('[MainScene3D] Received beginCloseup action');
          // Call the transition function if available on the ref
          if (ref.current && ref.current.transitionToMeetTiaCloseup) {
            ref.current.transitionToMeetTiaCloseup();
          }
        }
      };

      window.addEventListener('sceneStateChange', handleSceneStateChange);
      window.addEventListener('meetTiaAction', handleMeetTiaAction);

      return () => {
        window.removeEventListener('sceneStateChange', handleSceneStateChange);
        window.removeEventListener('meetTiaAction', handleMeetTiaAction);
      };
    }
  }, [ref]);

  return (
    <div className="w-full h-full">
      {/* We don't need the loading message here anymore since the preloader handles it */}

      {/* Canvas Layer */}
      <Canvas
        camera={{
          position: [-5, -7, 8],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
        shadows
        style={{ width: '100%', height: '100%' }}
      >
        <AssetPreloader onProgress={handleLoadingProgress} />
        {/* Don't pass ref directly to ClientHomeMainScene */}
        <ClientHomeMainScene sceneRef={ref} />
      </Canvas>

      {/* 3D Chat input is now handled by the ClientOnly3DChatInput component in the MeetTiaSection */}
    </div>
  );
});

MainScene3D.displayName = 'MainScene3D';

export default MainScene3D;
