'use client';

import { RoundedBox, useTexture } from '@react-three/drei';
import { useEffect } from 'react';
import * as THREE from 'three';

const TeacherCallImage = () => {
  // Load the texture
  const texture = useTexture('/images/teacher-call.jpg');
  
  // Configure texture properties
  texture.repeat.set(0, 0); // Scale: values < 1 stretch, values > 1 tile
  texture.offset.set(0, 0); // Position: shifts texture (0,0 is center)
  texture.rotation = 0; // Rotation in radians
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; // Allow texture to repeat
  
  // Ensure the texture is properly loaded
  if (texture) {
    // Adjust aspect ratio to match the box dimensions (optional)
    const aspectCorrection = true;
    if (aspectCorrection && texture.image) {
      const imageAspect = texture.image.width / texture.image.height;
      const boxAspect = 4 / 2; // from args[0] / args[1]
      
      if (imageAspect > boxAspect) {
        // Image is wider than box, adjust Y scale
        texture.repeat.set(1, boxAspect / imageAspect);
        texture.offset.set(0, (1 - texture.repeat.y) / 2);
      } else {
        // Image is taller than box, adjust X scale
        texture.repeat.set(imageAspect / boxAspect, 1);
        texture.offset.set((1 - texture.repeat.x) / 2, 0);
      }
    }
  }
  
  return (
    <group>
      {/* Background frame */}
      <RoundedBox
        args={[3.1, 2.1, 0.1]}
        radius={0.05}
        smoothness={4}
        bevelSegments={4}
        creaseAngle={0.4}
      >
        <meshStandardMaterial color="#333333" />
      </RoundedBox>
      
      {/* Image plane - positioned slightly in front of the frame */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial 
          map={texture} 
          toneMapped={false} // Preserve colors
        />
      </mesh>
    </group>
  );
};

export default TeacherCallImage;
