import { Coordinator} from './coordinator';
import { HeightMap } from './tick';

/**
 * Array of modules making up the total sculpture
 */

export class Grid {

	/**
	 * Returns height map with all modules retracted to the ceiling (max height)
	 */

	get DEFAULT_HEIGHT_MAP() {
		const map: HeightMap = [];
		for (let x = 0; x < this.nx; x++) {
			map[x] = [];
			for (let y = 0; y < this.ny; y++) {
				map[x][y] = this.maxHeight;
			}
		}
		return map;
	}

	coordinator: Coordinator;

	constructor(public nx: number, public ny: number, public maxHeight: number, public updateFrequency: number) {
		this.coordinator = new Coordinator(this);
	}
}
