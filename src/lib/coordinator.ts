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
import { roundUp } from './utils';

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

		let lastHeightMap = this.grid.DEFAULT_HEIGHT_MAP;
		let nextTransition: Transition = JSON.parse(JSON.stringify(DEFAULT_TRANSITION));

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
					// Calculate times to do shiz
					const exportedLastTime = lastTime(heightMapDuration);

					// At what time this formation (and transition) will affect current height map duration
					let startUpdate = exportedLastTime;
					if (nextTransition.continuousBefore) {
						startUpdate -= nextTransition.duration;
					}
					startUpdate = Math.max(startUpdate, 0);

					// When to start calculating current formation
					// (May vary depending on whether we need a "freeze frame" for non-continuous transitions)
					let startFormation = exportedLastTime;

					if (nextTransition.continuousBefore) {
						startFormation -= nextTransition.duration / 2;
					} else {
						startFormation += nextTransition.duration / 2;
					}
					if (nextTransition.continuousAfter) {
						startFormation -= nextTransition.duration / 2;
					} else {
						startFormation += nextTransition.duration / 2;
					}
					startFormation = Math.max(startFormation, 0);

					// If not looping, just start off with first formation without any transition shiz
					if (isFirst && !loop) {
						startUpdate = 0;
						startFormation = 0;
						nextTransition.duration = 0;
					}

					// Round move point time up to next update frequency (to determine offset)
					const firstUpdateTime = roundUp(startFormation, this.grid.updateFrequency);
					// If formation goes so quick that it's shorter than update frequency, ignore
					if (firstUpdateTime > exportedLastTime + item.duration) {
						continue;
					}
					const offset = firstUpdateTime - startFormation;

					// Get height map for this formation
					let formationHeightMapDuration = item.formation.getHeightMapForDuration(
						item.duration,
						offset,
						lastHeightMap
					);
					const formationHeightMapTimes = Object.keys(formationHeightMapDuration);
					const lastFormationTime = Number(formationHeightMapTimes[formationHeightMapTimes.length - 1]);

					const firstHeightMapCurrent = formationHeightMapDuration[offset];

					// If not continuous before, copy last height map of previous formation for duration of transition
					if (!nextTransition.continuousBefore) {
						for (
							let updateTime = firstUpdateTime;
							updateTime < startFormation;
							updateTime += this.grid.updateFrequency
						) {
							formationHeightMapDuration[updateTime] = lastHeightMap;
						}
					}

					// If not continuous after, copy first height map of formation for duration of transition
					if (!nextTransition.continuousAfter) {
						const oldFormation = JSON.parse(JSON.stringify(formationHeightMapDuration));
						const newFormation = [];

						// Add freeze frame
						/** @todo Might work might not? */
						let updateTime;
						for (
							updateTime = 0;
							updateTime < nextTransition.duration;
							updateTime += this.grid.updateFrequency
						) {
							newFormation[updateTime] = firstHeightMapCurrent;
						}

						const freezeFrameDuration = updateTime;

						// Add rest of calculated formation
						for (
							updateTime;
							updateTime < nextTransition.duration + lastFormationTime;
							updateTime += this.grid.updateFrequency
						) {
							newFormation[updateTime] = formationHeightMapDuration[updateTime - freezeFrameDuration];
						}

						formationHeightMapDuration = newFormation;
					}

					// Combine newly calculated formation (plus possible freeze frame) with existing height map duration
					for (
						let updateTime = firstUpdateTime;
						formationHeightMapDuration[updateTime - firstUpdateTime];
						updateTime += this.grid.updateFrequency
					) {
						const updateHeightMap = formationHeightMapDuration[updateTime - firstUpdateTime];
						// How far is this instance is from previous formation (will be more than 1 if already completed)
						const transitionPercentage = (updateTime - exportedLastTime) / nextTransition.duration;
						// console.log(`At time ${updateTime} transition percentage is ${transitionPercentage}`);
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

									// Transition from existing values to new formation values
									const previousValue = heightMapDuration[updateTime][x][y];
									const nextValue = updateHeightMap[x][y];
									// console.log('transition from', previousValue, 'to', nextValue);
									const valueDiff = nextValue - previousValue;
									if (previousValue) {
										const easingFunction = EASING_FUNCTIONS[nextTransition.easing];
										heightMapDuration[updateTime][x][y] = easingFunction(transitionPercentage) * valueDiff + previousValue;
									} else {
										heightMapDuration[updateTime][x][y] = nextValue;
									}
								}
							}
						} else {
							heightMapDuration[updateTime] = updateHeightMap;
						}
					}

					lastHeightMap = formationHeightMapDuration[lastTime(formationHeightMapDuration)];
					nextTransition = DEFAULT_TRANSITION;
					break;
				case SEQUENCE_TYPE.TRANSITION:
					nextTransition = item.transition;
					break;
			}
		}

		/** @todo If loop is true, add transition to beginning and end */

		return heightMapDuration;
	}

}

/**
 * Gets the last time of a height map duration
 */

function lastTime(duration: { [time: number]: any }) {
	if (typeof duration !== 'object') {
		return 0;
	}
	const times = Object.keys(duration);
	if (times.length <= 0) {
		return 0;
	} else {
		return Number(times[times.length - 1]);
	}
}
