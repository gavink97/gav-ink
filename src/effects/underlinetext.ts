import { animate, hover } from 'motion';
import token from '../../tokens.json';

const container = document.querySelectorAll('underline-text');
if (!container) {
	throw new Error('Could not find underline-text element');
}

for (const element of container) {
	const content = element.querySelector('#underline') as HTMLDivElement;
	if (!content) {
		throw new Error('Could not find element with id underline');
	}

	const suspense = element.querySelector('#placeholder') as HTMLDivElement;
	if (!suspense) {
		throw new Error('Could not find element with id placeholder');
	}

	drawLine(content);

	setTimeout(() => {
		suspense.style.display = 'none';
		content.style.display = 'block';
	}, 100);
}

function drawLine(content: HTMLDivElement): void {
	const DURATION = 0.85;
	const root = document.querySelector('html') as HTMLElement;
	const scale = Number.parseFloat(getComputedStyle(root).fontSize) / 16;

	content.style.position = 'relative';
	content.style.display = 'none';
	content.style.lineHeight = '1.4';
	content.style.whiteSpace = 'nowrap';

	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as HTMLElement & SVGSVGElement;
	const line = document.createElementNS('http://www.w3.org/2000/svg', 'line') as HTMLElement & SVGLineElement;
	const title = document.createElementNS('http://www.w3.org/2000/svg', 'title') as HTMLElement & SVGTitleElement;

	svg.setAttribute('height', String(2 * scale));
	svg.setAttribute('width', '0');
	svg.setAttribute('aria-label', content.innerText);
	svg.style.width = '100%';

	title.textContent = content.innerText;

	line.setAttribute('x1', '0');
	line.setAttribute('y1', scale.toString());
	line.setAttribute('x2', '100%');
	line.setAttribute('y2', scale.toString());
	line.setAttribute('pathLength', '0');

	line.style.display = 'block';
	line.style.stroke = token.color.text.accent.value;
	line.style.strokeWidth = String(3 * scale);

	svg.appendChild(title);
	svg.appendChild(line);
	content.appendChild(svg);

	animate(line, { pathLength: 0 }, { duration: DURATION, ease: ['easeIn', 'easeOut'] });

	hover(content, () => {
		animate(line, { pathLength: 1 }, { duration: DURATION, ease: ['easeIn', 'easeOut'] });

		return () => {
			animate(line, { pathLength: 0 }, { duration: DURATION, ease: ['easeIn', 'easeOut'] });
		};
	});

	function scaleSvg(): void {
		const scale = Number.parseFloat(getComputedStyle(root).fontSize) / 16;

		svg.setAttribute('height', String(2 * scale));
		line.setAttribute('y1', String(scale));
		line.setAttribute('y2', String(scale));
		line.style.strokeWidth = String(2 * scale);
	}

	window.addEventListener('resize', scaleSvg);
	document.addEventListener('DOMContentLoaded', scaleSvg);
}
