import { Grid } from './grid';
import { EASING, Globals, HeightMap, MovePoint, MovePointMap, TickCallback } from './tick';

/**
 * Class handling the tick function
 */

export class Formation {
	constructor(private grid: Grid, private callback: TickCallback, private globals: Globals = {}) { }

	getHeightMapForDuration(duration: number) {
		// const formationHeights: HeightMap = {};
		// for (let time = 0; time <= duration; time += this.grid.updateFrequency) {
		// 	formationHeights[time] = this.getMovePointMap(time);
		// }
		/** */
	}

	/**
	 * Get move points for all modules in grid
	 */

	getMovePointMap(time: number) {
		const grid: MovePointMap = [];
		for (let x = 0; x < this.grid.nx; x++) {
			grid[x] = [];
			for (let y = 0; y < this.grid.ny; y++) {
				grid[x][y] = this.getMovePoint(time, x, y);
			}
		}
		return grid;
	}

	getMovePoint(time: number, x: number, y: number) {
		const movePoint = this.callback({
			globals: this.globals,
			maxHeight: this.grid.maxHeight,
			timeElapsed: time,
			x,
			y
		});
		if (!movePoint || !movePoint.height) {
			return null;
		}
		if (!movePoint.easing) {
			movePoint.easing = EASING.LINEAR;
		}
		if (!movePoint.wait) {
			movePoint.wait = this.grid.updateFrequency;
		}
		return movePoint as MovePoint;
	}
}
