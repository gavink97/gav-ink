import { animate, hover } from 'motion';

const container = document.querySelectorAll('reveal-link');
if (!container) {
	throw new Error('Could not find reveal-link element');
}

for (const element of container) {
	const content = element.querySelector('#reveal-link') as HTMLDivElement;
	if (!content) {
		throw new Error('Could not find element with id reveal-link');
	}

	const suspense = element.querySelector('#placeholder') as HTMLDivElement;
	if (!suspense) {
		throw new Error('Could not find element with id placeholder');
	}

	revealLink(content);

	setTimeout(() => {
		suspense.style.display = 'none';
		content.style.display = 'flex';
	}, 10);
}

function revealLink(content: HTMLDivElement): void {
	const DURATION = 0.5;
	const root = document.querySelector('html') as HTMLElement;

	const text = content.innerText;
	content.innerText = '';
	content.style.display = 'none';
	content.style.position = 'relative';
	content.style.right = '1.375rem';

	const arrowSpan = document.createElement('span');
	const textSpan = document.createElement('span');
	textSpan.innerText = text;

	arrowSpan.style.display = 'inline-flex';
	arrowSpan.style.alignItems = 'center';
	arrowSpan.style.gap = '0.5rem';
	arrowSpan.style.paddingRight = '1rem';
	arrowSpan.style.paddingLeft = '1rem';
	arrowSpan.style.position = 'relative';
	arrowSpan.style.top = '0.125rem';

	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');

	svg.setAttribute('viewBox', '0 0 20 20');
	svg.style.width = '1.25rem';
	svg.style.height = '1.25rem';
	svg.style.flexShrink = '0';
	svg.setAttribute('aria-label', text);

	title.textContent = text;
	path.setAttribute('d', 'M2 8 L18 8 M13 15 L18 8 L13 2');

	path.style.display = 'block';
	path.style.stroke = 'currentColor';
	path.style.strokeWidth = '2.5';
	path.style.fill = 'none';

	svg.appendChild(title);
	svg.appendChild(path);
	arrowSpan.appendChild(svg);
	content.appendChild(arrowSpan);
	content.appendChild(textSpan);

	function scaleSvg(): void {
		const scale = Number.parseFloat(getComputedStyle(root).fontSize) / 16;
		const initial = 30 * scale;

		animate(content, { x: -initial }, { duration: 0 });

		hover(content, () => {
			animate(content, { x: 20 * scale }, { duration: DURATION, ease: ['easeIn', 'easeOut'] });

			animate(
				path,
				{ rotate: -31 },
				{ delay: DURATION / 4, duration: DURATION / 2, ease: ['easeIn', 'easeOut'] },
			);

			return () => {
				animate(content, { x: -initial }, { duration: DURATION, ease: ['easeIn', 'easeOut'] });

				animate(
					path,
					{ rotate: 0 },
					{ delay: DURATION / 3, duration: DURATION / 2, ease: ['easeIn', 'easeOut'] },
				);
			};
		});
	}

	window.addEventListener('resize', scaleSvg);
	document.addEventListener('DOMContentLoaded', scaleSvg);
}
