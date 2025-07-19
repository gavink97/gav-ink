import Stats from 'stats.js';
import * as THREE from 'three';
import { OrganicSphereObject } from '../../objects/sphere.ts';
import type { SceneParameters } from '../../types/object.ts';
import { PlayScrollAnimations, StartOffset, type AnimationTimeline } from '../../utils/timeline.ts';
import { MacbookObject } from '../../objects/macbook.ts';
import { adjCanvas, resizeRenderer } from '../../utils/resize.ts';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import token from '../../../../tokens.json';

export async function Scene2() {
	THREE.Cache.enabled = true;

	const isMobile = /Mobi|Android/i.test(navigator.userAgent);

	const useHelpers = false;

	const container = document.getElementById('three-home-scene');
	if (!container) return;

	const width = window.innerWidth;
	const height = window.innerHeight;
	const aspect = width / height;

	let env = container.getAttribute('environment-data');
	if (!env) {
		env = 'prod';
	}

	const scene = new THREE.Scene();

	const renderer = new THREE.WebGLRenderer({
		antialias: !isMobile,
		alpha: true,
		powerPreference: 'high-performance',
		precision: isMobile ? 'mediump' : 'highp',
	});

	if (aspect < 1) {
		renderer.setSize(width, height * aspect);
	} else {
		renderer.setSize(width, height);
	}

	renderer.shadowMap.enabled = false;
	//renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.setPixelRatio(window.devicePixelRatio);
	//renderer.setAnimationLoop(animate);

	const canvas = renderer.domElement;
	container.appendChild(canvas);

	const clock = new THREE.Clock();
	const timeline: AnimationTimeline[] = [];

	if (env === 'dev') {
		// caution: stats breaks footer
		// biome-ignore lint: this requires var
		var stats = new Stats();
		stats.showPanel(0);
		document.body.appendChild(stats.dom);
	}

	const sphere_layer = 0;
	const macbook_layer = 1;

	const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
	const target = new THREE.Vector3(0, 10, 0);
	camera.position.set(0, 11, 8);
	//camera.up = new THREE.Vector3(0, 0, 0);
	camera.lookAt(target);
	camera.layers.enable(sphere_layer);
	camera.layers.enable(macbook_layer);

	/*
	if (camera.aspect < 1) {
		const value = 5 / camera.aspect;
		camera.position.setZ(Math.min(8, value));
	} else {
		camera.position.setZ(5);
	}

	if (camera.aspect < 1) {
		const value = 60 / camera.aspect;
		camera.position.setZ(value);
	} else {
		camera.position.setZ(15);
	}
    */

	const sceneParams: SceneParameters = {
		clock: clock,
		container: container,
		environment: env,
		isMobile: isMobile,
		windowHeight: width,
		windowWidth: height,
	};

	const sphere = OrganicSphereObject({
		castShadow: false,
		layer: sphere_layer,
		sceneParameters: sceneParams,
		position: new THREE.Vector3(0, 11.55, 3),
		//position: new THREE.Vector3(0, 10, 55),
	});

	scene.add(sphere.mesh);

	const macbook = await MacbookObject({
		castShadow: false,
		layer: macbook_layer,
		sceneParameters: sceneParams,
		position: new THREE.Vector3(0, 0, 2),
	});

	macbook.action.time = 2;
	macbook.mixer.update(0);

	const macbookScreen = macbook.gltf.scene.getObjectByName('VQmfhbMzfNAuKAD');

	console.log(macbookScreen);
	macbookScreen.material.color.set(token.color.background.primary.value);
	macbookScreen.material.metalness = 0;

	scene.add(macbook.gltf.scene);

	/*
	timeline.push({
		start: 0,
		end: 100,
		func: (start) => {
			const toScale = StartOffset(scrollPercent, start, macbook.action.getClip().duration);

			macbook.action.time = toScale;
			macbook.mixer.update(toScale);
		},
	});
    */

	timeline.push({
		start: 15,
		end: 100,
		func: (progress) => {
			const action = macbook.action;
			const offset = 2;
			const duration = action.getClip().duration - offset;
			const reversedProgress = 1 - progress;

			action.time = duration * reversedProgress;
			macbook.mixer.update(0);
		},
	});

	timeline.push({
		start: 0,
		end: 15,
		easing: 'easeInOutSine',
		func: (progress) => {
			const startPos = new THREE.Vector3(0, 12.2, 8);
			const newPos = new THREE.Vector3(0, 10, 60);
			camera.position.lerpVectors(startPos, newPos, progress);
		},
	});

	if (useHelpers) {
		const gridHelper = new THREE.GridHelper(10, 0, 0xaec6cf, 0xaec6cf);
		scene.add(gridHelper);

		const axesHelper = new THREE.AxesHelper(5);
		scene.add(axesHelper);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.target.set(target.x, target.y, target.z);
		controls.update();

		const cameraHelper = new THREE.CameraHelper(camera);
		scene.add(cameraHelper);
	}

	let scrollPercent = 0;

	window.addEventListener('resize', init);
	document.addEventListener('DOMContentLoaded', init);

	window.addEventListener('scroll', (): void => {
		const scene = document.querySelector('home-scene');
		if (!scene) return;

		const progress = document.getElementById('scroll-progress');
		if (!progress) return;

		// This acts weird if home-scene is missing class="h-full w-full block"
		const rect = scene.getBoundingClientRect();
		const sceneHeight = scene.scrollHeight;
		const clientHeight = document.documentElement.clientHeight;

		if (rect.top <= 0) {
			const scrollCalc = (Math.abs(rect.top) / (sceneHeight - clientHeight)) * 100;
			scrollPercent = Math.min(Math.max(scrollCalc, 0), 100);
			//console.log(rect.top, (scene as HTMLElement).offsetTop, sceneHeight, clientHeight, scrollPercent)
		} else {
			scrollPercent = 0;
		}

		//(progress as HTMLDivElement).innerText = 'Scroll Progress : ' + scrollPercent.toFixed(0)
		progress.setAttribute('progress', scrollPercent.toFixed(0).toString());
	});

	window.scrollTo({ top: 0, behavior: 'instant' });

	animate();

	function init(): void {
		adjCanvas(camera, renderer);
	}

	function animate(): void {
		if (env === 'dev') {
			stats.begin();
		}

		requestAnimationFrame(animate);
		PlayScrollAnimations(timeline, scrollPercent);

		sphere.animationHook();

		if (env === 'dev') {
			stats.end();
		}

		render();
	}

	function render(): void {
		if (resizeRenderer(renderer)) {
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}

		renderer.render(scene, camera);
	}
}
