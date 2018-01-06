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

const DEFAULT_TRANSITION: TransitionSequence = {
	type: SEQUENCE_TYPE.TRANSITION,
	transition: {
		easing: EASING.LINEAR,
		duration: 2000,
		continuous: false
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

		let time = 0;
		let lastHeightMap = this.grid.DEFAULT_HEIGHT_MAP;
		let nextTransition: Transition | null = null;

		for (let i = 0; i < this.sequence.length; i++) {
			const item = this.sequence[i];
			const isFirst = (i === 0);
			const isLast = (i === this.sequence.length - 1);
			const isEdge = isFirst || isLast;

			// Ignore transitions that are first (because there's nothing to transition from!)
			if (isFirst && item.type === 'transition') {
				continue;
			}

			switch (item.type) {
				case SEQUENCE_TYPE.FORMATION:
					// Get height map for this formation
					const exportFormation = item.formation.exportHeightMapForDuration(item.duration, lastHeightMap);

					for (let updateTime = time; updateTime <= time + item.duration; updateTime += this.grid.updateFrequency) {
						heightMapDuration[updateTime] = exportFormation(updateTime - time);
					}

					lastHeightMap = heightMapDuration[item.duration];
					time += item.duration + this.grid.updateFrequency;

					/** @todo Add transition */

					nextTransition = null;
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
