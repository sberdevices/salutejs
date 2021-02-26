import { SaluteHandler, SaluteRequest } from '../../../types/salute';
import { ScenarioObject } from '../../../lib/createScenario';

import { AddNoteCommand, ApproveNoteSession, DeleteNoteCommand, DoneNoteCommand, NoteVariable } from './types';

export const run_app: SaluteHandler = ({ res }) => {
    res.appendSuggestions(['Запиши купить молоко', 'Добавь запись помыть машину']);
    res.setPronounceText('начнем');
    res.appendBubble('Начнем');
};

export const failure: SaluteHandler = ({ res }) => {
    res.setPronounceText('Я не понимаю');
    res.appendBubble('Я не понимаю');
};

export const add_note: SaluteHandler<SaluteRequest<NoteVariable>> = ({ req, res }) => {
    const { note } = req.variables;
    res.appendCommand<AddNoteCommand>({ type: 'add_note', payload: { note } });
    res.appendSuggestions(['Запиши купить молоко', 'Добавь запись помыть машину']);
    res.setPronounceText('Добавлено');
    res.appendBubble('Добавлено');
};

export const done_note: SaluteHandler<SaluteRequest<NoteVariable>> = ({ req, res }) => {
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
};

const delete_note_approved: SaluteHandler<SaluteRequest<NoteVariable>, ApproveNoteSession> = ({ res, session }) => {
    const { itemId } = session;

    res.appendCommand<DeleteNoteCommand>({
        type: 'delete_note',
        payload: { id: itemId },
    });

    res.setPronounceText('Удалено');
    res.appendBubble('Удалено');
};

export const delete_note: ScenarioObject<SaluteHandler<SaluteRequest<NoteVariable>, ApproveNoteSession>> = {
    callback: ({ req, res, session }) => {
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
        yes: delete_note_approved,
        no: ({ res }) => {
            res.setPronounceText('Удаление отменено');
            res.appendBubble('Удаление отменено');
        },
    },
};
