import express from 'express';

import { createSystemIntentsMiddleware } from '../../../lib/middlewares/createSystemIntentsMiddleware';
import { createServerActionMiddleware } from '../../../lib/middlewares/createServerActionMiddleware';
import { createDefaultAnswerMiddleware } from '../../../lib/middlewares/createDefaultAnswerMiddleware';
import { createStringSimilarityRecognizerMiddleware } from '../../../lib/middlewares/createStringSimilarityRecognizerMiddleware';
import { createScenario } from '../../../lib/createScenario';
import { SaluteMemoryStorage } from '../../../lib/session';
import { SaluteMiddlewareCreator, SaluteRequest, SaluteResponse } from '../../../types/salute';
import { createScenarioWalker } from '../../..';

import { intents } from './intents';
import { AddNoteCommand, DeleteNoteCommand, DoneNoteCommand, NoteVariable } from './types';

const app = express();
app.use(express.json());

// 1. check path
// 2. check required variables
// 2.1 if not full get associated random question
// 2.2 else call handler
// 3 validate
// 3.1 if valid next
// 3.2 else reset session.variables and setPronounceText

const createCycleScenarioMiddleware: SaluteMiddlewareCreator = ({ scenario }) => ({ req, res, session }) => {
    if (session.path.length) {
        // currentIntent = req.setVariant(req.inference.variants[0];
        // path = session.path
        // scenario.resolve(...path, currentIntent)
    }

    return Promise.resolve();
};

const createSetVariantScenarioMiddleware: SaluteMiddlewareCreator = () => ({ req, res }) => {
    if (req.inference?.variants.length) {
        req.setVariant(req.inference.variants[0]);
    }

    return Promise.resolve();
};

const createSetVariablesScenarioMiddleware: SaluteMiddlewareCreator = ({ scenario }) => async ({ req }) => {
    if (req.variant == null || scenario.intents[req.variant.intent.path] == null) {
        return Promise.resolve();
    }

    req.variant.slots.forEach((slot) => {
        req.setVariable(slot.name, slot.value);
    });

    // Здесь реализуем дозапросы:
    //   нормализуем переменные интента
    // const intentVariables = normalizeVars(scenario.intents[req.variant.intent.path].variables);
    // intentVariables.forEach((variable: => {
    //   заполняем из сессии или дозапрашиваем
    // });

    return Promise.resolve();
};

const createCustomScenarioMiddleware: SaluteMiddlewareCreator = ({ scenario }) => async ({ req, res }) => {
    if (req.variant == null) {
        return Promise.resolve();
    }

    return scenario.resolve(req.variant.intent.path)({ req, res });
};

const scenario = createScenario(intents)({
    run_app({ res }) {
        res.appendSuggestions(['Запиши купить молоко', 'Добавь запись помыть машину']);
        res.setPronounceText('начнем');
        res.appendBubble('Начнем');
    },
    default({ res }) {
        res.setPronounceText('Я не понимаю');
        res.appendBubble('Я не понимаю');
    },
    add_note: ({ req, res }: { req: SaluteRequest<NoteVariable>; res: SaluteResponse }) => {
        const { note } = req.variables;
        res.appendCommand<AddNoteCommand>({ type: 'add_note', payload: { note } });
        res.appendSuggestions(['Запиши купить молоко', 'Добавь запись помыть машину']);
        res.setPronounceText('Добавлено');
        res.appendBubble('Добавлено');
    },
    done_note: ({ req, res }: { req: SaluteRequest<NoteVariable>; res: SaluteResponse }) => {
        const { note } = req.variables;
        const item = req.state?.item_selector.items.find((i) => i.title.toLowerCase() === note.toLowerCase());
        if (note && item != null) {
            res.appendCommand<DoneNoteCommand>({
                type: 'done_note',
                payload: { id: item.id },
            });

            res.setPronounceText('Красавчик');
            res.appendBubble('Красавчик');
        }
    },
    done_note_action: ({ req, res }) => {
        const { title } = (req.serverAction.parameters as { title: string }) || {};
        const item = req.state?.item_selector.items.find((i) => i.title === title);
        if (title && item != null) {
            res.appendCommand<DoneNoteCommand>({
                type: 'done_note',
                payload: { id: item.id },
            });

            res.setPronounceText('Красавчик');
            res.appendBubble('Красавчик');
        }
    },
    delete_note: ({ req, res }: { req: SaluteRequest<NoteVariable>; res: SaluteResponse }) => {
        const { note } = req.variables;
        const item = req.state?.item_selector.items.find((i) => i.title.toLowerCase() === note.toLowerCase());
        if (note && item != null) {
            res.appendCommand<DeleteNoteCommand>({
                type: 'delete_note',
                payload: { id: item.id },
            });

            res.setPronounceText('Удалено');
            res.appendBubble('Удалено');
        }
    },
    delete_note_action: ({ req, res }) => {
        const { title } = (req.serverAction.parameters as { title: string }) || {};
        const item = req.state?.item_selector.items.find((i) => i.title === title);
        if (title && item != null) {
            res.appendCommand<DeleteNoteCommand>({
                type: 'delete_note',
                payload: { id: item.id },
            });

            res.setPronounceText('Удалено');
            res.appendBubble('Удалено');
        }
    },
});

export const scenarioWalker = createScenarioWalker({
    storage: new SaluteMemoryStorage(),
    middlewares: [
        createSystemIntentsMiddleware({ scenario }),
        createServerActionMiddleware({ scenario }),
        createStringSimilarityRecognizerMiddleware({ scenario }),
        createSetVariantScenarioMiddleware({ scenario }),
        createSetVariablesScenarioMiddleware({ scenario }),
        createCustomScenarioMiddleware({ scenario }),
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
