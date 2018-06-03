/**
 * @file Util functions for implementing formations
 */

import { EasingFunction } from '../tick';

/**
 * Detect if module is in center
 */

export function isCenter(nx: number, ny: number, x: number, y: number) {
	const { radius } = polarCoordinates(nx, ny, x, y, false);
	return {
		center: !Math.floor(radius),
		multiple: isEven(nx) || isEven(ny)
	};
}

/**
 * How far a specific module is from a border. See below for example values for a 5x5 grid:
 *
 * =======================
 * BORDER_ALIGNMENT.CENTER
 * =======================
 * +---+---+---+---+---+
 * | 0 | 0 | 0 | 0 | 0 |
 * +---+---+---+---+---+
 * | 0 | 1 | 1 | 1 | 0 |
 * +---+---+---+---+---+
 * | 0 | 1 | 2 | 1 | 0 |
 * +---+---+---+---+---+
 * | 0 | 1 | 1 | 1 | 0 |
 * +---+---+---+---+---+
 * | 0 | 0 | 0 | 0 | 0 |
 * +---+---+---+---+---+
 *
 *
 * ====================
 * BORDER_ALIGNMENT.X/Y
 * ====================
 * +---+---+---+---+---+
 * | 0 | 1 | 2 | 1 | 0 |
 * +---+---+---+---+---+
 * | 0 | 1 | 2 | 1 | 0 |
 * +---+---+---+---+---+
 * | 0 | 1 | 2 | 1 | 0 |
 * +---+---+---+---+---+
 * | 0 | 1 | 2 | 1 | 0 |
 * +---+---+---+---+---+
 * | 0 | 1 | 2 | 1 | 0 |
 * +---+---+---+---+---+
 *
 *
 * ==================
 * BORDER_ALIGNMENT.T
 * ==================
 * +---+---+---+---+---+
 * | 0 | 1 | 2 | 1 | 0 |
 * +---+---+---+---+---+
 * | 1 | 1 | 2 | 1 | 1 |
 * +---+---+---+---+---+
 * | 2 | 2 | 2 | 2 | 2 |
 * +---+---+---+---+---+
 * | 1 | 1 | 2 | 1 | 1 |
 * +---+---+---+---+---+
 * | 0 | 1 | 2 | 1 | 0 |
 * +---+---+---+---+---+
 *
 */

export function borderLevel(nx: number, ny: number, x: number, y: number, alignment = BORDER_ALIGNMENT.CENTER) {
	// If module's x/y component is less than half, just return it's x/y component.
	// Otherwise, subtract it from the total grid length essentially flipping it across the midway point.
	const xLevel = (nx / 2) < (x + 1) ? nx - (x + 1) : x;
	const yLevel = (ny / 2) < (y + 1) ? ny - (y + 1) : y;

	switch (alignment) {
		case BORDER_ALIGNMENT.X:
			return xLevel;
		case BORDER_ALIGNMENT.Y:
			return yLevel;
		case BORDER_ALIGNMENT.T:
			return Math.max(xLevel, yLevel);
		default:
			return Math.min(xLevel, yLevel);
	}
}

export function maxBorderLevel(nx: number, ny: number) {
	return borderLevel(nx, ny, Math.floor(nx / 2), Math.floor(ny / 2));
}

export enum BORDER_ALIGNMENT {
	CENTER = 'center',
	T = 't',
	X = 'x',
	Y = 'y'
}

 /**
  * Convert x and y coordinates to polar coordinates in grid
  */

export function polarCoordinates(nx: number, ny: number, x: number, y: number, computeTheta = true, radians = true) {
	const xMid = (nx + 1) / 2;
	const yMid = (ny + 1) / 2;

	const xRelative = (x + 1) - xMid;
	const yRelative = (y + 1) - yMid;

	const radius = distance(xMid, yMid, x + 1, y + 1);

	if (!computeTheta) {
		return {
			radius,
			theta: null
		};
	}

	let theta = Math.atan(yRelative / xRelative);

	if (!radians) {
		theta = toDegrees(theta);
	}

	return {
		radius,
		theta
	};
}

/**
 * Find value in between two other values (for transitioning between)
 */

export function transitionNumbers(easeFunction: EasingFunction, from: number, to: number, percent: number) {
	const valueDiff = to - from;
	return (easeFunction(percent) * valueDiff) + from;
}

/**
 * Finding the distance between two points
 */

export function distance(x1: number, y1: number, x2: number, y2: number) {
	return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

/**
 * Convert degrees to radians
 */

export function toRadians(degrees: number) {
	return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */

export function toDegrees(radians: number) {
	return radians * (180 / Math.PI);
}

/**
 * Whether number is even or not
 */

export function isEven(num: number) {
	return num % 2 === 0;
}

/**
 * Round up to nearest multiple of a number
 */

export function roundUp(num: number, multiple: number) {
	return Math.ceil(num / multiple) * multiple;
}

/**
 * Round down to nearest multiple of a number
 */

export function roundDown(num: number, multiple: number) {
	return Math.floor(num / multiple) * multiple;
}

/**
 * Round a number to a certain amount of decimal pounts
 */

export function round(num: number, precision = 2) {
	const factor = Math.pow(10, precision);
	const tempNumber = num * factor;
	const roundedTempNumber = Math.round(tempNumber);
	return roundedTempNumber / factor;
}
