attribute vec4 vertexPosition;

varying vec3 Normal;
varying vec3 Position;

out vec3 pos;

void main() {
  Normal = normalize(normalMatrix * normal);
  Position = vec3(modelViewMatrix * vec4(position, 1.0));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  pos = position.xyz;
}