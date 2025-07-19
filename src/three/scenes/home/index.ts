import WebGL from 'three/addons/capabilities/WebGL.js';
import { Scene2 } from './main.ts';

async function init() {
	if (WebGL.isWebGL2Available()) {
		try {
			await Scene2();
		} catch (error) {
			console.error('An error occured loading the scene:', error);
			window.location.replace('/?nogl=true');
		}
	} else {
		window.location.replace('/?nogl=true');
	}
}

init();
