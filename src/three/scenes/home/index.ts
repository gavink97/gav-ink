import WebGL from 'three/addons/capabilities/WebGL.js';
//import { Scene } from './macbook.ts';

if (WebGL.isWebGL2Available()) {
	//Scene();
} else {
	window.location.replace('/?nogl=true');
}
