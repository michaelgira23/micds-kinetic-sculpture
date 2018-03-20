/**
 * @file Util functions for implementing formations
 */

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
