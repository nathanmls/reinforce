'use client';

import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { 
  PerspectiveCamera,
  Grid, 
  GizmoHelper, 
  GizmoViewport,
  MeshPortalMaterial,
} from "@react-three/drei";
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';
import { useAuth } from "@/context/AuthContext";
import { useScroll } from "@/context/ScrollContext";
import { useDebugCamera } from "@/context/CameraDebugContext";
import GirlModel from './scene/GirlModel';
import BoyModel from './scene/BoyModel';
import TiaModel from './scene/TiaModel';
import OfficeModel from './scene/OfficeModel';
import SceneLighting from './scene/SceneLighting';
import SceneBackground from './scene/SceneBackground';
import FloorRoom from './scene/FloorRoom';
import WallMeetTia from './scene/WallMeetTia';
import { RainbowFloor } from './scene/RainbowFloor';
import useAdminCamera from '../hooks/useAdminCamera';

// Camera positions and rotations for each section
const CAMERA_STATES = {
  hero: {
    position: { x: 0, y: 2, z: 10 },
    rotation: { x: 0, y: Math.PI/10, z: 0 }
  },
  welcome: {
    position: { x: 4, y: -7, z: 10 },
    rotation: { x: 0, y: Math.PI/4.5, z: 0 }
  },
  mentor: {
    position: { x: -5, y: -7, z: 8 },
    rotation: { x: 0, y: Math.PI*-0.28, z: 0 }
  },
  meetTia: {
    position: { x: -5, y: -14, z: 8 },
    rotation: { x: 0, y: Math.PI*-0.28, z: 0 } 
  },
  meetTiaFinal: {
    position: { x: -5, y: -21, z: 8 },
    rotation: { x: 0, y: Math.PI*-0.28, z: 0 }
  }
};

export default function HomeMainScene() {
  const { userRole } = useAuth();
  const { heroProgress, welcomeProgress, mentorProgress, meetTiaProgress, comingSoonProgress } = useScroll();
  const { scene, camera, gl } = useThree();
  const { setCameraState } = useDebugCamera();
  const groupRef = useRef();
  const cameraRef = useRef();
  const mainCameraState = useRef();
  const [isExplorationMode, setIsExplorationMode] = useState(false);

  // Animation spring for Tia's movement
  const [tiaSpring, tiaApi] = useSpring(() => ({
    position: [0, -9.5, -3],
    rotation: [0, 0, 0],
    scale: 3.5,
    config: { mass: 1, tension: 280, friction: 60 }
  }));

  // Update Tia's position based on scroll
  useEffect(() => {
    if (mentorProgress > 0) {
      tiaApi.start({
        position: [-1, -7, 4],
        rotation: [0, Math.PI*-0.25, 0],
        scale: 1
      });
    } else {
      tiaApi.start({
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: 1
      });
    }
  }, [mentorProgress, tiaApi]);

  // Enable shadow mapping
  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.shadowMap.autoUpdate = true;
  }, [gl]);

  // Handle key press for exploration mode
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === 'r' && userRole === 'administrator') {
        setIsExplorationMode(prev => !prev);
        if (!isExplorationMode) {
          // Save current camera state when entering exploration mode
          mainCameraState.current = {
            position: { 
              x: camera.position.x, 
              y: camera.position.y, 
              z: camera.position.z 
            },
            rotation: { 
              x: camera.rotation.x, 
              y: camera.rotation.y, 
              z: camera.rotation.z 
            }
          };
        }
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [userRole, camera, isExplorationMode]);

  // Setup and cleanup helpers
  useEffect(() => {
    if (!scene || !camera) return;

    if (isExplorationMode && userRole === 'administrator') {
      console.log('Setting up helpers');
      // Create helpers
      const cameraHelper = new THREE.CameraHelper(camera);
      const gridHelper = new THREE.GridHelper(100, 100);
      const axesHelper = new THREE.AxesHelper(5);
      
      // Add helpers to scene
      scene.add(cameraHelper);
      scene.add(gridHelper);
      scene.add(axesHelper);
      
      return () => {
        console.log('Cleaning up helpers');
        scene.remove(cameraHelper);
        scene.remove(gridHelper);
        scene.remove(axesHelper);
      };
    }
  }, [isExplorationMode, scene, camera, userRole]);

  // Update camera in exploration mode
  const updateAdminCamera = useAdminCamera(camera, isExplorationMode, userRole);
  
  useFrame(() => {
    if (!groupRef.current) return;

    // Update admin camera controls
    updateAdminCamera();

    // Update camera debug state
    if (userRole === 'administrator' && camera) {
      setCameraState({
        position: {
          x: camera.position.x.toFixed(2),
          y: camera.position.y.toFixed(2),
          z: camera.position.z.toFixed(2)
        },
        rotation: {
          x: camera.rotation.x.toFixed(2),
          y: camera.rotation.y.toFixed(2),
          z: camera.rotation.z.toFixed(2)
        }
      });
    }

    // Only apply section transitions if not in exploration mode
    if (!isExplorationMode) {
      // Base camera state starts at hero
      let targetPosition = { ...CAMERA_STATES.hero.position };
      let targetRotation = { ...CAMERA_STATES.hero.rotation };

      // Hero to Welcome transition
      if (heroProgress > 0 && comingSoonProgress < 1) {
        targetPosition = {
          x: THREE.MathUtils.lerp(CAMERA_STATES.hero.position.x, CAMERA_STATES.welcome.position.x, heroProgress),
          y: THREE.MathUtils.lerp(CAMERA_STATES.hero.position.y, CAMERA_STATES.welcome.position.y, heroProgress),
          z: THREE.MathUtils.lerp(CAMERA_STATES.hero.position.z, CAMERA_STATES.welcome.position.z, heroProgress)
        };
        targetRotation = {
          x: THREE.MathUtils.lerp(CAMERA_STATES.hero.rotation.x, CAMERA_STATES.welcome.rotation.x, heroProgress),
          y: THREE.MathUtils.lerp(CAMERA_STATES.hero.rotation.y, CAMERA_STATES.welcome.rotation.y, heroProgress),
          z: THREE.MathUtils.lerp(CAMERA_STATES.hero.rotation.z, CAMERA_STATES.welcome.rotation.z, heroProgress)
        };
      }

      // Welcome to Mentor transition
      if (welcomeProgress > 0) {
        targetPosition = {
          x: THREE.MathUtils.lerp(CAMERA_STATES.welcome.position.x, CAMERA_STATES.mentor.position.x, welcomeProgress),
          y: THREE.MathUtils.lerp(CAMERA_STATES.welcome.position.y, CAMERA_STATES.mentor.position.y, welcomeProgress),
          z: THREE.MathUtils.lerp(CAMERA_STATES.welcome.position.z, CAMERA_STATES.mentor.position.z, welcomeProgress)
        };
        targetRotation = {
          x: THREE.MathUtils.lerp(CAMERA_STATES.welcome.rotation.x, CAMERA_STATES.mentor.rotation.x, welcomeProgress),
          y: THREE.MathUtils.lerp(CAMERA_STATES.welcome.rotation.y, CAMERA_STATES.mentor.rotation.y, welcomeProgress),
          z: THREE.MathUtils.lerp(CAMERA_STATES.welcome.rotation.z, CAMERA_STATES.mentor.rotation.z, welcomeProgress)
        };
      }

      // Mentor to MeetTia transition
      if (mentorProgress > 0) {
        targetPosition = {
          x: THREE.MathUtils.lerp(CAMERA_STATES.mentor.position.x, CAMERA_STATES.meetTia.position.x, mentorProgress),
          y: THREE.MathUtils.lerp(CAMERA_STATES.mentor.position.y, CAMERA_STATES.meetTia.position.y, mentorProgress),
          z: THREE.MathUtils.lerp(CAMERA_STATES.mentor.position.z, CAMERA_STATES.meetTia.position.z, mentorProgress)
        };
        targetRotation = {
          x: THREE.MathUtils.lerp(CAMERA_STATES.mentor.rotation.x, CAMERA_STATES.meetTia.rotation.x, mentorProgress),
          y: THREE.MathUtils.lerp(CAMERA_STATES.mentor.rotation.y, CAMERA_STATES.meetTia.rotation.y, mentorProgress),
          z: THREE.MathUtils.lerp(CAMERA_STATES.mentor.rotation.z, CAMERA_STATES.meetTia.rotation.z, mentorProgress)
        };
      }

      // Final MeetTia adjustments
      if (meetTiaProgress > 0) {
        targetPosition = {
          x: THREE.MathUtils.lerp(CAMERA_STATES.meetTia.position.x, CAMERA_STATES.meetTiaFinal.position.x, meetTiaProgress),
          y: THREE.MathUtils.lerp(CAMERA_STATES.meetTia.position.y, CAMERA_STATES.meetTiaFinal.position.y, meetTiaProgress),
          z: THREE.MathUtils.lerp(CAMERA_STATES.meetTia.position.z, CAMERA_STATES.meetTiaFinal.position.z, meetTiaProgress)
        };
        targetRotation = {
          x: THREE.MathUtils.lerp(CAMERA_STATES.meetTia.rotation.x, CAMERA_STATES.meetTiaFinal.rotation.x, meetTiaProgress),
          y: THREE.MathUtils.lerp(CAMERA_STATES.meetTia.rotation.y, CAMERA_STATES.meetTiaFinal.rotation.y, meetTiaProgress),
          z: THREE.MathUtils.lerp(CAMERA_STATES.meetTia.rotation.z, CAMERA_STATES.meetTiaFinal.rotation.z, meetTiaProgress)
        };
      }

      // Apply smooth transitions
      const smoothness = 0.1;
      
      // Position transitions
      camera.position.x += (targetPosition.x - camera.position.x) * smoothness;
      camera.position.y += (targetPosition.y - camera.position.y) * smoothness;
      camera.position.z += (targetPosition.z - camera.position.z) * smoothness;
      
      // Rotation transitions - only Y axis
      camera.rotation.y += (targetRotation.y - camera.rotation.y) * smoothness;
    }

    // Group position (always update regardless of exploration mode)
    const targetGroupY = comingSoonProgress < 1 ? THREE.MathUtils.lerp(0, -9.5, heroProgress) : -9.5;
    groupRef.current.position.y += (targetGroupY - groupRef.current.position.y) * 0.1;
  });

  return (
    <>
      <SceneLighting
        showHelpers={isExplorationMode}
        groupRef={groupRef}
      />
      <SceneBackground 
        scene={scene}
        heroProgress={heroProgress}
        welcomeProgress={welcomeProgress}
      />

      {/* Helpers - only show in admin exploration mode */}
      {isExplorationMode && userRole === 'administrator' && (
        <>
          <Grid
            args={[100, 100]}
            position={[0, -0.01, 0]}
            cellColor="#6f6f6f"
            sectionColor="#9d4b4b"
          />
          <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
            <GizmoViewport labelColor="white" axisColors={['#ff3653', '#0adb50', '#2c8fdf']} />
          </GizmoHelper>
        </>
      )}

      {/* Static group that doesn't move with scroll */}
      <group position={[0, 0, 0]}>
        {/* Group Hero Section */}
        <group position={[0, 0, 0]}>
        {/* FloorRoom with a hole */}
        <FloorRoom /> 

        {/* Back wall */}
        <mesh position={[0, 5, -5]} castShadow receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial
            color="#AB27D2"
            side={THREE.DoubleSide}
            shadowSide={THREE.DoubleSide}
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>

        {/* Right wall */}
        <mesh position={[5, 5, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial
            color="#AB27D2"
            side={THREE.DoubleSide}
            shadowSide={THREE.DoubleSide}
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>

        <OfficeModel wireframe={isExplorationMode} />
        </group>
        
        {/* Group Welcome Section */}
        <group position={[0, 0, 0]}>
          {/* Rainbow floor */}
          <RainbowFloor />
        
        {/* Portal effect */}
        <group position={[0, -7, -2.5]}>
          {/* Circular portal frame */}
          <mesh>
            <cylinderGeometry args={[2, 2, 0.1, 32]} rotation={[0, 0, 0]} />
            <MeshPortalMaterial>
              {/* Portal environment */}
              <color attach="background" args={['#B3D45A']} />
              <ambientLight intensity={1} />
              <pointLight position={[0, 2, 0]} intensity={2} />
              
              {/* Tia inside portal */}
              <group position={[0, 0, -1]} rotation={[0, -Math.PI/0.5, 0]} scale={3.5}>
                <TiaModel wireframe={isExplorationMode} />
              </group>
            </MeshPortalMaterial>
          </mesh>

          {/* Portal outer glow */}
          <mesh position={[0, 0, -0.1]}>
            <ringGeometry args={[1.8, 1.9, 64]} />
            <meshStandardMaterial
              color="#AB27D2"
              side={THREE.DoubleSide}
              metalness={0.5}
              roughness={0.2}
              emissive="#AB27D2"
              emissiveIntensity={0.5}
              wireframe={isExplorationMode}
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>
      </group>
      </group>

      {/* Group Tia Section */}
      <group position={[0, 0, 0]}>

        </group>

      {/* Animated group that moves with scroll */}
      <group ref={groupRef}>
                {/* Wall Tia Section */}
        <WallMeetTia wireframe={isExplorationMode} />
        <GirlModel wireframe={isExplorationMode} />

        {/* Circular floor */}
        <mesh
          rotation={[0, 0, 0]}
          position={[0, 0, 0]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[2, 2, 0.1, 32]} />
          <meshStandardMaterial
            color="#D2DBCD"
            side={THREE.DoubleSide}
            shadowSide={THREE.DoubleSide}
            metalness={0.1}
            roughness={0.8}
            wireframe={isExplorationMode}
          />
        </mesh>
      </group>

      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 2, 10]}
        fov={50}
        near={0.1}
        far={1000}
      />
    </>
  );
}