import { Message, NLPRequestMTS, NLPResponseATU, Recognizer } from '@salutejs/scenario';

import { handleNlpRequest } from './scenario';

const sessionId = '9ec25354-275e-4426-9f75-7ca1e8095da7';

const createRequestWithMessage = (message: Pick<Message, 'original_text'>): NLPRequestMTS => ({
    messageId: 0,
    messageName: 'MESSAGE_TO_SKILL',
    payload: {
        app_info: {
            projectId: 'test',
            applicationId: 'test',
            version: 'test',
            appversionId: 'test',
            frontendType: 'CHAT_APP',
        },
        character: {
            id: 'sber',
            name: 'Сбер',
            gender: 'male',
            appeal: 'official',
        },
        message: {
            original_text: message.original_text,
            normalized_text: '',
            asr_normalized_message: '',
            human_normalized_text: '',
            human_normalized_text_with_anaphora: '',
            tokenized_elements_list: [],
            entities: { CCY_TOKEN: [], MONEY_TOKEN: [], NUM_TOKEN: [] },
        },
        intent: 'item_selector',
        meta: {},
    },
    sessionId,
    uuid: {
        userChannel: 'test',
        sub: 'test',
        userId: 'test',
    },
});

expect.extend({
    toBeEqualResponse(received: NLPResponseATU, expected: NLPResponseATU) {
        expect(expected.payload.pronounceText).toEqual(received.payload.pronounceText);
        expect(expected.payload.items).toEqual(received.payload.items);
        expect(expected.payload.suggestions).toEqual(received.payload.suggestions);
        return { pass: true, message: () => '' };
    },
});

let inference: Recognizer['inference'] = () => {
    throw new Error('Not implemented');
};

jest.mock('@salutejs/recognizer-smartapp-brain', () => ({
    __esModule: true, // this property makes it work
    // eslint-disable-next-line object-shorthand, func-names
    SmartAppBrainRecognizer: function () {
        return {
            inference: (params) => inference(params),
        };
    },
}));

describe('scenario', () => {
    beforeEach(() => {
        inference = () => {
            throw new Error('Not implemented');
        };
    });

    test('Простая фраза', async () => {
        const phrase = 'Сложи 3 и 5';

        inference = ({ req }) => {
            if (req.message?.original_text === phrase) {
                req.setInference({
                    variants: [
                        {
                            intent: {
                                id: 0,
                                path: '/sum',
                                slots: [
                                    { name: 'num1', entity: 'number', required: true, array: false, prompts: [] },
                                    { name: 'num2', entity: 'number', required: true, array: false, prompts: [] },
                                ],
                            },
                            confidence: 1,
                            slots: [
                                { name: 'num1', value: '3', array: false },
                                { name: 'num2', value: '5', array: false },
                            ],
                        },
                    ],
                });
            }
        };

        const res = await handleNlpRequest(
            createRequestWithMessage({
                original_text: phrase,
            }),
        );
        // @ts-ignore
        expect(res).toBeEqualResponse({
            payload: { pronounceText: '8. Это было легко!', items: [] },
        } as NLPResponseATU);
    });

    test('Дозапрос числа', async () => {
        const phrase1 = 'Сложи 4';
        const phrase2 = '5';

        inference = ({ req }) => {
            if (req.message?.original_text === phrase1) {
                req.setInference({
                    variants: [
                        {
                            intent: {
                                id: 0,
                                path: '/sum',
                                slots: [{ name: 'num1', entity: 'number', required: true, array: false, prompts: [] }],
                            },
                            confidence: 1,
                            slots: [{ name: 'num1', value: '4', array: false }],
                        },
                    ],
                });
            } else if (req.message?.original_text === phrase2) {
                req.setInference({
                    variants: [
                        {
                            intent: {
                                id: 0,
                                path: '/sum',
                                slots: [{ name: 'num1', entity: 'number', required: true, array: false, prompts: [] }],
                            },
                            confidence: 1,
                            slots: [{ name: 'num1', value: '5', array: false }],
                        },
                    ],
                });
            }
        };

        const res1 = await handleNlpRequest(
            createRequestWithMessage({
                original_text: phrase1,
            }),
        );

        // @ts-ignore
        expect(res1).toBeEqualResponse({
            payload: {
                pronounceText: 'А какое второе число?',
                items: [{ bubble: { text: 'А какое второе число?', expand_policy: 'auto_expand', markdown: false } }],
            },
        } as NLPResponseATU);

        const res2 = await handleNlpRequest(
            createRequestWithMessage({
                original_text: phrase2,
            }),
        );

        // @ts-ignore
        expect(res2).toBeEqualResponse({
            payload: { pronounceText: '9. Это было легко!', items: [] },
        } as NLPResponseATU);
    });
});
