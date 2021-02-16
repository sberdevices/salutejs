import express from 'express';

import { createServerActionIntentHandler } from '../../../lib/createServerActionIntentHandler';
import { StringSimilarityRecognizer } from '../../../lib/recognisers/stringSimilarity';
import { NLPResponseATU } from '../../../types/response';
import { Intents, SaluteMiddleware, SaluteRequest, SaluteResponse } from '../../../types/salute';

import { createScenarioHandler } from '.';

const createGraphResolver = ({ intents }: { intents: Intents }): SaluteMiddleware => (
    req: SaluteRequest,
    res: SaluteResponse,
): Promise<void> => {
    if (req.inference?.variants.length) {
        req.setVariant(req.inference.variants[0]);
        intents[req.variant.intent.path].callback(req, res);
    }

    return Promise.resolve();
};

const defaultAnswerHandler = ({ intents }: { intents: Intents }): SaluteMiddleware => (
    req: SaluteRequest,
    res: SaluteResponse,
): Promise<void> => {
    const answer = res.message as NLPResponseATU;
    if (
        !answer.payload.items?.length &&
        answer.payload.pronounceText == null &&
        !answer.payload.suggestions?.buttons?.length
    ) {
        intents.default.callback(req, res);
    }

    return Promise.resolve();
};

const intents = {
    run_app: {
        callback: (req: SaluteRequest, res: SaluteResponse) => {
            res.appendSuggestions(['Запиши купить молоко', 'Добавь запись помыть машину']);
            res.setPronounceText('начнем');
            res.appendBubble('Начнем');
        },
    },
    default: {
        callback: (req: SaluteRequest, res: SaluteResponse) => {
            res.setPronounceText('Я не понимаю');
            res.appendBubble('Я не понимаю');
        },
    },
    add_note: {
        matchers: [
            'добавить',
            'установить',
            // 'запиши',
            'записать',
            'поставь',
            'закинь',
            'напомнить',
            'напоминание',
            'заметка',
            'задание',
            'задача',
        ],
        variables: ['note'],
        callback: (req: SaluteRequest, res: SaluteResponse) => {
            const note = req.variant.slots.find((v) => v.name === 'note').value;
            res.appendCommand({ type: 'smart_app_data', action: { type: 'add_note', note } });
            res.appendSuggestions(['Запиши купить молоко', 'Добавь запись помыть машину']);
            res.setPronounceText('Добавлено');
            res.appendBubble('Добавлено');
        },
    },
    done_note: {
        matchers: ['выполнил', 'сделал'],
        variables: ['note'],
        callback: (req: SaluteRequest, res: SaluteResponse) => {
            const note = req.variant.slots.find((v) => v.name === 'note').value;
            const item = req.state?.item_selector.items.find((i) => i.title.toLowerCase() === note.toLowerCase());
            if (note && item != null) {
                res.appendCommand({
                    type: 'smart_app_data',
                    action: {
                        type: 'done_note',
                        id: item.id,
                    },
                });

                res.setPronounceText('Красавчик');
                res.appendBubble('Красавчик');
            }
        },
    },
    done_note_action: {
        actionId: 'done',
        callback: (req: SaluteRequest, res: SaluteResponse) => {
            const { title } = (req.serverAction.parameters as { title: string }) || {};
            const item = req.state?.item_selector.items.find((i) => i.title === title);
            if (title && item != null) {
                res.appendCommand({
                    type: 'smart_app_data',
                    action: {
                        type: 'done_note',
                        id: item.id,
                    },
                });

                res.setPronounceText('Красавчик');
                res.appendBubble('Красавчик');
            }
        },
    },
    delete_note: {
        matchers: ['Удалить', 'Удали'],
        variables: ['note'],
        callback: (req: SaluteRequest, res: SaluteResponse) => {
            const note = req.variant.slots.find((v) => v.name === 'note').value;
            const item = req.state?.item_selector.items.find((i) => i.title.toLowerCase() === note.toLowerCase());
            if (note && item != null) {
                res.appendCommand({
                    type: 'smart_app_data',
                    action: {
                        type: 'delete_note',
                        id: item.id,
                    },
                });

                res.setPronounceText('Удалено');
                res.appendBubble('Удалено');
            }
        },
    },
    delete_note_action: {
        actionId: 'delete_note',
        callback: (req: SaluteRequest, res: SaluteResponse) => {
            const { title } = (req.serverAction.parameters as { title: string }) || {};
            const item = req.state?.item_selector.items.find((i) => i.title === title);
            if (title && item != null) {
                res.appendCommand({
                    type: 'smart_app_data',
                    action: {
                        type: 'delete_note',
                        id: item.id,
                    },
                });

                res.setPronounceText('Удалено');
                res.appendBubble('Удалено');
            }
        },
    },
};

export const scenarioMessageHandler = createScenarioHandler({
    middlewares: [
        createServerActionIntentHandler({ intents }),
        new StringSimilarityRecognizer({ intents }).inference,
        createGraphResolver({ intents }),
        defaultAnswerHandler({ intents }),
    ],
});

const app = express();

app.use(express.json());

app.post('/hook', async (req, res) => {
    const resp = await scenarioMessageHandler(req.body);
    res.status(200).json(resp);
});

app.listen(3000);
