import { isTickCallbackReturn } from '../move-point';
import { TickCallback, TickCallbackReturn } from '../tick';

/**
 * Class that invokes specific callback functions depending on specific metadata circumstances
 */

export class StateRouter {

	private times: number[] = [];

	constructor(private config: StateRouterConfig, private duration?: number, private loop = true) {
		this.times = Object.keys(config).map(k => Number(k)).sort().reverse();
	}

	export(): TickCallback {
		return ({ timeElapsed, x, y }) => {
			if (this.duration) {
				// If looping, make time elapsed reset after duration
				if (this.loop) {
					timeElapsed %= this.duration;
				} else if (timeElapsed >= this.duration) {
					// If there's a duration and not looping, ignore any points past duration
					return;
				}
			}

			// Find latest time
			for (const time of this.times) {
				if (time <= timeElapsed) {

					// Finally fall back to returning value for whole grid
					if (isTickCallbackReturn(this.config[time])) {
						// Second fall back to returning value for specific row
						// Any object is a valid TickCallback return, so we must check deeper
						if (isTickCallbackReturn((this.config[time] as StateRouterConfigColumns)[x])) {
							// First try returning value for specific module
							if (isTickCallbackReturn((this.config[time] as StateRouterConfigGrid)[x][y])) {
								return (this.config[time] as StateRouterConfigGrid)[x][y];
							} else {
								return (this.config[time] as StateRouterConfigColumns)[x];
							}
						} else {
							return this.config[time];
						}
					}
					return;
				}
			}
		};
	}
}

export interface StateRouterConfig {
	[time: number]: TickCallbackReturn | StateRouterConfigRow;
}

interface StateRouterConfigRow {
	[x: number]: TickCallbackReturn | StateRouterConfigColumns;
}

interface StateRouterConfigGrid {
	[x: number]: StateRouterConfigColumns;
}

interface StateRouterConfigColumns {
	[y: number]: TickCallbackReturn;
}
