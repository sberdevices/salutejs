import { IntentsDict, SaluteIntent } from '@salutejs/types';

import { ProjectData, Intent } from './projectData';

export const getIntentsFromResponse = (resp: ProjectData) => {
    const intents: IntentsDict = {};

    for (const intent of resp.intents) {
        const variables: SaluteIntent['variables'] = {};

        if (Array.isArray(intent.slots)) {
            for (const slot of intent.slots) {
                variables[slot.name] = {
                    required: true,
                    questions: slot.prompts,
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

export type EntitiesDict = Record<
    string,
    {
        matchers: Array<{
            type: 'synonyms' | 'pattern';
            rule: Array<string>;
            value: string;
        }>;
        noMorph?: boolean;
    }
>;

export const getEntitiesFromResponse = (resp: ProjectData): EntitiesDict => {
    const entities: EntitiesDict = {};

    for (const { entity, records } of resp.entities) {
        entities[entity.name] = {
            noMorph: entity.noMorph,
            matchers: records.map(({ type, rule, value }) => {
                return {
                    type,
                    rule,
                    value,
                };
            }),
        };
    }

    return entities;
};

export const convertEntitiesForImport = (entities: EntitiesDict) => {
    const projectEntities = [];
    for (const [key, value] of Object.entries(entities)) {
        const projectEntity = {
            entity: {
                name: key,
                // Hardcoded for now but we've seen 'dictionary' type as well
                type: 'annotation',
                noMorph: value.noMorph,
            },
            records: value.matchers,
        };

        projectEntities.push(projectEntity);
    }

    return projectEntities;
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
