import { random } from './rng';
import { EASING, TickCallback } from './tick';

export const defaultFormations: { [func: string]: TickCallback } = {

	/**
	 * Sine wave in the x direction
	 */

	sinx: info => {
		return {
			height: (Math.sin(info.x + (info.timeElapsed / 10) * (Math.PI / 180)) * (info.maxHeight / 2))
				+ (info.maxHeight / 2)
		};
	},

	/**
	 * Sine wave in the y direction
	 */

	siny: info => {
		return {
			height: (Math.sin(info.y + (info.timeElapsed / 10) * (Math.PI / 180)) * (info.maxHeight / 2))
				+ (info.maxHeight / 2)
		};
	},

	/**
	 * Sine wave in diagonal direction
	 */

	sind: info => {
		return {
			height: (Math.sin(info.x + info.y + (info.timeElapsed / 10) * (Math.PI / 180)) * (info.maxHeight / 2))
				+ (info.maxHeight / 2)
		};
	},

	/**
	 * Tan wave for the giggles
	 */

	tan: info => {
		return {
			height: (Math.tan((info.x / 10) + (info.timeElapsed / 10) * (Math.PI / 180)) * (info.maxHeight / 2))
				+ (info.maxHeight / 2)
		};
	},

	/**
	 * Make modules go to random heights
	 */

	random: info => {
		const rng = random(info);
		// if (info.x === 0 && info.y === 0 && info.timeElapsed === 0) {
		// 	console.log(rng());
		// 	console.log(rng());
		// 	console.log(rng());
		// }
		return {
			height: rng() * info.maxHeight,
			ease: EASING.EASE_IN_OUT_EXPO,
			wait: (rng() * 5000) + 1000
		};
	}
};
