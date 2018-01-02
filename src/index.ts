const port = 1550;

import * as express from 'express';
import * as path from 'path';

// Coordination algorithm
import { Grid } from './lib/grid';
import { TickInfo } from './lib/tick';

const app = express();

const angularDir = path.join(__dirname, '..', 'interface', 'dist');

// API
app.get('/test', (req, res) => {
	const grid = new Grid(5, 5, 10, 100);
	grid.coordinator.addFormation(info => {
		return {
			height: (Math.sin(info.x + (info.timeElapsed / 1000) * (Math.PI / 180)) * (info.maxHeight / 2))
				+ (info.maxHeight / 2)
		};
	}, 10000);
	res.json(grid.coordinator.export());
});

// Serve Angular interface for creating formations
app.use(express.static(angularDir));
app.use((req, res) => {
	res.sendFile(path.join(angularDir, 'index.html'));
});

app.listen(port, () => console.log(`Server listening on *:${port}`));
