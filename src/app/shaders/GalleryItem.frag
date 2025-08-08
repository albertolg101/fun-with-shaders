#define PI 3.141592
#define PIXELATION_RES 100.0

uniform float uAspect;
uniform sampler2D uTexture;
uniform float uTextureAspect;
uniform vec3 uColor;
uniform vec2 uMouse;
uniform float uTime;
uniform float uMouseRadio;

varying vec2 vUv;

float sq(float x) {
    return x * x;
}

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

vec4 getColor(in vec2 uv) {
    vec2 centeredUV = uv - vec2(0.5);
    float ratio = (centeredUV.x * centeredUV.x + centeredUV.y * centeredUV.y); 

    vec2 canvasSize = vec2(uAspect, 1.0) / max(uAspect, 1.0);
    vec2 texSize = vec2(uTextureAspect, 1.0) / max(uTextureAspect, 1.0);
    vec2 scale = vec2(max(uTextureAspect / uAspect, 1.0));
    vec2 offset = abs(canvasSize - texSize  / scale) * 0.5;
    vec2 texUv = (uv * canvasSize - offset) / texSize * scale;
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

    vec4 color = mix(vec4(uColor * ratio, 1.0), texColor, step(0.1, texColor.w));
    return color;
}

vec2 pixalate(vec2 uv, float res, float aspect) {
    return vec2(
        floor(uv.x * res * aspect) / (res * aspect),
        floor(uv.y * res) / res
    );
}

vec2 randPointInsideCircle(vec2 seed) {
    float radius = random(seed);
    float angle = random(seed + vec2(1.0)) * 2.0 * PI;
    return vec2(radius * cos(angle), radius * sin(angle));
}

void main() {
    vec2 iuv = pixalate(vUv, PIXELATION_RES, uAspect); 
    float itime = floor(uTime * 20.0) / 20.0;
    vec2 ruv = vec2(
        uMouse.x + uMouseRadio * randPointInsideCircle(sin(iuv + itime)).x,
        uMouse.y + uMouseRadio * randPointInsideCircle(sin(iuv + itime)).y
    );

    gl_FragColor = mix(
        getColor(vUv),
        getColor(abs(ruv)),
        smoothstep(
            sq(uMouseRadio), 
            sq(uMouseRadio * 0.1),
            sq((vUv.x - uMouse.x) * uAspect) + sq(vUv.y - uMouse.y)
        )
    );
}