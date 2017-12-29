import { TickCallback } from './tick';

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
	}
};
