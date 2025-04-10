// app/components/scene/SceneShadowSetup.jsx
'use client';

import { useEffect } from 'react';
import * as THREE from 'three';

const SceneShadowSetup = ({ gl }) => {
  useEffect(() => {
    const previousShadowMapState = {
      enabled: gl.shadowMap.enabled,
      type: gl.shadowMap.type,
      autoUpdate: gl.shadowMap.autoUpdate,
    };

    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.shadowMap.autoUpdate = true;

    return () => {
      gl.shadowMap.enabled = previousShadowMapState.enabled;
      gl.shadowMap.type = previousShadowMapState.type;
      gl.shadowMap.autoUpdate = previousShadowMapState.autoUpdate;
    };
  }, [gl]);

  return null;
};

export default SceneShadowSetup;
