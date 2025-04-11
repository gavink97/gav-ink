precision highp float;

uniform float u_time;

varying vec3 pos;

void main() {
    pos = position;

    float posy;
    posy = sin(u_time) + position.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position.x, posy, position.z, 1.0 );
}
