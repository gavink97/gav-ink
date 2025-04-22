import { animate } from 'motion';

export default function PageTransition(): void {
	const container = document.querySelector('page-transition');
	if (!container) {
		throw new Error('Could not find page-transition element');
	}

	const elem = container.querySelector('#page-transition');
	if (!elem) {
		throw new Error('Could not find element with id page-transition');
	}

	const content = container.querySelector('#content') as HTMLDivElement;
	if (!content) {
		throw new Error('Could not find element with id content');
	}

	const suspense = container.querySelector('#placeholder') as HTMLDivElement;
	if (!suspense) {
		throw new Error('Could not find element with id placeholder');
	}

	animate(content, { opacity: 1 }, { duration: 2, ease: [0.37, 0, 0.63, 1] });

	setTimeout(() => {
		content.style.display = 'block';
		suspense.style.display = 'none';
	}, 100);
}

PageTransition();
