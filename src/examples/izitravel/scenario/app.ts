import express from 'express';
import { config } from 'dotenv';

import { createScenario2, createSystemScenario } from '../../../lib/createScenario2';
import { initSaluteRequest, initSaluteResponse } from '../../../lib/createScenarioWalker';
import { SmartAppBrainRecognizer } from '../../../lib/recognisers';
import { SaluteMemoryStorage, SaluteSession } from '../../../lib/session';
import { SaluteRequest, SaluteResponse } from '../../../types/salute';

import * as handlers from './handlers';
import { intents } from './intents';

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
        handle: ({ req, res }, dispatch) => {
            // TODO: Clever way
            // req.setVariable

            dispatch(['ToMainPage']);
        },
    },
});

const systemScenario = createSystemScenario({
    RUN_APP: handlers.run_app,
    NO_MATCH: handlers.failure,
});

const smartAppBrainRecognizer = new SmartAppBrainRecognizer(process.env.ACCESS_TOKEN, process.env.SMARTAPP_BRAIN_HOST);
const storage = new SaluteMemoryStorage();

const scenarioLogic = async (req: SaluteRequest, res: SaluteResponse, session: SaluteSession) => {
    const dispatch = (path: string[]) => {
        const state = scenario.getByPath(path);
        if (state) {
            session.path = path;
            state.handle({ req, res, session: session.state, history: {} }, dispatch);

            req.currentState = {
                path: session.path,
                state,
            };
        }
    };

    const saluteHandlerOpts = { req, res, session: session.state, history: {} };

    if (req.intent === 'run_app') {
        systemScenario.RUN_APP(saluteHandlerOpts, dispatch);
    }

    if (req.intent === 'close_app') {
        systemScenario.CLOSE_APP(saluteHandlerOpts, dispatch);
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

    // SLOTFILING LOGIC START
    const slotFillingMinRating = 0;
    let currentIntent = variant;

    // при слотфиллинге, устанавливаем предыдущий интент как текущий, если он есть в результатах распознавания
    if (session.path.length && session.slotFilling) {
        // ищем предущий интент в результатах распознавания
        const connected = (req.inference?.variants || []).find(
            (v) =>
                v.confidence >= slotFillingMinRating && v.intent.path === session.intents[session.intents.length - 1],
        );
        currentIntent = connected || variant;
        // заполненную переменную ожидаем увидеть в слотах интента
    }

    // ищем незаполненные переменные, задаем вопрос пользователю
    const getIntentMissingVariables = (
        intent: string,
        variables: Record<string, unknown>,
    ): { name: string; question: string }[] => {
        const missing = [];
        const vars = intents[intent].variables || {};

        Object.keys(vars).forEach((v) => {
            if (vars[v].required && variables[v] === undefined && vars[v].questions?.length) {
                const questionNo = Math.floor(Math.random() * vars[v].questions.length);
                missing.push({ name: v, question: vars[v].questions[questionNo] });
            }
        });

        return missing;
    };

    const missingVars = getIntentMissingVariables(currentIntent.intent.path, req.variables);
    if (missingVars.length) {
        // сохраняем состояние в сессии
        Object.keys(req.variables).forEach((name) => {
            session.variables[name] = req.variables[name];
        });

        // задаем вопрос
        const { question } = missingVars[0];

        res.appendBubble(question);
        res.setPronounceText(question);

        // устанавливаем флаг слотфиллинга, на него будем смотреть при следующем запросе пользователя
        session.slotFilling = true;
        // сохранили интент со слотфилингом
        if (session.intents[session.intents.length - 1] !== currentIntent.intent.path) {
            session.intents.push(currentIntent.intent.path);
        }

        return Promise.resolve();
    }

    // SLOTFILING LOGIC END
    // INFERENCE LOGIC END

    const scenarioState = scenario.resolve(session.path, req);

    if (scenarioState) {
        req.currentState = scenarioState;
        dispatch(scenarioState.path);

        if (!req.currentState.state.children) {
            session.path = [];
            session.variables = {};
            session.intents = [];
        } else {
            session.intents.push(variant.intent.path);
        }
    } else {
        systemScenario.NO_MATCH(saluteHandlerOpts, dispatch);
    }
};

if (process.env.NODE_ENV !== 'test') {
    app.post('/hook', async ({ body }, response) => {
        const req: SaluteRequest = initSaluteRequest(body);
        const res: SaluteResponse = initSaluteResponse(body);

        const sessionId = body.uuid.userId;

        const session = await storage.resolve(sessionId);

        await scenarioLogic(req, res, session);

        await storage.save({ id: sessionId, session });

        response.status(200).json(res.message);
    });

    app.listen(3000, () => {
        console.log('Listening on 3000');
    });
}
