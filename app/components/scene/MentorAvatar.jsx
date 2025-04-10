'use client';

import { useEffect, useState } from 'react';
import { animated } from '@react-spring/three';
import { mentorService } from '../../services/mentorService';
import { AVATAR_MODELS } from '../../models/Mentor';
import TiaModel from './TiaModel';
import ProfessorModel from './ProfessorModel';
import CoachModel from './CoachModel';
import AdvisorModel from './AdvisorModel';

const AVATAR_COMPONENTS = {
  [AVATAR_MODELS.TIA]: TiaModel,
  [AVATAR_MODELS.PROFESSOR]: ProfessorModel,
  [AVATAR_MODELS.COACH]: CoachModel,
  [AVATAR_MODELS.ADVISOR]: AdvisorModel,
};

export default function MentorAvatar({
  institutionId,
  position,
  rotation,
  scale,
  opacity,
}) {
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMentor = async () => {
      try {
        const mentors =
          await mentorService.getMentorsByInstitution(institutionId);
        // Use the first mentor for now - you could implement logic to cycle through multiple mentors
        setMentor(mentors[0]);
      } catch (error) {
        console.error('Error loading mentor:', error);
      } finally {
        setLoading(false);
      }
    };

    if (institutionId) {
      loadMentor();
    }
  }, [institutionId]);

  if (loading || !mentor) {
    // Return default TIA model while loading or if no mentor is assigned
    return (
      <animated.group position={position} rotation={rotation} scale={scale}>
        <TiaModel opacity={opacity} />
      </animated.group>
    );
  }

  const AvatarComponent = AVATAR_COMPONENTS[mentor.avatarId] || TiaModel;

  return (
    <animated.group position={position} rotation={rotation} scale={scale}>
      <AvatarComponent opacity={opacity} />
    </animated.group>
  );
}
