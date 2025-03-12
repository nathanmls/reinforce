varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
uniform float time;
uniform float displacementScale;

void main() {
  vUv = uv;
  vNormal = normal;
  
  // Create more complex displacement with multiple waves
  vec3 pos = position;
  
  // Radial wave from center
  float dist = length(uv - 0.5);
  float radialWave = sin(dist * 10.0 - time * 2.0) * 0.5 + 0.5;
  
  // Combine with original displacement for more interesting effect
  pos.z += sin(pos.x * 3.0 + time * 1.5) * cos(pos.y * 2.0 + time) * displacementScale;
  pos.z += radialWave * displacementScale * 0.5;
  
  // Add some subtle x/y displacement for a more fluid look
  pos.x += sin(pos.y * 4.0 + time) * displacementScale * 0.1;
  pos.y += cos(pos.x * 4.0 + time) * displacementScale * 0.1;
  
  vPosition = pos;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
