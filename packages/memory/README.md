# @salutejs/memory

Адаптеры для работы с сессией пользователя на уровне сценария.

> npm i -S @salutejs/memory

## SaluteMemoryStorage

Адаптер для хранения сессии в памяти процесса.

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

### Roadmap

- Firebase
- MongoDB
- Redis


#### SberDevices with :heart:
