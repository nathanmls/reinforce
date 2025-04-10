'use client';

import { useRef, useState } from 'react';
import { TRANSITION_STATES } from '../components/scene/CameraController';

export const useCameraTransitions = () => {
  const [isWallTransitioned, setIsWallTransitioned] = useState(false);
  const [transitionState, setTransitionState] = useState(
    TRANSITION_STATES.IDLE
  );
  const [transitionError, setTransitionError] = useState(null);
  const [isExplorationMode, setIsExplorationMode] = useState(false);

  // Refs to store methods from CameraController
  const transitionWallMeetTia = useRef(null);
  const reverseWallMeetTiaTransition = useRef(null);
  const getTransitionState = useRef(null);
  const transitionToMeetTiaCloseup = useRef(null);
  const transitionToMeetTiaInitial = useRef(null);

  // State for MeetTia closeup mode
  const [isMeetTiaCloseup, setIsMeetTiaCloseup] = useState(false);

  // Handler for camera controller state changes
  const handleCameraStateChange = ({
    isExplorationMode: newExplorationMode,
    transitionWallMeetTia: newTransitionWallMeetTia,
    reverseWallMeetTiaTransition: newReverseWallMeetTiaTransition,
    getTransitionState: newGetTransitionState,
    transitionState: newTransitionState,
    transitionError: newTransitionError,
    transitionToMeetTiaCloseup: newTransitionToMeetTiaCloseup,
    transitionToMeetTiaInitial: newTransitionToMeetTiaInitial,
    isMeetTiaCloseup: newIsMeetTiaCloseup,
  }) => {
    // Update local state with values from CameraController
    setIsExplorationMode(newExplorationMode);
    setTransitionState(newTransitionState);
    setTransitionError(newTransitionError);

    // Update closeup state if it changed
    if (newIsMeetTiaCloseup !== undefined) {
      setIsMeetTiaCloseup(newIsMeetTiaCloseup);
    }

    // Store methods for external access
    transitionWallMeetTia.current = newTransitionWallMeetTia;
    reverseWallMeetTiaTransition.current = newReverseWallMeetTiaTransition;
    getTransitionState.current = newGetTransitionState;
    transitionToMeetTiaCloseup.current = newTransitionToMeetTiaCloseup;
    transitionToMeetTiaInitial.current = newTransitionToMeetTiaInitial;
  };

  return {
    isWallTransitioned,
    setIsWallTransitioned,
    transitionState,
    transitionError,
    isExplorationMode,
    isMeetTiaCloseup,
    transitionWallMeetTia,
    reverseWallMeetTiaTransition,
    getTransitionState,
    transitionToMeetTiaCloseup,
    transitionToMeetTiaInitial,
    handleCameraStateChange,
  };
};
