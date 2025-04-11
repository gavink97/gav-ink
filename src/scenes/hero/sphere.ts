import * as THREE from 'three';
import _FS from '../../shaders/fragment.glsl';
import _VS from '../../shaders/vertex.glsl';

export function SphereScene(): void {
	const useHelpers = false;

	const container = document.getElementById('three-home-scene');
	if (!container) return;

	const scene = new THREE.Scene();

	const aspect = window.innerWidth / window.innerHeight;

	const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
	camera.position.setY(10);

	if (camera.aspect < 1) {
		const value = 60 / camera.aspect;
		camera.position.setZ(value);
	} else {
		camera.position.setZ(60);
	}

	const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });

	if (aspect < 1) {
		renderer.setSize(window.innerWidth, window.innerHeight * aspect);
	} else {
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setAnimationLoop(animate);

	const canvas = renderer.domElement;
	container.appendChild(canvas);

	const clock = new THREE.Clock();

	const Uniforms = {
		u_time: {
			type: 'f',
			value: clock.getElapsedTime(),
		},
		u_screen_size: {
			type: 'f',
			value: new THREE.Vector2(window.innerWidth, window.innerHeight),
		},
	};

	const sphere = new THREE.Mesh(
		//new THREE.BufferGeometry(),
		new THREE.SphereGeometry(14, 32, 32),
		new THREE.ShaderMaterial({
			wireframe: false,
			precision: 'highp',
			uniforms: Uniforms,
			vertexShader: _VS,
			fragmentShader: _FS,
			side: THREE.DoubleSide,
		}),
	);

	sphere.position.set(0, 8, 0);
	sphere.castShadow = true;
	scene.add(sphere);

	if (useHelpers) {
		const gridHelper = new THREE.GridHelper(10, 10, 0xaec6cf, 0xaec6cf);
		scene.add(gridHelper);

		const axesHelper = new THREE.AxesHelper(5);
		scene.add(axesHelper);
	}

	function adjCanvas(): void {
		camera.aspect = window.innerWidth / window.innerHeight;

		if (camera.aspect < 1) {
			const value = 60 / camera.aspect;
			camera.position.setZ(value);
		} else {
			camera.position.setZ(60);
		}

		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	window.addEventListener('resize', adjCanvas);
	document.addEventListener('DOMContentLoaded', adjCanvas);

	function animate(): void {
		//sphere.rotation.x += 0.001;
		sphere.rotation.y += 0.001;
		Uniforms.u_time.value = clock.getElapsedTime();
		render();
	}

	function render(): void {
		if (resizeRendererToDisplaySize(renderer)) {
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}

		renderer.render(scene, camera);
	}
}

function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer): boolean {
	const canvas = renderer.domElement;
	const pixelRatio = window.devicePixelRatio;
	const width = Math.floor(canvas.clientWidth * pixelRatio);
	const height = Math.floor(canvas.clientHeight * pixelRatio);
	const needResize = canvas.width !== width || canvas.height !== height;
	if (needResize) {
		renderer.setSize(width, height, false);
	}
	return needResize;
}
