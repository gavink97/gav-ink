import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import _FS_MAIN from '../../shaders/fragment_main.glsl';
import _FS_PARS from '../../shaders/fragment_pars.glsl';
import _VS_MAIN from '../../shaders/vertex_main.glsl';
import _VS_PARS from '../../shaders/vertex_pars.glsl';

export function SphereScene(): void {
	const useHelpers = false;
	const width = window.innerWidth;
	const height = window.innerHeight;

	const container = document.getElementById('three-home-scene');
	if (!container) return;

	let env = container.getAttribute('environment-data');
	if (!env) {
		env = 'prod';
	}

	const scene = new THREE.Scene();

	const aspect = width / height;

	const renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true,
		powerPreference: 'high-performance',
	});

	if (aspect < 1) {
		renderer.setSize(width, height * aspect);
	} else {
		renderer.setSize(width, height);
	}

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setAnimationLoop(animate);

	const canvas = renderer.domElement;
	container.appendChild(canvas);

	const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
	camera.position.setY(10);
	//camera.position.setZ(10);

	if (camera.aspect < 1) {
		const value = 5 / camera.aspect;
		camera.position.setZ(Math.min(8, value));
	} else {
		camera.position.setZ(5);
	}

	const light = new THREE.DirectionalLight('#f9ffeb', 0.8);
	light.position.set(80, 100, 10);
	light.castShadow = true;

	const ambientLight = new THREE.AmbientLight('#4F804F', 1.15);
	scene.add(ambientLight, light);

	const clock = new THREE.Clock();

	const Uniforms = {
		uTime: {
			type: 'f',
			value: clock.getElapsedTime(),
		},
		uScreenSize: {
			type: 'f',
			value: new THREE.Vector2(width, height),
		},
	};

	let quality = 100;

	if (env === 'prod') {
		quality = 400;
	}

	const geometry = new THREE.IcosahedronGeometry(1, quality);

	/*
    const material = new THREE.ShaderMaterial({
            wireframe: false,
            precision: 'highp',
            uniforms: Uniforms,
            vertexShader: _VS,
            fragmentShader: _FS,
            side: THREE.DoubleSide,
        })
    */

	const material = new THREE.MeshStandardMaterial({
		//wireframe: false,
		//precision: 'highp'
	});

	material.onBeforeCompile = (shader) => {
		material.userData.shader = shader;

		shader.uniforms.uTime = Uniforms.uTime;

		const parsVertexString = '#include <displacementmap_pars_vertex>';
		shader.vertexShader = shader.vertexShader.replace(parsVertexString, `${parsVertexString}\n${_VS_PARS}`);

		const mainVertexString = '#include <displacementmap_vertex>';
		shader.vertexShader = shader.vertexShader.replace(mainVertexString, `${mainVertexString}\n${_VS_MAIN}`);

		const parsFragmentString = '#include <bumpmap_pars_fragment>';
		shader.fragmentShader = shader.fragmentShader.replace(parsFragmentString, `${parsFragmentString}\n${_FS_PARS}`);

		const mainFragmentString = '#include <normal_fragment_maps>';
		shader.fragmentShader = shader.fragmentShader.replace(mainFragmentString, `${mainFragmentString}\n${_FS_MAIN}`);
	};

	const sphere = new THREE.Mesh(geometry, material);

	sphere.position.set(0, 10, 0);
	sphere.castShadow = true;
	scene.add(sphere);

	const target = new THREE.WebGLRenderTarget(width, height, {
		samples: 8,
	});
	const composer = new EffectComposer(renderer, target);
	const renderPass = new RenderPass(scene, camera);
	composer.addPass(renderPass);

	composer.addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.7, 0.4, 0.4));

	if (useHelpers) {
		const gridHelper = new THREE.GridHelper(10, 10, 0xaec6cf, 0xaec6cf);
		scene.add(gridHelper);

		const axesHelper = new THREE.AxesHelper(5);
		scene.add(axesHelper);
	}

	function adjCanvas(): void {
		const width = window.innerWidth;
		const height = window.innerHeight;
		camera.aspect = width / height;

		if (camera.aspect < 1) {
			const value = 5 / camera.aspect;
			camera.position.setZ(Math.min(8, value));
		} else {
			camera.position.setZ(5);
		}

		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
		composer.setSize(width, height);
	}

	window.addEventListener('resize', adjCanvas);
	document.addEventListener('DOMContentLoaded', adjCanvas);

	function animate(): void {
		sphere.rotation.x += 0.001;
		sphere.rotation.y += 0.001;
		Uniforms.uTime.value = clock.getElapsedTime() / 40;

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
