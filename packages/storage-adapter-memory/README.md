# @salutejs/storage-adapter-memory

Адаптер для хранения сессии в памяти процесса.

> npm i -S @salutejs/storage-adapter-memory

## Использование

``` ts
import { createSaluteRequest, createSaluteResponse, createScenarioWalker } from '@salutejs/scenario';
import { SaluteMemoryStorage } from '@salutejs/memory';
import express from 'express';

//...

const app = express();
app.use(express.json());

const storage = new SaluteMemoryStorage();
const scenarioWalker = createScenarioWalker({
    intents,
    recognizer,
    systemScenario,
    userScenario,
});

app.post('/', async ({ body }, response) => {
    const req = createSaluteRequest(body);
    const res = createSaluteResponse(body);
    const session = await storage.resolve(body.uuid.sessionId);

    await scenarioWalker({ req, res, session });

    await storage.save({ id: body.uuid.sessionId, session });

    response.status(200).json(res.message);
});

```

#### SberDevices with :heart:
