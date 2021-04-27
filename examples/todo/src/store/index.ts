import { AddNoteCommand, DeleteNoteCommand, DoneNoteCommand, InitCommand, Note } from '../types';

type State = {
    notes: Array<Note>;
};

export type Action = InitCommand | AddNoteCommand | DoneNoteCommand | DeleteNoteCommand;

export const reducer = (state: State, action: Action) => {
    switch (action.type) {
        case 'init':
            return {
                ...state,
                notes: [...action.payload.notes],
            };

        case 'add_note':
            return {
                ...state,
                notes: [
                    ...state.notes,
                    {
                        id: Math.random().toString(36).substring(7),
                        title: action.payload.note,
                        completed: false,
                    },
                ],
            };

        case 'done_note':
            return {
                ...state,
                notes: state.notes.map((note) => (note.id === action.payload.id ? { ...note, completed: true } : note)),
            };

        case 'delete_note':
            return {
                ...state,
                notes: state.notes.filter(({ id }) => id !== action.payload.id),
            };

        default:
            throw new Error();
    }
};
