import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import _FS from '../../shaders/fragment.glsl';
import _VS from '../../shaders/vertex.glsl';
import { type AnimationTimeline, PlayScrollAnimations, StartOffset } from '../utils/utils.ts';

// figure out rotation angles
export function Scene(): void {
	let useHelpers = false;

	const container = document.getElementById('three-home-scene');
	if (!container) return;

	let env = container.getAttribute('environment-data');
	if (!env) {
		env = 'prod';
	}
	env = 'prod';

	const scene = new THREE.Scene();

	{
		const amb = new THREE.AmbientLight(0x404040, 0.5);
		scene.add(amb);
	}

	{
		const dirLight = new THREE.DirectionalLight(0xffffff, 2);
		dirLight.position.set(0, 40, -30);
		dirLight.castShadow = true;
		dirLight.shadow.camera.top = 2;
		dirLight.shadow.camera.bottom = -2;
		dirLight.shadow.camera.left = -2;
		dirLight.shadow.camera.right = 2;
		dirLight.shadow.camera.near = 0.1;
		dirLight.shadow.camera.far = 40;
		scene.add(dirLight);
		scene.add(dirLight.target);
	}

	{
		const color = 0xffffff;
		const intensity = 2;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(5, 0, 15);
		scene.add(light);
		scene.add(light.target);
	}

	const aspect = window.innerWidth / window.innerHeight;

	const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
	camera.position.setY(10);

	if (camera.aspect < 1) {
		const value = 60 / camera.aspect;
		camera.position.setZ(value);
	} else {
		camera.position.setZ(60);
	}

	// need to make high-performance conditional to macos
	const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });

	// look at examples to determine aspect size, maybe just adjust camera instead idk
	if (aspect < 1) {
		renderer.setSize(window.innerWidth, window.innerHeight * aspect);
		//console.log(window.innerHeight, window.innerHeight * aspect)
	} else {
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.outputColorSpace = THREE.SRGBColorSpace;

	const canvas = renderer.domElement;
	container.appendChild(canvas);

	const timeline: AnimationTimeline[] = [];

	// suspense cube
	const geometry = new THREE.BoxGeometry(10, 10, 10);
	const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
	const cube = new THREE.Mesh(geometry, material);
	scene.add(cube);

	if (env === 'prod') {
		useHelpers = false;

		dracoModel(scene)
			.then(([mixer, animations]) => {
				const clip = THREE.AnimationClip.findByName(animations, 'monitor');
				const action = mixer.clipAction(clip);
				action.reset().play().paused = true;

				timeline.push({
					start: 0,
					end: 101,
					func: (start) => {
						const toScale = StartOffset(scrollPercent, start, action.getClip().duration);

						action.time = toScale;
						mixer.update(toScale);
					},
				});
				scene.remove(cube);
			})
			.catch((error) => {
				console.error('Error loading model:', error);
			});
	} else {
		useHelpers = true;

		gltfModel(scene)
			.then(([mixer, animations]) => {
				const clip = THREE.AnimationClip.findByName(animations, 'monitor');
				const action = mixer.clipAction(clip);
				action.reset().play().paused = true;

				timeline.push({
					start: 0,
					end: 101,
					func: (start) => {
						const toScale = StartOffset(scrollPercent, start, action.getClip().duration);

						action.time = toScale;
						mixer.update(toScale);
					},
				});
				scene.remove(cube);
			})
			.catch((error) => {
				console.error('Error loading model:', error);
			});
	}

	// animations here, other shapes here
	const sphere = new THREE.Mesh(
		new THREE.SphereGeometry(2, 32, 32),
		new THREE.ShaderMaterial({
			uniforms: {},
			vertexShader: _VS,
			fragmentShader: _FS,
		}),
	);

	sphere.position.set(10, 5, 0);
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
		//camera.aspect = canvas.clientWidth / canvas.clientHeight;

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

	let scrollPercent = 0;

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

	function animate(): void {
		requestAnimationFrame(animate);
		PlayScrollAnimations(timeline, scrollPercent);
		render();
	}

	function render(): void {
		if (resizeRendererToDisplaySize(renderer)) {
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}

		renderer.render(scene, camera);
	}

	window.scrollTo({ top: 0, behavior: 'smooth' });
	animate();
}

function loadingModel(xhr: ProgressEvent): void {
	const suspense = document.getElementById('suspense');
	if (!suspense) {
		throw new Error('Could not find element with id suspense');
	}

	const container = document.getElementById('three-home-scene');
	if (!container) return;

	let totalSize = container.getAttribute('modal-size');
	if (!totalSize) {
		totalSize = '0';
	}

	const progress = ((xhr.loaded / Number(totalSize)) * 100).toFixed(1);

	(suspense as HTMLDivElement).innerText = `Loading Progress : ${progress}%`;

	if (xhr.loaded === Number(totalSize)) {
		suspense.style.display = 'none';
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

function gltfModel(scene: THREE.Scene): Promise<[THREE.AnimationMixer, THREE.AnimationClip[]]> {
	const modelPath = 'public/model/macbook.glb';
	const loader = new GLTFLoader();

	return new Promise((resolve, reject) => {
		loader.load(
			modelPath,
			(gltf) => {
				const model = gltf.scene;

				scene.add(model);
				model.position.set(0, 0, 2);

				model.traverse((object) => {
					if (!object.isObject3D) {
						console.log('what the fuck is this');
						object.castShadow = false;
					} else {
						object.castShadow = true;
					}
				});

				const animations = gltf.animations;
				const mixer = new THREE.AnimationMixer(model);

				resolve([mixer, animations]);
			},
			(xhr) => {
				loadingModel(xhr);
			},
			(error) => {
				reject(error);
			},
		);
	});
}

function dracoModel(scene: THREE.Scene): Promise<[THREE.AnimationMixer, THREE.AnimationClip[]]> {
	const modelPath = 'public/model/macbook.drc';
	const loader = new DRACOLoader();

	const decoder = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

	loader.setDecoderPath(decoder);
	loader.preload();

	const gltfLoader = new GLTFLoader();

	gltfLoader.setDRACOLoader(loader);

	return new Promise((resolve, reject) => {
		gltfLoader.load(
			modelPath,
			(gltf) => {
				const model = gltf.scene;

				scene.add(model);
				model.position.set(0, 0, 2);

				model.traverse((object) => {
					if (!object.isObject3D) {
						console.log('what the fuck is this');
						object.castShadow = false;
					} else {
						object.castShadow = true;
					}
				});

				const animations = gltf.animations;
				const mixer = new THREE.AnimationMixer(model);

				resolve([mixer, animations]);
			},
			(xhr) => {
				loadingModel(xhr);
			},
			(error) => {
				reject(error);
			},
		);
	});
}
