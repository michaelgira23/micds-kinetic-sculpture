import { EASING_FUNCTIONS } from './easings';
import { Grid } from './grid';
import { MovePoint } from './move-point';
import { EASING, Globals, HeightMap, HeightMapDuration, MovePointMapDuration, TickCallback } from './tick';

/**
 * Class handling the tick function
 */

export class Formation {
	constructor(private grid: Grid, private callback: TickCallback, private globals: Globals = {}) { }

	/**
	 * Export function for giving height map of formation at time
	 */

	exportHeightMapForDuration(duration: number, previousHeightMap: HeightMap = this.grid.DEFAULT_HEIGHT_MAP) {

		// First, map out all move points
		const movePointMapDuration: MovePointMapDuration = {};

		for (let x = 0; x < this.grid.nx; x++) {
			for (let y = 0; y < this.grid.ny; y++) {

				// When to call next tick callback
				let waitUntil = 0;

				for (let time = 0; time <= duration; time++) {
					if (time < waitUntil) {
						continue;
					}

					const movePoint = new MovePoint(this.callback({
						globals: this.globals,
						maxHeight: this.grid.maxHeight,
						nx: this.grid.nx,
						ny: this.grid.ny,
						timeElapsed: time,
						totalDuration: duration,
						x,
						y
					}));

					if (movePoint.height === null) {
						continue;
					}

					if (typeof movePointMapDuration[time] !== 'object') {
						movePointMapDuration[time] = [];
					}
					if (typeof movePointMapDuration[time][x] !== 'object') {
						movePointMapDuration[time][x] = [];
					}
					movePointMapDuration[time][x][y] = movePoint;

					waitUntil = time + movePoint.duration;
				}
			}
		}

		return (time: number) => {
			const heightMap: HeightMap = [];

			for (let x = 0; x < this.grid.nx; x++) {
				for (let y = 0; y < this.grid.ny; y++) {
					// Ensure array exists and default to previous height map for last formation
					if (typeof heightMap[x] !== 'object') {
						heightMap[x] = [];
					}
					heightMap[x][y] = previousHeightMap[x][y];

					// Iterate from current move point backwards in case current move point is null
					for (let movePointTime = 0; movePointTime <= time; movePointTime++) {
						let lastHeight = previousHeightMap[x][y];
						if (movePointMapDuration[time] && movePointMapDuration[time][x] && movePointMapDuration[time][x][y]) {
							const movePoint = movePointMapDuration[time][x][y];

							if (movePointTime <= time && time <= movePointTime + movePoint.duration) {
								const height = movePoint.getHeight(lastHeight, time);
								if (height === null) {
									continue;
								} else {
									heightMap[x][y] = height;
									break;
								}
							}

							lastHeight = movePoint.height!;
							heightMap[x][y] = lastHeight;
						}
					}
				}
			}

			return heightMap;
		};
	}

}
