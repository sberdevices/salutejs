import express from 'express';

import { createServerActionIntentHandler } from '../../../lib/createServerActionIntentHandler';
import { StringSimilarityRecognizer } from '../../../lib/recognisers/stringSimilarity';
import { createScenario } from '../../../lib/createScenario';
import { NLPResponseATU } from '../../../types/response';
import { SaluteMiddlewareCreator } from '../../../types/salute';
import { createScenarioHandler } from '../../..';

import { intents } from './intents';
import { AddNoteCommand, DeleteNoteCommand, DoneNoteCommand } from './types';

const createGraphResolver: SaluteMiddlewareCreator = ({ scenario }) => ({ req, res }) => {
    if (req.inference?.variants.length) {
        req.setVariant(req.inference.variants[0]);
        scenario.resolve(req.variant.intent.path)({ req, res });
    }

    return Promise.resolve();
};

const defaultAnswerHandler: SaluteMiddlewareCreator = ({ scenario }) => ({ req, res }) => {
    const answer = res.message as NLPResponseATU;
    if (
        !answer.payload.items?.length &&
        answer.payload.pronounceText == null &&
        !answer.payload.suggestions?.buttons?.length
    ) {
        scenario.resolve('default')({ req, res });
    }

    return Promise.resolve();
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
    add_note: ({ req, res }) => {
        const note = req.variant.slots.find((v) => v.name === 'note').value;
        res.appendCommand<AddNoteCommand>({ type: 'add_note', payload: { note } });
        res.appendSuggestions(['Запиши купить молоко', 'Добавь запись помыть машину']);
        res.setPronounceText('Добавлено');
        res.appendBubble('Добавлено');
    },
    done_note: ({ req, res }) => {
        const note = req.variant.slots.find((v) => v.name === 'note').value;
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
    delete_note: ({ req, res }) => {
        const note = req.variant.slots.find((v) => v.name === 'note').value;
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

export const scenarioMessageHandler = createScenarioHandler({
    middlewares: [
        createServerActionIntentHandler({ scenario }),
        new StringSimilarityRecognizer({ scenario }).inference,
        createGraphResolver({ scenario }),
        defaultAnswerHandler({ scenario }),
    ],
});

const app = express();

app.use(express.json());

app.post('/hook', async (req, res) => {
    const resp = await scenarioMessageHandler(req.body);
    res.status(200).json(resp);
});

app.listen(3000);
