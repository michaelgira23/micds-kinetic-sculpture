import { isTickCallbackReturn } from '../move-point';
import { MovePointMap, MovePointMapColumns, MovePointMapDuration, TickCallback, TickCallbackReturn } from '../tick';

/**
 * Object for representing formations by manually coding in move points at specific modules and times
 * (Instead of calculating based off of a function like normal)
 */

export class ManualFormation {
	constructor(private movePointMapDuration: MovePointMapDuration) { }

	/**
	 * Return a TickCallback function that returns stored move points
	 */

	export(): TickCallback {
		return ({ timeElapsed, x, y }) => {
			// Finally fall back to returning value for whole grid
			if (isTickCallbackReturn(this.movePointMapDuration[timeElapsed])) {
				// Second fall back to returning value for specific row
				if (isTickCallbackReturn((this.movePointMapDuration[timeElapsed] as MovePointMapColumns)[x])) {
					// First try returning value for specific module
					if (isTickCallbackReturn((this.movePointMapDuration[timeElapsed] as MovePointMap)[x][y])) {
						return (this.movePointMapDuration[timeElapsed] as MovePointMap)[x][y];
					} else {
						return (this.movePointMapDuration[timeElapsed] as MovePointMapColumns)[x];
					}
				} else {
					return this.movePointMapDuration[timeElapsed];
				}
			}
		};
	}
}
