import { Formation } from './formation';
import { Grid } from './grid';
import {
	FormationSequence,
	Globals,
	HeightMapDuration,
	Sequence,
	SEQUENCE_TYPE,
	StoredSequence,
	TickCallback,
	Transition
} from './tick';

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
		let lastItemType: SEQUENCE_TYPE | null = null;

		for (let i = 0; i < this.sequence.length; i++) {
			const item = this.sequence[i];
			const isEdge = (i === 0) || (i === this.sequence.length - 1);

			// Ignore transitions that are first or last (because there's nothing to transition to/from!)
			if (isEdge && item.type === 'transition') {
				continue;
			}

			// return (item as FormationSequence).formation.getHeightMapForDuration(10000);

			switch (item.type) {
				case SEQUENCE_TYPE.FORMATION:
					// Get height map for this formation
					const formationHeightMapDuration = item.formation.getHeightMapForDuration(item.duration, lastHeightMap);
					const formationHeightMapTimes = Object.keys(formationHeightMapDuration);

					// Get last height map for next formation
					const formationLastTime = Number(formationHeightMapTimes[formationHeightMapTimes.length - 1]);
					lastHeightMap = formationHeightMapDuration[formationLastTime];

					// Append formation height map to the exportered height map
					const exportedHeightMapTimes = Object.keys(heightMapDuration);
					const exportedLastTime = Number(exportedHeightMapTimes[exportedHeightMapTimes.length - 1]);

					const startAppendage = exportedLastTime + this.grid.updateFrequency;
					const newTotalDuration = exportedLastTime + formationLastTime + this.grid.updateFrequency;
					for (const key of formationHeightMapTimes) {
						const time = Number(key);
						const exportedTime = exportedLastTime + this.grid.updateFrequency + Number(time);
						heightMapDuration[exportedTime] = formationHeightMapDuration[time];
					}

					/** @todo Add transition */

					break;
				case SEQUENCE_TYPE.TRANSITION:
					break;
			}
			lastItemType = item.type;
		}

		/** @todo If loop is true, add transition to beginning and end */

		return heightMapDuration;
	}

}
