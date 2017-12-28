import { EASING_FUNCTIONS } from './easings';
import { Grid } from './grid';
import {
	EASING,
	Globals,
	HeightMap,
	HeightMapDuration,
	MovePoint,
	MovePointMap,
	MovePointMapDuration,
	TickCallback
} from './tick';

/**
 * Class handling the tick function
 */

export class Formation {
	constructor(private grid: Grid, private callback: TickCallback, private globals: Globals = {}) { }

	getHeightMapForDuration(duration: number, previousHeight: HeightMap = this.grid.DEFAULT_HEIGHT_MAP) {
		const movePointMap = this.getMovePointMapForDuration(duration);
		const movePointMapTimes = Object.keys(movePointMap).map(time => Number(time));

		const heightMap: HeightMapDuration = {};
		for (let time = 0; time <= duration; time += this.grid.updateFrequency) {
			heightMap[time] = [];
		}
		const updateHeightTimes = Object.keys(heightMap).map(time => Number(time));

		// Iterate through each individual module
		for (let x = 0; x < this.grid.nx; x++) {
			for (let y = 0; y < this.grid.ny; y++) {
				// Remember last updated value/time for easing
				// For the first value, default to `previousHeight` if null is returned from callback function
				let previousValue = previousHeight[x][y];
				let lastUpdated = 0;
				// Go through all the move points for this specific module
				for (const movePointTime of movePointMapTimes) {
					const movePoint = movePointMap[movePointTime][x][y];

					// Ignore milliseconds in which callback returns null
					if (!movePoint) {
						continue;
					}

					// Update all times up until the current frame
					for (const updateTime of updateHeightTimes) {
						if (lastUpdated <= updateTime && updateTime <= movePointTime) {
							// Get percentage time is between the two values
							const percentage = (updateTime - lastUpdated) / (movePointTime - lastUpdated);
							// Difference in heights
							const valueDiff = movePoint.height - previousValue;
							// Ease function to use
							const ease = EASING_FUNCTIONS[movePoint.easing];
							// Calculate what height should be at current updating time
							const newValue = (ease(percentage) * valueDiff) + previousValue;

							if (typeof heightMap[updateTime][x] !== 'object') {
								heightMap[updateTime][x] = [];
							}

							heightMap[updateTime][x][y] = newValue;
						}
					}

					previousValue = movePoint.height;
					lastUpdated = movePointTime;
				}
			}
		}

		return heightMap;
	}

	getMovePointMapForDuration(duration: number) {
		const movePointMap: MovePointMapDuration = {};
		for (let time = 0; time <= duration; time++) {
			movePointMap[time] = this.getMovePointMap(time);
		}
		return movePointMap;
	}

	/**
	 * Get move points for all modules in grid
	 */

	getMovePointMap(time: number, ignoreNull = true) {
		const grid: MovePointMap = [];
		for (let x = 0; x < this.grid.nx; x++) {
			grid[x] = [];
			for (let y = 0; y < this.grid.ny; y++) {
				const movePoint = this.getMovePoint(time, x, y);
				if (movePoint !== null) {
					grid[x][y] = movePoint;
				}
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
		if (!movePoint || typeof movePoint.height !== 'number') {
			return null;
		}
		if (!movePoint.easing || !(movePoint.easing in EASING)) {
			movePoint.easing = EASING.LINEAR;
		}
		if (typeof movePoint.wait !== 'number' || movePoint.wait <= 0) {
			movePoint.wait = 1;
		}
		return movePoint as MovePoint;
	}
}
