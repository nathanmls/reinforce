'use client';

import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';

export default function SceneLighting({ 
  ambientIntensity = 1.2,
  directionalIntensity = 1.5,
  pointIntensity = 10,
  spotIntensity = 30,
  showHelpers = false,
  groupRef,
  isMeetTiaSection = false
}) {
  const directionalLightRef = useRef();
  const cameraLightRef = useRef();
  const cameraLightHelperRef = useRef();
  const pointLightRef = useRef();
  const spotLightRef = useRef();
  const spotLightHelperRef = useRef();
  const mainCameraRef = useRef(new THREE.Object3D());
  const { scene, camera } = useThree();

  // Update lights to follow the camera and group
  useFrame(() => {
    // Store main camera position when not in exploration mode
    if (!showHelpers) {
      mainCameraRef.current.position.copy(camera.position);
      mainCameraRef.current.rotation.copy(camera.rotation);
    }

    // Always use main camera position for lights
    const cameraToUse = showHelpers ? mainCameraRef.current : camera;
    
    // Get camera direction and position
    const cameraDirection = new THREE.Vector3();
    cameraToUse.getWorldDirection(cameraDirection);
    const cameraPosition = cameraToUse.position.clone();

    // Update camera light
    if (cameraLightRef.current) {
      const lightPosition = cameraPosition.clone();
      lightPosition.add(cameraDirection.multiplyScalar(-2));
      lightPosition.y += 2;
      
      cameraLightRef.current.position.copy(lightPosition);
      cameraLightRef.current.target.position.copy(cameraPosition);
      cameraLightRef.current.target.updateMatrixWorld();

      if (showHelpers && cameraLightHelperRef.current) {
        cameraLightHelperRef.current.update();
      }
    }

    // Update spot light to follow group with fixed offset
    if (spotLightRef.current && groupRef?.current) {
      const groupPosition = new THREE.Vector3();
      groupRef.current.getWorldPosition(groupPosition);
      
      // Position the light above and behind the group
      const spotOffset = new THREE.Vector3(0, 10, 5); 
      const spotPosition = groupPosition.clone().add(spotOffset);
      spotLightRef.current.position.copy(spotPosition);
      
      // Target the group position
      spotLightRef.current.target.position.copy(groupPosition);
      spotLightRef.current.target.updateMatrixWorld();

      // Update helper if it exists
      if (showHelpers && spotLightHelperRef.current) {
        spotLightHelperRef.current.update();
      }
    }

    // Update group-following lights
    if (groupRef?.current) {
      const groupPosition = new THREE.Vector3();
      groupRef.current.getWorldPosition(groupPosition);

      // Update directional light
      if (directionalLightRef.current) {
        directionalLightRef.current.position.y = groupPosition.y + 10;
        directionalLightRef.current.target.position.copy(groupPosition);
        directionalLightRef.current.target.updateMatrixWorld();
      }

      // Update point light
      if (pointLightRef.current) {
        const pointPosition = isMeetTiaSection ? cameraPosition : groupPosition.clone().add(new THREE.Vector3(-5, 5, 0));
        pointLightRef.current.position.copy(pointPosition);
      }
    }
  });

  // Create/cleanup helpers
  useEffect(() => {
    if (showHelpers) {
      // Create helpers
      if (directionalLightRef.current) {
        const dirHelper = new THREE.DirectionalLightHelper(directionalLightRef.current, 5, '#ff0000');
        scene.add(dirHelper);
      }
      if (cameraLightRef.current) {
        const camLightHelper = new THREE.DirectionalLightHelper(cameraLightRef.current, 5, '#ff00ff');
        scene.add(camLightHelper);
        cameraLightHelperRef.current = camLightHelper;
      }
      if (pointLightRef.current) {
        const pointHelper = new THREE.PointLightHelper(pointLightRef.current, 1, '#00ff00');
        scene.add(pointHelper);
      }
      if (spotLightRef.current) {
        const spotHelper = new THREE.SpotLightHelper(spotLightRef.current, '#0000ff');
        scene.add(spotHelper);
        spotLightHelperRef.current = spotHelper;
      }

      // Add main camera helper
      const mainCameraHelper = new THREE.Object3D();
      // Add a small cone to represent camera direction
      const coneGeometry = new THREE.ConeGeometry(0.5, 1, 8);
      const coneMaterial = new THREE.MeshBasicMaterial({ color: '#ffff00', wireframe: true });
      const cone = new THREE.Mesh(coneGeometry, coneMaterial);
      cone.rotation.x = Math.PI / 2;
      mainCameraHelper.add(cone);
      mainCameraRef.current.add(mainCameraHelper);
      scene.add(mainCameraRef.current);

      // Cleanup function
      return () => {
        scene.children = scene.children.filter(child => 
          !(child instanceof THREE.DirectionalLightHelper) &&
          !(child instanceof THREE.PointLightHelper) &&
          !(child instanceof THREE.SpotLightHelper)
        );
        scene.remove(mainCameraRef.current);
        cameraLightHelperRef.current = null;
        spotLightHelperRef.current = null;
      };
    }
  }, [scene, showHelpers]);

  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight 
        intensity={ambientIntensity} 
        color="#ffffff"
      />
      
      {/* Directional light for general shadows */}
      <directionalLight
        ref={directionalLightRef}
        position={[-5, 5, 5]}
        intensity={directionalIntensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      >
        <primitive object={new THREE.Object3D()} /> {/* Light target */}
      </directionalLight>

      {/* Hemisphere light for subtle color variation */}
      <hemisphereLight
        intensity={0.2}
        color="#ffffff"
        groundColor="#000000"
      />

      {/* Camera-following fill light */}
      <directionalLight
        ref={cameraLightRef}
        intensity={directionalIntensity * 0.3}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={30}
        shadow-camera-near={0.1}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      >
        <primitive object={new THREE.Object3D()} />
      </directionalLight>

      {/* Point light for local illumination */}
      <pointLight
        ref={pointLightRef}
        position={isMeetTiaSection ? camera.position : [0, 10, 0]}
        intensity={pointIntensity}
        color="#ffffff"
        distance={50}
        decay={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-bias={-0.0001}
      />

      {/* Spot light for focused highlights */}
      <spotLight
        ref={spotLightRef}
        position={[0, 10, -5]}
        intensity={spotIntensity}
        angle={Math.PI / 6}
        penumbra={0.5}
        decay={1.5}
        distance={50}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-bias={-0.0001}
      >
        <primitive object={new THREE.Object3D()} />
      </spotLight>

      {showHelpers && (
        <>
          <directionalLightHelper args={[directionalLightRef.current]} />
          <gridHelper args={[30, 30]} />
          <axesHelper args={[5]} />
        </>
      )}
    </>
  );
}

SceneLighting.propTypes = {
  ambientIntensity: PropTypes.number,
  directionalIntensity: PropTypes.number,
  pointIntensity: PropTypes.number,
  spotIntensity: PropTypes.number,
  showHelpers: PropTypes.bool,
  groupRef: PropTypes.object,
  isMeetTiaSection: PropTypes.bool
};
