import { IntentsDict } from '@salutejs/types';

export const lookupMissingVariables = (
    intent: string,
    intents: IntentsDict,
    variables: Record<string, unknown>,
): { name: string; question: string }[] => {
    const missing = [];
    const vars = intents[intent]?.variables || {};

    Object.keys(vars).forEach((v) => {
        if (vars[v].required && variables[v] === undefined && vars[v].questions?.length) {
            const questionNo = Math.floor(Math.random() * vars[v].questions.length);
            missing.push({ name: v, question: vars[v].questions[questionNo] });
        }
    });

    return missing;
};
