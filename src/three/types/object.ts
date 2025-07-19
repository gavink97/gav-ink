import type { AnimationAction, AnimationMixer, Clock, Mesh, Vector3 } from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface ObjectThree {
	animationHook?: () => void;
}

export interface ObjectThreeMesh extends ObjectThree {
	mesh: Mesh;
}

export interface ObjectThreeGLTF extends ObjectThree {
	action: AnimationAction;
	gltf: GLTF;
	mixer: AnimationMixer;
	suspense: Mesh;
}

export interface SceneParameters {
	clock: Clock;
	container: HTMLElement;
	environment: string;
	isMobile: boolean;
	windowHeight: number;
	windowWidth: number;
}

export interface ObjectThreeParameters {
	castShadow: boolean;
	layer?: number;
	sceneParameters: SceneParameters;
	position: Vector3;
}
