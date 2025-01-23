// app/components/three/helpers/BoneHelper.js
import * as THREE from 'three';

export class BoneHelper {
  constructor(bone, size = 0.2, color = 0xffff00) {
    if (!bone) {
      throw new Error('Bone is required for BoneHelper');
    }

    this.bone = bone;
    this.helperGroup = new THREE.Group();
    
    // Create an axes helper
    const axes = new THREE.AxesHelper(size);
    this.helperGroup.add(axes);
    
    // Create a sphere to mark the bone position
    const sphereGeometry = new THREE.SphereGeometry(size * 0.1);
    const sphereMaterial = new THREE.MeshBasicMaterial({ 
      color,
      transparent: true,
      opacity: 0.7
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.helperGroup.add(sphere);
    
    // Create a cone pointing in the bone's forward direction
    const coneGeometry = new THREE.ConeGeometry(size * 0.1, size * 0.3);
    const coneMaterial = new THREE.MeshBasicMaterial({ 
      color,
      transparent: true,
      opacity: 0.7
    });
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.rotation.x = -Math.PI / 2; // Point forward
    cone.position.z = size * 0.15;
    this.helperGroup.add(cone);
    
    // Add the helper to the bone
    bone.add(this.helperGroup);

    // Set initial visibility
    this.setVisibility(true);
  }

  setVisibility(visible) {
    if (this.helperGroup) {
      this.helperGroup.visible = visible;
    }
  }

  update() {
    if (this.bone && this.helperGroup) {
      this.helperGroup.updateMatrix();
    }
  }

  dispose() {
    if (this.helperGroup) {
      this.helperGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        }
      });
      if (this.bone) {
        this.bone.remove(this.helperGroup);
      }
    }
  }
}
