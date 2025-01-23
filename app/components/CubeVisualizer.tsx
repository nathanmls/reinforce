"use client";

import { useEffect, useRef } from 'react';
import { AgentState, TrackReference } from '@livekit/components-react';
import * as THREE from 'three';

interface CubeVisualizerProps {
  state: AgentState;
  trackRef?: TrackReference | null;
  className?: string;
}

export function CubeVisualizer({ state, trackRef, className = '' }: CubeVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cubesRef = useRef<THREE.Mesh[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | undefined>();

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) {
      console.log('CubeVisualizer: Container ref is not available');
      return;
    }
    
    console.log('CubeVisualizer: Initializing Three.js scene');
    console.log('Container dimensions:', {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight
    });

    // Setup Three.js scene
    const scene = new THREE.Scene();
    scene.background = null; // This makes the background transparent

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0); // This sets the clear color with 0 opacity
    containerRef.current.appendChild(renderer.domElement);

    // Create three cubes
    const cubes: THREE.Mesh[] = [];
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const materials = [
      new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        shininess: 100,
        transparent: true,
        opacity: 0.8
      }),
      new THREE.MeshPhongMaterial({
        color: 0x0000ff,
        shininess: 100,
        transparent: true,
        opacity: 0.8
      }),
      new THREE.MeshPhongMaterial({
        color: 0xff0000,
        shininess: 100,
        transparent: true,
        opacity: 0.8
      })
    ];

    // Position cubes
    const positions = [
      new THREE.Vector3(-2, 0, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(2, 0, 0)
    ];

    positions.forEach((position, index) => {
      const cube = new THREE.Mesh(geometry, materials[index]);
      cube.position.copy(position);
      scene.add(cube);
      cubes.push(cube);
    });

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Position camera
    camera.position.z = 7;

    // Store refs
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    cubesRef.current = cubes;

    // Initial render
    renderer.render(scene, camera);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.render(scene, camera);
    };

    window.addEventListener('resize', handleResize);

    // Start animation
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Rotate cubes
      cubes.forEach((cube) => {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      console.log('CubeVisualizer: Cleaning up');
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      // Dispose of Three.js resources
      geometry.dispose();
      materials.forEach(material => material.dispose());
      renderer.dispose();
    };
  }, []);

  // Handle audio analysis
  useEffect(() => {
    if (!trackRef?.publication?.track?.mediaStream) {
      console.log('CubeVisualizer: No media stream available');
      return;
    }
    console.log('CubeVisualizer: Initializing audio context');

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(trackRef.publication.track.mediaStream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 32;
    source.connect(analyser);
    analyserRef.current = analyser;

    return () => {
      audioContext.close();
      analyserRef.current = null;
    };
  }, [trackRef]);

  // Handle audio visualization
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const cubes = cubesRef.current;

    if (!scene || !camera || !renderer || !cubes.length) return;

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Update cube scales based on audio data
      if (analyserRef.current && state !== 'disconnected') {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Use different frequency ranges for each cube
        const ranges = [
          [0, 3],   // Bass
          [4, 7],   // Mid
          [8, 11]   // High
        ];

        cubes.forEach((cube, index) => {
          const [start, end] = ranges[index];
          const average = Array.from(dataArray.slice(start, end + 1))
            .reduce((sum, value) => sum + value, 0) / (end - start + 1);
          
          const scale = 1 + (average / 128); // Normalize to [1, 2] range
          cube.scale.setScalar(scale);
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state]);

  return (
    <div ref={containerRef} className={`${className} agent-visualizer`} />
  );
}
