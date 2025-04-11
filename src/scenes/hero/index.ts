import WebGL from 'three/addons/capabilities/WebGL.js';
import { SphereScene } from './sphere.ts';

if (WebGL.isWebGL2Available()) {
	SphereScene();
} else {
	window.location.replace('/?nogl=true');
}
