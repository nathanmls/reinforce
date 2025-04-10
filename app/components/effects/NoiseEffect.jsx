'use client';

import { useState, useEffect, useMemo } from 'react';
import { EffectComposer, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

/**
 * NoiseEffect - A customizable static or animated noise effect for Three.js scenes
 *
 * @param {Object} props
 * @param {number} props.intensity - Intensity of the noise effect (0.0 to 1.0)
 * @param {number} props.frequency - Frequency/scale of the noise pattern
 * @param {boolean} props.animated - Whether the noise should be animated
 * @param {string} props.blendMode - Blend mode for the noise effect ('normal', 'multiply', etc.)
 */
export default function NoiseEffect({
  intensity = 0.55,
  frequency = 4.0,
  animated = false,
  blendMode = 'multiply',
}) {
  const [isMounted, setIsMounted] = useState(false);

  // Generate a fixed random seed for static noise
  const [seed] = useState(() => Math.random() * 100);

  // Map blend mode string to BlendFunction
  const blendFunction = useMemo(() => {
    const blendMap = {
      normal: BlendFunction.NORMAL,
      add: BlendFunction.ADD,
      subtract: BlendFunction.SUBTRACT,
      multiply: BlendFunction.MULTIPLY,
      overlay: BlendFunction.OVERLAY,
      screen: BlendFunction.SCREEN,
      'soft-light': BlendFunction.SOFT_LIGHT,
    };
    return blendMap[blendMode.toLowerCase()] || BlendFunction.MULTIPLY;
  }, [blendMode]);

  // Handle client-side only rendering
  useEffect(() => {
    setIsMounted(true);
    return () => {};
  }, []);

  // Don't render anything on the server
  if (!isMounted) {
    return null;
  }

  return (
    <EffectComposer>
      <Noise
        premultiply
        blendFunction={blendFunction}
        opacity={intensity}
        seed={animated ? undefined : seed} // Use fixed seed for static noise, undefined for animated
        frequency={frequency}
      />
    </EffectComposer>
  );
}
