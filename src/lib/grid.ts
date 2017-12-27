import { Coordinator} from './coordinator';

/**
 * Array of modules making up the total sculpture
 */

export class Grid {

	coordinator: Coordinator;

	constructor(public nx: number, public ny: number, public maxHeight: number, public updateFrequency: number) {
		this.coordinator = new Coordinator(this);
	}
}
