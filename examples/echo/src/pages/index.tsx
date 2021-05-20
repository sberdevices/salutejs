import { useEffect, useRef, useState } from 'react';
import { Container, DeviceThemeProvider } from '@sberdevices/plasma-ui';
import {
    AssistantCharacterType,
    AssistantAppState,
    AssistantNavigationCommand,
    createAssistant,
    createSmartappDebugger,
    AssistantClientCommand,
} from '@sberdevices/assistant-client';

import { GlobalStyles } from '../Components/GlobalStyles';
import { useScenario } from '../hooks/useScenario';

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
// eslint-disable-next-line prefer-destructuring
const NEXT_PUBLIC_DEV_TOKEN = process.env.NEXT_PUBLIC_DEV_TOKEN;
// eslint-disable-next-line prefer-destructuring
const NEXT_PUBLIC_DEV_PHRASE = process.env.NEXT_PUBLIC_DEV_PHRASE;

const IndexPage = () => {
    const [character, setCharacter] = useState<AssistantCharacterType>('sber' as const);

    const assistantStateRef = useRef<AssistantAppState>({});
    const assistantRef = useRef<ReturnType<typeof createAssistant>>();

    useScenario();

    useEffect(() => {
        const initializeAssistant = () => {
            if (!IS_DEVELOPMENT) {
                return createAssistant({
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

        assistant.on('data', (command: AssistantClientCommand) => {
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
                    // dispatch(command.smart_app_data);
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

    return (
        <DeviceThemeProvider>
            <GlobalStyles character={character} />
            <Container style={{ margin: '5rem 0 7rem' }}></Container>
        </DeviceThemeProvider>
    );
};

export default IndexPage;
