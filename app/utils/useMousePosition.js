import { useState, useEffect } from 'react';

export function useMousePosition() {
  const [mouseX, setMouseX] = useState(null);
  const [mouseY, setMouseY] = useState(null);

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMouseX(event.clientX);
      setMouseY(event.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return { mouseX, mouseY };
}
