precision mediump float;

uniform float uAspect;
uniform sampler2D uTexture;
uniform float uTextureAspect;
uniform vec3 uColor;
uniform vec2 uMouse;

varying vec2 vUv;

void main() {
    vec2 uv = vUv - vec2(0.5);
    float ratio = (uv.x * uv.x + uv.y * uv.y) * 1.8;

    vec2 canvasSize = vec2(uAspect, 1.0) / max(uAspect, 1.0);
    vec2 texSize = vec2(uTextureAspect, 1.0) / max(uTextureAspect, 1.0);
    vec2 scale = vec2(max(uTextureAspect / uAspect, 1.0));
    vec2 offset = abs(canvasSize - texSize  / scale) * 0.5;
    vec2 texUv = (vUv * canvasSize - offset) / texSize * scale;
    vec4 texColor = mix(
        vec4(0.0), texture2D(uTexture, texUv), 
        min(
            min(
                step(0.0, texUv.x),
                step(0.0, texUv.y)
            ),
            min(
                step(texUv.x, 1.0),
                step(texUv.y, 1.0)
            )
        )
    );

    gl_FragColor = mix(vec4(uColor - ratio, 1.0), texColor, step(0.1, texColor.w));
}