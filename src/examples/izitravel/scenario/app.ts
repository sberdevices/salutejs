import express from 'express';
import { config } from 'dotenv';

import {
    createUserScenario,
    createSystemScenario,
    createSaluteRequest,
    createSaluteResponse,
    SaluteResponse,
    SaluteRequest,
    SaluteMemoryStorage,
    SmartAppBrainRecognizer,
    createScenarioWalker,
} from '../../..';

import * as handlers from './handlers';
import { intents } from './intents';

config();

const app = express();

app.use(express.json());

const userScenario = createUserScenario({
    ToMainPageFromMainPage: {
        match: (req) =>
            req.inference?.variants[0].intent.path === 'Izi/ToMainPage' && req.state.screen === 'Screen.MainPage',
        handle: handlers.toMainPageFromMainPage,
    },
    ToMainPageFromTourPage: {
        match: (req) =>
            req.inference?.variants[0].intent.path === 'Izi/ToMainPage' && req.state.screen === 'Screen.TourPage',
        handle: handlers.toMainPageFromTourPage,
    },
    ToMainPage: {
        match: (req) => req.inference?.variants[0].intent.path === 'Izi/ToMainPage',
        handle: handlers.toMainPage,
        children: {
            ToMainPageYes: {
                match: (req) => req.message.original_text === 'да',
                // match: (req) => req.inference?.variants[0].intent.path === 'yes',
                handle: handlers.toMainPageFromTourPage,
            },
            ToMainPageNo: {
                match: (req) => req.message.original_text === 'нет',
                // match: (req) => req.inference?.variants[0].intent.path === 'no',
                handle: handlers.ToMainPageNo,
            },
        },
    },
    OpenItemIndex: {
        match: (req) => req.inference?.variants[0].intent.path === 'Navigation/OpenItemIndex',
        handle: handlers.openItemIndex,
    },
    RunAudioTour: {
        match: (req) => req.inference?.variants[0].intent.path === 'Izi/RunAudiotour',
        handle: handlers.runAudioTour,
    },
    Push: {
        match: (req) => req.inference?.variants[0].intent.path === 'Navigation/Push',
        handle: handlers.push,
    },
    ShowAllFromMainPage: {
        match: (req) =>
            req.inference?.variants[0].intent.path === 'Izi/ShowAll' && req.state.screen === 'Screen.MainPage',
        handle: handlers.showAllFromMainPage,
    },
    ShowAll: {
        match: (req) =>
            req.inference?.variants[0].intent.path === 'Izi/ShowAll' && req.state.screen !== 'Screen.MainPage',
        handle: (_, dispatch) => {
            dispatch(['ToMainPage']);
        },
    },
    SlotFillingIntent: {
        match: (req) => req.inference?.variants[0].intent.path === 'SlotFillingIntent',
        handle: handlers.slotFillingIntent,
    },
});

const systemScenario = createSystemScenario({
    RUN_APP: handlers.run_app,
    NO_MATCH: handlers.failure,
});

const scenarioWalker = createScenarioWalker({
    intents,
    recognizer: new SmartAppBrainRecognizer(process.env.ACCESS_TOKEN, process.env.SMARTAPP_BRAIN_HOST),
    systemScenario,
    userScenario,
});

const storage = new SaluteMemoryStorage();

if (process.env.NODE_ENV !== 'test') {
    app.post('/hook', async ({ body }, response) => {
        const req: SaluteRequest = createSaluteRequest(body);
        const res: SaluteResponse = createSaluteResponse(body);

        const sessionId = body.uuid.userId;

        const session = await storage.resolve(sessionId);

        await scenarioWalker({ req, res, session });

        await storage.save({ id: sessionId, session });

        response.status(200).json(res.message);
    });

    app.listen(3000, () => {
        console.log('Listening on 3000');
    });
}
