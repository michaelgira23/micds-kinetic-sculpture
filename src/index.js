const port = 1550;

const express = require('express');
const app = express();

app.get('/', (req, res) => {
	res.end('l');
});

app.listen(port, () => console.log(`Server listening on *:${port}`));
