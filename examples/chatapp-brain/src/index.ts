import express from 'express';
import { config as dotenv } from 'dotenv';

import { handleNlpRequest } from './scenario';

dotenv();

const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());

app.post('/app-connector', async ({ body }, httpRes) => {
    httpRes.json(await handleNlpRequest(body));
});

app.listen(port, () => console.log(`Salute on ${port}`));
