'use client';

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { useSceneSetup } from './three/scene/useSceneSetup';
import { useModelSetup } from './three/model/useModelSetup';
import { BoneHelper } from './three/helpers/BoneHelper';
import { gsap } from 'gsap';

const TiaScene = forwardRef(({ onTransitionComplete }, ref) => {
  // Refs for scene elements
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const modelRef = useRef(null);
  const animationFrameRef = useRef(null);
  const vignetteRef = useRef(null);
  const envMapRef = useRef(null);

  // Bone references
  const headBoneRef = useRef(null);
  const jawBoneRef = useRef(null);
  const helpersRef = useRef({ jaw: null, head: null });

  // Animation states
  const targetHeadRotation = useRef({ x: 0, y: 3 });
  const jawAnimationRef = useRef({ rotation: 0 });
  const timeRef = useRef(0);
  const modelRotationRef = useRef({ y: 0 });

  // Get scene setup utilities
  const { 
    setupRenderer, 
    setupCamera, 
    setupScene, 
    setupLighting, 
    loadEnvironmentMap, 
    updateEnvironment 
  } = useSceneSetup();

  // Get model setup utilities
  const { 
    loadModel, 
    updateHeadRotation, 
    updateJawRotation 
  } = useModelSetup();

  const createVignette = () => {
    // Create a plane geometry with a hole
    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    
    const fragmentShader = `
      varying vec2 vUv;
      void main() {
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(vUv, center);
        
        // Create solid circle with sharp edge
        float circle = step(dist, 0.1);
        
        // Create border
        float borderWidth = 0.006;
        float border = step(dist, 0.1 + borderWidth) - circle;
        
        // Combine circle and border
        vec4 circleColor = vec4(0.95, 0.95, 0.95, 1.0 - circle);
        vec4 borderColor = vec4(1.0, 1.0, 1.0, border);

        gl_FragColor = mix(circleColor, borderColor, border);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: false, // Ensure vignette is always visible
      depthWrite: false
    });

    const vignette = new THREE.Mesh(planeGeometry, material);
    vignette.position.z = 1.5;
    vignette.position.y = 3; // Adjusted for better framing
    vignette.renderOrder = 999; // Ensure it renders last
    vignetteRef.current = vignette;
    return vignette;
  };

  const initializeScene = async () => {
    if (!containerRef.current || !canvasRef.current) return;

    // Setup basic scene elements
    rendererRef.current = setupRenderer(canvasRef.current);
    cameraRef.current = setupCamera();
    sceneRef.current = setupScene();
    setupLighting(sceneRef.current);

    // Set background color to #B3D45A
    sceneRef.current.background = new THREE.Color('#B3D45A');

    // Load the model
    const { model, headBone, jawBone } = await loadModel();
    modelRef.current = model;
    headBoneRef.current = headBone;
    jawBoneRef.current = jawBone;

    // Setup bone helpers
    if (headBone) {
      helpersRef.current.head = new BoneHelper(headBone, 0.2, 0xff0000);
    }
    if (jawBone) {
      helpersRef.current.jaw = new BoneHelper(jawBone, 0.15, 0x00ff00);
    }

    // Add model to scene
    sceneRef.current.add(model);

    // Create and add vignette to scene
    const vignette = createVignette();
    if (vignette && sceneRef.current) {
      sceneRef.current.add(vignette);
    }

    // Start animation loop
    animate();
  };

  const animate = () => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !modelRef.current) return;

    // Update head rotation
    if (headBoneRef.current) {
      const currentRotation = headBoneRef.current.rotation;
      const targetRotation = targetHeadRotation.current;
      updateHeadRotation(currentRotation, targetRotation, 0.1);
    }

    // Update jaw rotation
    if (jawBoneRef.current) {
      const jawRotation = Math.sin(timeRef.current) * 0.1;
      updateJawRotation(jawBoneRef.current, jawRotation);
      timeRef.current += 0.05;
    }

    // Update model rotation
    if (modelRef.current) {
      modelRef.current.rotation.y = modelRotationRef.current.y;
    }

    // Render scene
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const handleResize = () => {
    if (!containerRef.current || !canvasRef.current || !cameraRef.current || !rendererRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Update camera
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();

    // Update renderer
    rendererRef.current.setSize(width, height);
    rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  useImperativeHandle(ref, () => ({
    transitionVignette: () => {
      if (!vignetteRef.current || !cameraRef.current) return;
    
      // Move camera closer
      gsap.to(cameraRef.current.position, {
        // x: 0,
        // y: 0.5,
        z: 2,
        duration: 1.5,
        ease: "power2.inOut"
      });

      // Move vignette behind
      gsap.to(vignetteRef.current.position, {
        z: 5,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
          if (onTransitionComplete) {
            onTransitionComplete(true);
          }
        }
      });
    },
    reverseTransition: () => {
      if (!vignetteRef.current || !cameraRef.current) return;
    
      // Move camera back
      gsap.to(cameraRef.current.position, {
        x: 0,
        y: 3,
        z: 5,
        duration: 1.5,
        ease: "power2.inOut"
      });

      // Move vignette back
      gsap.to(vignetteRef.current.position, {
        z: 1.5,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
          if (onTransitionComplete) {
            onTransitionComplete(false);
          }
        }
      });
    }
  }));

  useEffect(() => {
    initializeScene();

    // Add resize event listener
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
      
      // Clean up Three.js resources
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            object.material.dispose();
          }
        });
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
});

export default TiaScene;
