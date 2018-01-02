import { Formation } from './formation';
import { Grid } from './grid';
import {
	FormationSequence,
	Globals,
	HeightMapDuration,
	Sequence,
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
			type: 'formation',
			formation: new Formation(this.grid, callback, globals),
			duration
		});
	}

	addTransition(transition: Transition, index: number = this.sequence.length) {
		this.sequence.splice(index, 0, {
			type: 'transition',
			transition
		});

		// Avoid consecutive transitions
		if (typeof this.sequence[index - 1] === 'object' && this.sequence[index - 1].type === 'transition') {
			this.sequence.splice(index - 1, 1);
		}
		if (typeof this.sequence[index + 1] === 'object' && this.sequence[index + 1].type === 'transition') {
			this.sequence.splice(index + 1, 1);
		}
	}

	/**
	 * Adds stored sequence to this coordinator object's sequence
	 */

	import(stored: StoredSequence) {
		for (const item of stored) {
			switch (item.type) {
				case 'formation':
					this.addFormation(item.formation.function, item.duration, item.formation.globals);
					break;
				case 'transition':
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

		for (let i = 0; i < this.sequence.length; i++) {
			const item = this.sequence[i];
			const isEdge = (i === 0) || (i === this.sequence.length - 1);

			// Ignore transitions that are first or last (because there's nothing to transition to/from!)
			if (isEdge && item.type === 'transition') {
				continue;
			}

			switch (item.type) {
				case 'formation':
					const formationHeightMapDuration = item.formation.getHeightMapForDuration(item.duration, lastHeightMap);
					const heightMapTimes = Object.keys(formationHeightMapDuration);

					// Get last height map for next formation
					const lastTime = Number(heightMapTimes[heightMapTimes.length - 1]);
					lastHeightMap = formationHeightMapDuration[lastTime];
					break;
				case 'transition':
					break;
			}

			/** @todo Get the duration from each formation then combine them via transitions */
		}
	}
}
