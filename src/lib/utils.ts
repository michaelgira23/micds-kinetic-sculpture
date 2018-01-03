/**
 * @file Util functions for implementing formations
 */

 /**
  * Convert x and y coordinates to polar coordinates in grid
  */

export function polarCoordinates(nx: number, ny: number, x: number, y: number, radians = true) {
	const xMid = nx / 2;
	const yMid = ny / 2;

	const xRelative = x - xMid;
	const yRelative = y - yMid;

	const radius = distance(xMid, yMid, x, y);
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
