'use client';

import { useState, useRef, useEffect } from 'react';

/**
 * ChatInput - A component that renders a chat input form outside the Three.js canvas
 * This follows the best practice of keeping HTML elements separate from Three.js
 */
export default function ChatInput({
  onSendMessage,
  position = { bottom: '20px' },
}) {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() === '') return;

    onSendMessage({
      speaker: 'You',
      message: message.trim(),
    });

    setMessage('');
  };

  // Focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        ...position,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '400px',
        pointerEvents: 'auto',
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
          border: '2px solid rgba(138, 43, 226, 0.8)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          pointerEvents: 'auto',
        }}
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
            pointerEvents: 'auto',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 15px',
            background: 'rgba(138, 43, 226, 0.8)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            pointerEvents: 'auto',
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
