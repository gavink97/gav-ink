import { animate, hover } from 'motion';

const container = document.querySelectorAll('stagger-text');
if (!container) {
	throw new Error('Could not find stagger-text element');
}

for (const element of container) {
	const content = element.querySelector('#stagger') as HTMLDivElement;
	if (!content) {
		throw new Error('Could not find element with id stagger');
	}

	const suspense = element.querySelector('#placeholder') as HTMLDivElement;
	if (!suspense) {
		throw new Error('Could not find element with id placeholder');
	}

	staggerEffect(content);

	setTimeout(() => {
		suspense.style.display = 'none';
		content.style.display = 'block';
	}, 100);
}

function staggerEffect(content: HTMLDivElement): void {
	const DURATION = 0.25;
	const STAGGER = 0.025;

	const text = content.innerText;
	content.innerText = '';

	content.style.display = 'none';
	content.style.lineHeight = '1.2';
	content.style.position = 'relative';
	content.style.overflow = 'hidden';
	content.style.whiteSpace = 'nowrap';

	const hoveredDiv = document.createElement('div') as HTMLDivElement;
	hoveredDiv.style.position = 'absolute';
	hoveredDiv.style.inset = '0';

	const letters = text.split('');

	letters.forEach((letter, index) => {
		const spanUnhovered = document.createElement('span');
		const spanHovered = document.createElement('span');

		spanUnhovered.innerText = letter;
		spanHovered.innerText = letter;
		spanUnhovered.style.display = 'inline-block';
		spanHovered.style.display = 'inline-block';

		if (letter === ' ') {
			spanUnhovered.style.marginRight = '0.375rem';
			spanHovered.style.marginRight = '0.375rem';
		}

		animate(spanUnhovered, { y: 0 }, { duration: 0 });
		animate(spanHovered, { y: '100%' }, { duration: 0 });

		hover(content, () => {
			animate(
				spanUnhovered,
				{ y: '-100%' },
				{ duration: DURATION, delay: STAGGER * index, ease: ['easeIn', 'easeOut'] },
			);
			animate(spanHovered, { y: 0 }, { duration: DURATION, delay: STAGGER * index, ease: ['easeIn', 'easeOut'] });

			return () => {
				animate(
					spanUnhovered,
					{ y: 0 },
					{ duration: DURATION, delay: STAGGER * index, ease: ['easeIn', 'easeOut'] },
				);
				animate(
					spanHovered,
					{ y: '100%' },
					{ duration: DURATION, delay: STAGGER * index, ease: ['easeIn', 'easeOut'] },
				);
			};
		});

		content.appendChild(spanUnhovered);
		hoveredDiv.appendChild(spanHovered);
	});

	content.appendChild(hoveredDiv);
}
