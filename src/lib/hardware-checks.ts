import { HeightMap, HeightMapDuration } from './tick';

/**
 * For making sure sequences are able to be displayed on a sculpture
 */

export function maxRates(heightMapDuration: HeightMapDuration, limits: { [nthDeriv: number]: number }) {
	const times = Object.keys(heightMapDuration).map(k => Number(k));
	if (times.length < 2) {
		return [];
	}
	const interval = times[1] - times[0];
	const derivatives = Object.keys(limits).map(k => Number(k)).sort();
	const highestDeriv = derivatives[derivatives.length - 1];

	const errors: Error[] = [];

	let mapDuration = heightMapDuration;
	for (let i = 1; i <= highestDeriv; i++) {
		mapDuration = deriveHeightMapDuration(mapDuration);

		const derivTimes = Object.keys(mapDuration).map(k => Number(k));
		for (const time of derivTimes) {
			for (let x = 0; x < mapDuration[time].length; x++) {
				for (let y = 0; y < mapDuration[time].length; y++) {
					if (Math.abs(mapDuration[time][x][y]) > limits[i]) {
						errors.push({
							x,
							y,
							time,
							nthDeriv: i,
							limit: limits[i],
							value: mapDuration[time][x][y]
						});
					}
				}
			}
		}
	}

	return errors;
}

export function deriveHeightMapDuration(heightMapDuration: HeightMapDuration) {
	const derivedMapDuration: HeightMapDuration = {};
	const times = Object.keys(heightMapDuration).map(k => Number(k));

	for (let i = 0; i < times.length - 1; i++) {
		const time = times[i];
		const nextTime = times[i + 1];
		const timeDiff = nextTime - time;
		const middleTime = (time + nextTime) / 2;

		const heightMap: HeightMap = heightMapDuration[time];
		const nextHeightMap: HeightMap = heightMapDuration[nextTime];

		for (let x = 0; x < heightMap.length; x++) {
			for (let y = 0; y < heightMap.length; y++) {
				if (nextHeightMap[x] && typeof nextHeightMap[x][y] === 'number') {
					const valueDiff = nextHeightMap[x][y] - heightMap[x][y];
					const rate = valueDiff / timeDiff;

					if (!derivedMapDuration[middleTime]) {
						derivedMapDuration[middleTime] = [];
					}
					if (!derivedMapDuration[middleTime][x]) {
						derivedMapDuration[middleTime][x] = [];
					}

					derivedMapDuration[middleTime][x][y] = rate;
				}
			}
		}
	}
	return derivedMapDuration;
}

export interface Error {
	x: number;
	y: number;
	time: number;
	nthDeriv: number;
	limit: number;
	value: number;
}
