import express, { Request, Response } from 'express';
import {
    createIntents,
    createMatchers,
    createSaluteRequest,
    createSaluteResponse,
    createScenarioWalker,
    createSystemScenario,
    createUserScenario,
    SaluteRequest,
} from '@salutejs/scenario';
import { SaluteMemoryStorage } from '@salutejs/storage-adapter-memory';
import { config as dotEnv } from 'dotenv';

import { appendHandler, cartHandler, payDialogFinished, paymentHandler, removeHandler, runApp } from './handlers';
import intents from './intents';

dotEnv();

const { regexp } = createMatchers<SaluteRequest, typeof intents>();

const scenarioWalker = createScenarioWalker({
    intents: createIntents(intents),
    systemScenario: createSystemScenario({
        RUN_APP: runApp,
        PAY_DIALOG_FINISHED: payDialogFinished,
    }),
    userScenario: createUserScenario({
        append: {
            match: regexp(
                new RegExp(`^(${intents.append.matchers.map((m) => m.rule).join('|')}) (?<product>.+)$`, 'i'),
            ),
            handle: appendHandler,
        },
        remove: {
            match: regexp(
                new RegExp(`^(${intents.remove.matchers.map((m) => m.rule).join('|')}) (?<product>.+)$`, 'i'),
            ),
            handle: removeHandler,
        },
        cart: {
            match: regexp(new RegExp(`^(${intents.cart.matchers.map((m) => m.rule).join('|')})$`, 'i')),
            handle: cartHandler,
            children: {
                payment: {
                    match: regexp(new RegExp(`^(${intents.payment.matchers.map((m) => m.rule).join('|')})$`, 'i')),
                    handle: paymentHandler,
                },
            },
        },
    }),
});

const app = express();
app.use(express.json());

const storage = new SaluteMemoryStorage();

app.post('/app-connector', async (request: Request, response: Response) => {
    const req = createSaluteRequest(request.body);
    const res = createSaluteResponse(request.body);

    const sessionId = request.body.uuid.userId;
    const session = await storage.resolve(sessionId);

    await scenarioWalker({ req, res, session });
    await storage.save({ id: sessionId, session });

    response.status(200).json(res.message);
});

app.listen(3000);
