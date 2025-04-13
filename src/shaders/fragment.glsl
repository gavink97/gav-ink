precision highp float;

uniform float uTime;
uniform vec2 u_screen_size;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying float vDisplacemnt;

void main() {
    //vec3 viewDirection = normalize(cameraPosition - vPosition);
    //float fresnel = 1. - dot(viewDirection, circle);
    vec4 c = vec4(vec3(0.35294, 0.49804, 0.32941), 1.);
    gl_FragColor = c;
    //gl_FragColor = vec4(position, 1., 1.);
}
