import React, { FC, memo, useReducer, useState, useRef, useEffect } from 'react';
import { createSmartappDebugger, createAssistant, AssistantAppState, AssistantSmartAppData, AssistantClientCustomizedCommand, AssistantNavigationCommand } from '@sberdevices/assistant-client';
import './App.css';

import { Action, reducer } from './store';

interface TodoCommand extends AssistantSmartAppData {
    smart_app_data: Action;
}

const initializeAssistant = (getState: any) => {
    if (process.env.NODE_ENV === 'development' && window.Cypress == null) {
        return createSmartappDebugger<TodoCommand>({
            token: process.env.REACT_APP_TOKEN ?? '',
            initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
            getState,
        });
    }

    return createAssistant<TodoCommand>({ getState });
};

const creatTodoAssistant = () => createAssistant<TodoCommand>({ getState: () => ({}) });

export const App: FC = memo(() => {
    const [appState, dispatch] = useReducer(reducer, {
        notes: [{ id: 'uinmh', title: 'купить хлеб', completed: false }],
    });

    const [note, setNote] = useState('');

    const assistantStateRef = useRef<AssistantAppState>();
    const assistantRef = useRef<ReturnType<typeof creatTodoAssistant>>();

    useEffect(() => {
        assistantRef.current = initializeAssistant(() => assistantStateRef.current);

        assistantRef.current.on('data', (command: AssistantClientCustomizedCommand<TodoCommand>) => {
            const { navigation } = command as AssistantNavigationCommand;
            if (navigation) {
                switch (navigation.command) {
                    case 'UP':
                        window.scrollTo(0, window.scrollY - 500);
                        break;
                    case 'DOWN':
                        window.scrollTo(0, window.scrollY + 500);
                        break;
                }
            }

            const { smart_app_data } = command as TodoCommand;
            if (smart_app_data) {
                dispatch(smart_app_data);
            }
        });
    }, []);

    useEffect(() => {
        assistantStateRef.current = {
            item_selector: {
                items: appState.notes.map(({ id, title }, index) => ({
                    number: index + 1,
                    id,
                    title,
                })),
            },
        };
    }, [appState]);

    const doneNote = (title: string) => {
        assistantRef.current?.sendData({ action: { action_id: 'done', parameters: { note: title } } });
    };

    return (
        <main className="container">
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    dispatch({ type: 'add_note', payload: { note } });
                    setNote('');
                }}
            >
                <input
                    className="add-note"
                    type="text"
                    placeholder="Add Note"
                    value={note}
                    onChange={({ target: { value } }) => setNote(value)}
                    required
                    autoFocus
                />
            </form>
            <ul className="notes">
                {appState.notes.map((note, index) => (
                    <li className="note" key={note.id}>
                        <span>
                            <span style={{ fontWeight: 'bold' }}>{index + 1}. </span>
                            <span
                                style={{
                                    textDecorationLine: note.completed ? 'line-through' : 'none',
                                }}
                            >
                                {note.title}
                            </span>
                        </span>
                        <input
                            id={`checkbox-note-${note.id}`}
                            className="done-note"
                            type="checkbox"
                            checked={note.completed}
                            onChange={() => doneNote(note.title)}
                            disabled={note.completed}
                        />
                    </li>
                ))}
            </ul>
        </main>
    );
});
