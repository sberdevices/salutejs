import { IntentsDict } from './types/salute';

export const lookupMissingVariables = (
    intent: string,
    intents: IntentsDict,
    variables: Record<string, unknown>,
): { name: string; question: string }[] => {
    const missing: Array<{ name: string; question: string }> = [];
    const vars = intents[intent]?.variables || {};

    Object.keys(vars).forEach((v) => {
        const { questions, required } = vars[v];
        if (questions && questions?.length && required && variables[v] === undefined) {
            const questionNo = Math.floor(Math.random() * questions.length);
            missing.push({ name: v, question: questions[questionNo] });
        }
    });

    return missing;
};
