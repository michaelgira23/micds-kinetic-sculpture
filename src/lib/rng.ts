import * as seedrandom from 'seedrandom';

import { TickInfo } from './tick';

/**
 * Deterministic "random" number generator so formations are random but generate same output every time
 */

export function random(info: TickInfo) {
	return seedrandom(JSON.stringify(info));
}
