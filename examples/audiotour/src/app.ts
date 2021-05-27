import express from 'express';
import assert from 'assert';
import { config as dotEnv } from 'dotenv';
import {
    createUserScenario,
    createSystemScenario,
    createSaluteRequest,
    createSaluteResponse,
    createScenarioWalker,
    createMatchers,
    createIntents,
} from '@salutejs/scenario';
import { SaluteMemoryStorage } from '@salutejs/storage-adapter-memory';
import { SmartAppBrainRecognizer } from '@salutejs/recognizer-smartapp-brain';

import model from './intents.json';
import config from './config';
import { IziRequest } from './types';
import { createLegacyAction, createLegacyGoToAction } from './legacyAction';

dotEnv();

const app = express();
app.use(express.json());

const intents = createIntents(model);

const { match, intent, text, action, state, selectItem } = createMatchers<IziRequest, typeof intents>();

const userScenario = createUserScenario({
    ToMainPageFromMainPage: {
        match: match(intent('/Izi/ToMainPage'), state({ screen: 'Screen.MainPage' })),
        handle: ({ res }) => res.setPronounceText(config.message.TO_MAIN_PAGE.ON_MAIN_PAGE),
    },
    ToMainPageFromTourPage: {
        match: match(intent('/Izi/ToMainPage'), state({ screen: 'Screen.TourPage' })),
        handle: ({ res }) => res.appendItem(createLegacyGoToAction('Screen.MainPage')),
    },
    ToMainPage: {
        match: intent('/Izi/ToMainPage'),
        handle: ({ res }) => res.setPronounceText(config.message.TO_MAIN_PAGE.CONFIRMATION),
        children: {
            ToMainPageYes: {
                match: text('да'),
                handle: ({ res }) => res.appendItem(createLegacyGoToAction('Screen.MainPage')),
            },
            ToMainPageNo: {
                match: text('нет'),
                handle: ({ res }) => res.setPronounceText('А жаль'),
            },
        },
    },
    OpenItemIndex: {
        match: intent('/Navigation/OpenItemIndex'),
        handle: ({ req, res }) => {
            const { screen } = req.state;
            const number = Number(req.variables.number);

            if (screen === 'Screen.TourPage') {
                res.appendSuggestions(config.suggestions['Screen.TourStop']);
            }

            res.appendItem(createLegacyAction(selectItem({ number })(req)));
        },
    },
    RunAudioTour: {
        match: intent('/Izi/RunAudiotour'),
        handle: ({ res }) =>
            res.appendItem(
                createLegacyAction({
                    action: {
                        type: 'run_audiotour',
                    },
                }),
            ),
    },
    Push: {
        match: intent('/Navigation/Push'),
        handle: ({ req, res }) => {
            const { screen } = req.state;
            const { UIElement, element } = req.variables;

            assert(typeof UIElement === 'string');
            assert(typeof element === 'string');

            const { id: uiElementId } = JSON.parse(UIElement);
            const { id: elementId } = JSON.parse(element);

            if (screen === 'Screen.TourStop' || (screen === 'Screen.TourPage' && elementId === 'run_audiotour')) {
                res.appendSuggestions(config.suggestions['Screen.TourStop']);
            }

            res.appendItem(createLegacyAction(selectItem({ id: uiElementId })(req)));
        },
    },
    ShowAllFromMainPage: {
        match: match(intent('/Izi/RunAudiotour'), state({ screen: 'Screen.MainPage' })),
        handle: ({ res }) => res.setPronounceText(config.message.PAGE_LOADED.ALL_ON_MAIN_PAGE),
    },
    ShowAll: {
        match: match(intent('/Izi/ShowAll'), state({ screen: 'Screen.MainPage' })),
        handle: (_, dispatch) => dispatch(['ToMainPage']),
    },
    SlotFillingIntent: {
        match: intent('/SlotFillingIntent'),
        handle: ({ res, req }) => res.setPronounceText(`Вы попросили ${req.variables.a} яблок`),
        children: {
            Hello: {
                match: text('привет'),
                handle: ({ res }) => {
                    res.setPronounceText('привет и тебе');
                },
            },
        },
    },
    EchoAction: {
        match: action('echo'),
        handle: ({ res, req }) => {
            const { phrase } = req.variables;
            assert(typeof phrase === 'string');
            res.setPronounceText(phrase);
        },
    },
});

const systemScenario = createSystemScenario({
    RUN_APP: ({ res }) => {
        res.appendSuggestions(config.suggestions['Screen.MainPage']);
        res.setPronounceText(config.message.HELLO);
    },
    NO_MATCH: ({ res }) => {
        res.setPronounceText('Я не понимаю');
        res.appendBubble('Я не понимаю');
    },
});

const scenarioWalker = createScenarioWalker({
    intents,
    recognizer: new SmartAppBrainRecognizer(process.env.ACCESS_TOKEN, process.env.SMARTAPP_BRAIN_HOST),
    systemScenario,
    userScenario,
});

const storage = new SaluteMemoryStorage();

app.post('/hook', async ({ body }, response) => {
    const req = createSaluteRequest(body);
    const res = createSaluteResponse(body);

    const sessionId = body.uuid.userId;
    const session = await storage.resolve(sessionId);

    await scenarioWalker({ req, res, session });
    await storage.save({ id: sessionId, session });

    response.status(200).json(res.message);
});

app.listen(4000, () => {
    console.log('Listening on 4000');
});
