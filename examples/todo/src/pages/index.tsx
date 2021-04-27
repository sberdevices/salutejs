import { memo, useReducer, useState, useRef, useEffect, FormEvent } from 'react';
import type {
    AssistantSmartAppData,
    AssistantCharacterType,
    AssistantAppState,
    AssistantClientCustomizedCommand,
    AssistantNavigationCommand,
} from '@sberdevices/assistant-client';
import { DeviceThemeProvider } from '@sberdevices/plasma-ui/components/Device';
import { Container, Row, Col } from '@sberdevices/plasma-ui';
import { TextField } from '@sberdevices/plasma-ui/components/TextField';
import { Card, CardContent } from '@sberdevices/plasma-ui/components/Card';
import { Cell } from '@sberdevices/plasma-ui/components/Cell';
import { TextBox } from '@sberdevices/plasma-ui/components/TextBox';
import { Checkbox } from '@sberdevices/plasma-ui/components/Checkbox';

import { GlobalStyles } from '../components/GlobalStyles';
import { Action, reducer } from '../store';

if (process.browser) {
    // @ts-ignore
    import('@sberdevices/spatial-navigation');
}

const NEXT_PUBLIC_DEV_TOKEN = process.env.NEXT_PUBLIC_DEV_TOKEN;
const NEXT_PUBLIC_DEV_PHRASE = process.env.NEXT_PUBLIC_DEV_PHRASE;

if (!NEXT_PUBLIC_DEV_TOKEN || !NEXT_PUBLIC_DEV_PHRASE) {
    throw new Error('');
}

interface TodoCommand extends AssistantSmartAppData {
    smart_app_data: Action;
}

const IndexPage = memo(() => {
    const [appState, dispatch] = useReducer(reducer, {
        notes: [{ id: 'uinmh', title: 'купить хлеб', completed: false }],
    });

    const [character, setCharacter] = useState<AssistantCharacterType>('sber' as const);
    const [note, setNote] = useState('');

    const assistantStateRef = useRef<AssistantAppState>();
    const assistantRef = useRef<any>();

    useEffect(() => {
        import('@sberdevices/assistant-client').then(({ createAssistant }) => {
            const initializeAssistant = () => {
                return createAssistant<TodoCommand>({ getState: () => ({}) });
                // return createSmartappDebugger({
                //     token: NEXT_PUBLIC_DEV_TOKEN,
                //     initPhrase: NEXT_PUBLIC_DEV_PHRASE,
                //     getState: () => {
                //         return {};
                //     },
                // });
            };

            const assistant = initializeAssistant();

            assistant.on('data', (command: AssistantClientCustomizedCommand<TodoCommand>) => {
                switch (command.type) {
                    case 'character':
                        setCharacter(command.character.id);
                        // 'sber' | 'eva' | 'joy';
                        break;
                    case 'navigation':
                        break;
                    case 'smart_app_data':
                        break;
                    default:
                        break;
                }

                const { navigation } = command as AssistantNavigationCommand;
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

                const { smart_app_data } = command as TodoCommand;
                if (smart_app_data) {
                    dispatch(smart_app_data);
                }
            });

            assistantRef.current = assistant;
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
        assistantRef.current?.sendData({ action: { action_id: 'done', parameters: { title } } });
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
});

export default IndexPage;
