'use client';

import { useEffect } from 'react';
import { useDebugCamera } from '../../context/CameraDebugContext';
import { useAuth } from '../../context/AuthContext';

export default function CameraDebug() {
  const { userRole } = useAuth();
  const { cameraState, isDebugVisible, setIsDebugVisible } = useDebugCamera();

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === 'c' && userRole === 'administrator') {
        setIsDebugVisible(prev => !prev);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [setIsDebugVisible, userRole]);

  if (!isDebugVisible || userRole !== 'administrator') return null;

  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg font-mono text-sm z-50">
      <h3 className="font-bold mb-2">Camera Debug</h3>
      <div>
        <div className="mb-2">
          <div className="text-gray-400">Position:</div>
          <div>x: {cameraState.position.x}</div>
          <div>y: {cameraState.position.y}</div>
          <div>z: {cameraState.position.z}</div>
        </div>
        <div>
          <div className="text-gray-400">Rotation:</div>
          <div>x: {cameraState.rotation.x}</div>
          <div>y: {cameraState.rotation.y}</div>
          <div>z: {cameraState.rotation.z}</div>
        </div>
      </div>
    </div>
  );
}
