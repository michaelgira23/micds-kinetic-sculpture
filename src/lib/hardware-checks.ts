import { HeightMap, HeightMapDuration } from './tick';

/**
 * For making sure sequences are able to be displayed on a sculpture
 */

export function maxRates(heightMapDuration: HeightMapDuration, limits: { [nthDeriv: number]: number }) {
	const derivatives = Object.keys(limits).map(k => Number(k)).sort();
	const highestDeriv = derivatives[derivatives.length - 1];

	let mapDuration = heightMapDuration;
	for (let i = 1; i <= highestDeriv; i++) {
		mapDuration = deriveHeightMapDuration(mapDuration);

		const times = Object.keys(mapDuration).map(k => Number(k));
		for (const time of times) {
			for (const row of mapDuration[time]) {
				for (const rate of row) {
					// @todo
				}
			}
		}
	}
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

export interface RateOver {
	from: number;
	to: number;
	nthDeriv: number;
}
