import { IntentsDict } from './types/salute';

type MissingVariablesType = { name: string; question: string; entity?: string }[];

export const lookupMissingVariables = (
    intent: string,
    intents: IntentsDict,
    variables: Record<string, unknown>,
): MissingVariablesType => {
    const missing: MissingVariablesType = [];
    const vars = intents[intent]?.variables || {};

    Object.keys(vars).forEach((v) => {
        const { questions, required, entity } = vars[v];
        if (questions && questions?.length && required && variables[v] === undefined) {
            const questionNo = Math.floor(Math.random() * questions.length);
            missing.push({ name: v, question: questions[questionNo], entity });
        }
    });

    return missing;
};
