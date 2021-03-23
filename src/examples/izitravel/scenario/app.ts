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
    createMatchers,
} from '../../..';

import * as handlers from './handlers';
import { intents } from './intents';
import { IziRequest } from './types';

config();

const app = express();
app.use(express.json());

const { match, intent, text, state } = createMatchers<IziRequest>();

const userScenario = createUserScenario({
    ToMainPageFromMainPage: {
        match: match(intent('Izi/ToMainPage'), state({ screen: 'Screen.MainPage' })),
        handle: handlers.toMainPageFromMainPage,
    },
    ToMainPageFromTourPage: {
        match: match(intent('Izi/ToMainPage'), state({ screen: 'Screen.TourPage' })),
        handle: handlers.toMainPageFromTourPage,
    },
    ToMainPage: {
        match: intent('Izi/ToMainPage'),
        handle: handlers.toMainPage,
        children: {
            ToMainPageYes: {
                match: text('да'),
                handle: handlers.toMainPageFromTourPage,
            },
            ToMainPageNo: {
                match: text('нет'),
                handle: handlers.ToMainPageNo,
            },
        },
    },
    OpenItemIndex: {
        match: intent('Navigation/OpenItemIndex'),
        handle: handlers.openItemIndex,
    },
    RunAudioTour: {
        match: intent('Izi/RunAudiotour'),
        handle: handlers.runAudioTour,
    },
    Push: {
        match: intent('Navigation/Push'),
        handle: handlers.push,
    },
    ShowAllFromMainPage: {
        match: match(intent('Izi/RunAudiotour'), state({ screen: 'Screen.MainPage' })),
        handle: handlers.showAllFromMainPage,
    },
    ShowAll: {
        match: match(intent('Izi/ShowAll'), state({ screen: 'Screen.MainPage' })),
        handle: (_, dispatch) => {
            dispatch(['ToMainPage']);
        },
    },
    SlotFillingIntent: {
        match: intent('SlotFillingIntent'),
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
