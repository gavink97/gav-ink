import { Easings } from './easing.ts';

export interface AnimationTimeline {
	start: number;
	easing?: keyof typeof Easings;
	end: number;
	func: (progress: number) => void;
}

export function PlayScrollAnimations(timeline: AnimationTimeline[], scrollPercent: number): void {
	for (const animation of timeline) {
		if (scrollPercent >= animation.start && scrollPercent < animation.end) {
			const segmentProgress = (scrollPercent - animation.start) / (animation.end - animation.start);

			let progress: number;

			if (animation.easing) {
				progress = Easings[animation.easing](segmentProgress);
			} else {
				progress = segmentProgress;
			}

			animation.func(progress);
		}
	}
}

export function StartOffset(current: number, start: number, end: number, duration: number): number {
	const progress = Math.min(1, Math.max(0, (current - start) / (end - start)));
	return duration * progress;
}
