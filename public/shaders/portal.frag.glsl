varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
uniform vec3 glowColor;
uniform float time;

void main() {
  // Calculate distance from center for radial effect
  float dist = length(vUv - 0.5);
  
  // Create a sharper edge with smoother transition
  float edge = smoothstep(0.35, 0.5, dist);
  
  // Create animated pulse effect
  float pulse = sin(time * 1.5) * 0.5 + 0.5;
  
  // Add ripple effect
  float ripple = sin((dist * 15.0 - time) * 2.0) * 0.5 + 0.5;
  ripple *= smoothstep(0.5, 0.35, dist); // Only show ripples inside the portal
  
  // Calculate fresnel effect for edge glow
  float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.0);
  
  // Mix colors based on effects
  vec3 innerColor = mix(glowColor, vec3(1.0, 1.0, 1.0), ripple * 0.3);
  vec3 finalColor = mix(innerColor, glowColor * 1.5, edge * fresnel);
  
  // Add subtle color variation
  finalColor += vec3(sin(time * 0.5) * 0.1, cos(time * 0.3) * 0.1, sin(time * 0.7) * 0.1) * (1.0 - edge);
  
  // Adjust opacity for edge fade
  float opacity = mix(0.9, 0.0, smoothstep(0.4, 0.5, dist));
  opacity = mix(opacity, opacity * (pulse * 0.5 + 0.5), edge);
  
  gl_FragColor = vec4(finalColor, opacity);
}
