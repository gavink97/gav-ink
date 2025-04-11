import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function ScrollScene() {
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
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	container.appendChild(renderer.domElement);

	//const clock = new THREE.Clock();

	const modalPath = 'assets/modals/body_block_rig_by_mixamo.glb';
	const loader = new GLTFLoader();

	const animationScripts: { start: number; end: number; func: () => void }[] = [];

	loader.load(
		modalPath,
		(gltf) => {
			floor();

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

			const skeleton = new THREE.SkeletonHelper(model);
			skeleton.visible = false;
			scene.add(skeleton);

			const animations = gltf.animations;
			const mixer = new THREE.AnimationMixer(model);

			const action = mixer.clipAction(animations[0]);
			action.reset().play().paused = true;

			animationScripts.push({
				start: 0,
				end: 101,
				func: () => {
					const duration = action.getClip().duration;
					const scrolldec = scrollPercent / 100;
					const toScale = duration * scrolldec;

					action.time = toScale;
					mixer.update(toScale);
				},
			});
		},
		(xhr) => {
			loadingModel(xhr);
		},
		(error) => {
			console.error(error);
			throw error;
		},
	);

	// animations here

	window.addEventListener('resize', () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	});

	function scalePercent(start: number, end: number) {
		return (scrollPercent - start) / (end - start);
	}

	function floor() {
		const mesh = new THREE.Mesh(
			new THREE.PlaneGeometry(100, 100),
			new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false }),
		);
		mesh.rotation.x = -Math.PI / 2;
		mesh.receiveShadow = true;
		scene.add(mesh);
	}

	function playScrollAnimations() {
		for (const animation of animationScripts) {
			if (scrollPercent >= animation.start && scrollPercent < animation.end) {
				animation.func();
			}
		}
	}

	let scrollPercent = 0;

	// on scroll thru element
	window.addEventListener('scroll', () => {
		//console.log(container.scrollHeight)
		scrollPercent =
			((document.documentElement.scrollTop || document.body.scrollTop) /
				((document.documentElement.scrollHeight || document.body.scrollHeight) -
					document.documentElement.clientHeight)) *
			100;
		(document.getElementById('scrollProgress') as HTMLDivElement).innerText =
			`Scroll Progress: ${scrollPercent.toFixed(0)}`;
	});

	function animate() {
		requestAnimationFrame(animate);
		playScrollAnimations();
		render();
	}

	function render() {
		renderer.render(scene, camera);
	}

	window.scrollTo({ top: 0, behavior: 'smooth' });
	animate();
}

// dynamically get size and render percentage in div
function loadingModel(xhr: ProgressEvent) {
	const totalSize = 2410692;

	console.log(`${((xhr.loaded / totalSize) * 100).toFixed(1)}%`);
}
