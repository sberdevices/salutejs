import { useReducer, useRef, useEffect, FormEvent } from 'react';
import {
    AssistantCharacterType,
    AssistantAppState,
    AssistantClientCustomizedCommand,
    AssistantNavigationCommand,
    AssistantSmartAppData,
    createAssistant,
    createSmartappDebugger,
} from '@sberdevices/assistant-client';
import {
    Card,
    CardContent,
    Cell,
    Container,
    Row,
    Col,
    DeviceThemeProvider,
    TextBox,
    TextField,
    Checkbox,
} from '@sberdevices/plasma-ui';
import { createGlobalStyle } from 'styled-components';
import { darkJoy, darkEva, darkSber } from '@sberdevices/plasma-tokens/themes';
import { text, background, gradient } from '@sberdevices/plasma-tokens';

import { AddNoteCommand, DoneNoteCommand, DeleteNoteCommand, Note } from '../types';

if (process.browser) {
    // @ts-ignore
    import('@sberdevices/spatial-navigation');
}

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
// eslint-disable-next-line
const NEXT_PUBLIC_DEV_TOKEN = process.env.NEXT_PUBLIC_DEV_TOKEN;
// eslint-disable-next-line
const NEXT_PUBLIC_DEV_PHRASE = process.env.NEXT_PUBLIC_DEV_PHRASE;

type Action =
    | AddNoteCommand
    | DoneNoteCommand
    | DeleteNoteCommand
    | {
          type: 'Type note';
          payload: string;
      }
    | {
          type: 'Set character';
          payload: AssistantCharacterType;
      };

interface TodoCommand extends AssistantSmartAppData {
    smart_app_data: Action;
}

type State = {
    notes: Array<Note>;
    character: AssistantCharacterType;
    note: string;
};

const reducer = (state: State, action: Action) => {
    switch (action.type) {
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
                note: '',
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

        case 'Set character':
            return {
                ...state,
                character: action.payload,
            };

        case 'Type note':
            return {
                ...state,
                note: action.payload,
            };

        default:
            throw new Error();
    }
};

const themes = {
    sber: createGlobalStyle(darkEva),
    eva: createGlobalStyle(darkSber),
    joy: createGlobalStyle(darkJoy),
};

const DocStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: rgba(255, 255, 255, 0); 
    -webkit-tap-highlight-color: transparent; /* i.e. Nexus5/Chrome and Kindle Fire HD 7'' */
  }
  html {
    font-size: 32px;
    user-select: none;
  }
  body {
    font-family: "SB Sans Text", sans-serif;
    height: auto;
    min-height: 100%;
  }
  body:before {
    content: "";
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    color: ${text};
    background: ${gradient};
    background-color: ${background};
    background-attachment: fixed;
    background-size: 100vw 100vh;
    z-index: -2;
  }
`;

const IndexPage = () => {
    const [{ note, character, notes }, dispatch] = useReducer(reducer, {
        notes: [{ id: 'uinmh', title: 'купить хлеб', completed: false }],
        character: 'sber' as const,
        note: '',
    });

    const assistantStateRef = useRef<AssistantAppState>({});
    const assistantRef = useRef<ReturnType<typeof createAssistant>>();

    useEffect(() => {
        // Инициализируем ассистента
        const initializeAssistant = () => {
            if (IS_DEVELOPMENT) {
                return createSmartappDebugger({
                    token: NEXT_PUBLIC_DEV_TOKEN,
                    initPhrase: NEXT_PUBLIC_DEV_PHRASE,
                    getState: () => assistantStateRef.current,
                });
            }

            return createAssistant<TodoCommand>({
                getState: () => assistantStateRef.current,
            });
        };

        const assistant = initializeAssistant();

        // Подписываемся на данные
        assistant.on('data', (command: AssistantClientCustomizedCommand<TodoCommand>) => {
            let navigation: AssistantNavigationCommand['navigation'];
            switch (command.type) {
                case 'character':
                    dispatch({
                        type: 'Set character',
                        payload: command.character.id,
                    });
                    break;
                case 'navigation':
                    navigation = command.navigation;
                    break;
                case 'smart_app_data':
                    dispatch(command.smart_app_data);
                    break;
                default:
                    break;
            }

            if (navigation) {
                switch (navigation.command) {
                    case 'UP':
                        window.scrollTo(0, window.scrollY - 500);
                        break;
                    case 'DOWN':
                        window.scrollTo(0, window.scrollY + 500);
                        break;
                    default:
                        break;
                }
            }
        });

        assistantRef.current = assistant;
    }, []);

    useEffect(() => {
        assistantStateRef.current = {
            item_selector: {
                items: notes.map(({ id, title }, index) => ({
                    number: index + 1,
                    id,
                    title,
                })),
            },
        };
    }, [notes]);

    const doneNote = (title: string) => {
        assistantRef.current?.sendAction({ type: 'done', payload: { note: title } });
    };

    const Theme = themes[character];

    return (
        <DeviceThemeProvider>
            <Theme />
            <DocStyles />
            <Container style={{ margin: '5rem 0 7rem' }}>
                <Row>
                    <Col size={12} sizeXL={6} offsetXL={3}>
                        <form
                            onSubmit={(e: FormEvent<HTMLFormElement>) => {
                                e.preventDefault();
                                dispatch({ type: 'add_note', payload: { note } });
                            }}
                        >
                            <TextField
                                label="Add Note"
                                value={note}
                                onChange={({ target: { value } }) => {
                                    dispatch({
                                        type: 'Type note',
                                        payload: value,
                                    });
                                }}
                            />
                        </form>
                    </Col>
                </Row>
                <Row style={{ marginTop: '2rem' }}>
                    {notes.map((n, i) => (
                        <Col key={i} size={12} sizeXL={6} offsetXL={3} style={{ marginBottom: '1rem' }}>
                            <Card>
                                <CardContent compact>
                                    <Cell
                                        content={<TextBox title={`${i + 1}. ${n.title}`} />}
                                        contentRight={
                                            <Checkbox checked={n.completed} onChange={() => doneNote(n.title)} />
                                        }
                                    />
                                </CardContent>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </DeviceThemeProvider>
    );
};

export default IndexPage;
