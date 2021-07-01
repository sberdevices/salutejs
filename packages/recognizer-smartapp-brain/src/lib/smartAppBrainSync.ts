import { IntentsDict, SaluteIntent, TextIntent } from '@salutejs/scenario';

import { ProjectData, Phrase, Intent } from './projectData';

export const getIntentsFromResponse = (resp: ProjectData) => {
    const intents: IntentsDict = {};

    for (const intent of resp.intents) {
        const variables: SaluteIntent['variables'] = {};

        if (Array.isArray(intent.slots)) {
            for (const slot of intent.slots) {
                variables[slot.name] = {
                    required: true,
                    questions: slot.prompts,
                    array: slot.array ? true : undefined,
                };
            }
        }

        const matchers: TextIntent['matchers'] = [];

        if (intent.phrases) {
            for (const phrase of intent.phrases) {
                matchers.push({
                    type: 'phrase',
                    rule: phrase.text,
                });
            }
        }

        if (intent.patterns) {
            for (const pattern of intent.patterns) {
                matchers.push({
                    type: 'pattern',
                    rule: pattern,
                });
            }
        }

        intents[intent.path] = {
            matchers,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectEntities: any[] = [];
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
        const slots: NonNullable<Intent['slots']> = [];

        // eslint-disable-next-line no-shadow
        for (const [key, value] of Object.entries(variables)) {
            slots.push({
                name: key,
                prompts: value.questions,
                array: value.array,
                entity: value.entity,
            });
        }

        const patterns: string[] = [];
        const phrases: Phrase[] = [];

        const matchers = value.matchers ?? [];

        for (const { type, rule } of matchers) {
            switch (type) {
                case 'phrase':
                    phrases.push({
                        text: rule,
                        entities: null,
                        stagedPhraseIdx: null,
                    });
                    break;
                case 'pattern':
                    patterns.push(rule);
                    break;
                default:
                    throw new Error(`Wrong matcher type: ${type}`);
            }
        }

        projectIntents.push({
            path: key,
            enabled: true,
            answer: null,
            customData: null,
            description: null,
            id: Date.now(),
            patterns,
            phrases,
            slots,
        });
    }

    return projectIntents;
};
