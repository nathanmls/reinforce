'use client';

import { useState, useRef, useEffect } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * ThreeDChatInput - A component that renders a chat input form inside the Three.js canvas
 * using drei's HTML component to create a 3D UI element
 * 
 * @param {Object} props
 * @param {Array} props.position - [x,y,z] position coordinates
 * @param {Array} props.rotation - [x,y,z] rotation in radians
 * @param {number|Array} props.scale - Scale factor(s)
 * @param {Function} props.onSendMessage - Callback function when user sends a message
 */
export default function ThreeDChatInput({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  onSendMessage,
}) {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);
  const groupRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (message.trim() === '') return;

    onSendMessage({
      speaker: 'You',
      message: message.trim(),
    });

    setMessage('');
    
    // Focus the input after sending a message
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        inputRef.current.focus();
      }, 300);
    }
  }, []);

  return (
    <group 
      ref={groupRef}
      position={position instanceof THREE.Vector3 ? position : new THREE.Vector3(...position)} 
      rotation={rotation instanceof THREE.Euler ? rotation : new THREE.Euler(...rotation)}
      scale={scale}
    >
      <Html
        transform
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={0.47}
        prepend
        center
        zIndexRange={[100, 0]}
        sprite
        distanceFactor={6}
        style={{
          width: '400px',
          height: 'auto',
          padding: '0',
          background: 'transparent',
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '2px solid rgba(171, 39, 210, 0.8)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '10px 15px',
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              background: 'transparent',
              cursor: 'text',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 15px',
              background: 'rgba(171, 39, 210, 0.8)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            Send
          </button>
        </form>
      </Html>
    </group>
  );
}
