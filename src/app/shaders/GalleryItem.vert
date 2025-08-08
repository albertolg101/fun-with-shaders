uniform float uVelocity;
uniform vec2 uMouse;

varying vec2 vUv;

void main() {
    vUv = uv;
    vec3 pos = position;
    pos.x += (uv.y - 0.5) * (uv.y - 0.5) * 0.1 * sign(uVelocity) * log(abs(uVelocity) + 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}