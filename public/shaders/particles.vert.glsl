uniform float time;
uniform float size;
attribute float scale;

void main() {
  vec3 pos = position;
  pos.x += sin(time + position.y) * 0.5;
  pos.y += cos(time + position.x) * 0.5;
  gl_PointSize = size * scale;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
