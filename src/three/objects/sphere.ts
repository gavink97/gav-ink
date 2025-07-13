import * as THREE from 'three';
import _FS_MAIN from '../shaders/fragment_main.glsl';
import _FS_PARS from '../shaders/fragment_pars.glsl';
import _VS_MAIN from '../shaders/vertex_main.glsl';
import _VS_PARS from '../shaders/vertex_pars.glsl';
import type { ObjectThreeMesh, ObjectThreeParameters } from '../types/object.ts';

export function OrganicSphereObject(params: ObjectThreeParameters): ObjectThreeMesh {
	const scene = params.sceneParameters;

	const width = scene.windowWidth;
	const height = scene.windowHeight;

	const clock = scene.clock;
	const env = scene.environment;

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

	let quality = scene.isMobile ? 200 : 400;

	if (env === 'dev') {
		quality = 100;
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
	const pos = params.position;

	sphere.layers.disableAll();
	sphere.layers.enable(params.layer);
	sphere.layers.set(params.layer);

	sphere.position.set(pos.x, pos.y, pos.z);
	sphere.castShadow = params.castShadow;

	{
		const color = '#f9ffeb';
		const intensity = 0.8;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(pos.x + 80, pos.y + 100, pos.z + 10);
		light.lookAt(pos.x, pos.y, pos.z);
		light.castShadow = false;

		light.layers.disableAll();
		light.layers.enable(params.layer);
		light.layers.set(params.layer);
		sphere.add(light);
	}

	{
		const color = '#4F804F';
		const intensity = 1.15;
		const ambientLight = new THREE.AmbientLight(color, intensity);
		ambientLight.lookAt(pos.x, pos.y, pos.z);

		ambientLight.layers.disableAll();
		ambientLight.layers.enable(params.layer);
		ambientLight.layers.set(params.layer);
		sphere.add(ambientLight);
	}

	return {
		mesh: sphere,
		animationHook: animate,
	};

	function animate(): void {
		//sphere.rotation.x += 0.001;
		//sphere.rotation.y += 0.001;
		Uniforms.uTime.value = clock.getElapsedTime() / 40;
	}

	/*
	const target = new THREE.WebGLRenderTarget(width, height, {
		samples: 8,
	});

    const composer = new EffectComposer(renderer, target);
	const renderPass = new RenderPass(scene, camera);
	composer.addPass(renderPass);

	composer.addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.7, 0.4, 0.4));
    */

	// should simplify this to 100dvh to avoid issues on safari ios
}
