import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import type { ObjectThreeParameters, ObjectThreeGLTF } from '../types/object.ts';
import type { Mesh } from 'three';

export async function MacbookObject(params: ObjectThreeParameters): Promise<ObjectThreeGLTF> {
	const scene = params.sceneParameters;

	let model: GLTF | Error;

	try {
		model = await loadModel(scene.environment);

		if (model instanceof Error) {
			throw new Error('An error occured while loading the model');
		}
	} catch {
		throw new Error('An error occured while loading the model');
	}

	const mesh = model.scene;
	const mixer = new THREE.AnimationMixer(mesh);
	const clip = THREE.AnimationClip.findByName(model.animations, 'monitor');

	const action = mixer.clipAction(clip);
	action.reset();
	action.paused = true;
	action.play();

	const pos = params.position;

	mesh.layers.disableAll();
	mesh.layers.enable(params.layer);
	mesh.layers.set(params.layer);
	mesh.position.set(pos.x, pos.y, pos.z);

	if (params.castShadow) {
		mesh.traverse((object) => {
			if (!object.isObject3D) {
				object.castShadow = false;
			} else {
				object.castShadow = true;
			}
		});
	}

	{
		const color = '#404040';
		const intensity = 0.5;
		const ambLight = new THREE.AmbientLight(color, intensity);
		ambLight.lookAt(pos.x, pos.y, pos.z);

		ambLight.layers.disableAll();
		ambLight.layers.enable(params.layer);
		ambLight.layers.set(params.layer);

		mesh.add(ambLight);
	}

	{
		const color = '#ffffff';
		const intensity = 2;
		const dirLight = new THREE.DirectionalLight(color, intensity);
		dirLight.position.set(pos.x + 0, pos.y + 40, pos.z + -30);
		dirLight.lookAt(pos.x, pos.y, pos.z);

		dirLight.castShadow = true;
		dirLight.shadow.camera.top = 2;
		dirLight.shadow.camera.bottom = -2;
		dirLight.shadow.camera.left = -2;
		dirLight.shadow.camera.right = 2;
		dirLight.shadow.camera.near = 0.1;
		dirLight.shadow.camera.far = 40;

		dirLight.layers.disableAll();
		dirLight.layers.enable(params.layer);
		dirLight.layers.set(params.layer);

		mesh.add(dirLight);
		//mesh.add(dirLight.target);
	}

	{
		const color = '#ffffff';
		const intensity = 2;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(pos.x + 5, pos.y + 0, pos.z + 15);
		light.lookAt(pos.x, pos.y, pos.z);

		light.layers.disableAll();
		light.layers.enable(params.layer);
		light.layers.set(params.layer);

		mesh.add(light);
		//mesh.add(light.target);
	}

	const exp: ObjectThreeGLTF = {
		action: action,
		gltf: model,
		mixer: mixer,
		suspense: suspense(),
	};

	return exp;
}

function suspense(): Mesh {
	const geometry = new THREE.BoxGeometry(10, 10, 10);
	const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
	const cube = new THREE.Mesh(geometry, material);

	return cube;
}

function progress(xhr: ProgressEvent): void {
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

async function loadModel(env: string): Promise<GLTF | Error> {
	let modelPath: string;
	const loader = new GLTFLoader();

	if (env === 'prod') {
		modelPath = 'public/model/macbook.drc';
		const preloader = new DRACOLoader();

		const draco = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

		preloader.setDecoderPath(draco);
		preloader.preload();

		loader.setDRACOLoader(preloader);
	} else {
		modelPath = 'public/model/macbook.glb';
	}

	return new Promise((resolve, reject) => {
		loader.load(
			modelPath,
			(gltf) => {
				resolve(gltf);
			},
			(xhr) => {
				progress(xhr);
			},
			(error) => {
				console.log(error);
				reject(error);
			},
		);
	});
}
