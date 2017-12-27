import { Grid } from './grid';
import { Globals, TickCallback } from './tick';

/**
 * Class handling the tick function
 */

export class Formation {
	constructor(private grid: Grid, private callback: TickCallback, private globals: Globals = {}) { }

	getMovePointArray(time: number) {
		//
	}

	getMovePoint(time: number, x: number, y: number) {
		return this.callback({
			globals: this.globals,
			maxHeight: this.grid.maxHeight,
			timeElapsed: time,
			x,
			y
		});
	}
}
