import { Formation } from './formation';
import { Grid } from './grid';
import {
	EASING,
	FormationSequence,
	Globals,
	HeightMapDuration,
	Sequence,
	SEQUENCE_TYPE,
	StoredSequence,
	TickCallback,
	Transition,
	TransitionSequence
} from './tick';

const DEFAULT_TRANSFORMATION: TransitionSequence = {
	type: SEQUENCE_TYPE.TRANSITION,
	transition: {
		easing: EASING.LINEAR,
		duration: 2000,
		continuousBefore: false,
		continuousAfter: false
	}
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

	export(loop = true) {
		const heightMapDuration: HeightMapDuration = {};

		let lastHeightMap = this.grid.DEFAULT_HEIGHT_MAP;
		let nextTransition: TransitionSequence | null = null;

		for (let i = 0; i < this.sequence.length; i++) {
			const item = this.sequence[i];
			const isFirst = (i === 0);
			const isLast = (i === this.sequence.length - 1);
			const isEdge = isFirst || isLast;

			// Ignore transitions that are first or last (because there's nothing to transition to/from!)
			if (isEdge && item.type === 'transition') {
				continue;
			}

			switch (item.type) {
				case SEQUENCE_TYPE.FORMATION:
					// Get height map for this formation
					const formationHeightMapDuration = item.formation.getHeightMapForDuration(item.duration, 0, lastHeightMap);
					const formationHeightMapTimes = Object.keys(formationHeightMapDuration);

					// Get last height map for next formation
					const formationLastTime = Number(formationHeightMapTimes[formationHeightMapTimes.length - 1]);
					lastHeightMap = formationHeightMapDuration[formationLastTime];

					// Append formation height map to the exportered height map
					const exportedHeightMapTimes = Object.keys(heightMapDuration);
					let exportedLastTime = 0;
					let startAppendage = 0;
					let newTotalDuration = formationLastTime;
					if (!isFirst) {
						exportedLastTime = Number(exportedHeightMapTimes[exportedHeightMapTimes.length - 1]);
						startAppendage = exportedLastTime + this.grid.updateFrequency;
						newTotalDuration = exportedLastTime + formationLastTime + this.grid.updateFrequency;
					}
					for (const key of formationHeightMapTimes) {
						const time = Number(key);
						let exportedTime = exportedLastTime + Number(time);
						if (!isFirst) {
							exportedTime += this.grid.updateFrequency;
						}
						heightMapDuration[exportedTime] = formationHeightMapDuration[time];
					}

					/** @todo Add transition */

					nextTransition = null;
					break;
				case SEQUENCE_TYPE.TRANSITION:
					nextTransition = item;
					break;
			}
		}

		/** @todo If loop is true, add transition to beginning and end */

		return heightMapDuration;
	}

}
