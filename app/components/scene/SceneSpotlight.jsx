// app/components/scene/SceneSpotlight.jsx
"use client";

import * as THREE from "three";
import { useRef } from "react";

const SceneSpotlight = ({ isExplorationMode }) => {
  const spotlightRef = useRef();
  const spotlightTargetRef = useRef();

  return (
    <>
      <object3D ref={spotlightTargetRef} position={[0, 0, -5]} />
      <spotLight
        ref={spotlightRef}
        intensity={1}
        angle={Math.PI}
        penumbra={0.2}
        decay={2}
        distance={20}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.001}
        target={spotlightTargetRef.current}
      />
      {isExplorationMode && spotlightRef.current && (
        <>
          <spotLightHelper args={[spotlightRef.current]} />
          <primitive
            object={new THREE.CameraHelper(spotlightRef.current.shadow.camera)}
          />
        </>
      )}
    </>
  );
};

export default SceneSpotlight;