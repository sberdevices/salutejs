import express from 'express';

import { createScenario, createSaluteRequestHandler } from '../../..';

import * as handlers from './handlers';
import { intents } from './intents';

const app = express();
app.use(express.json());

const scenario = createScenario(intents)({
    ...handlers,
    'Navigation/OpenItemIndex': handlers.openItemIndex,
    'Izi/RunAudiotour': handlers.runAudioTour,
    'Navigation/Push': handlers.push,
    'Izi/ToMainPage': handlers.toMainPage,
    'Izi/ShowAll': handlers.showAll,
});

export const scenarioWalker = createSaluteRequestHandler(scenario);

if (process.env.NODE_ENV !== 'test') {
    app.post('/hook', async (req, res) => {
        console.log(req.body);
        const resp = await scenarioWalker(req.body);
        res.status(200).json(resp);
    });

    app.listen(3000);
}
