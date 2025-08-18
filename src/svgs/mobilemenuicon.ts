import htmx from 'htmx.org';
import { animate, hover, press } from 'motion';
import token from '../../tokens.json';
import { HandleAnimationTrigger } from '../components/observer.ts';
import { CheckGLCookie } from '../utils/cookies.ts';

let isAnimating = false;
const animationQueue: Array<() => void> = [];
const animationStates = new WeakMap<
	HTMLElement,
	{
		animation: Animation;
		isOpening: boolean;
	}
>();

const lenis = window.Lenis;

const durationSM = Number.parseFloat(token.animation.duration.sm.sec.value);
const durationMD = Number.parseFloat(token.animation.duration.md.sec.value);
const durationLG = Number.parseInt(token.animation.duration.lg.ms.value);

const container = document.querySelector('burger-menu');
if (!container) {
	throw new Error('Could not find burger-menu element');
}

const content = container.querySelector('#burger-menu-icon') as HTMLDivElement;
if (!content) {
	throw new Error('Could not find element with id burger-menu-icon');
}

const suspense = container.querySelector('#placeholder') as HTMLDivElement;
if (!suspense) {
	throw new Error('Could not find element with id placeholder');
}

mobileMenu(content);

setTimeout(() => {
	content.style.display = 'block';
	suspense.style.display = 'none';
}, 70);

function menuIcon(): HTMLButtonElement {
	const button = document.createElement('button');
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as HTMLElement & SVGSVGElement;
	const title = document.createElementNS('http://www.w3.org/2000/svg', 'title') as HTMLElement & SVGTitleElement;
	const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line') as HTMLElement & SVGLineElement;
	const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line') as HTMLElement & SVGLineElement;
	const line3 = document.createElementNS('http://www.w3.org/2000/svg', 'line') as HTMLElement & SVGLineElement;

	button.type = 'button';
	button.ariaLabel = 'mobile menu';

	svg.setAttribute('height', '36');
	svg.setAttribute('width', '36');
	svg.ariaLabel = 'mobile menu';
	svg.ariaHidden = 'true';
	svg.style.overflow = 'auto';

	title.textContent = 'mobile menu icon';

	line1.setAttribute('x1', '0');
	line1.setAttribute('x2', '36');
	line1.setAttribute('y1', '11');
	line1.setAttribute('y2', '11');
	line1.style.strokeWidth = '5';

	line2.setAttribute('x1', '0');
	line2.setAttribute('x2', '36');
	line2.setAttribute('y1', '18');
	line2.setAttribute('y2', '18');
	line2.style.strokeWidth = '5';

	line3.setAttribute('x1', '0');
	line3.setAttribute('x2', '36');
	line3.setAttribute('y1', '25');
	line3.setAttribute('y2', '25');
	line3.style.strokeWidth = '5';

	svg.appendChild(title);
	svg.appendChild(line1);
	svg.appendChild(line2);
	svg.appendChild(line3);
	button.appendChild(svg);

	animate(button, { rotateX: 0 }, { duration: 0 });

	hover(button, () => {
		//animate(button, { rotateX: 180 }, { duration: durationMD });

		return () => {
			animate(button, { rotateX: 0 }, { duration: durationMD });
		};
	});

	return button;
}

function mobileMenu(content: HTMLDivElement): void {
	const button = menuIcon();
	content.appendChild(button);

	const duration = Number.parseFloat(token.animation.duration.lg.sec.value);

	const logo = document.getElementById('gavink-logo') as HTMLOrSVGImageElement;
	if (!logo) return;

	let pressed = false;

	press(button, () => {
		if (isAnimating) {
			return;
		}

		if (content.style.stroke === token.color.background.accent.value) {
			animate(logo, { fill: token.color.text.primary.value }, { duration: duration, ease: 'easeOut' });
			animate(button, { stroke: token.color.background.accent.value }, { duration: duration, ease: 'easeOut' });
		} else {
			animate(logo, { fill: token.color.background.primary.value }, { duration: duration, ease: 'easeOut' });
			animate(button, { stroke: token.color.background.primary.value }, { duration: duration, ease: 'easeOut' });
		}

		if (pressed) {
			pressed = false;
			closeMenuModal();
		} else {
			animate(logo, { fill: token.color.text.primary.value }, { duration: duration, ease: 'easeIn' });
			animate(button, { stroke: token.color.background.accent.value }, { duration: duration, ease: 'easeIn' });
			pressed = true;

			lenis.stop();
			openMenuModal(() => {
				pressed = false;
			});
		}
	});

	const resizeHandler = (): void => {
		const width = document.documentElement.clientWidth;
		const modal = document.getElementById('burger-modal');
		if (!modal) {
			return;
		}

		if (width >= Number.parseInt(token.viewport.md.value)) {
			lenis.start();
			modal.remove();
			pressed = false;
		}
	};

	window.addEventListener('resize', resizeHandler);
}

function processAnimation(action: () => void): void {
	if (isAnimating) {
		animationQueue.push(action);
		return;
	}

	isAnimating = true;
	action();
}

function animationComplete(): void {
	isAnimating = false;
	if (animationQueue.length > 0) {
		const nextAction = animationQueue.shift();
		if (nextAction) {
			processAnimation(nextAction);
		}
	}
}

function openMenuModal(onLinkPressed: () => void): void {
	fetch('/component/burger-modal')
		.then((res) => {
			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}
			return res.text();
		})
		.then((html) => {
			const temp = document.createElement('div');
			temp.innerHTML = html;
			const modal = temp.firstElementChild as HTMLElement;

			if (!modal) return;

			const existingModal = document.getElementById('burger-modal');
			if (existingModal) {
				existingModal.remove();
				cancelActiveAnimations(existingModal);
			}

			document.body.appendChild(modal);

			const content = modal.querySelector('.modal-content') as HTMLElement;

			modal.style.opacity = '0';

			if (content) {
				content.style.transform = 'scale(0.9)';
			}

			const timing: KeyframeAnimationOptions = {
				duration: durationLG,
				easing: 'ease-in',
				fill: 'forwards',
			};

			const existingState = animationStates.get(modal);
			if (existingState && !existingState.isOpening) {
				existingState.animation.reverse();
				existingState.isOpening = true;

				if (content) {
					const contentState = animationStates.get(content);
					if (contentState) contentState.animation.reverse();
				}

				existingState.animation.onfinish = animationComplete;
				return;
			}

			const modalAnimation = modal.animate(fadeInKeyframes, timing);
			animationStates.set(modal, { animation: modalAnimation, isOpening: true });

			if (content) {
				const contentAnimation = content.animate(zoomInKeyframes, timing);
				animationStates.set(content, { animation: contentAnimation, isOpening: true });
			}

			handleLinks(onLinkPressed);

			modalAnimation.onfinish = animationComplete;
			modalAnimation.oncancel = animationComplete;
		})
		.catch((err) => {
			console.error('Error fetching modal:', err);
		});
}

function handleLinks(onLinkPressed: () => void): void {
	const modalitems = document.querySelectorAll('.modal-item');
	const button = document.querySelector('#burger-menu-icon > button') as HTMLButtonElement;

	for (const modal of modalitems) {
		// use something else than href
		const link = modal.getAttribute('href');
		const hook = modal.getAttribute('data-section-hook');

		if (!link.startsWith('/')) {
			return;
		}

		press(modal, () => {
			closeMenuModal();
			onLinkPressed();
			HandleAnimationTrigger(hook);

			button.style.stroke = 'unset';

			// see why this isn't setting the offset
			const options = {
				immediate: true,
				offset: -100,
			};

			const gl = CheckGLCookie();

			if (!gl) {
				if (link === '/#') {
					lenis.scrollTo(0);
				} else {
					lenis.scrollTo(link.substring(1), options);
					//document.getElementById(link.substring(2)).scrollIntoView();
				}

				return;
			}

			const swap = document.getElementById('swap');
			if (!swap) {
				console.error('Expected a swap element but not present');
				return;
			}

			if (link.startsWith('/#')) {
				document.getElementById('home').style.display = 'unset';
				swap.innerHTML = '';

				const active = swap.getAttribute('swap-active').toLowerCase() === 'true';
				swap.setAttribute('swap-active', 'false');

				if (link === '/#') {
					if (active) {
						lenis.scrollTo(0, options);
					} else {
						lenis.scrollTo(0);
					}
				} else {
					if (active) {
						lenis.scrollTo(link.substring(1), options);
					} else {
						document.getElementById(link.substring(2)).scrollIntoView();
					}
				}
			} else {
				swap.setAttribute('swap-active', 'true');
				htmx.ajax('GET', link, { target: '#swap', swap: 'innerHTML' });
				lenis.scrollTo(0, options);
			}
		});
	}
}

function closeMenuModal(): void {
	const modal = document.getElementById('burger-modal');
	if (!modal) {
		console.log('expected there to be a modal to close');
		return;
	}

	const content = modal.querySelector('.modal-content') as HTMLElement;

	const timing: KeyframeAnimationOptions = {
		duration: durationLG,
		easing: 'ease-out',
		fill: 'forwards',
	};

	lenis.start();

	const existingState = animationStates.get(modal);

	if (existingState.isOpening) {
		existingState.animation.reverse();
		existingState.isOpening = false;

		if (content) {
			const contentState = animationStates.get(content);
			if (contentState) contentState.animation.reverse();
		}

		existingState.animation.onfinish = () => {
			modal.remove();
			animationComplete();
		};
		return;
	}

	const modalAnimation = modal.animate(fadeOutKeyframes, timing);
	animationStates.set(modal, { animation: modalAnimation, isOpening: false });

	if (content) {
		const contentAnimation = content.animate(zoomOutKeyframes, timing);
		animationStates.set(content, { animation: contentAnimation, isOpening: false });
	}

	modalAnimation.onfinish = () => {
		modal.remove();
		animationComplete();
	};
	modalAnimation.oncancel = animationComplete;
}

function cancelActiveAnimations(element: HTMLElement): void {
	const state = animationStates.get(element);
	if (state) {
		state.animation.cancel();
		animationStates.delete(element);
	}
}

const fadeInKeyframes = [{ opacity: 0 }, { opacity: 1 }];

const fadeOutKeyframes = [{ opacity: 1 }, { opacity: 0 }];

const zoomInKeyframes = [{ transform: 'scale(0.9)' }, { transform: 'scale(1)' }];

const zoomOutKeyframes = [{ transform: 'scale(1)' }, { transform: 'scale(0.9)' }];
