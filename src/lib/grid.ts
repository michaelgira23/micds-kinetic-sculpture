import { Coordinator} from './coordinator';

/**
 * Array of modules making up the total sculpture
 */

export class Grid {

	coordinator: Coordinator;

	constructor(public x: number, public y: number, public maxHeight: number) {
		this.coordinator = new Coordinator(this);
	}
}
