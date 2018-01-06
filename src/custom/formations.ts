import { random } from '../lib/rng';
import { EASING, TickCallback } from '../lib/tick';
import { isCenter, polarCoordinates, toRadians } from '../lib/utils';

export const formations: { [name: string]: TickCallback } = {

	/**
	 * Sine wave in the x direction
	 */

	sinx: info => {
		return (Math.sin(info.x + toRadians(info.timeElapsed / 10)) * (info.maxHeight / 2))
			+ (info.maxHeight / 2);
	},

	/**
	 * Sine wave in the y direction
	 */

	siny: info => {
		return (Math.sin(info.y + toRadians(info.timeElapsed / 10)) * (info.maxHeight / 2))
			+ (info.maxHeight / 2);
	},

	/**
	 * Sine wave in diagonal direction
	 */

	sind: info => {
		return (Math.sin(info.x + info.y + toRadians(info.timeElapsed / 10)) * (info.maxHeight / 2))
			+ (info.maxHeight / 2);
	},

	/**
	 * Tan wave for the giggles
	 */

	tan: info => {
		return (Math.tan((info.x / 10) + toRadians(info.timeElapsed / 10)) * (info.maxHeight / 2))
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
			easeDuration: Math.abs(rng() * 3000) + 1000
		};
	},

	/**
	 * Two "designs"
	 */

	alternate: ({ x, y, timeElapsed, totalDuration, maxHeight }) => {
		if (timeElapsed === 0) {
			return {
				height: maxHeight / 2,
				waitAfter: x * 200
			};
		}

		const wait = 1500;
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

		return {
			height,
			easing: EASING.EASE_IN_OUT_QUINT,
			easeDuration: 1000,
			waitAfter: wait - 1000
		};
	},

	/**
	 * Ripple effect
	 */

	ripple: info => {
		const xMid = info.nx / 2;
		const yMid = info.ny / 2;
		const r = (Math.pow(Math.abs(info.x - xMid), 2) + Math.pow(Math.abs(info.y - yMid), 2));
		const int = 0.5;
		const h = int * 100 * Math.sin((info.timeElapsed) / 360 + r / (int * 10)) / (r + info.timeElapsed / 360);

		return {
			height: h,
			easing: EASING.EASE_IN_QUAD
		};
	},

	/**
	 * Raindrop effect
	 */

	raindrop: ({ nx, ny, x, y, timeElapsed, maxHeight }) => {
		const impactTime = 2000;

		const { center } = isCenter(nx, ny, x, y);

		if (timeElapsed === 0) {
			return {
				height: center ? maxHeight : (maxHeight / 4),
				wait: impactTime
			};
		} else {
			const { radius } = polarCoordinates(nx, ny, x, y);
			return Math.sin((timeElapsed - impactTime) / 100) * (maxHeight / 2);
		}

		// if (timeElapsed >= impactTime || (timeElapsed < impactTime && center)) {
		// 	const polar = polarCoordinates(nx, ny, x, y);
		// 	const n = toRadians((timeElapsed - impactTime) / 10) - polar.radius;
		// 	return (Math.sin(n) / (n / 2)) * maxHeight / 2;
		// } else if (center) {
		// 	if (timeElapsed === 0) {
		// 		console.log('time elapsed 0', maxHeight)
		// 		return maxHeight;
		// 	} else {
		// 		return {
		// 			height: 0,
		// 			wait: impactTime
		// 		};
		// 	}
		// } else {
		// 	return 0;
		// }
	},

	/**
	 * Test
	 */

	test: info => {
		if (info.timeElapsed === 0) {
			return {
				height: info.maxHeight / 2,
				easing: EASING.EASE_IN_CIRC,
				waitBefore: 1000,
				easeDuration: 2000,
				waitAfter: 1000
			};
		} else if (info.timeElapsed === 4000) {
			return 0;
		}
	}
};
