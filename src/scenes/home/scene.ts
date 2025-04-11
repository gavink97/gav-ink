import * as THREE from 'three';
import { type GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function Scene() {
	document.addEventListener('DOMContentLoaded', () => {
		const container = document.querySelector('#three-home-scene');
		if (!container) return;

		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0xa0a0a0);
		scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

		const gridHelper = new THREE.GridHelper(10, 10, 0xaec6cf, 0xaec6cf);
		scene.add(gridHelper);

		const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
		hemiLight.position.set(0, 40, 0);
		scene.add(hemiLight);

		const dirLight = new THREE.DirectionalLight(0xffffff, 3);
		dirLight.position.set(3, 10, 10);
		dirLight.castShadow = true;
		dirLight.shadow.camera.top = 2;
		dirLight.shadow.camera.bottom = -2;
		dirLight.shadow.camera.left = -2;
		dirLight.shadow.camera.right = 2;
		dirLight.shadow.camera.near = 0.1;
		dirLight.shadow.camera.far = 40;
		scene.add(dirLight);

		const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.set(0, 1.5, 7);

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.shadowMap.enabled = true;
		container.appendChild(renderer.domElement);

		const modalPath = 'assets/modals/body_block_rig_by_mixamo.glb';

		const loader = new GLTFLoader();

		loader.load(
			modalPath,
			(gltf) => {
				floor(scene);
				model(gltf, scene, camera, renderer);
			},
			(xhr) => {
				loadingModel(xhr);
			},
			(error) => {
				console.error(error);
			},
		);

		window.addEventListener('resize', () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		});
	});
}

function model(gltf: GLTF, scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
	const clock = new THREE.Clock();

	let model = new THREE.Group<THREE.Object3DEventMap>();
	let skeleton = new THREE.SkeletonHelper(model);
	let mixer = new THREE.AnimationMixer(model);
	let numAnimations = 0;

	model = gltf.scene;
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

	skeleton = new THREE.SkeletonHelper(model);
	skeleton.visible = false;
	scene.add(skeleton);

	const animations = gltf.animations;
	mixer = new THREE.AnimationMixer(model);

	numAnimations = animations.length;

	const action = mixer.clipAction(animations[0]);
	action.play();

	const animate = () => {
		const mixerUpdateDelta = clock.getDelta();

		mixer.update(mixerUpdateDelta);
		renderer.render(scene, camera);
		requestAnimationFrame(animate);
	};

	animate();
}

function floor(scene: THREE.Scene) {
	const mesh = new THREE.Mesh(
		new THREE.PlaneGeometry(100, 100),
		new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false }),
	);
	mesh.rotation.x = -Math.PI / 2;
	mesh.receiveShadow = true;
	scene.add(mesh);
}

// dynamically get size and render percentage in div
function loadingModel(xhr: ProgressEvent) {
	const totalSize = 2410692;

	console.log(`${((xhr.loaded / totalSize) * 100).toFixed(1)}%`);
}
