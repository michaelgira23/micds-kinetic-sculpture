import { StateRouter } from '../lib/formation-helpers/state-router';
import { isCenter, polarCoordinates, toRadians } from '../lib/formation-helpers/utils';
import { random } from '../lib/rng';
import { EASING, TickCallback } from '../lib/tick';

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
	 * Two waves AT THE SAME TIME.
	 */

	 // alternate: new StateRouter({
		//  0: ({ maxHeight, x }) => {
		// 	 return {
		// 		 height: maxHeight / 2,
		// 		 waitAfter: x * 200
		// 	 };
		//  }
	 // }).export(),

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

	ripple: ({ timeElapsed, maxHeight, nx, ny, x, y }) => {
		// y = -e^(-kx) * sin(x)
		const { radius } = polarCoordinates(nx, ny, x, y, false);

		const waveHeight = maxHeight / 2;
		const dropTiming = {
			waitBefore: 500,
			duration: 1000
		};
		const startRipple = dropTiming.waitBefore + dropTiming.duration;
		const rippleDuration = 8000;

		if (timeElapsed === 0) {
			return radius < 1 ? maxHeight : (waveHeight / 2);
		} else if (timeElapsed === 1 && radius < 1) {
			return {
				height: (waveHeight / 2),
				easing: EASING.EASE_IN_QUAD,
				waitBefore: dropTiming.waitBefore,
				easeDuration: dropTiming.duration
			};
		} else if (startRipple <= timeElapsed && timeElapsed < startRipple + rippleDuration) {
			const rippleElapsed = timeElapsed - startRipple;
			const theta = radius - (rippleElapsed / 300);

			if (theta > 0) {
				return;
			}

			const rippleHeight = -waveHeight * (Math.E ** (-0.3 * radius) * Math.cos(theta));
			return (waveHeight / 2) + rippleHeight * ((rippleDuration - rippleElapsed) / rippleDuration);
		} else {
			return (waveHeight / 2);
		}
	},

	/**
	 * Test of manual formations
	 */

	manualTest: new StateRouter({
		0: 1,
		1000: {
			0: {
				height: 2,
				easeDuration: 1000,
				easing: EASING.EASE_IN_EXPO
			}
		},
		2000: {
			0: {
				4: {
					height: 3,
					easeDuration: 1000,
					easing: EASING.EASE_IN_OUT_EXPO
				}
			}
		}
	}).export()
};
