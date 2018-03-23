import { EASING_FUNCTIONS } from './easings';
import { Formation } from './formation';
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
import { lastTime, roundUp, transitionNumbers } from './utils';

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

		for (let i = 0; i < this.sequence.length; i++) {
			const item = this.sequence[i];
			const isFirst = (i === 0);
			const isLast = (i === this.sequence.length - 1);
			const isEdge = isFirst || isLast;

			// Ignore transitions that are first or last (because there's nothing to transition to/from!)
			// if (isEdge && item.type === 'transition') {
			// 	continue;
			// }

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
					if (isFirst && !loop) {
						startFormation = 0;
						startFormationUpdate = 0;
						startTransition = 0;
						startTransitionUpdate = 0;
						useTransition = JSON.parse(JSON.stringify(useTransition));
						useTransition.duration = 0;
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
					lastHeightMap = formationHeightMapDuration[lastTime(formationHeightMapDuration)];
					useTransition = DEFAULT_TRANSITION;
					break;
				case SEQUENCE_TYPE.TRANSITION:
					useTransition = item.transition;
					break;
			}
		}

		/** @todo If loop is true, add transition to beginning and end */

		return heightMapDuration;
	}

}
