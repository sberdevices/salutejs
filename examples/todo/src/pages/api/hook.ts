import { NextApiRequest, NextApiResponse } from 'next';
import {
    createUserScenario,
    createSystemScenario,
    createSaluteRequest,
    createSaluteResponse,
    createScenarioWalker,
    createMatchers,
    SaluteRequest,
    NLPRequest,
    NLPResponse,
} from '@salutejs/scenario';
import { SaluteMemoryStorage } from '@salutejs/storage-adapter-memory';

import { AddNoteCommand, DeleteNoteCommand, DoneNoteCommand } from '../../types';

const capitalize = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);

const { action, regexp, selectItem } = createMatchers<SaluteRequest>();

const userScenario = createUserScenario({
    AddNote: {
        match: regexp(/^(запиши|напомни|добавь запись) (?<note>.+)$/i),
        handle: ({ req, res }) => {
            const { note } = req.variables;
            if (typeof note !== 'string') {
                throw new Error('Wrong note type');
            }

            res.appendCommand<AddNoteCommand>({ type: 'add_note', payload: { note: capitalize(note) } });
            res.appendSuggestions(['Запиши купить молоко', 'Добавь запись помыть машину']);
            res.setPronounceText('Добавлено');
            res.appendBubble('Добавлено');
        },
    },
    DoneNote: {
        match: regexp(/^(выполнила?|сделала?) (?<note>.+)$/i),
        handle: ({ req, res }) => {
            const { note } = req.variables;
            const item = selectItem({ title: note })(req);
            if (note && item?.id) {
                res.appendCommand<DoneNoteCommand>({
                    type: 'done_note',
                    payload: { id: item.id },
                });

                res.setPronounceText('Умничка');
                res.appendBubble('Умничка');
            }
        },
    },
    DoneNoteAction: {
        match: action('done'),
        handle: ({ req, res }) => {
            const { note } = req.variables;
            const item = selectItem({ title: note })(req);
            if (note && item?.id) {
                res.appendCommand<DoneNoteCommand>({
                    type: 'done_note',
                    payload: { id: item.id },
                });

                res.setPronounceText('Умничка');
                res.appendBubble('Умничка');
            }
        },
    },
    DeleteNote: {
        match: regexp(/^(удалить|удали) (?<note>.+)$/i),
        handle: ({ req, res, session }) => {
            const { note } = req.variables;
            const item = selectItem({ title: note })(req);
            if (note && item?.id) {
                session.itemId = item.id;

                res.setPronounceText('Вы уверены?');
                res.appendBubble('Вы уверены?');
                res.appendSuggestions(['продолжить', 'отменить']);
            }
        },
        children: {
            yes: {
                match: regexp(/^(да|продолжить)$/i),
                handle: ({ res, session }) => {
                    const { itemId } = session;

                    if (typeof itemId === 'string') {
                        res.appendCommand<DeleteNoteCommand>({
                            type: 'delete_note',
                            payload: { id: itemId },
                        });

                        res.setPronounceText('Удалено');
                        res.appendBubble('Удалено');
                    }
                },
            },
            no: {
                match: regexp(/^(нет|отменить)$/i),
                handle: ({ res }) => {
                    res.setPronounceText('Удаление отменено');
                    res.appendBubble('Удаление отменено');
                },
            },
        },
    },
});

// Системный сценарий
const systemScenario = createSystemScenario({
    RUN_APP: ({ res }) => {
        res.appendSuggestions(['Запиши купить молоко', 'Добавь запись помыть машину']);
        res.setPronounceText('начнем');
        res.appendBubble('Начнем');
    },
    NO_MATCH: ({ res }) => {
        res.setPronounceText('Я не понимаю');
        res.appendBubble('Я не понимаю');
    },
});

// Где сохраняется контекст
const storage = new SaluteMemoryStorage();

// Немного бойлерплейта
const scenarioWalker = createScenarioWalker({
    systemScenario,
    userScenario,
});

const handleNlpRequest = async (request: NLPRequest): Promise<NLPResponse> => {
    const req = createSaluteRequest(request);
    const res = createSaluteResponse(request);

    const sessionId = request.uuid.userId;
    const session = await storage.resolve(sessionId);

    await scenarioWalker({ req, res, session });
    await storage.save({ id: sessionId, session });

    return res.message;
};

export default async (request: NextApiRequest, response: NextApiResponse) => {
    response.status(200).json(await handleNlpRequest(request.body));
};
