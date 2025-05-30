import htmx from 'htmx.org';
import { animate, hover, press } from 'motion';
import token from '../../tokens.json';

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

let pressed = false;

burgerIcon(content);

setTimeout(() => {
	content.style.display = 'block';
	suspense.style.display = 'none';
}, 10);

function burgerIcon(content: HTMLDivElement): void {
	const DURATION = 0.5;

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
	line1.style.stroke = token.color.background.accent.value;
	line1.style.strokeWidth = '5';

	line2.setAttribute('x1', '0');
	line2.setAttribute('x2', '36');
	line2.setAttribute('y1', '18');
	line2.setAttribute('y2', '18');
	line2.style.stroke = token.color.background.accent.value;
	line2.style.strokeWidth = '5';

	line3.setAttribute('x1', '0');
	line3.setAttribute('x2', '36');
	line3.setAttribute('y1', '25');
	line3.setAttribute('y2', '25');
	line3.style.stroke = token.color.background.accent.value;
	line3.style.strokeWidth = '5';

	svg.appendChild(title);
	svg.appendChild(line1);
	svg.appendChild(line2);
	svg.appendChild(line3);
	button.appendChild(svg);
	content.appendChild(button);

	animate(content, { rotateX: 0 }, { duration: 0 });

	// disabled because need to create a real animation
	hover(content, () => {
		//animate(content, { rotateX: 180 }, { duration: DURATION });

		return () => {
			animate(content, { rotateX: 0 }, { duration: DURATION });
		};
	});

	press(button, () => {
		if (pressed) {
			closeBurgerModal();
			pressed = false;
		} else {
			openBurgerModal(pressed);
			pressed = true;
		}
	});

	// only add the handler once
	const resizeHandler = (): void => {
		const width = document.documentElement.clientWidth;
		const modal = document.getElementById('burger-modal');
		if (!modal) {
			return;
		}

		if (width >= Number.parseInt(token.viewport.md.value)) {
			modal.remove();
			pressed = false;
		}
	};

	window.addEventListener('resize', resizeHandler);
}

function openBurgerModal(pressed: boolean): void {
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
			const content = temp.firstElementChild;
			if (content) {
				document.body.appendChild(content);
			}
		})
		.then(() => {
			opening();
			handleLinks();
		})
		.catch((err) => {
			console.error('Error fetching modal:', err);
		});

	function handleLinks(): void {
		const modalitems = document.querySelectorAll('.modal-item');

		for (const modal of modalitems) {
			const link = modal.getAttribute('href');

			if (!link.startsWith('/')) {
				return;
			}

			press(modal, () => {
				closeBurgerModal();
				pressed === false;

				const lenis = window.lenis;

				const options = {
					immediate: true,
					offset: -100,
				};

				if (link.startsWith('/#')) {
					document.getElementById('home').style.display = 'unset';
					document.getElementById('swap').innerHTML = '';

					const active = document.getElementById('swap').getAttribute('swap-active').toLowerCase() === 'true';
					document.getElementById('swap').setAttribute('swap-active', 'false');

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
							const ele = document.getElementById(link.substring(2));
							ele.scrollIntoView();
						}
					}
				} else {
					document.getElementById('swap').setAttribute('swap-active', 'true');
					htmx.ajax('GET', link, { target: '#swap', swap: 'innerHTML' });
					lenis.scrollTo(0, options);
				}

				return;
			});
		}
	}

	function opening(): void {
		const modal = document.getElementById('burger-modal');
		if (!modal) {
			return;
		}

		const nav = document.getElementById('nav');
		if (!nav) {
			console.log('expected there to be a nav.');
			return;
		}

		modal.classList.add('opening');
		nav.classList.add('opening');
	}
}

export function closeBurgerModal(): void {
	const modal = document.getElementById('burger-modal');
	if (!modal) {
		console.log('expected there to be a modal to close');
		return;
	}

	const nav = document.getElementById('nav');
	if (!nav) {
		console.log('expected there to be a nav.');
		return;
	}

	modal.classList.add('closing');
	modal.style.touchAction = 'none !important';

	nav.classList.add('closing');

	// call these early if closeBurgerModal is called early
	modal.addEventListener(
		'animationstart',
		() => {
			modal.classList.remove('opening');
			nav.classList.remove('opening');
		},
		{ once: true },
	);

	modal.addEventListener(
		'animationend',
		() => {
			modal.classList.remove('closing');
			modal.style.touchAction = 'unset';

			nav.classList.remove('closing');

			modal.remove();
		},
		{ once: true },
	);
}
