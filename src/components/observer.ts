import token from '../../tokens.json';
import { animate as motion } from 'motion';

// https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
// https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API/Timing_element_visibility

window.addEventListener('resize', Observer);
document.addEventListener('DOMContentLoaded', Observer);

function Observer(): void {
	const observerOptions = {
		root: null,
		rootMargin: '0px 0px -95% 0px',
		//scrollMargin: "",
		threshold: 0,
	};

	const observer = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			const trigger = entry.target.getAttribute('data-animation-trigger');

			console.log(entry);

			if (entry.isIntersecting) {
				console.log(trigger);
				HandleAnimationTrigger(trigger);
			}
		}
	}, observerOptions);

	const elems = document.querySelectorAll('[data-animation-trigger]');

	for (const el of elems) {
		observer.observe(el);
	}
}

export function HandleAnimationTrigger(trigger: string | null): void {
	const sustainable = document.getElementById('sustainable-grid');
	const contactButton = document.getElementsByClassName('contact-us-button')[0] as HTMLDivElement;
	const logo = document.getElementById('gavink-logo');
	const mobileMenu = document.getElementById('burger-menu-icon');

	const DURATION = 0.25;

	switch (trigger) {
		case 'hero':
			motion(sustainable, { marginLeft: '1rem', marginRight: '1rem' }, { duration: DURATION });
			motion(logo, { fill: token.color.text.primary.value }, { duration: DURATION });
			motion(
				contactButton,
				{
					color: token.color.text.accent.value,
					backgroundColor: token.color.background.accent.value,
				},
				{ duration: DURATION },
			);
			motion(mobileMenu, { stroke: token.color.background.accent.value }, { duration: DURATION });
			break;

		case 'sustainability':
			motion(sustainable, { marginLeft: 0, marginRight: 0 }, { duration: DURATION });
			motion(logo, { fill: token.color.text.accent.value }, { duration: DURATION });
			motion(
				contactButton,
				{
					color: token.color.text.primary.value,
					backgroundColor: token.color.background.primary.value,
				},
				{ duration: DURATION },
			);
			motion(mobileMenu, { stroke: token.color.background.primary.value }, { duration: DURATION });
			break;

		case 'footer':
			motion(logo, { fill: token.color.text.accent.value }, { duration: DURATION });
			motion(
				contactButton,
				{
					color: token.color.text.primary.value,
					backgroundColor: token.color.background.primary.value,
				},
				{ duration: DURATION },
			);
			motion(mobileMenu, { stroke: token.color.background.primary.value }, { duration: DURATION });
			break;

		default:
			motion(logo, { fill: token.color.text.primary.value }, { duration: DURATION });
			motion(
				contactButton,
				{
					color: token.color.text.accent.value,
					backgroundColor: token.color.background.accent.value,
				},
				{ duration: DURATION },
			);
			motion(mobileMenu, { stroke: token.color.background.accent.value }, { duration: DURATION });
	}
}
