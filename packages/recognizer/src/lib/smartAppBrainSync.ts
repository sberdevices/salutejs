import { IntentsDict, SaluteIntent } from '@salutejs/types';

import { ProjectData, Intent } from './projectData';

export const getIntentsFromResponse = (resp: ProjectData) => {
    const intents: IntentsDict = {};

    for (const intent of resp.intents) {
        const variables: SaluteIntent['variables'] = {};

        if (Array.isArray(intent.slots)) {
            for (const slot of intent.slots) {
                variables[slot.name] = {
                    // Eto ne tot required
                    required: slot.required,
                    questions: slot.prompts,

                    // TODO: hz no och vazhno nado popravit'
                    // @ts-ignore
                    entity: slot.entity,

                    // TODO: Узнать, нужно ли это
                    // @ts-ignore
                    array: slot.array,
                };
            }
        }

        intents[intent.path] = {
            matchers: intent.phrases.map((ph) => ph.text),
            variables,
        };
    }

    return intents;
};

export const convertIntentsForImport = (intents: IntentsDict) => {
    const projectIntents: Intent[] = [];

    for (const [key, value] of Object.entries(intents)) {
        const variables = value.variables || {};
        const slots = [];

        for (const [key, value] of Object.entries(variables)) {
            slots.push({
                name: key,
                prompts: value.questions,
                required: value.required,
                // @ts-ignore
                entity: value.entity,
                // @ts-ignore
                array: value.array,
            });
        }

        projectIntents.push({
            path: key,
            enabled: true,
            answer: null,
            customData: null,
            description: null,
            id: Date.now(),
            patterns: [],
            phrases: (value.matchers ?? []).map((text) => {
                return {
                    text,
                    entities: null,
                    stagedPhraseIdx: null,
                };
            }),
            slots,
        });
    }

    return projectIntents;
};
