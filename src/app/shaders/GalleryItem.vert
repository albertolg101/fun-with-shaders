uniform float uVelocity;
uniform float uTime;
uniform float uBend;

varying vec2 vUv;

float randomWave(in float x) {
    return (sin(x + 2.0) + sin(2.0 * x + 3.0) + sin(3.0 * x + 5.0) + sin(5.0 * x + 7.0)) / 4.0;
}

void main() {
    vUv = uv;
    vec3 pos = position;
    pos.x += (uv.y - 0.5) * (uv.y - 0.5) * 0.1 * sign(uVelocity) * log(abs(uVelocity) + 1.0);
    pos.z += randomWave(2.0 * uv.x + 0.5 * uv.y * 2.0 + uTime) * 0.0003 * uBend;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}