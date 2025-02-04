'use client';

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import PropTypes from 'prop-types';

// Color constants for better maintainability
const COLORS = {
  HERO: {
    TOP: 0xFFFFFF,
    BOTTOM: 0xFFFFFF
  },
  WELCOME: {
    TOP: 0xAB28D2,
    BOTTOM: 0x7B1FA2
  },
  MENTOR: {
    TOP: 0x58146C,
    BOTTOM: 0xAB27D2
  },
  MEET_TIA: {
    TOP: 0xB3D45A,
    BOTTOM: 0xB3D45A
  },
  FINAL: {
    TOP: 0x000000,
    BOTTOM: 0x000000
  }
};

export default function SceneBackground({ 
  scene,
  heroProgress = 0,
  welcomeProgress = 0,
  mentorProgress = 0,
  meetTiaProgress = 0,
  exponent = 0.6
}) {
  const gradientShader = useMemo(() => ({
    uniforms: {
      topColor: { value: new THREE.Color(COLORS.HERO.TOP) },
      bottomColor: { value: new THREE.Color(COLORS.HERO.BOTTOM) },
      offset: { value: 0 },
      exponent: { value: exponent }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `
  }), [exponent]);

  const gradientMaterial = useMemo(() => (
    new THREE.ShaderMaterial({
      uniforms: gradientShader.uniforms,
      vertexShader: gradientShader.vertexShader,
      fragmentShader: gradientShader.fragmentShader,
      side: THREE.BackSide
    })
  ), [gradientShader]);

  useEffect(() => {
    if (!scene) {
      console.warn('Scene is not provided to SceneBackground');
      return;
    }

    const geometry = new THREE.SphereGeometry(500, 32, 32);
    const mesh = new THREE.Mesh(geometry, gradientMaterial);
    
    try {
      scene.add(mesh);
    } catch (error) {
      console.error('Failed to add background mesh to scene:', error);
    }

    return () => {
      try {
        scene.remove(mesh);
        geometry.dispose();
        gradientMaterial.dispose();
      } catch (error) {
        console.error('Error cleaning up background resources:', error);
      }
    };
  }, [scene, gradientMaterial]);

  useEffect(() => {
    if (!scene) return;

    let topColor = new THREE.Color();
    let bottomColor = new THREE.Color();

    // Handle section transitions in sequence
    if (heroProgress < 1) {
      // Hero to Welcome transition
      topColor.setHex(COLORS.HERO.TOP).lerp(new THREE.Color(COLORS.WELCOME.TOP), heroProgress);
      bottomColor.setHex(COLORS.HERO.BOTTOM).lerp(new THREE.Color(COLORS.WELCOME.BOTTOM), heroProgress);
    } else if (welcomeProgress < 1) {
      // Welcome to Mentor transition
      topColor.setHex(COLORS.WELCOME.TOP).lerp(new THREE.Color(COLORS.MENTOR.TOP), welcomeProgress);
      bottomColor.setHex(COLORS.WELCOME.BOTTOM).lerp(new THREE.Color(COLORS.MENTOR.BOTTOM), welcomeProgress);
    } else if (mentorProgress < 1) {
      // Start transitioning to MeetTia during Mentor section
      const transitionStart = 0.5; // Start transition halfway through mentor section
      const normalizedProgress = mentorProgress > transitionStart 
        ? (mentorProgress - transitionStart) / (1 - transitionStart)
        : 0;
      
      topColor.setHex(COLORS.MENTOR.TOP).lerp(new THREE.Color(COLORS.MEET_TIA.TOP), normalizedProgress);
      bottomColor.setHex(COLORS.MENTOR.BOTTOM).lerp(new THREE.Color(COLORS.MEET_TIA.BOTTOM), normalizedProgress);
    } else if (meetTiaProgress < 1) {
      // MeetTia section (already black)
      topColor.setHex(COLORS.MEET_TIA.TOP);
      bottomColor.setHex(COLORS.MEET_TIA.BOTTOM);
    } else {
      // Final state
      topColor.setHex(COLORS.FINAL.TOP);
      bottomColor.setHex(COLORS.FINAL.BOTTOM);
    }

    try {
      // Update gradient colors
      gradientMaterial.uniforms.topColor.value.copy(topColor);
      gradientMaterial.uniforms.bottomColor.value.copy(bottomColor);
      gradientMaterial.uniforms.offset.value = Math.max(heroProgress, welcomeProgress, mentorProgress, meetTiaProgress) * 0.5;

      // Update scene background
      if (scene.background) {
        scene.background.copy(topColor);
      } else {
        scene.background = topColor.clone();
      }
    } catch (error) {
      console.error('Error updating background colors:', error);
    }
  }, [scene, gradientMaterial, heroProgress, welcomeProgress, mentorProgress, meetTiaProgress]);

  return null;
}

SceneBackground.propTypes = {
  scene: PropTypes.object.isRequired,
  heroProgress: PropTypes.number,
  welcomeProgress: PropTypes.number,
  mentorProgress: PropTypes.number,
  meetTiaProgress: PropTypes.number,
  exponent: PropTypes.number
};
