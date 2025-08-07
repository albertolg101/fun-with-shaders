uniform float uVelocity;

varying vec2 vUv;

void main() {
    vUv = uv;
    vec3 pos = position;
    pos.x += (uv.y - 0.5) * (uv.y - 0.5) * 60.0 * sign(uVelocity) * log(abs(uVelocity) + 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}