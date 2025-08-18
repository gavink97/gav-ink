import WebGL from 'three/addons/capabilities/WebGL.js';
import { Scene2 } from './main.ts';
import { GetCookie } from '../../../utils/cookies.ts';

async function init() {
	if (GetCookie('prefnogl') !== '') {
		return;
	}

	if (GetCookie('nogl') === 'true') {
		return;
	}

	if (WebGL.isWebGL2Available()) {
		try {
			await Scene2();
		} catch (error) {
			console.error('An error occured loading the scene:', error);

			//const expiry = new Date();
			//expiry.setDate(expiry.getDate() + 7);

			//document.cookie = `nogl=true; expires=${expiry.toUTCString()}; path=/; secure; HttpOnly`;
			document.cookie = 'nogl=true';
			//window.location.replace('/');
		}
	} else {
		document.cookie = 'nogl=true';
		//window.location.replace('/');
	}
}

init();
