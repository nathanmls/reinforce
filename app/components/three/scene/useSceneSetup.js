// app/components/three/scene/useSceneSetup.js
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

export const useSceneSetup = () => {
  const setupRenderer = (canvas) => {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    return renderer;
  };

  const setupCamera = () => {
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 3, 5);
    camera.lookAt(0, 3, 0);
    return camera;
  };

  const setupScene = () => {
    const scene = new THREE.Scene();
    return scene;
  };

  const setupLighting = (scene) => {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add floor
    const floorGeometry = new THREE.CircleGeometry(30, 64);
    const floorMaterial = new THREE.MeshPhongMaterial({
      color: 0xc7df88,
      side: THREE.DoubleSide,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);
  };

  const loadEnvironmentMap = async (scene, renderer, settings) => {
    // Create a completely safe settings object with all possible properties
    const safeSettings = {
      // Core display settings
      showBackground: true,
      backgroundBlur: 0,

      // Rendering intensity and exposure
      intensity: 1.0,
      exposure: 1.0,

      // Rotation and bounds
      rotation: 0,

      // Safeguard min/max values
      minIntensity: 0,
      maxIntensity: 2,
      minExposure: 0,
      maxExposure: 2,
      minRotation: 0,
      maxRotation: Math.PI * 2,

      // Merge with provided settings, with defaults as fallback
      ...(settings || {}),
    };

    try {
      // Validate critical inputs
      if (!scene) {
        throw new Error('Scene is undefined');
      }

      const rgbeLoader = new RGBELoader();
      const texture = await rgbeLoader.loadAsync('/environment/SunriseBG.hdr');
      texture.mapping = THREE.EquirectangularReflectionMapping;

      // Safely apply environment settings
      scene.environment = texture;

      // Background handling with explicit null check
      scene.background = safeSettings.showBackground === true ? texture : null;

      // Rotation with bounds checking
      const rotationValue = Math.max(
        safeSettings.minRotation,
        Math.min(safeSettings.maxRotation, safeSettings.rotation || 0)
      );
      texture.offset.x = rotationValue / (2 * Math.PI);

      // Renderer exposure with bounds checking
      if (renderer) {
        const exposureValue = Math.max(
          safeSettings.minExposure,
          Math.min(safeSettings.maxExposure, safeSettings.exposure || 1.0)
        );
        renderer.toneMappingExposure = exposureValue;
      }

      // Material environment map intensity
      const intensityValue = Math.max(
        safeSettings.minIntensity,
        Math.min(safeSettings.maxIntensity, safeSettings.intensity || 1.0)
      );

      scene.traverse((node) => {
        if (node.isMesh && node.material) {
          node.material.envMapIntensity = intensityValue;
          node.material.needsUpdate = true;
        }
      });

      return texture;
    } catch (error) {
      console.error('Comprehensive error in environment map loading:', error);

      // Provide a fallback or graceful degradation
      return null;
    }
  };

  const updateEnvironment = (scene, envMap, settings = {}) => {
    if (!scene || !envMap) {
      console.warn('Scene or environment map is missing');
      return;
    }

    // Merge with safe defaults
    const safeSettings = {
      showBackground: true,
      backgroundBlur: 0,
      intensity: 1.0,
      exposure: 1.0,
      rotation: 0,
      ...settings,
    };

    try {
      // Update scene background
      scene.environment = envMap;
      scene.background = safeSettings.showBackground ? envMap : null;

      // Update environment map settings
      envMap.offset.x = (safeSettings.rotation || 0) / (2 * Math.PI);

      // Update material environment maps
      scene.traverse((node) => {
        if (node.isMesh && node.material) {
          node.material.envMap = envMap;
          node.material.envMapIntensity = safeSettings.intensity;
          node.material.needsUpdate = true;
        }
      });
    } catch (error) {
      console.error('Error updating environment:', error);
    }
  };

  return {
    setupRenderer,
    setupCamera,
    setupScene,
    setupLighting,
    loadEnvironmentMap,
    updateEnvironment,
  };
};
