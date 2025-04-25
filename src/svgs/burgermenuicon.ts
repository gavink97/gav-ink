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
			openBurgerModal();
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

		// need to fix this as modal does not remove
		if (width >= token.viewport.md.value) {
			modal.remove();
			pressed = false;
			enableScroll();
		}
	};

	window.addEventListener('resize', resizeHandler);
}

// this should be in a different file
function openBurgerModal(): void {
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
			disableScroll();
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

			// ensure there is no flash before assign is complete
			press(modal, () => {
				closeBurgerModal();
				pressed = false;

				const options = {
					immediate: true,
				};

				if (link.startsWith('/#')) {
					document.getElementById('home').style.display = 'unset';
					document.getElementById('swap').innerHTML = '';

					if (link === '/#') {
						window.lenis.scrollTo(0, options);
					} else {
						window.lenis.scrollTo(link.substring(1), options);
					}
				} else {
					// write handler for contact page here
					htmx.ajax('GET', link, { target: '#swap', swap: 'innerHTML' });
					window.lenis.scrollTo(0, options);
				}

				return;
			});
		}
	}
}

function closeBurgerModal(): void {
	const modal = document.querySelector('#burger-modal');
	if (!modal) {
		console.log('expected there to be a modal to close');
		return;
	}

	modal.remove();
	enableScroll();
}

// add a duration based on opening and closing animation
function disableScroll(): void {
	const nav = document.getElementById('nav');
	if (!nav) {
		console.error('expected there to be a nav');
		return;
	}

	nav.style.backgroundColor = token.color.background.primary.value;
	document.body.style.overflow = 'hidden';
}

function enableScroll(): void {
	const nav = document.getElementById('nav');
	if (!nav) {
		console.error('expected there to be a nav');
		return;
	}

	nav.style.backgroundColor = 'transparent';
	document.body.style.overflow = 'auto';
}
