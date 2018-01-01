import { random } from '../lib/rng';
import { EASING, MovePoint, TickCallback } from '../lib/tick';

export const formations: { [name: string]: TickCallback } = {

	/**
	 * Sine wave in the x direction
	 */

	sinx: info => {
		return (Math.sin(info.x + (info.timeElapsed / 10) * (Math.PI / 180)) * (info.maxHeight / 2))
			+ (info.maxHeight / 2);
	},

	/**
	 * Sine wave in the y direction
	 */

	siny: info => {
		return (Math.sin(info.y + (info.timeElapsed / 10) * (Math.PI / 180)) * (info.maxHeight / 2))
			+ (info.maxHeight / 2);
	},

	/**
	 * Sine wave in diagonal direction
	 */

	sind: info => {
		return (Math.sin(info.x + info.y + (info.timeElapsed / 10) * (Math.PI / 180)) * (info.maxHeight / 2))
			+ (info.maxHeight / 2);
	},

	/**
	 * Tan wave for the giggles
	 */

	tan: info => {
		return (Math.tan((info.x / 10) + (info.timeElapsed / 10) * (Math.PI / 180)) * (info.maxHeight / 2))
			+ (info.maxHeight / 2);
	},

	/**
	 * Make modules go to random heights
	 */

	random: info => {
		const rng = random(info);
		return {
			height: rng() * info.maxHeight,
			easing: EASING.EASE_IN_OUT_EXPO,
			wait: Math.abs(rng() * 3000) + 1000
		};
	},

	/**
	 * Two "designs"
	 */

	alternate: ({ x, y, timeElapsed, totalDuration, maxHeight }) => {
		let wait = 1500;
		const sequence = [0, 1, 0, -1];

		// Determine what multiplier should be (rotates through sequence in `wait` ms intervals)
		let multiplier = 0;
		for (let i = 0; i < sequence.length; i++) {
			const step = Math.floor(timeElapsed / wait) % sequence.length;
			if (step === i) {
				multiplier = sequence[i];
			}
		}

		// Check if we have enough time, otherwise we should default back to 0
		if (multiplier !== 0 && (timeElapsed + (wait * 2)) > totalDuration) {
			multiplier = 0;
		}

		let height = (maxHeight / 2) * multiplier;
		if ((x + y) % 2 === 0) {
			height *= -1;
		}
		height += maxHeight / 2;

		// Initial offset
		if (timeElapsed === 0) {
			wait += x * 200;
		}

		return {
			height,
			easing: EASING.EASE_IN_OUT_QUINT,
			wait
		};
	}
};
