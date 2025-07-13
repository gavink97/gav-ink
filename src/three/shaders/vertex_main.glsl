vec3 coords = normal;
coords.y += uTime;
vec3 noisePattern = vec3(snoise(coords / 1.5));
float pattern = wave(noisePattern + uTime);

vDisplacement = pattern;

float displacement = pattern / 3.;

transformed += normalize(objectNormal) * displacement;
