import { EASING_FUNCTIONS } from './easings';
import { Formation, lastTime } from './formation';
import { roundUp, transitionNumbers } from './formation-helpers/utils';
import { Grid } from './grid';
import {
	EASING,
	FormationSequence,
	Globals,
	HeightMap,
	HeightMapDuration,
	Sequence,
	SEQUENCE_TYPE,
	StoredSequence,
	TickCallback,
	Transition,
	TransitionSequence
} from './tick';

const DEFAULT_TRANSITION: Transition = {
	easing: EASING.LINEAR,
	duration: 2000,
	continuousBefore: false,
	continuousAfter: false
};

/**
 * Main class for blending together formations, playing them in loop
 */

export class Coordinator {

	constructor(private grid: Grid, public sequence: Sequence = []) { }

	clear() {
		this.sequence = [];
	}

	addFormation(callback: TickCallback, duration: number, globals?: Globals, index: number = this.sequence.length) {
		this.sequence.splice(index, 0, {
			type: SEQUENCE_TYPE.FORMATION,
			formation: new Formation(this.grid, callback, globals),
			duration
		});
	}

	addTransition(transition: Transition, index: number = this.sequence.length) {
		this.sequence.splice(index, 0, {
			type: SEQUENCE_TYPE.TRANSITION,
			transition
		});

		// Avoid consecutive transitions
		if (typeof this.sequence[index - 1] === 'object' && this.sequence[index - 1].type === SEQUENCE_TYPE.TRANSITION) {
			this.sequence.splice(index - 1, 1);
		}
		if (typeof this.sequence[index + 1] === 'object' && this.sequence[index + 1].type === SEQUENCE_TYPE.TRANSITION) {
			this.sequence.splice(index + 1, 1);
		}
	}

	/**
	 * Adds stored sequence to this coordinator object's sequence
	 */

	import(stored: StoredSequence) {
		for (const item of stored) {
			switch (item.type) {
				case SEQUENCE_TYPE.FORMATION:
					this.addFormation(item.formation.function, item.duration, item.formation.globals);
					break;
				case SEQUENCE_TYPE.TRANSITION:
					this.addTransition(item.transition);
					break;
			}
		}
	}

	/**
	 * Will return one iteration of loop. If loop is set to `true`, will transition the end into the beginning again.
	 */

	export(loop = false) {
		const heightMapDuration: HeightMapDuration = {};

		let exportDuration = 0;
		let lastHeightMap = this.grid.DEFAULT_HEIGHT_MAP;
		let useTransition: Transition = DEFAULT_TRANSITION;
		const useSequence: Sequence = this.sequence.slice(0);

		// If looping, put beginning formation also at the end
		if (loop) {
			for (const item of useSequence) {
				if (item.type === SEQUENCE_TYPE.FORMATION) {
					useSequence.push(item);
					break;
				}
			}
		}

		// Formations already processed
		let nFormations = 0;
		// When to cut the rest of the height maps (when looping from last formation)
		let cutBeginning = 0;
		let cutEnd = Number.POSITIVE_INFINITY;

		for (let i = 0; i < useSequence.length; i++) {
			const item = useSequence[i];
			const isFirst = (i === 0);
			const isLast = (i === useSequence.length - 1);

			switch (item.type) {
				case SEQUENCE_TYPE.FORMATION:
					// When formation calculation technically starts
					let startFormation = exportDuration;
					if (useTransition.continuousBefore && useTransition.continuousAfter) {
						startFormation -= useTransition.duration;
					} else if (!useTransition.continuousBefore && !useTransition.continuousAfter) {
						startFormation += useTransition.duration;
					}
					startFormation = Math.max(startFormation, 0);
					// What time to start updating height map duration
					let startFormationUpdate = roundUp(startFormation, this.grid.updateFrequency);

					// When transition calculation technically starts
					let startTransition = exportDuration;
					if (useTransition.continuousBefore) {
						startTransition = Math.max(exportDuration - useTransition.duration, 0);
					}
					// What time to start updating height map duration
					let startTransitionUpdate = roundUp(startTransition, this.grid.updateFrequency);

					// If not looping, just start off with first formation without any transition shiz
					if (isFirst) {
						startFormation = 0;
						startFormationUpdate = 0;
						startTransition = 0;
						startTransitionUpdate = 0;
						useTransition = JSON.parse(JSON.stringify(useTransition));
						useTransition.duration = 0;
					}

					// If looping and this is second formation, cut off previous formation that isn't part of transition
					if (loop && isLast) {
						const transitionEnds = startTransition + useTransition.duration;
						cutBeginning = transitionEnds - startFormation;
						cutEnd = transitionEnds;
					}

					// Calculate formation's height map duration
					const offset = startFormationUpdate - startFormation;
					const formationHeightMapDuration = item.formation.getHeightMapForDuration(
						item.duration,
						offset,
						lastHeightMap
					);
					const firstFormationHeightMap = formationHeightMapDuration[offset];

					// Combine newly calculated formation (plus possible freeze frame) with existing height map duration
					for (
						let updateTime = startTransitionUpdate;
						updateTime < startFormation + item.duration;
						updateTime += this.grid.updateFrequency
					) {
						const updateHeightMap = formationHeightMapDuration[updateTime - startFormation];
						// How far is this instance is from previous formation (will be more than 1 if already completed)
						const transitionPercentage = (updateTime - startTransition) / useTransition.duration;

						if (transitionPercentage < 1) {
							// Go through all modules to calculate easing from previous last height map
							if (!heightMapDuration[updateTime]) {
								heightMapDuration[updateTime] = [];
							}
							for (let x = 0; x < this.grid.nx; x++) {
								if (!heightMapDuration[updateTime][x]) {
									heightMapDuration[updateTime][x] = [];
								}
								for (let y = 0; y < this.grid.ny; y++) {
									// If no existing value for current time, it means continuousBefore transition. Default to latest value.
									if (typeof heightMapDuration[updateTime][x][y] !== 'number') {
										heightMapDuration[updateTime][x][y] = lastHeightMap[x][y];
									}
									const previousValue = heightMapDuration[updateTime][x][y];

									// Use new value from calculated formation if available; otherwise, fall back to first height map.
									const nextValue = updateHeightMap ? updateHeightMap[x][y] : firstFormationHeightMap[x][y];

									heightMapDuration[updateTime][x][y] =
										transitionNumbers(EASING_FUNCTIONS[useTransition.easing], previousValue, nextValue, transitionPercentage);
								}
							}
						} else {
							// If no transition going on, expedite the calculations and just use formation's height map
							heightMapDuration[updateTime] = updateHeightMap;
						}
					}

					exportDuration = startFormation + item.duration;
					nFormations++;
					lastHeightMap = formationHeightMapDuration[lastTime(formationHeightMapDuration)];
					useTransition = DEFAULT_TRANSITION;
					break;
				case SEQUENCE_TYPE.TRANSITION:
					useTransition = item.transition;
					break;
			}
		}

		// Cut out any beginning/end formations and shift all height maps so they begin at 0
		// This completes the process of smoothly looping a height map duration
		const heightMapDurationTimes = Object.keys(heightMapDuration).map(k => Number(k));
		const shiftHeightMaps = roundUp(cutBeginning, this.grid.updateFrequency);

		const cleanedHeightMapDuration: HeightMapDuration = {};

		// Delete any height maps that should be cut
		for (let time = 0; time <= exportDuration - this.grid.updateFrequency; time += this.grid.updateFrequency) {
			if (cutBeginning <= time && time < cutEnd) {
				cleanedHeightMapDuration[time - shiftHeightMaps] = heightMapDuration[time];
			}
		}

		return cleanedHeightMapDuration;
	}

}
