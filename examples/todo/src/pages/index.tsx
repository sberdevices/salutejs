import { useEffect, useRef, useState } from 'react';
import type { AssistantCharacterType } from '@sberdevices/assistant-client';
import { DeviceThemeProvider } from '@sberdevices/plasma-ui/components/Device';

import { GlobalStyles } from '../Components/GlobalStyles';

const NEXT_PUBLIC_DEV_TOKEN = process.env.NEXT_PUBLIC_DEV_TOKEN;
const NEXT_PUBLIC_DEV_PHRASE = process.env.NEXT_PUBLIC_DEV_PHRASE;

if (!NEXT_PUBLIC_DEV_TOKEN || !NEXT_PUBLIC_DEV_PHRASE) {
    throw new Error('');
}

const IndexPage = () => {
    const assistantRef = useRef<any>();
    const [character, setCharacter] = useState<AssistantCharacterType>('sber' as const);

    useEffect(() => {
        import('@sberdevices/assistant-client').then(({ createAssistant }) => {
            const initializeAssistant = () => {
                return createAssistant({ getState: () => ({}) });
                // return createSmartappDebugger({
                //     token: NEXT_PUBLIC_DEV_TOKEN,
                //     initPhrase: NEXT_PUBLIC_DEV_PHRASE,
                //     getState: () => {
                //         return {};
                //     },
                // });
            };

            const assistant = initializeAssistant();

            assistant.on('data', (command) => {
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
            });

            assistantRef.current = assistant;
        });
    }, []);

    return (
        <DeviceThemeProvider>
            <GlobalStyles character={character} />
        </DeviceThemeProvider>
    );
};

export default IndexPage;
