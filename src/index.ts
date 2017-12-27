const port = 1550;

import * as express from 'express';
import * as path from 'path';

const app = express();

// API
app.get('/test', (req, res) => {
	res.json({ hello: 'world' });
});

// Serve Angular interface for creating formations
const angularDir = path.join(__dirname, '..', 'interface', 'dist');
app.use(express.static(angularDir));
app.use((req, res) => {
	res.sendFile(path.join(angularDir, 'index.html'));
});

app.listen(port, () => console.log(`Server listening on *:${port}`));
