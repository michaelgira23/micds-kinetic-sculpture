# Creating Formations

## Terminology

The sculpture is made of up an array of **modules**. A module is one motor with an attached string and a ball at the end of the string.

A **formation** is a series of coordinated movements between the modules.

A formation is created by supplying one function. This function is called a **tick callback function**. It is fired for every module at every millisecond and returns an object containing what height the module (ball) should be at.

## Programming a Formation

Tick callbacks can be found in [`/src/lib/default-formations.ts`](https://github.com/michaelgira23/micds-kinetic-sculpture/blob/master/src/lib/default-formations.ts). To create another formation, add another tick callback to the exported object.

### Tick Info

The callback function accepts one parameter: the `info` object. This contains data about the grid scultpure, the specific module, and more:

```typescript
interface TickInfo {
	globals: [key: string]: any; // Global values passed onto all of the functions. This is an empty object by default unless you specifically provide values while invoking the formation.
	maxHeight: number;           // Maximum height each module can reach
	nx: number;                  // Number of modules in the sculpture grid in the x direction
	ny: number;                  // Number of modules in the sculpture grid in the y direction
	timeElapsed: number;         // Time passed since the formation has started
	totalDuration: number;       // Total time formation will go on for
	x: number;                   // X-coordinate of the specific module this callback function is invoked for
	y: number;                   // Y-coordinate of the specific module this callback function is invoked for
}
```
Up-to-date specification of data types can be found in [`/src/lib/tick.ts`](https://github.com/michaelgira23/micds-kinetic-sculpture/blob/master/src/lib/tick.ts)

### Function Implementation

The tick callback performs the logic to dictate where each module should be at what time using the tick info provided. The callback has the following type:

```typescript
type TickCallback = (info: TickInfo) => Partial<MovePoint> | number | void;

interface MovePoint {
	height: number; // Height from very bottom. 1 unit equals 1 meter.
	easing: EASING; // Easing function to get to next point throughout the provided `wait` duration.
	wait: number;   // How many milliseconds in the formation before calling the next callback tick function for this module
}
```

Up-to-date specification of data types can be found in [`/src/lib/tick.ts`](https://github.com/michaelgira23/micds-kinetic-sculpture/blob/master/src/lib/tick.ts)

It's important to note **the `Partial<MovePoint>` makes all properties in the return object optional.** If height is not provided, it will default to the height of the previous tick callback (rendering the ease function useless). If easing function is not provided, it defaults to `EASING.LINEAR`. A full list of possible easings can be found in [`/src/lib/tick.ts`](https://github.com/michaelgira23/micds-kinetic-sculpture/blob/master/src/lib/tick.ts). Finally, `wait` is how many milliseconds to wait before calling the next tick callback for the specific module. No tick callback will be invoked between the time of the current callback and the duration of the wait. It defaults to `1ms`. Increase the `wait` to see the easing function in action.

The tick callback can also return a number. This value is interpreted as the height. There is no difference between returning a number and returning an object with only the `height` property. Just like returning an object, `easing` will default to `EASING.LINEAR` and `wait` defaults to `1` millisecond.

If the callback function returns nothing, null, or other invalid input, the module will remain at the height it was previously. In practice, if no value has been previously returned for the current callback function, it will use the final position of the last formation. If there is no previous formation (like in the visualizer), it will default to max height of the sculpture.

Here is an example tick callback to create a formation:

```typescript
info => {
	// Some logic here..
	return {
		height: 1,                       // Raise ball 1 meter from its lowest point
		easing: EASING.EASE_IN_OUT_QUAD, // Easing function to get from current position to 1 meter
		wait: 1000                       // Easing should take 1 second to get to 1 meter off the ground. No other tick callback functions will be invoked for this module for the next 1000 milliseconds.
	};
}
```

### Using Random Numbers

There are many cases you might want a touch of randomness to your formation. Instead of using something like [`Math.random()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random), use the `random()` function (already imported in [`/src/lib/default-formations.ts`](https://github.com/michaelgira23/micds-kinetic-sculpture/blob/master/src/lib/default-formations.ts)) to create a "deterministic" random number generator. Pass in the `info` object and it will generate the same "random" numbers for each invocation for each individual module at each specific time. **This allows for random numbers, but consistent values returned each time the formation is generated. This helps remove any uncertainty to make sure no unexpected behavior pops up transitioning from development to the physical structure.**

Here is an example implementation generating random `height`s and `wait`ing at random times:

```typescript
info => {
	// This is just the random number generator. Not a random number itself!
	// Call this function to generate a random decimal between 0 (inclusive) and 1 (exclusive)
	const rng = random(info);
	return {
		height: rng() * info.maxHeight,
		easing: EASING.EASE_IN_OUT_EXPO,
		wait: Math.abs(rng() * 3000) + 1000
	};
}
```
