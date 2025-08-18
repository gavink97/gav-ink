import token from '../../tokens.json';
import { animate } from 'motion';

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

			//console.log(entry);

			if (entry.isIntersecting) {
				//console.log(trigger);
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
	const mobileMenuButton = document.querySelector('#burger-menu-icon > button') as HTMLButtonElement;

	const DURATION = token.animation.duration.sm.sec.value;

	switch (trigger) {
		case 'hero':
			if (sustainable.style.marginLeft !== '') {
				animate(sustainable, { marginLeft: '1rem', marginRight: '1rem' }, { duration: DURATION });
			}

			animate(logo, { fill: token.color.text.primary.value }, { duration: DURATION });
			animate(
				contactButton,
				{
					color: token.color.text.accent.value,
					backgroundColor: token.color.background.accent.value,
				},
				{ duration: DURATION },
			);
			mobileMenu.style.stroke = token.color.background.accent.value;
			animate(mobileMenuButton, { stroke: token.color.background.accent.value }, { duration: DURATION });
			break;

		case 'sustainability':
			animate(sustainable, { marginLeft: 0, marginRight: 0 }, { duration: DURATION });
			animate(logo, { fill: token.color.text.accent.value }, { duration: DURATION });
			animate(
				contactButton,
				{
					color: token.color.text.primary.value,
					backgroundColor: token.color.background.primary.value,
				},
				{ duration: DURATION },
			);
			mobileMenu.style.stroke = token.color.background.primary.value;
			animate(mobileMenuButton, { stroke: token.color.background.primary.value }, { duration: DURATION });
			break;

		case 'footer':
			animate(logo, { fill: token.color.text.accent.value }, { duration: DURATION });
			animate(
				contactButton,
				{
					color: token.color.text.primary.value,
					backgroundColor: token.color.background.primary.value,
				},
				{ duration: DURATION },
			);
			mobileMenu.style.stroke = token.color.background.primary.value;
			animate(mobileMenuButton, { stroke: token.color.background.primary.value }, { duration: DURATION });
			break;

		default:
			animate(logo, { fill: token.color.text.primary.value }, { duration: DURATION });
			animate(
				contactButton,
				{
					color: token.color.text.accent.value,
					backgroundColor: token.color.background.accent.value,
				},
				{ duration: DURATION },
			);
			mobileMenu.style.stroke = token.color.background.accent.value;
			animate(mobileMenuButton, { stroke: token.color.background.accent.value }, { duration: DURATION });
	}
}
