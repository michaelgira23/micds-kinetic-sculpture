import { Formation } from './formation';
import { Grid } from './grid';
import { EASING, Globals, TickCallback, Transition } from './tick';

/**
 * Main class for blending together formations, playing them in loop
 */

export class Coordinator {

	constructor(private grid: Grid, readonly sequence: Sequence = []) { }

	addFormation(index: number = this.sequence.length, duration: number, callback: TickCallback, globals: Globals) {
		this.sequence.splice(index, 0, {
			type: 'formation',
			formation: new Formation(this.grid, callback, globals),
			duration
		});
	}

	addTransition(index: number = this.sequence.length, transition: Transition) {
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
}

export type Sequence = (FormationSequence|TransitionSequence)[];

interface FormationSequence {
	type: 'formation';
	formation: Formation;
	duration: number;
}

interface TransitionSequence {
	type: 'transition';
	transition: Transition;
}
