import { Formation } from './formation';
import { Grid } from './grid';
import { EASING, Globals, HeightMap, TickCallback, Transition } from './tick';

/**
 * Main class for blending together formations, playing them in loop
 */

export class Coordinator {

	constructor(private grid: Grid, readonly sequence: Sequence = [], public repeat = Number.POSITIVE_INFINITY) { }

	addFormation(callback: TickCallback, duration?: number, globals?: Globals, index: number = this.sequence.length) {
		this.sequence.splice(index, 0, {
			type: 'formation',
			formation: new Formation(this.grid, callback, globals),
			duration: duration || Number.POSITIVE_INFINITY
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
	 * Will return one iteration of loop.
	 */

	export() {
		const heightMap: HeightMap = {};
		for (let i = 0; i < this.sequence.length; i++) {
			const item = this.sequence[i];
			const isEdge = (i === 0) || (i === this.sequence.length - 1);

			// Ignore transitions that are first or last (because there's nothing to transition to/from!)
			if (isEdge && item.type === 'transition') {
				continue;
			}

			/** @todo Get the duration from each formation then combine them via transitions */
		}
	}
}

export type Sequence = (FormationSequence | TransitionSequence)[];

interface FormationSequence {
	type: 'formation';
	formation: Formation;
	duration: number;
}

interface TransitionSequence {
	type: 'transition';
	transition: Transition;
}
