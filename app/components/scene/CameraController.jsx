"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useDebugCamera } from "@/context/CameraDebugContext";
import useAdminCamera from "../../hooks/useAdminCamera";

// Simplified transition states
export const TRANSITION_STATES = {
  IDLE: 'idle',
  TRANSITIONING: 'transitioning',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Camera state positions and rotations
export const CAMERA_STATES = {
  hero: {
    position: { x: 0, y: 2, z: 10 },
    rotation: { x: 0, y: Math.PI / 10, z: 0 },
  },
  welcome: {
    position: { x: 4, y: -7, z: 10 },
    rotation: { x: 0, y: Math.PI / 4.5, z: 0 },
  },
  mentor: {
    position: { x: -5, y: -7, z: 8 },
    rotation: { x: 0, y: Math.PI * -0.28, z: 0 },
  },
  meetTia: {
    position: { x: 0, y: -7, z: 2 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  // Initial position for MeetTia section
  meetTiaInitial: {
    position: { x: 0, y: -7, z: 2 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  // Closeup position for MeetTia section (when Let's Begin is clicked)
  meetTiaClose: {
    position: { x: 0, y: -7, z: 2 }, // Moved closer to the portal (negative z value)
    rotation: { x: 0, y: 0, z: 0 },
  },
  meetTiaFinal: {
    position: { x: 0, y: -10, z: 3 },
    rotation: { x: 0, y: 0, z: 0 },
  },
};

const CameraController = ({
  cameraRef,
  groupRef,
  spotlightRef,
  spotlightTargetRef,
  userRole,
  scrollProgress,
  onCameraStateChange,
  updatePortalCloseupState, // Renamed to avoid conflict with local state setter
}) => {
  const { setCameraState } = useDebugCamera();
  const initialCameraState = useRef(null);
  const [isExplorationMode, setIsExplorationMode] = useState(false);
  const [isWallTransitioned, setIsWallTransitioned] = useState(false);
  const [targetCameraPosition, setTargetCameraPosition] = useState(null);
  const [targetQuaternion, setTargetQuaternion] = useState(null);
  const [transitionState, setTransitionState] = useState(TRANSITION_STATES.IDLE);
  const [transitionError, setTransitionError] = useState(null);
  const [isMeetTiaCloseup, setIsMeetTiaCloseup] = useState(false);

  const { heroProgress, welcomeProgress, mentorProgress, meetTiaProgress, comingSoonProgress } = scrollProgress;

  // Optimized exploration mode handler
  const toggleExplorationMode = (e) => {
    if (e.key.toLowerCase() === "r" && userRole === "administrator") {
      setIsExplorationMode((prev) => {
        if (prev) {
          // Restore camera state when exiting exploration mode
          if (initialCameraState.current) {
            cameraRef.current.position.set(
              initialCameraState.current.position.x,
              initialCameraState.current.position.y,
              initialCameraState.current.position.z
            );
            cameraRef.current.rotation.set(
              initialCameraState.current.rotation.x,
              initialCameraState.current.rotation.y,
              initialCameraState.current.rotation.z
            );
          }
        } else {
          // Save current camera state when entering exploration mode
          initialCameraState.current = {
            position: {
              x: cameraRef.current.position.x,
              y: cameraRef.current.position.y,
              z: cameraRef.current.position.z,
            },
            rotation: {
              x: cameraRef.current.rotation.x,
              y: cameraRef.current.rotation.y,
              z: cameraRef.current.rotation.z,
            },
          };
        }
        return !prev;
      });
    }
  };

  useEffect(() => {
    window.addEventListener("keypress", toggleExplorationMode);
    return () => window.removeEventListener("keypress", toggleExplorationMode);
  }, [userRole]);

  // Update camera state for debugging
  useEffect(() => {
    if (cameraRef.current) {
      setCameraState({
        position: {
          x: cameraRef.current.position.x,
          y: cameraRef.current.position.y,
          z: cameraRef.current.position.z,
        },
        rotation: {
          x: cameraRef.current.rotation.x,
          y: cameraRef.current.rotation.y,
          z: cameraRef.current.rotation.z,
        },
      });
    }
  }, [isExplorationMode, cameraRef, setCameraState]);

  // Memoized admin camera update for keyboard navigation
  const updateAdminCamera = useAdminCamera(
    cameraRef.current,
    isExplorationMode,
    userRole
  );

  // Store initial camera state
  useEffect(() => {
    if (cameraRef.current && !initialCameraState.current) {
      initialCameraState.current = {
        position: { ...cameraRef.current.position },
        rotation: { ...cameraRef.current.rotation },
      };
    }
  }, [cameraRef]);

  // Monitor transition state changes
  useEffect(() => {
    if (transitionState === TRANSITION_STATES.FAILED) {
      console.error('Transition failed:', transitionError);
    }
  }, [transitionState, transitionError]);

  // Monitor scroll position to reset camera when leaving MeetTia section
  useEffect(() => {
    // If we're in closeup mode but scrolled away from MeetTia section, reset the camera
    if (isMeetTiaCloseup && mentorProgress < 0.7) {
      setIsMeetTiaCloseup(false);
      if (updatePortalCloseupState) updatePortalCloseupState(false);
    }
  }, [mentorProgress, isMeetTiaCloseup, updatePortalCloseupState]);

  // Main animation frame
  useFrame(() => {
    if (!cameraRef.current) return;

    // Update admin camera controls for keyboard navigation
    updateAdminCamera();

    // Only apply section transitions if not in exploration mode
    if (!isExplorationMode) {
      // Base camera state starts at hero
      let targetPosition = { ...CAMERA_STATES.hero.position };
      let targetRotation = { ...CAMERA_STATES.hero.rotation };

      // Hero to Welcome transition
      if (heroProgress > 0 && comingSoonProgress < 1) {
        targetPosition = {
          x: THREE.MathUtils.lerp(
            CAMERA_STATES.hero.position.x,
            CAMERA_STATES.welcome.position.x,
            heroProgress
          ),
          y: THREE.MathUtils.lerp(
            CAMERA_STATES.hero.position.y,
            CAMERA_STATES.welcome.position.y,
            heroProgress
          ),
          z: THREE.MathUtils.lerp(
            CAMERA_STATES.hero.position.z,
            CAMERA_STATES.welcome.position.z,
            heroProgress
          ),
        };
        targetRotation = {
          x: THREE.MathUtils.lerp(
            CAMERA_STATES.hero.rotation.x,
            CAMERA_STATES.welcome.rotation.x,
            heroProgress
          ),
          y: THREE.MathUtils.lerp(
            CAMERA_STATES.hero.rotation.y,
            CAMERA_STATES.welcome.rotation.y,
            heroProgress
          ),
          z: THREE.MathUtils.lerp(
            CAMERA_STATES.hero.rotation.z,
            CAMERA_STATES.welcome.rotation.z,
            heroProgress
          ),
        };
      }

      // Welcome to Mentor transition
      if (welcomeProgress > 0) {
        targetPosition = {
          x: THREE.MathUtils.lerp(
            CAMERA_STATES.welcome.position.x,
            CAMERA_STATES.mentor.position.x,
            welcomeProgress
          ),
          y: THREE.MathUtils.lerp(
            CAMERA_STATES.welcome.position.y,
            CAMERA_STATES.mentor.position.y,
            welcomeProgress
          ),
          z: THREE.MathUtils.lerp(
            CAMERA_STATES.welcome.position.z,
            CAMERA_STATES.mentor.position.z,
            welcomeProgress
          ),
        };
        targetRotation = {
          x: THREE.MathUtils.lerp(
            CAMERA_STATES.welcome.rotation.x,
            CAMERA_STATES.mentor.rotation.x,
            welcomeProgress
          ),
          y: THREE.MathUtils.lerp(
            CAMERA_STATES.welcome.rotation.y,
            CAMERA_STATES.mentor.rotation.y,
            welcomeProgress
          ),
          z: THREE.MathUtils.lerp(
            CAMERA_STATES.welcome.rotation.z,
            CAMERA_STATES.mentor.rotation.z,
            welcomeProgress
          ),
        };
      }

      // Mentor to MeetTia transition
      if (mentorProgress > 0) {
        targetPosition = {
          x: THREE.MathUtils.lerp(
            CAMERA_STATES.mentor.position.x,
            CAMERA_STATES.meetTia.position.x,
            mentorProgress
          ),
          y: THREE.MathUtils.lerp(
            CAMERA_STATES.mentor.position.y,
            CAMERA_STATES.meetTia.position.y,
            mentorProgress
          ),
          z: THREE.MathUtils.lerp(
            CAMERA_STATES.mentor.position.z,
            CAMERA_STATES.meetTia.position.z,
            mentorProgress
          ),
        };
        targetRotation = {
          x: THREE.MathUtils.lerp(
            CAMERA_STATES.mentor.rotation.x,
            CAMERA_STATES.meetTia.rotation.x,
            mentorProgress
          ),
          y: THREE.MathUtils.lerp(
            CAMERA_STATES.mentor.rotation.y,
            CAMERA_STATES.meetTia.rotation.y,
            mentorProgress
          ),
          z: THREE.MathUtils.lerp(
            CAMERA_STATES.mentor.rotation.z,
            CAMERA_STATES.meetTia.rotation.z,
            mentorProgress
          ),
        };
      }

      // Final MeetTia adjustments
      if (meetTiaProgress > 0) {
        targetPosition = {
          x: THREE.MathUtils.lerp(
            CAMERA_STATES.meetTia.position.x,
            CAMERA_STATES.meetTiaFinal.position.x,
            meetTiaProgress
          ),
          y: THREE.MathUtils.lerp(
            CAMERA_STATES.meetTia.position.y,
            CAMERA_STATES.meetTiaFinal.position.y,
            meetTiaProgress
          ),
          z: THREE.MathUtils.lerp(
            CAMERA_STATES.meetTia.position.z,
            CAMERA_STATES.meetTiaFinal.position.z,
            meetTiaProgress
          ),
        };
        targetRotation = {
          x: THREE.MathUtils.lerp(
            CAMERA_STATES.meetTia.rotation.x,
            CAMERA_STATES.meetTiaFinal.rotation.x,
            meetTiaProgress
          ),
          y: THREE.MathUtils.lerp(
            CAMERA_STATES.meetTia.rotation.y,
            CAMERA_STATES.meetTiaFinal.rotation.y,
            meetTiaProgress
          ),
          z: THREE.MathUtils.lerp(
            CAMERA_STATES.meetTia.rotation.z,
            CAMERA_STATES.meetTiaFinal.rotation.z,
            meetTiaProgress
          ),
        };
      }

      // Apply smooth transitions
      const smoothness = 0.1;

      // Position transitions
      cameraRef.current.position.x +=
        (targetPosition.x - cameraRef.current.position.x) * smoothness;
      cameraRef.current.position.y +=
        (targetPosition.y - cameraRef.current.position.y) * smoothness;
      cameraRef.current.position.z +=
        (targetPosition.z - cameraRef.current.position.z) * smoothness;

      // Rotation transitions
      cameraRef.current.rotation.x +=
        (targetRotation.x - cameraRef.current.rotation.x) * smoothness;
      cameraRef.current.rotation.y +=
        (targetRotation.y - cameraRef.current.rotation.y) * smoothness;
      cameraRef.current.rotation.z +=
        (targetRotation.z - cameraRef.current.rotation.z) * smoothness;
    }

    // Update camera position and rotation when transitioning
    if (targetCameraPosition && 
        (transitionState === TRANSITION_STATES.TRANSITIONING)) {
      console.log('Transitioning camera to:', targetCameraPosition);
      const currentPos = new THREE.Vector3(
        cameraRef.current.position.x,
        cameraRef.current.position.y,
        cameraRef.current.position.z
      );
      const targetPos = new THREE.Vector3(
        targetCameraPosition.x,
        targetCameraPosition.y,
        targetCameraPosition.z
      );

      // Linear interpolation for position
      currentPos.lerp(targetPos, 0.05);
      cameraRef.current.position.copy(currentPos);

      // Smooth quaternion rotation
      if (targetQuaternion) {
        const currentQuat = new THREE.Quaternion().setFromEuler(
          cameraRef.current.rotation
        );
        currentQuat.slerp(targetQuaternion, 0.05);
        cameraRef.current.quaternion.copy(currentQuat);
      }

      // Check if we've reached the target (with a small threshold)
      const distanceToTarget = currentPos.distanceTo(targetPos);
      console.log('Distance to target:', distanceToTarget);
      if (distanceToTarget < 0.1) {
        console.log('Transition completed');
        setTransitionState(TRANSITION_STATES.COMPLETED);
      }
    }

    // Group position (always update regardless of exploration mode)
    const targetGroupY =
      comingSoonProgress < 1
        ? THREE.MathUtils.lerp(0, -9.5, heroProgress)
        : -9.5;
    groupRef.current.position.y +=
      (targetGroupY - groupRef.current.position.y) * 0.1;

    // Update spotlight position to be slightly above and behind camera
    if (spotlightRef.current) {
      spotlightRef.current.position.set(
        cameraRef.current.position.x,
        cameraRef.current.position.y + 5,
        cameraRef.current.position.z + 2
      );
    }

    // Update spotlight target to be in front of camera
    if (spotlightTargetRef.current) {
      const targetDistance = 10;
      spotlightTargetRef.current.position.set(
        cameraRef.current.position.x +
          Math.sin(cameraRef.current.rotation.y) * targetDistance,
        cameraRef.current.position.y - 2,
        cameraRef.current.position.z -
          Math.cos(cameraRef.current.rotation.y) * targetDistance
      );
    }
  });

  // Transition methods
  const transitionWallMeetTia = () => {
    try {
      if (!cameraRef.current) {
        throw new Error('Camera reference is not available');
      }

      if (transitionState === TRANSITION_STATES.TRANSITIONING) {
        throw new Error('Transition already in progress');
      }

      setTransitionState(TRANSITION_STATES.TRANSITIONING);
      setTransitionError(null);

      // Store initial camera state
      initialCameraState.current = {
        position: {
          x: cameraRef.current.position.x,
          y: cameraRef.current.position.y,
          z: cameraRef.current.position.z,
        },
        rotation: {
          x: cameraRef.current.rotation.x,
          y: cameraRef.current.rotation.y,
          z: cameraRef.current.rotation.z,
        },
      };

      // Set target position with validation
      const targetPosition = {
        x: cameraRef.current.position.x + 8,
        y: -7,
        z: cameraRef.current.position.z + 17,
      };

      // Validate target position
      if (Object.values(targetPosition).some(isNaN)) {
        throw new Error('Invalid target position calculated');
      }

      setTargetCameraPosition(targetPosition);

      // Create and validate target quaternion
      const targetQuat = new THREE.Quaternion().setFromEuler(
        cameraRef.current.rotation
      );

      if (!targetQuat.isValid()) {
        throw new Error('Invalid target rotation calculated');
      }

      setTargetQuaternion(targetQuat);
      setIsWallTransitioned(true);
      // Note: COMPLETED state will be set when animation actually reaches target
    } catch (error) {
      console.error('Transition failed:', error);
      setTransitionError(error.message);
      setTransitionState(TRANSITION_STATES.FAILED);
      // Reset any partial transition state
      if (initialCameraState.current) {
        setTargetCameraPosition(initialCameraState.current.position);
        const resetQuat = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(
            initialCameraState.current.rotation.x,
            initialCameraState.current.rotation.y,
            initialCameraState.current.rotation.z
          )
        );
        setTargetQuaternion(resetQuat);
      }
      setIsWallTransitioned(false);
    }
  };

  const reverseWallMeetTiaTransition = () => {
    try {
      if (!initialCameraState.current) {
        throw new Error('No initial camera state available');
      }

      if (transitionState === TRANSITION_STATES.TRANSITIONING) {
        throw new Error('Transition already in progress');
      }

      setTransitionState(TRANSITION_STATES.TRANSITIONING);
      setTransitionError(null);

      // Validate initial state
      if (Object.values(initialCameraState.current.position).some(isNaN)) {
        throw new Error('Invalid initial position state');
      }

      setTargetCameraPosition(initialCameraState.current.position);

      const targetQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          initialCameraState.current.rotation.x,
          initialCameraState.current.rotation.y,
          initialCameraState.current.rotation.z
        )
      );

      if (!targetQuat.isValid()) {
        throw new Error('Invalid initial rotation state');
      }

      setTargetQuaternion(targetQuat);
      setIsWallTransitioned(false);
      setTransitionState(TRANSITION_STATES.IDLE);
    } catch (error) {
      console.error('Reverse transition failed:', error);
      setTransitionError(error.message);
      setTransitionState(TRANSITION_STATES.FAILED);
    }
  };

  const getTransitionState = () => ({
    state: transitionState,
    error: transitionError
  });

  // Function to transition camera to close-up position when clicking Let's Begin
  const transitionToMeetTiaCloseup = () => {
    try {
      if (!cameraRef.current) {
        throw new Error('Camera reference is not available');
      }

      console.log('Starting transition to MeetTia closeup');
      
      // Force reset any ongoing transitions
      setTransitionState(TRANSITION_STATES.IDLE);
      setTransitionError(null);
      
      // Set the new transition state
      setTransitionState(TRANSITION_STATES.TRANSITIONING);

      // Directly set camera position for immediate effect
      cameraRef.current.position.set(
        CAMERA_STATES.meetTiaClose.position.x,
        CAMERA_STATES.meetTiaClose.position.y,
        CAMERA_STATES.meetTiaClose.position.z
      );
      
      cameraRef.current.rotation.set(
        CAMERA_STATES.meetTiaClose.rotation.x,
        CAMERA_STATES.meetTiaClose.rotation.y,
        CAMERA_STATES.meetTiaClose.rotation.z
      );
      
      // Update states
      setIsMeetTiaCloseup(true);
      if (updatePortalCloseupState) updatePortalCloseupState(true);
      
      // Complete the transition immediately
      setTransitionState(TRANSITION_STATES.COMPLETED);
      
      console.log('Transition to MeetTia closeup completed');
    } catch (error) {
      console.error('Transition to closeup failed:', error);
      setTransitionError(error.message);
      setTransitionState(TRANSITION_STATES.FAILED);
    }
  };

  // Function to transition camera back to initial position when clicking Go Back
  const transitionToMeetTiaInitial = () => {
    try {
      if (!cameraRef.current) {
        throw new Error('Camera reference is not available');
      }

      console.log('Starting transition to MeetTia initial position');
      
      // Force reset any ongoing transitions
      setTransitionState(TRANSITION_STATES.IDLE);
      setTransitionError(null);
      
      // Set the new transition state
      setTransitionState(TRANSITION_STATES.TRANSITIONING);

      // Directly set camera position for immediate effect
      cameraRef.current.position.set(
        CAMERA_STATES.meetTiaInitial.position.x,
        CAMERA_STATES.meetTiaInitial.position.y,
        CAMERA_STATES.meetTiaInitial.position.z
      );
      
      cameraRef.current.rotation.set(
        CAMERA_STATES.meetTiaInitial.rotation.x,
        CAMERA_STATES.meetTiaInitial.rotation.y,
        CAMERA_STATES.meetTiaInitial.rotation.z
      );
      
      // Update states
      setIsMeetTiaCloseup(false);
      if (updatePortalCloseupState) updatePortalCloseupState(false);
      
      // Complete the transition immediately
      setTransitionState(TRANSITION_STATES.COMPLETED);
      
      console.log('Transition to MeetTia initial position completed');
    } catch (error) {
      console.error('Transition to initial position failed:', error);
      setTransitionError(error.message);
      setTransitionState(TRANSITION_STATES.FAILED);
    }
  };

  // Expose methods to parent component via useEffect to avoid setState during render
  useEffect(() => {
    onCameraStateChange({
      isExplorationMode,
      transitionWallMeetTia,
      reverseWallMeetTiaTransition,
      getTransitionState,
      transitionState,
      transitionError,
      transitionToMeetTiaCloseup,
      transitionToMeetTiaInitial,
      isMeetTiaCloseup
    });
  }, [isExplorationMode, transitionState, transitionError, isMeetTiaCloseup, onCameraStateChange]);

  return null; // This is a logic component, no rendering
};

export default CameraController;
