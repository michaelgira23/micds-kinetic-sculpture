import { random } from '../lib/rng';
import { EASING, MovePoint, TickCallback } from '../lib/tick';
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

		if (timeElapsed === 0) {
			return maxHeight / 2;
		} else if (x === 0) {
			return {
				height: 0,
				wait: 2000
			};
		}

		// const { center } = isCenter(nx, ny, x, y);

		// if (timeElapsed <= 10) {
		// 	return 1;
		// } else {
		// 	return {
		// 		height: 2,
		// 		wait: 1000
		// 	};
		// }

		// if (x === 1 && y === 1) {
		// 	if (timeElapsed < impactTime) {
		// 		return maxHeight;
		// 	} else {
		// 		return {
		// 			height: 1,
		// 			easing: EASING.EASE_IN_QUAD,
		// 			wait: impactTime
		// 		};
		// 	}
		// } else {
		// 	return 0;
		// }

		// let wait = 1500;
		// const sequence = [0, 1, 0, -1];
		//
		// // Determine what multiplier should be (rotates through sequence in `wait` ms intervals)
		// let multiplier = 0;
		// for (let i = 0; i < sequence.length; i++) {
		// 	const step = Math.floor(timeElapsed / wait) % sequence.length;
		// 	if (step === i) {
		// 		multiplier = sequence[i];
		// 	}
		// }
		//
		// // Check if we have enough time, otherwise we should default back to 0
		// // if (multiplier !== 0 && (timeElapsed + (wait * 2)) > totalDuration) {
		// // 	multiplier = 0;
		// // }
		//
		// let height = (maxHeight / 2) * multiplier;
		// if ((x + y) % 2 === 0) {
		// 	height *= -1;
		// }
		// height += maxHeight / 2;
		//
		// // Initial offset
		// if (timeElapsed === 0) {
		// 	wait += x * 200;
		// }
		//
		// return {
		// 	height,
		// 	easing: EASING.EASE_IN_OUT_QUINT,
		// 	wait
		// };

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
	}
};
