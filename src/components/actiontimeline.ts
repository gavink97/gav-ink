import { PlayScrollAnimations, StartOffset, type AnimationTimeline } from '../utils/timeline.ts';
import token from '../../tokens.json';

//document.addEventListener('DOMContentLoaded', ActionTimeline);
ActionTimeline();

function ActionTimeline() {
	const timeline: AnimationTimeline[] = [];

	timeline.push({
		start: 0,
		end: 1,
		easing: 'easeInSine',
		func: (progress) => {
			console.log(progress);
		},
	});

	timeline.push({
		start: 0,
		end: 1,
		easing: 'easeInSine',
		func: (progress) => {
			const sustainable = document.getElementById('sustainable-grid');

			if (progress < 0.11) {
				sustainable.style.marginLeft = '1rem';
				sustainable.style.marginRight = '1rem';
			} else if (progress >= 0.11) {
				sustainable.style.marginLeft = '0';
				sustainable.style.marginRight = '0';
			}
		},
	});

	// inbetween color change?
	timeline.push({
		start: 0,
		end: 1,
		func: (progress) => {
			const contactButton = document.getElementsByClassName('contact-us-button')[0] as HTMLDivElement;

			if (progress < 0.115) {
				contactButton.style.color = token.color.text.accent.value;
				contactButton.style.backgroundColor = token.color.background.accent.value;
			} else if (progress >= 0.115 && progress < 0.413) {
				contactButton.style.color = token.color.text.primary.value;
				contactButton.style.backgroundColor = token.color.background.primary.value;
			} else if (progress >= 0.413 && progress < 0.995) {
				contactButton.style.color = token.color.text.accent.value;
				contactButton.style.backgroundColor = token.color.background.accent.value;
			} else if (progress >= 0.995) {
				contactButton.style.color = token.color.text.primary.value;
				contactButton.style.backgroundColor = token.color.background.primary.value;
			}
		},
	});

	let scrollPercent = 0;

	window.addEventListener('scroll', (): void => {
		updateProgress();
		PlayScrollAnimations(timeline, scrollPercent);
	});

	window.addEventListener('resize', (): void => {
		updateProgress();
		PlayScrollAnimations(timeline, scrollPercent);
	});

	function updateProgress() {
		const progress = document.getElementById('scroll-progress');
		if (!progress) return;

		const rect = document.body.getBoundingClientRect();
		const Height = document.body.scrollHeight;
		const clientHeight = document.documentElement.clientHeight;

		if (rect.top <= 0) {
			const scrollCalc = Math.abs(rect.top) / (Height - clientHeight);
			scrollPercent = Math.min(Math.max(scrollCalc, 0), 1);
		} else {
			scrollPercent = 0;
		}

		progress.setAttribute('progress', scrollPercent.toFixed(5).toString());
	}

	PlayScrollAnimations(timeline, scrollPercent);

	window.scrollTo({ top: 0, behavior: 'instant' });
}
