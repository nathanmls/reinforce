"use client";

import { Grid, GizmoHelper, GizmoViewport } from "@react-three/drei";
import * as THREE from "three";

const SceneDebugHelpers = ({ isExplorationMode, userRole, spotlightRef }) => {
  if (!isExplorationMode || userRole !== "administrator") {
    return null;
  }

  return (
    <>
      <Grid
        args={[100, 100]}
        position={[0, -0.01, 0]}
        cellColor="#6f6f6f"
        sectionColor="#9d4b4b"
        fadeDistance={50}
        fadeStrength={1}
        infiniteGrid
      />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport
          labelColor="white"
          axisColors={["#ff3653", "#0adb50", "#2c8fdf"]}
        />
      </GizmoHelper>
      {spotlightRef.current && (
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

export default SceneDebugHelpers;
