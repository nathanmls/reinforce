'use client';

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import PropTypes from 'prop-types';

export default function SceneBackground({ 
  scene,
  heroProgress = 0,
  welcomeProgress = 0,
  exponent = 0.6
}) {
  const gradientShader = useMemo(() => ({
    uniforms: {
      topColor: { value: new THREE.Color("#FFFFFF") },
      bottomColor: { value: new THREE.Color("#F2F2F2") },
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
    const geometry = new THREE.SphereGeometry(500, 32, 32);
    const mesh = new THREE.Mesh(geometry, gradientMaterial);
    scene.add(mesh);

    return () => {
      scene.remove(mesh);
      geometry.dispose();
      gradientMaterial.dispose();
    };
  }, [scene, gradientMaterial]);

  useEffect(() => {
    // Calculate smooth color transitions
    const topColor = new THREE.Color();
    const bottomColor = new THREE.Color();

    if (heroProgress < 1) {
      // Hero to Welcome transition
      topColor.setHex(0xFFFFFF).lerp(new THREE.Color(0xAB28D2), heroProgress);
      bottomColor.setHex(0xF2F2F2).lerp(new THREE.Color(0x7B1FA2), heroProgress);
    } else if (welcomeProgress < 1) {
      // Welcome to Mentor transition
      topColor.setHex(0xAB28D2).lerp(new THREE.Color(0x58146C), welcomeProgress);
      bottomColor.setHex(0x7B1FA2).lerp(new THREE.Color(0xAB27D2), welcomeProgress);
    } else {
      // Final Mentor section colors
      topColor.setHex(0x58146C);
      bottomColor.setHex(0xAB27D2);
    }

    // Update gradient colors
    gradientMaterial.uniforms.topColor.value.copy(topColor);
    gradientMaterial.uniforms.bottomColor.value.copy(bottomColor);
    gradientMaterial.uniforms.offset.value = Math.max(heroProgress, welcomeProgress) * 0.5;

    // Update scene background
    if (scene.background) {
      scene.background.copy(topColor);
    } else {
      scene.background = topColor.clone();
    }
  }, [scene, gradientMaterial, heroProgress, welcomeProgress]);

  return null;
}

SceneBackground.propTypes = {
  scene: PropTypes.object.isRequired,
  heroProgress: PropTypes.number,
  welcomeProgress: PropTypes.number,
  exponent: PropTypes.number
};
