"use client";

import { createContext, useContext, useRef } from 'react';
import { useCameraTransitions } from '../hooks/useCameraTransitions';

const SceneContext = createContext(null);

export const SceneProvider = ({ children }) => {
  const cameraRef = useRef();
  const groupRef = useRef();
  const spotlightRef = useRef();
  const spotlightTargetRef = useRef();
  
  const cameraTransitions = useCameraTransitions();
  
  return (
    <SceneContext.Provider value={{
      cameraRef,
      groupRef,
      spotlightRef,
      spotlightTargetRef,
      ...cameraTransitions
    }}>
      {children}
    </SceneContext.Provider>
  );
};

export const useScene = () => {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error('useScene must be used within a SceneProvider');
  }
  return context;
};
