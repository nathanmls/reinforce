// useDebugGui.js
'use client';

import { useRef, useEffect } from 'react';

// Move dat.gui import to be dynamic
let datGui = null;

export const createDebugSettings = () => ({
  enableMouseControl: true,
  manualHeadRotation: {
    x: 0,
    y: 0,
  },
  headRotationSpeed: 0.05,
  showDebugPanel: true,
  jawControl: {
    enableAnimation: true,
    manualRotation: 0,
    animationSpeed: 0.1,
    animationAmplitude: 0.1,
    minRotation: -0.5,
    maxRotation: 0.5,
    currentRotation: 0,
  },
  headAnimation: {
    enabled: false,
    speed: 0.5,
    amplitude: 0.3,
  },
  modelControl: {
    enabled: false,
    rotationSpeed: 0.05,
  },
  showBoneHelpers: true,
  environment: {
    showBackground: true,
    backgroundBlur: 0,
    intensity: 1.0,
    exposure: 1.0,
    rotation: 0,
    minIntensity: 0,
    maxIntensity: 2,
    minExposure: 0,
    maxExposure: 2,
    minRotation: 0,
    maxRotation: Math.PI * 2,
  },
});

export const useDebugGui = ({
  settings,
  onHeadRotation,
  onJawControl,
  onBoneHelperToggle,
  onEnvironmentUpdate,
}) => {
  const guiRef = useRef(null);
  const callbacksRef = useRef({
    onHeadRotation,
    onJawControl,
    onBoneHelperToggle,
    onEnvironmentUpdate,
  });
  const settingsRef = useRef(settings);

  // Update refs when callbacks change
  useEffect(() => {
    callbacksRef.current = {
      onHeadRotation,
      onJawControl,
      onBoneHelperToggle,
      onEnvironmentUpdate,
    };
  }, [onHeadRotation, onJawControl, onBoneHelperToggle, onEnvironmentUpdate]);

  // Update settings ref when settings change
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    // Clean up existing GUI if it exists
    if (guiRef.current) {
      guiRef.current.destroy();
      guiRef.current = null;
    }

    const setupGui = async () => {
      try {
        // Dynamically import dat.gui only on the client side
        if (!datGui) {
          datGui = (await import('dat.gui')).GUI;
        }

        // Create GUI instance
        const gui = new datGui({ width: 300 });
        guiRef.current = gui;

        // Position the GUI at the top right
        const guiContainer = gui.domElement.parentElement;
        if (guiContainer) {
          Object.assign(guiContainer.style, {
            position: 'fixed',
            top: '100px',
            right: '16px',
            zIndex: '999999999',
          });
        }

        // Head Rotation Folder
        const headFolder = gui.addFolder('Head Rotation');
        headFolder
          .add(settingsRef.current.manualHeadRotation, 'x', -Math.PI, Math.PI)
          .onChange((value) => {
            callbacksRef.current.onHeadRotation({
              x: value,
              y: settingsRef.current.manualHeadRotation.y,
            });
          });
        headFolder
          .add(settingsRef.current.manualHeadRotation, 'y', -Math.PI, Math.PI)
          .onChange((value) => {
            callbacksRef.current.onHeadRotation({
              x: settingsRef.current.manualHeadRotation.x,
              y: value,
            });
          });
        headFolder.add(settingsRef.current, 'headRotationSpeed', 0, 0.5);
        headFolder.open();

        // Jaw Control Folder
        const jawFolder = gui.addFolder('Jaw Control');
        jawFolder.add(settingsRef.current.jawControl, 'enableAnimation');
        jawFolder
          .add(
            settingsRef.current.jawControl,
            'manualRotation',
            settingsRef.current.jawControl.minRotation,
            settingsRef.current.jawControl.maxRotation
          )
          .onChange((value) => {
            callbacksRef.current.onJawControl(value);
          });
        jawFolder.add(settingsRef.current.jawControl, 'animationSpeed', 0, 0.5);
        jawFolder.add(
          settingsRef.current.jawControl,
          'animationAmplitude',
          0,
          0.5
        );
        jawFolder.open();

        // Bone Helpers Folder
        const helpersFolder = gui.addFolder('Bone Helpers');
        helpersFolder
          .add(settingsRef.current, 'showBoneHelpers')
          .onChange((value) => {
            callbacksRef.current.onBoneHelperToggle(value);
          });
        helpersFolder.open();

        // Environment Folder
        const envFolder = gui.addFolder('Environment');
        envFolder
          .add(settingsRef.current.environment, 'showBackground')
          .onChange((value) => {
            callbacksRef.current.onEnvironmentUpdate({
              ...settingsRef.current.environment,
              showBackground: value,
            });
          });
        envFolder
          .add(settingsRef.current.environment, 'backgroundBlur', 0, 1)
          .onChange((value) => {
            callbacksRef.current.onEnvironmentUpdate({
              ...settingsRef.current.environment,
              backgroundBlur: value,
            });
          });
        envFolder
          .add(
            settingsRef.current.environment,
            'intensity',
            settingsRef.current.environment.minIntensity,
            settingsRef.current.environment.maxIntensity
          )
          .onChange((value) => {
            callbacksRef.current.onEnvironmentUpdate({
              ...settingsRef.current.environment,
              intensity: value,
            });
          });
        envFolder
          .add(
            settingsRef.current.environment,
            'exposure',
            settingsRef.current.environment.minExposure,
            settingsRef.current.environment.maxExposure
          )
          .onChange((value) => {
            callbacksRef.current.onEnvironmentUpdate({
              ...settingsRef.current.environment,
              exposure: value,
            });
          });
        envFolder
          .add(
            settingsRef.current.environment,
            'rotation',
            settingsRef.current.environment.minRotation,
            settingsRef.current.environment.maxRotation
          )
          .onChange((value) => {
            callbacksRef.current.onEnvironmentUpdate({
              ...settingsRef.current.environment,
              rotation: value,
            });
          });
        envFolder.open();
      } catch (error) {
        console.error('Error setting up GUI:', error);
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      setupGui();
    }

    // Cleanup function
    return () => {
      if (guiRef.current) {
        guiRef.current.destroy();
        guiRef.current = null;
      }
    };
  }, []); // Empty dependency array since we're using refs

  return guiRef.current;
};
