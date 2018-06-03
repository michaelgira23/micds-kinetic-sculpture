import { EASING_FUNCTIONS } from './easings';
import { transitionNumbers } from './formation-helpers/utils';
import { Grid } from './grid';
import { EASING, EasingFunction, HeightDuration, TickCallbackReturn, TickInfo, Values } from './tick';

/**
 * Represents a group of values returned from a tick callback
 */

export class MovePoint {

	get duration() {
		return this.waitBefore + this.easeDuration + this.waitAfter;
	}

	readonly height: number | null = null;
	readonly easing: EasingFunction = EASING_FUNCTIONS[EASING.LINEAR];
	readonly waitBefore: number = 0;
	readonly easeDuration: number = 0;
	readonly waitAfter: number = 0;
	readonly variables: Values = {};

	constructor(private tickInfo: TickInfo, values: TickCallbackReturn) {
		// Recursively call TickCallback until it returns something
		while (typeof values === 'function') {
			values = values(this.tickInfo);
		}

		// If number, only set height
		if (typeof values === 'number') {
			this.height = values;
			return;
		}

		// We don't want anything to do with not objects
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
		if (typeof values.variables === 'object') {
			this.variables = values.variables;
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
				return transitionNumbers(this.easing, heightBefore, this.height!, percentage);
			}
		};
	}

}

/**
 * Determines if a value is a valid value that could be returned by a tick callback
 * (excluding null and undefined)
 */

export function isTickCallbackReturn(value: any) {
	if (typeof value === 'object' && value !== null) {
		return true;
	}
	if (typeof value === 'function') {
		return true;
	}
	if (typeof value === 'number') {
		return true;
	}
	return false;
}
