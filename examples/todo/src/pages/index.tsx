import { useReducer, useState, useRef, useEffect, FormEvent } from 'react';
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

import { GlobalStyles } from '../Components/GlobalStyles';
import { Action, reducer } from '../store';

if (process.browser) {
    // @ts-ignore
    import('@sberdevices/spatial-navigation');
}

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const NEXT_PUBLIC_DEV_TOKEN = process.env.NEXT_PUBLIC_DEV_TOKEN;
const NEXT_PUBLIC_DEV_PHRASE = process.env.NEXT_PUBLIC_DEV_PHRASE;

interface TodoCommand extends AssistantSmartAppData {
    smart_app_data: Action;
}

const IndexPage = () => {
    const [appState, dispatch] = useReducer(reducer, {
        notes: [{ id: 'uinmh', title: 'купить хлеб', completed: false }],
    });

    const [character, setCharacter] = useState<AssistantCharacterType>('sber' as const);
    const [note, setNote] = useState('');

    const assistantStateRef = useRef<AssistantAppState>({});
    const assistantRef = useRef<ReturnType<typeof createAssistant>>();

    useEffect(() => {
        const initializeAssistant = () => {
            if (!IS_DEVELOPMENT) {
                return createAssistant<TodoCommand>({
                    getState: () => assistantStateRef.current,
                });
            }

            if (!NEXT_PUBLIC_DEV_TOKEN || !NEXT_PUBLIC_DEV_PHRASE) {
                throw new Error('');
            }

            return createSmartappDebugger({
                token: NEXT_PUBLIC_DEV_TOKEN,
                initPhrase: NEXT_PUBLIC_DEV_PHRASE,
                getState: () => assistantStateRef.current,
            });
        };

        const assistant = initializeAssistant();

        assistant.on('data', (command: AssistantClientCustomizedCommand<TodoCommand>) => {
            let navigation: AssistantNavigationCommand['navigation'];
            switch (command.type) {
                case 'character':
                    setCharacter(command.character.id);
                    // 'sber' | 'eva' | 'joy';
                    break;
                case 'navigation':
                    navigation = (command as AssistantNavigationCommand).navigation;
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
                items: appState.notes.map(({ id, title }, index) => ({
                    number: index + 1,
                    id,
                    title,
                })),
            },
        };
    }, [appState]);

    const doneNote = (title: string) => {
        assistantRef.current?.sendAction({ type: 'done', payload: { note: title } });
    };

    return (
        <DeviceThemeProvider>
            <GlobalStyles character={character} />
            <Container style={{ margin: '5rem 0 7rem' }}>
                <Row>
                    <Col size={12} sizeXL={6} offsetXL={3}>
                        <form
                            onSubmit={(e: FormEvent<HTMLFormElement>) => {
                                e.preventDefault();
                                dispatch({ type: 'add_note', payload: { note } });
                                setNote('');
                            }}
                        >
                            <TextField
                                label="Add Note"
                                value={note}
                                onChange={({ target: { value } }) => setNote(value)}
                            />
                        </form>
                    </Col>
                </Row>
                <Row style={{ marginTop: '2rem' }}>
                    {appState.notes.map((n, i) => (
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
