import { FC, useMemo } from 'react';
import { createGlobalStyle } from 'styled-components';
import { darkSber, darkEva, darkJoy } from '@sberdevices/plasma-tokens/themes';
import {
    text, // Цвет текста
    background, // Цвет подложки
    gradient, // Градиент
} from '@sberdevices/plasma-tokens';
import { AssistantCharacterType } from '@sberdevices/assistant-client';

const themes = {
    sber: createGlobalStyle(darkEva),
    eva: createGlobalStyle(darkSber),
    joy: createGlobalStyle(darkJoy),
};

const DocumentStyle = createGlobalStyle`
    html:root {
        min-height: 100vh;
        color: ${text};
        background-color: ${background};
        background-image: ${gradient};
    }
`;

export const GlobalStyles: FC<{ character: AssistantCharacterType }> = ({ character }) => {
    const Theme = useMemo(() => themes[character], [character]);
    return (
        <>
            <DocumentStyle />
            <Theme />
        </>
    );
};
