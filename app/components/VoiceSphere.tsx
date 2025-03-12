'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { mentorService } from '../services/mentorService';
import { AVATAR_MODELS } from '../models/Mentor';
import MariaModel from './scene/MariaModel';
import CarlosModel from './scene/CarlosModel';
import SofiaModel from './scene/SofiaModel';
import PedroModel from './scene/PedroModel';

const AVATAR_COMPONENTS = {
  [AVATAR_MODELS.MARIA]: MariaModel,
  [AVATAR_MODELS.CARLOS]: CarlosModel,
  [AVATAR_MODELS.SOFIA]: SofiaModel,
  [AVATAR_MODELS.PEDRO]: PedroModel,
};

interface VoiceSphereProps {
  intensity: number;
  institutionId?: string;
}

export function VoiceSphere({ intensity, institutionId }: VoiceSphereProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMentor = async () => {
      if (!institutionId) {
        setLoading(false);
        return;
      }

      try {
        const mentors = await mentorService.getMentorsByInstitution(institutionId);
        setMentor(mentors[0]); // Use first mentor for now
      } catch (error) {
        console.error('Error loading mentor:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMentor();
  }, [institutionId]);

  useFrame(() => {
    if (groupRef.current) {
      const scale = 1 + intensity * 0.5;
      groupRef.current.scale.set(scale, scale, scale);
      groupRef.current.rotation.y += 0.01;
    }
  });

  // If no institution ID or loading, show default sphere
  if (!institutionId || loading || !mentor) {
    return (
      <Sphere ref={groupRef} args={[1, 32, 32]}>
        <meshPhongMaterial
          color="#4b0082"
          emissive="#320755"
          specular="#ffffff"
          shininess={50}
          wireframe={true}
        />
      </Sphere>
    );
  }

  // Use the appropriate avatar component
  const AvatarComponent = AVATAR_COMPONENTS[mentor.avatarId] || AVATAR_COMPONENTS[AVATAR_MODELS.MARIA];

  return (
    <group ref={groupRef} scale={[0.5, 0.5, 0.5]}>
      <AvatarComponent />
    </group>
  );
}
