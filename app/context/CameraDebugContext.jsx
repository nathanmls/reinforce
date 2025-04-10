'use client';

import { createContext, useContext, useState } from 'react';

const CameraDebugContext = createContext({
  cameraState: null,
  setCameraState: () => {},
  isDebugVisible: false,
  setIsDebugVisible: () => {},
});

export const useDebugCamera = () => useContext(CameraDebugContext);

export function CameraDebugProvider({ children }) {
  const [cameraState, setCameraState] = useState({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  });
  const [isDebugVisible, setIsDebugVisible] = useState(false);

  return (
    <CameraDebugContext.Provider
      value={{
        cameraState,
        setCameraState,
        isDebugVisible,
        setIsDebugVisible,
      }}
    >
      {children}
    </CameraDebugContext.Provider>
  );
}
