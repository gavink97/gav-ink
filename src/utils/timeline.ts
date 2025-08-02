import { Easings } from './easing.ts';

export interface AnimationTimeline {
	start: number;
	easing?: keyof typeof Easings;
	end: number;
	animate: (progress: number) => void;
	postAnimation?: (progress: number) => void;
	preAnimation?: (progress: number) => void;
}

export function PlayTimeline(timeline: AnimationTimeline[], scrollPercent: number): void {
	for (const segment of timeline) {
		if (scrollPercent < segment.start) {
			const segmentProgress = scrollPercent / segment.start;
			segment.preAnimation(segmentProgress);
		} else if (scrollPercent >= segment.start && scrollPercent <= segment.end) {
			const segmentProgress = (scrollPercent - segment.start) / (segment.end - segment.start);

			let progress: number;

			if (segment.easing) {
				progress = Easings[segment.easing](segmentProgress);
			} else {
				progress = segmentProgress;
			}

			segment.animate(progress);
		} else if (scrollPercent > segment.end) {
			const segmentProgress = (scrollPercent - segment.end) / (1 - segment.end);
			segment.postAnimation(segmentProgress);
		}
	}
}
