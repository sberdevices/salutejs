import express from 'express';

import { createCycleScenarioMiddleware } from '../../../lib/middlewares/createCycleScenarioMiddleware';
import { createSystemIntentsMiddleware } from '../../../lib/middlewares/createSystemIntentsMiddleware';
import { createServerActionMiddleware } from '../../../lib/middlewares/createServerActionMiddleware';
import { createDefaultAnswerMiddleware } from '../../../lib/middlewares/createDefaultAnswerMiddleware';
import { createStringSimilarityRecognizerMiddleware } from '../../../lib/middlewares/createStringSimilarityRecognizerMiddleware';
import { createScenario } from '../../../lib/createScenario';
import { SaluteMemoryStorage } from '../../../lib/session';
import { createScenarioWalker } from '../../..';

import * as handlers from './handlers';
import { intents } from './intents';

const app = express();
app.use(express.json());

const scenario = createScenario(intents)(handlers);

export const scenarioWalker = createScenarioWalker({
    storage: new SaluteMemoryStorage(),
    middlewares: [
        createSystemIntentsMiddleware({ scenario }),
        createServerActionMiddleware({ scenario }),
        createStringSimilarityRecognizerMiddleware({ scenario }),
        createCycleScenarioMiddleware({ scenario }),
        createDefaultAnswerMiddleware({ scenario }),
    ],
});

if (process.env.NODE_ENV !== 'test') {
    app.post('/hook', async (req, res) => {
        const resp = await scenarioWalker(req.body);
        res.status(200).json(resp);
    });

    app.listen(3000);
}
