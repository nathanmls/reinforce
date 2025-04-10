import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export const useModelSetup = () => {
  const loadModel = () => {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        '/models/tia-placeholder.glb',
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(3, 3, 3);
          model.position.set(0, 0, 0);

          // Store bones in a map for easier access
          const bones = {
            jaw: null,
            head: null,
          };

          // Collect bone and mesh information
          const bonesInfo = [];
          const meshesInfo = [];

          model.traverse((node) => {
            if (node.isBone) {
              bonesInfo.push({
                name: node.name,
                position: node.position,
                rotation: node.rotation,
                quaternion: node.quaternion,
                parent: node.parent?.name,
              });
            }

            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
              if (node.skeleton) {
                meshesInfo.push({
                  name: node.name,
                  bones: node.skeleton.bones.map((b) => b.name),
                });
              }
            }

            // Store the jaw bone reference
            if (node.name === 'jaw_master') {
              bones.jaw = node;
              bones.jaw.initialRotation = new THREE.Euler().copy(node.rotation);
              bones.jaw.initialQuaternion = new THREE.Quaternion().copy(
                node.quaternion
              );
              bones.jaw.matrixAutoUpdate = true;
              bones.jaw.rotation.order = 'XYZ';
            }

            // Store the head bone reference
            if (node.name === 'head') {
              bones.head = node;
              bones.head.initialRotation = new THREE.Euler().copy(
                node.rotation
              );
              bones.head.initialQuaternion = new THREE.Quaternion().copy(
                node.quaternion
              );
              bones.head.matrixAutoUpdate = true;
              bones.head.rotation.order = 'XYZ';
            }
          });

          // Log collected information in a grouped and organized way
          console.group('Model Information');
          console.log('Total bones:', bonesInfo.length);
          console.log('Total meshes with skeletons:', meshesInfo.length);

          console.group('Bones');
          bonesInfo.forEach((bone) => console.log(`${bone.name}:`, bone));
          console.groupEnd();

          console.group('Meshes');
          meshesInfo.forEach((mesh) => console.log(`${mesh.name}:`, mesh));
          console.groupEnd();

          console.groupEnd();

          resolve({ model, bones });
        },
        undefined,
        reject
      );
    });
  };

  const updateHeadRotation = (headBone, targetRotation, settings) => {
    if (!headBone || !settings) return;

    // Apply smooth rotation to head bone using quaternions
    const targetQuaternion = new THREE.Quaternion();
    const euler = new THREE.Euler(
      headBone.initialRotation.x + targetRotation.x,
      headBone.initialRotation.y + targetRotation.y,
      headBone.initialRotation.z,
      'XYZ'
    );
    targetQuaternion.setFromEuler(euler);

    // Smoothly interpolate current rotation to target
    const speed = settings.headRotationSpeed || 0.05;
    headBone.quaternion.slerp(targetQuaternion, speed);
    headBone.updateMatrix();
  };

  const updateJawRotation = (jawBone, settings, animationState) => {
    if (!jawBone || !settings || !animationState) return;

    // Ensure settings has the required structure
    const jawSettings = settings.jawControl || {
      enableAnimation: true,
      manualRotation: 0,
      animationSpeed: 0.1,
      animationAmplitude: 0.1,
    };

    if (jawSettings.enableAnimation) {
      // Calculate jaw rotation using quaternion
      const jawRotation =
        Math.sin(animationState.rotation) * jawSettings.animationAmplitude;
      const jawEuler = new THREE.Euler(
        jawBone.initialRotation.x + jawRotation,
        jawBone.initialRotation.y,
        jawBone.initialRotation.z,
        'XYZ'
      );
      const jawQuaternion = new THREE.Quaternion().setFromEuler(jawEuler);
      jawBone.quaternion.copy(jawQuaternion);

      // Update animation state
      animationState.rotation += jawSettings.animationSpeed;
    } else {
      // Manual control using quaternion
      const jawEuler = new THREE.Euler(
        jawBone.initialRotation.x + jawSettings.manualRotation,
        jawBone.initialRotation.y,
        jawBone.initialRotation.z,
        'XYZ'
      );
      const jawQuaternion = new THREE.Quaternion().setFromEuler(jawEuler);
      jawBone.quaternion.copy(jawQuaternion);
    }

    jawBone.updateMatrix();
  };

  return {
    loadModel,
    updateHeadRotation,
    updateJawRotation,
  };
};
