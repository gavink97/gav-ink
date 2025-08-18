import type Lenis from 'lenis';

declare global {
	interface Window {
		Lenis: Lenis;
		LenisAnchor: (anchor: string) => void;
	}
}
