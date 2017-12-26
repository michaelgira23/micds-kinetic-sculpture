const port = 1550;

import * as express from 'express';
const app = express();

app.get('/', (req, res) => {
	res.end('L');
});

app.listen(port, () => console.log(`Server listening on *:${port}`));
