precision highp float;

uniform float u_time;
uniform vec2 u_screen_size;

varying vec3 pos;

void main() {
    //vec2 position = gl_FragCoord.xy / u_screen_size;
    vec2 newPos = fract(vec2(pos.x, pos.y) * 10.);
    //gl_FragColor = vec4(newPos, 1., 1.);

    vec4 c1 = vec4(newPos, 0.9, 1.);
    vec4 c2 = vec4(newPos, 0.7, 1.);
    vec4 c = mix(c1, c2, pos.x/12.);
    gl_FragColor = c;
    //gl_FragColor = vec4(position, 1., 1.);
}
