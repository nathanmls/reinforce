'use client';

import { useRef } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import * as THREE from 'three';

export default function HeroModel() {
  const mixer = useRef();
  const clock = useRef(new THREE.Clock());
  const animationTimeRef = useRef(0);
  const model = useLoader(FBXLoader, "/models/Waving.fbx");

  // Initialize animation
  if (!mixer.current) {
    mixer.current = new THREE.AnimationMixer(model);
    if (model.animations.length > 0) {
      const action = mixer.current.clipAction(model.animations[0]);
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      action.play();
    }
  }

  useFrame(() => {
    if (mixer.current) {
      const delta = clock.current.getDelta();
      animationTimeRef.current += delta;

      // Every 20 seconds, reset and play the animation
      if (animationTimeRef.current >= 0) {
        animationTimeRef.current = 0;
        const action = mixer.current.clipAction(model.animations[0]);
        action.reset();
        action.play();
      }

      mixer.current.update(delta);
    }
  });

  return (
    <primitive 
      object={model} 
      scale={2.6} 
      position={[0, 0.02, 0]}
      castShadow
    />
  );
}