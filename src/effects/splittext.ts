import { animate, inView } from 'motion';

const containers = document.getElementsByClassName('section-paragraph');
if (!containers) {
	throw new Error('Could not find any elements with a class of section-paragraph');
}

// https://motion.dev/docs/inview
for (const content of containers) {
	inView(
		content,
		(element) => {
			splitText(element as HTMLElement);
		},
		//{root, margin, amount}
	);
}

function splitText(content: HTMLElement): void {
	const DURATION = 0.25;
	const STAGGER = 0.025;

	const text = content.innerText;
	content.innerText = '';

	const words = text.split(' ');

	words.forEach((word, index) => {
		const animatedWord = document.createElement('span');
		if (index + 1 === words.length) {
			animatedWord.innerText = word;
		} else {
			animatedWord.innerText = `${word} `;
		}

		animatedWord.style.opacity = '0';
		animatedWord.style.filter = blur('1.5rem');
		//animatedWord.style.y = '20';

		animate(
			animatedWord,
			{
				opacity: 1,
				y: 0,
				filter: 'blur(0)',
			},
			{
				duration: DURATION,
				delay: STAGGER * index,
				ease: ['easeIn', 'easeOut'],
			},
		);

		content.appendChild(animatedWord);
	});
}
