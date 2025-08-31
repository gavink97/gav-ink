import { animate, hover } from 'motion';

const container = document.querySelector('drop-down-menu-icon');
if (!container) {
	throw new Error('Could not find drop-down-menu-icon element');
}

const content = container.querySelector('#drop-down-menu-icon') as HTMLDivElement;
if (!content) {
	throw new Error('Could not find element with id drop-down-menu-icon');
}

const suspense = container.querySelector('#placeholder') as HTMLDivElement;
if (!suspense) {
	//throw new Error('Could not find element with id placeholder');
}

dropDownIcon(content);

setTimeout(() => {
	suspense.style.display = 'none';
	content.style.display = 'flex';
}, 10);

function dropDownIcon(content: HTMLDivElement): void {
	const DURATION = 0.2;
	const root = document.querySelector('html') as HTMLElement;
	const scale = Number.parseFloat(getComputedStyle(root).fontSize) / 16;

	const menu = document.getElementById('dropdownmenu');

	content.style.display = 'none';
	content.style.inset = '0';
	content.style.position = 'absolute';
	content.style.width = '100%';
	content.style.justifyContent = 'center';
	content.style.alignItems = 'center';

	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as HTMLElement & SVGSVGElement;
	const path = document.createElementNS('http://www.w3.org/2000/svg', 'path') as HTMLElement & SVGLineElement;
	const title = document.createElementNS('http://www.w3.org/2000/svg', 'title') as HTMLElement & SVGTitleElement;

	svg.setAttribute('height', '10');
	svg.setAttribute('width', '15');
	svg.setAttribute('aria-label', 'services drop down icon');
	svg.style.position = 'relative';
	svg.style.top = `${1.5 / 16}rem`;
	svg.style.left = `${40 / 16}rem`;
	svg.style.scale = String(scale);

	title.textContent = 'services drop down icon';

	path.setAttribute('d', 'M3 3 L8 7 L13 3');
	path.style.stroke = 'black';
	path.style.strokeWidth = '2';
	path.style.fill = 'none';

	svg.appendChild(title);
	svg.appendChild(path);
	content.appendChild(svg);

	animate(svg, { rotate: 0 }, { duration: 0 });

	hover([content, menu], () => {
		animate(svg, { rotate: 180 }, { duration: DURATION });

		return () => {
			animate(svg, { rotate: 0 }, { duration: DURATION });
		};
	});

	function scaleSvg(): void {
		const scale = Number.parseFloat(getComputedStyle(root).fontSize) / 16;
		svg.style.scale = String(scale);
	}

	window.addEventListener('resize', scaleSvg);
	document.addEventListener('DOMContentLoaded', scaleSvg);
}
