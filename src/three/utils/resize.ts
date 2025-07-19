import type { PerspectiveCamera, WebGLRenderer } from 'three';

// should simplify this to 100dvh to avoid issues on safari ios
export function adjCanvas(camera: PerspectiveCamera, renderer: WebGLRenderer): void {
	const width = window.innerWidth;
	const height = window.innerHeight;
	const aspect = width / height;

	camera.aspect = aspect;
	camera.position.set(0, 11, 8);

	/*
	if (camera.aspect < 1) {
		const value = 60 / camera.aspect;
		camera.position.setZ(value);
	} else {
		camera.position.setZ(60);
	}
    */

	renderer.setSize(width, height);
	camera.updateProjectionMatrix();
	//composer.setSize(width, height);
}

export function resizeRenderer(renderer: WebGLRenderer): boolean {
	const canvas = renderer.domElement;
	const pixelRatio = window.devicePixelRatio;

	const width = Math.floor(canvas.clientWidth * pixelRatio);
	const height = Math.floor(canvas.clientHeight * pixelRatio);

	const needsResize = canvas.width !== width || canvas.height !== height;
	if (needsResize) {
		renderer.setSize(width, height, false);
	}

	return needsResize;
}
