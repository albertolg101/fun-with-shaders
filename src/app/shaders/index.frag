uniform vec3 uColor;

varying vec2 vUv;

void main() {
    vec2 uv = vUv - vec2(0.5);
    float ratio = (uv.x * uv.x + uv.y * uv.y);
    gl_FragColor = vec4(uColor - ratio, 1.0);
}