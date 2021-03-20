import express from 'express';
import { config } from 'dotenv';

import { createScenario2, createSystemScenario } from '../../../lib/createScenario2';
import { initSaluteRequest, initSaluteResponse } from '../../../lib/createScenarioWalker';
import { SmartAppBrainRecognizer } from '../../../lib/recognisers';
import { SaluteMemoryStorage } from '../../../lib/session';
import { SaluteRequest, SaluteResponse } from '../../../types/salute';

import * as handlers from './handlers';

config();

const app = express();

app.use(express.json());

const scenario = createScenario2({
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
        handle: ({ req, res }) => {
            // TODO: Clever way
            // req.setVariable

            res.dispatch(['ToMainPage']);
        },
    },
});

const systemScenario = createSystemScenario({
    RUN_APP: handlers.run_app,
    NO_MATCH: handlers.failure,
});

const smartAppBrainRecognizer = new SmartAppBrainRecognizer(process.env.ACCESS_TOKEN, process.env.SMARTAPP_BRAIN_HOST);
const storage = new SaluteMemoryStorage();

if (process.env.NODE_ENV !== 'test') {
    app.post('/hook', async ({ body }, response) => {
        const req: SaluteRequest = initSaluteRequest(body);
        const res: SaluteResponse = initSaluteResponse(body);

        const sessionId = body.uuid.userId;

        const session = await storage.resolve(sessionId);

        const saluteHandlerOpts = { req, res, session: session.state, history: {} };

        res.dispatch = (path: string[]) => {
            const state = scenario.getByPath(path);
            if (state) {
                session.path = path;
                state.handle(saluteHandlerOpts);
                // TODO: Четко сформулировать, когда и как сохранять и очищать path и делать это не тут
                if (!scenario.getByPath(session.path).children) {
                    session.path = [];
                }
            }
        };

        if (req.intent === 'run_app') {
            systemScenario.RUN_APP(saluteHandlerOpts);
        }

        if (req.intent === 'close_app') {
            systemScenario.CLOSE_APP(saluteHandlerOpts);
        }

        // INFERENCE LOGIC START
        await smartAppBrainRecognizer.inference({ req });

        // TODO: make this more clever (confidence)
        const variant = req.inference.variants[0];
        variant.slots.forEach((slot) => {
            req.setVariable(slot.name, slot.value);
        });

        Object.keys(session.variables).forEach((name) => {
            req.setVariable(name, session.variables[name]);
        });

        // TODO: Slotfilling

        // INFERENCE LOGIC END

        // TODO: Перенести текущий стейт в req.lastState
        // и по нему в конце выполнения обработчика понимать,
        // нужно ли очистить session.path
        const scenarioState = scenario.resolve(session.path, req);

        if (scenarioState) {
            res.dispatch(scenarioState.path);
        } else {
            systemScenario.NO_MATCH(saluteHandlerOpts);
        }

        await storage.save({ id: sessionId, session });

        response.status(200).json(res.message);
    });

    app.listen(3000, () => {
        console.log('Listening on 3000');
    });
}
