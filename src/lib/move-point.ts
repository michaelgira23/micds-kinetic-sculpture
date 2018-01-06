import { EASING_FUNCTIONS } from './easings';
import { Grid } from './grid';
import { EASING, HeightDuration, TickCallbackReturn } from './tick';

/**
 * Represents a group of values returned from a tick callback
 */

export class MovePoint {

	get duration() {
		return this.waitBefore + this.easeDuration + this.waitAfter;
	}

	readonly height: number | null = null;
	readonly easing: (x: number) => number = EASING_FUNCTIONS[EASING.LINEAR];
	readonly waitBefore: number = 0;
	readonly easeDuration: number = 0;
	readonly waitAfter: number = 0;

	constructor(values: TickCallbackReturn) {
		if (typeof values === 'number') {
			this.height = values;
			return;
		}

		if (typeof values !== 'object') {
			return;
		}
		if (typeof values.height === 'number') {
			this.height = values.height;
		}
		if (typeof values.easing === 'string' && EASING_FUNCTIONS[values.easing]) {
			this.easing = EASING_FUNCTIONS[values.easing];
		}
		if (typeof values.waitBefore === 'number' && values.waitBefore > 0) {
			this.waitBefore = Math.floor(values.waitBefore);
		}
		if (typeof values.easeDuration === 'number' && values.easeDuration > 0) {
			this.easeDuration = Math.floor(values.easeDuration);
		}
		if (typeof values.waitAfter === 'number' && values.waitAfter > 0) {
			this.waitAfter = Math.floor(values.waitAfter);
		}
	}

	/**
	 * Export function for finding height for duration of move point
	 */

	export(heightBefore: number) {
		if (this.height === null) {
			return (time: number) => null;
		}
		const valueDiff = this.height - heightBefore;

		return (time: number) => {
			const percentage = (time - this.waitBefore) / this.easeDuration;
			// If before/after, just shortcut to before/after heights
			if (percentage < 0) {
				// Shortcut to previous value (during wait before)
				return heightBefore;
			} else if (percentage > 1 || isNaN(percentage)) {
				// Shortcut to after value (during wait after)
				return this.height;
			} else {
				// Calculate easing (during easing)
				return (this.easing(percentage) * valueDiff) + heightBefore;
			}
		};
	}

}
