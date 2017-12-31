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
				let lastUpdated = 0;
				let lastUpdatedWait = 0;

				// Iterate through duration finding all the move points
				for (let movePointTime = 0; movePointTime <= duration; movePointTime++) {
					// Skip trying to calculate new move point if previous wait hasn't timed out
					if (movePointTime < lastUpdated + lastUpdatedWait) {
						continue;
					}

					const movePoint = this.getMovePoint(movePointTime, x, y);

					if (!movePoint) {
						continue;
					}

					// Update points
					for (let updateTime = lastUpdated; updateTime <= duration; updateTime += this.grid.updateFrequency) {

						let newValue = movePoint.height;

						// Do easing logic if easing from previous point. Otherwise, default following points to move point
						if (updateTime < movePointTime) {
							// Get percentage time is between the two values
							const percentage = (updateTime - lastUpdated) / (movePointTime - lastUpdated);
							// Difference in heights
							const valueDiff = movePoint.height - previousValue;
							// Ease function to use
							// console.log('ease', movePoint.easing);
							const ease = EASING_FUNCTIONS[movePoint.easing];
							// Calculate what height should be at current updating time
							newValue = (ease(percentage) * valueDiff) + previousValue;
						}

						if (typeof heightMapDuration[updateTime] !== 'object') {
							heightMapDuration[updateTime] = [];
						}

						if (typeof heightMapDuration[updateTime][x] !== 'object') {
							heightMapDuration[updateTime][x] = [];
						}

						heightMapDuration[updateTime][x][y] = newValue;
					}

					previousValue = movePoint.height;
					lastUpdated = movePointTime;
					lastUpdatedWait = movePoint.wait;
				}
			}
		}

		return heightMapDuration;
	}

	/**
	 * Get move point for a specific module at a specific time
	 */

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
		if (!movePoint.easing) {
			movePoint.easing = EASING.LINEAR;
		}
		if (typeof movePoint.wait !== 'number' || movePoint.wait < 1) {
			movePoint.wait = 1;
		}
		movePoint.wait = Math.floor(movePoint.wait);
		return movePoint as MovePoint;
	}
}
