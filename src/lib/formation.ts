import { EASING_FUNCTIONS } from './easings';
import { Grid } from './grid';
import { MovePoint } from './move-point';
import { EASING, Globals, HeightMap, HeightMapDuration, TickCallback } from './tick';

/**
 * Class handling the tick function
 */

export class Formation {
	constructor(private grid: Grid, private callback: TickCallback, private globals: Globals = {}) { }

	/**
	 * Calculate height of each module for a duration of time
	 */

	getHeightMapForDuration(duration: number, previousHeightMap: HeightMap = this.grid.DEFAULT_HEIGHT_MAP) {
		const heightMapDuration: HeightMapDuration = {};

		// Iterate through each individual module
		for (let x = 0; x < this.grid.nx; x++) {
			for (let y = 0; y < this.grid.ny; y++) {
				// Remember last updated value/time for easing
				let previousValue = previousHeightMap[x][y];
				let waitUntil = 0;

				// Fill times with previous height in case there are absolutely no move points for this module
				for (let updateTime = 0; updateTime <= duration; updateTime += this.grid.updateFrequency) {
					if (typeof heightMapDuration[updateTime] !== 'object') {
						heightMapDuration[updateTime] = [];
					}

					if (typeof heightMapDuration[updateTime][x] !== 'object') {
						heightMapDuration[updateTime][x] = [];
					}

					heightMapDuration[updateTime][x][y] = previousValue;
				}

				// Iterate through duration finding all the move points
				for (let movePointTime = 0; movePointTime <= duration; movePointTime++) {
					// Skip trying to calculate new move point if previous wait hasn't timed out
					if (movePointTime < waitUntil) {
						continue;
					}

					// const movePoint = this.getMovePoint(movePointTime, duration, x, y);
					const movePoint = new MovePoint(this.callback({
						globals: this.globals,
						maxHeight: this.grid.maxHeight,
						nx: this.grid.nx,
						ny: this.grid.ny,
						timeElapsed: movePointTime,
						totalDuration: duration,
						x,
						y
					}));

					if (movePoint.height === null) {
						continue;
					}

					const movePointExport = movePoint.export(previousValue);

					// Round move point time up to next update frequency
					const firstUpdateTime = Math.ceil(waitUntil / this.grid.updateFrequency) * this.grid.updateFrequency;
					if (firstUpdateTime > movePointTime + movePoint.duration) {
						continue;
					}

					// Update points
					for (let updateTime = firstUpdateTime; updateTime <= duration; updateTime += this.grid.updateFrequency) {
						heightMapDuration[updateTime][x][y] = movePointExport(updateTime - movePointTime)!;
					}

					previousValue = movePoint.height;
					waitUntil = movePointTime + movePoint.duration;
				}
			}
		}

		return heightMapDuration;
	}

}
