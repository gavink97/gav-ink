export interface AnimationTimeline {
	start: number;
	end: number;
	func: (start: number, end: number) => void;
}

export function PlayScrollAnimations(timeline: AnimationTimeline[], scrollPercent: number): void {
	for (const animation of timeline) {
		if (scrollPercent >= animation.start && scrollPercent < animation.end) {
			animation.func(animation.start, animation.end);
		}
	}
}

export function StartOffset(scroll: number, start: number, duration: number): number {
	return duration * ((scroll - start) / Math.abs(start / 100 - 1) / 100);
}
