'use client';

import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';

export default function SceneLighting({ 
  ambientIntensity = 0.6,
  directionalIntensity = 0.5,
  pointIntensity = 0.5,
  spotIntensity = 1,
  showHelpers = false,
  groupRef 
}) {
  const directionalLightRef = useRef();
  const cameraLightRef = useRef();
  const cameraLightHelperRef = useRef();
  const pointLightRef = useRef();
  const spotLightRef = useRef();
  const { scene, camera } = useThree();

  // Update lights to follow the camera and group
  useFrame(() => {
    if (camera) {
      // Get camera direction and position
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      const cameraPosition = camera.position.clone();

      // Update camera light
      if (cameraLightRef.current) {
        const lightPosition = cameraPosition.clone();
        lightPosition.add(cameraDirection.multiplyScalar(-2));
        lightPosition.y += 2;
        
        cameraLightRef.current.position.copy(lightPosition);
        cameraLightRef.current.target.position.copy(camera.position);
        cameraLightRef.current.target.updateMatrixWorld();

        if (showHelpers && cameraLightHelperRef.current) {
          cameraLightHelperRef.current.update();
        }
      }

      // Update spot light to follow camera
      if (spotLightRef.current) {
        const spotOffset = new THREE.Vector3(2, 5, -2);
        const spotPosition = cameraPosition.clone().add(spotOffset);
        
        spotLightRef.current.position.copy(spotPosition);
        
        // Calculate target position: slightly ahead of camera
        const targetOffset = cameraDirection.multiplyScalar(5);
        const targetPosition = cameraPosition.clone().add(targetOffset);
        spotLightRef.current.target.position.copy(targetPosition);
        spotLightRef.current.target.updateMatrixWorld();
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
        const pointOffset = new THREE.Vector3(-5, 5, 0);
        pointLightRef.current.position.copy(groupPosition.clone().add(pointOffset));
      }
    }
  });

  // Create/cleanup helpers
  useEffect(() => {
    if (showHelpers) {
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
      }

      return () => {
        scene.children = scene.children.filter(child => 
          !(child instanceof THREE.DirectionalLightHelper) &&
          !(child instanceof THREE.PointLightHelper) &&
          !(child instanceof THREE.SpotLightHelper)
        );
        cameraLightHelperRef.current = null;
      };
    }
  }, [scene, showHelpers]);

  return (
    <>
      {/* Ambient light for overall scene brightness */}
      <ambientLight intensity={ambientIntensity} />
      
      {/* Main directional light for primary shadows */}
      <directionalLight
        ref={directionalLightRef}
        position={[-10, 10, 5]}
        intensity={directionalIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-near={0.1}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0001}
        shadow-radius={2}
      >
        <primitive object={new THREE.Object3D()} /> {/* Light target */}
      </directionalLight>

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
        position={[-5, 5, 0]}
        intensity={pointIntensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        shadow-bias={-0.0001}
      />

      {/* Spot light for focused highlights */}
      <spotLight
        ref={spotLightRef}
        position={[0, 10, 0]}
        angle={0.4}
        penumbra={0.8}
        intensity={spotIntensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        shadow-bias={-0.0001}
      >
        <primitive object={new THREE.Object3D()} />
      </spotLight>
    </>
  );
}

SceneLighting.propTypes = {
  ambientIntensity: PropTypes.number,
  directionalIntensity: PropTypes.number,
  pointIntensity: PropTypes.number,
  spotIntensity: PropTypes.number,
  showHelpers: PropTypes.bool,
  groupRef: PropTypes.object
};
