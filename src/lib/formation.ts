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
		for (let time = 0; time <= duration; time++) {
			heightMap[time] = [];
		}
		const heightTimes = Object.keys(heightMap).map(time => Number(time));

		for (let x = 0; x < this.grid.nx; x++) {
			for (let y = 0; y < this.grid.ny; y++) {
				const previousValue = previousHeight[x][y];
				let lastUpdated = 0;
				for (const time of movePointMapTimes) {
					const movePoint = movePointMap[time][x][y];
					if (!movePoint) {
						continue;
					}

					/** @todo Find easing between last frame and current move point and calculate heights for intervals */

					lastUpdated = time;
				}
			}
		}
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
