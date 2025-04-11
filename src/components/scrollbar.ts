import { animate } from 'motion';
import token from '../../tokens.json';

const container = document.querySelector('scroll-bar');
if (!container) {
	throw new Error('Could not find scroll-bar element');
}

const content = container.querySelector('#motion-scroll') as HTMLDivElement;
if (!content) {
	throw new Error('Could not find element with id motion-scroll');
}

const suspense = container.querySelector('#placeholder') as HTMLDivElement;
if (!suspense) {
	throw new Error('Could not find element with id placeholder');
}

scrollBar(content);

setTimeout(() => {
	suspense.style.display = 'none';
}, 10);

function scrollBar(content: HTMLDivElement): void {
	content.style.width = '1rem';
	content.style.height = '60vh';
	content.style.background = String(token.color.background.accent.value);
	content.style.transformOrigin = 'top';
	content.style.bottom = '20vh';
	content.style.right = '1.25rem';
	content.style.position = 'fixed';
	content.style.borderRadius = '1rem';

	const scrollEvent = (): number[] => {
		const parent = document.querySelector('home-scene');
		const clientHeight = document.documentElement.clientHeight;
		let offset = 0;
		let scroll = 0;

		if (parent) {
			const parentRects = parent.getBoundingClientRect();
			if (parentRects.bottom < clientHeight) {
				offset = Math.abs(parentRects.bottom - clientHeight);
			} else {
				offset = 0;
			}
		}

		const progress = document.getElementById('scroll-progress');
		scroll = progress ? Number(progress.getAttribute('progress')) / 100 : 0;

		return [scroll, offset];
	};

	window.addEventListener('scroll', (): void => {
		const progress = scrollEvent();

		animate(content, { scaleY: progress[0], translateY: `-${progress[1]}px` }, { duration: 0 });
	});

	animate(content, { scaleY: 0 }, { duration: 0 });
}
