import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

const lenis = new Lenis({
	//anchors: {
	//	offset: -100,
	//},
	//anchors: true,
	wrapper: document.querySelector('html'),
});

window.Lenis = lenis;
window.LenisAnchor = LenisAnchor;

function raf(time): void {
	lenis.raf(time);
	requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

function checkSafari(): void {
	const userAgentString = navigator.userAgent;
	const chromeAgent = userAgentString.indexOf('Chrome') > -1;
	let safariAgent = userAgentString.indexOf('Safari') > -1;
	if (chromeAgent && safariAgent) safariAgent = false;

	// smooth scrolling jitters on safari
	if (safariAgent) {
		const root = document.querySelector('html');
		root.style.scrollBehavior = 'smooth';
		return;
	}
}

export function LenisAnchor(anchor: string): void {
	const lenis = window.Lenis;
	const offset = lenisOffset(anchor);
	//let options = {};

	console.log(`anchor: ${anchor} offset: ${offset}`);

	const options = {
		onComplete: () => {
			console.log('done');
		},
		immediate: false,
		offset: offset,
	};

	if (window.location.pathname !== '/') {
		console.log(window.location.pathname);
		lenis.options.anchors = true;
	} else {
		lenis.options.anchors = false;
	}

	lenis.scrollTo(anchor, options);
	return;
	/*

	const swap = document.getElementById('swap');
	if (!swap) {
		console.log(offset);
		options = {
			onComplete: () => {
				console.log('done');
			},
			immediate: false,
			offset: offset,
		};

		lenis.scrollTo(anchor, options);
		return;
	}

	const attribute = 'swap-active';

	document.getElementById('home').style.display = 'unset';
	swap.innerHTML = '';

	const active = swap.getAttribute(attribute);
	const state = active.toLowerCase() === 'true';

	options = {
		immediate: state,
		offset: offset,
	};

	swap.setAttribute(attribute, 'false');
	lenis.scrollTo(anchor, options);
    */
}

function lenisOffset(anchor: string): number {
	switch (anchor.toLowerCase()) {
		case '0':
		case 'top':
		case '#sustainable-grid':
			return 0;

		default:
			return -100;
	}
}
