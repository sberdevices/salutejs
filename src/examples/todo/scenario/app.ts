import express from 'express';

import { createCycleScenarioMiddleware } from '../../../lib/middlewares/createCycleScenarioMiddleware';
import { createSystemIntentsMiddleware } from '../../../lib/middlewares/createSystemIntentsMiddleware';
import { createServerActionMiddleware } from '../../../lib/middlewares/createServerActionMiddleware';
import { createDefaultAnswerMiddleware } from '../../../lib/middlewares/createDefaultAnswerMiddleware';
import { createStringSimilarityRecognizerMiddleware } from '../../../lib/middlewares/createStringSimilarityRecognizerMiddleware';
import { createScenario } from '../../../lib/createScenario';
import { SaluteMemoryStorage, SaluteSession } from '../../../lib/session';
import { SaluteRequest, SaluteResponse } from '../../../types/salute';
import { createScenarioWalker } from '../../..';

import { intents } from './intents';
import { AddNoteCommand, DeleteNoteCommand, DoneNoteCommand, NoteVariable } from './types';

const app = express();
app.use(express.json());

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
    add_note: ({ req, res }: { req: SaluteRequest<NoteVariable>; res: SaluteResponse; session: SaluteSession }) => {
        const { note } = req.variables;
        res.appendCommand<AddNoteCommand>({ type: 'add_note', payload: { note } });
        res.appendSuggestions(['Запиши купить молоко', 'Добавь запись помыть машину']);
        res.setPronounceText('Добавлено');
        res.appendBubble('Добавлено');
    },
    done_note: ({ req, res }: { req: SaluteRequest<NoteVariable>; res: SaluteResponse; session: SaluteSession }) => {
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
    delete_note: {
        callback: ({
            req,
            res,
            session,
        }: {
            req: SaluteRequest<NoteVariable>;
            res: SaluteResponse;
            session: SaluteSession;
        }) => {
            const { note } = req.variables;
            const item = req.state?.item_selector.items.find((i) => i.title.toLowerCase() === note.toLowerCase());
            if (note && item != null) {
                session.itemId = item.id;

                res.setPronounceText('Вы уверены?');
                res.appendBubble('Вы уверены?');
                res.appendSuggestions(['продолжить', 'отменить']);
            }
        },
        children: {
            yes: ({ res, session }) => {
                const itemId = session.itemId as string;

                res.appendCommand<DeleteNoteCommand>({
                    type: 'delete_note',
                    payload: { id: itemId },
                });

                res.setPronounceText('Удалено');
                res.appendBubble('Удалено');
            },
            no: ({ res }) => {
                res.setPronounceText('Удаление отменено');
                res.appendBubble('Удаление отменено');
            },
        },
    },
    delete_note_action: ({ req, res }) => {
        const { title } = (req.serverAction.parameters as { title: string }) || {};
        const item = req.state?.item_selector.items.find((i) => i.title.toLowerCase() === title.toLowerCase());
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
