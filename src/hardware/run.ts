import * as five from 'johnny-five';

const board = new five.Board();

// The board's pins will not be accessible until
// the board has reported that it is ready
board.on('ready', () => {
	console.log('Ready!');

	const stepper = new five.Stepper({
		type: five.Stepper.TYPE.DRIVER,
		stepsPerRev: 200,
		pins: {
			step: 10,
			dir: 11
		}
	});

	// stepper.step({ steps: 2000, direction: 1, accel: 1600, decel: 1600 }, () => {
	// 	console.log('Done stepping!');
	// });

	stepper.rpm(60).step(2000, () => {
		console.log('Done stepping!');
	});
});
