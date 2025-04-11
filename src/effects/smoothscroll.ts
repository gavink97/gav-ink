import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

const lenis = new Lenis({
	wrapper: document.querySelector('html'),
});

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
