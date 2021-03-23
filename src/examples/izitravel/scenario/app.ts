import express from 'express';
import { config as dotEnv } from 'dotenv';

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

import { intents } from './intents';
import config from './config';
import { IziHandler, IziRequest } from './types';
import { createLegacyAction, createLegacyGoToAction } from './legacyAction';

dotEnv();

const app = express();
app.use(express.json());

const { match, intent, text, state } = createMatchers<IziRequest>();

const userScenario = createUserScenario<IziRequest, IziHandler>({
    ToMainPageFromMainPage: {
        match: match(intent('Izi/ToMainPage'), state({ screen: 'Screen.MainPage' })),
        handle: ({ res }) => {
            res.setPronounceText(config.message.TO_MAIN_PAGE.ON_MAIN_PAGE);
        },
    },
    ToMainPageFromTourPage: {
        match: match(intent('Izi/ToMainPage'), state({ screen: 'Screen.TourPage' })),
        handle: ({ res }) => {
            res.appendItem(createLegacyGoToAction('Screen.MainPage'));
        },
    },
    ToMainPage: {
        match: intent('Izi/ToMainPage'),
        handle: ({ res }) => {
            res.setPronounceText(config.message.TO_MAIN_PAGE.CONFIRMATION);
        },
        children: {
            ToMainPageYes: {
                match: text('да'),
                handle: ({ res }) => {
                    res.appendItem(createLegacyGoToAction('Screen.MainPage'));
                },
            },
            ToMainPageNo: {
                match: text('нет'),
                handle: ({ res }) => {
                    res.setPronounceText('А жаль');
                },
            },
        },
    },
    OpenItemIndex: {
        match: intent('Navigation/OpenItemIndex'),
        handle: ({ req, res }) => {
            const { screen } = req.state;
            if (screen === 'Screen.TourPage') {
                res.appendSuggestions(config.suggestions['Screen.TourStop']);
            }

            // TODO: add to matchers
            req.state.item_selector.items.forEach((item) => {
                if (item.number === +req.variables.number) {
                    res.appendItem(createLegacyAction(item));
                }
            });
        },
    },
    RunAudioTour: {
        match: intent('Izi/RunAudiotour'),
        handle: ({ res }) => {
            res.appendItem(
                createLegacyAction({
                    action: {
                        type: 'run_audiotour',
                    },
                }),
            );
        },
    },
    Push: {
        match: intent('Navigation/Push'),
        handle: ({ req, res }) => {
            const { id: uiElementId } = JSON.parse(req.variables.UIElement);
            const { id: elementId } = JSON.parse(req.variables.element);
            // TODO: add to matchers
            const item = req.state.item_selector.items.find((item) => item.id === uiElementId);

            const { screen } = req.state;

            if (screen === 'Screen.TourStop' || (screen === 'Screen.TourPage' && elementId === 'run_audiotour')) {
                res.appendSuggestions(config.suggestions['Screen.TourStop']);
            }

            res.appendItem(createLegacyAction(item));
        },
    },
    ShowAllFromMainPage: {
        match: match(intent('Izi/RunAudiotour'), state({ screen: 'Screen.MainPage' })),
        handle: ({ res }) => {
            res.setPronounceText(config.message.PAGE_LOADED.ALL_ON_MAIN_PAGE);
        },
    },
    ShowAll: {
        match: match(intent('Izi/ShowAll'), state({ screen: 'Screen.MainPage' })),
        handle: (_, dispatch) => {
            dispatch(['ToMainPage']);
        },
    },
    SlotFillingIntent: {
        match: intent('SlotFillingIntent'),
        handle: ({ res, req }) => {
            res.setPronounceText(`Вы попросили ${req.variables.a} яблок`);
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
