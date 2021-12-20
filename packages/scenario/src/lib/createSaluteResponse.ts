import { NLPRequest, NLPRequestSA } from './types/request';
import { NLPResponse, NLPResponseCPD } from './types/response';
import { SaluteCommand, SaluteResponse } from './types/salute';
import { Bubble, Button, Card, EmotionId, PolicyRunAppComand, SmartAppErrorCommand } from './types/systemMessage';

export const createSaluteResponse = (req: NLPRequest): SaluteResponse => {
    const { messageId, sessionId, uuid, payload } = req;
    let message: NLPResponse = {
        messageName: 'ANSWER_TO_USER',
        messageId,
        sessionId,
        uuid,
        payload: {
            device: payload.device,
            projectName: payload.projectName,
            items: [],
            finished: false,
            intent: 'scenario',
        },
    };

    const runApp = (server_action: PolicyRunAppComand['nodes']['server_action']) => {
        message = {
            messageId,
            sessionId,
            uuid,
            messageName: 'POLICY_RUN_APP',
            payload: {
                projectName: payload.projectName,
                device: payload.device,
                server_action,
            },
        };
    };

    const getProfileData = () => {
        message = {
            messageId,
            sessionId,
            uuid,
            messageName: 'GET_PROFILE_DATA',
            payload: {
                projectName: payload.projectName,
                device: payload.device,
            },
        };
    };

    const chooseProfileData = (fields: NLPResponseCPD['payload']['fields']) => {
        message = {
            messageId,
            sessionId,
            uuid,
            messageName: 'CHOOSE_PROFILE_DATA',
            payload: {
                fields,
            },
        };
    };

    const getDetailedProfileData = () => {
        message = {
            messageId,
            sessionId,
            uuid,
            messageName: 'DETAILED_PROFILE_DATA',
            payload: {
                fields: ['address'],
            },
        };
    };

    return {
        appendBubble: (
            bubble: string,
            options: { expand_policy?: Bubble['expand_policy']; markdown?: boolean } = {},
        ) => {
            if (message.messageName !== 'ANSWER_TO_USER') {
                throw new Error('Wrong message type');
            }

            const { expand_policy, markdown } = options;

            message.payload.items.push({
                bubble: {
                    text: bubble,
                    expand_policy: expand_policy || 'auto_expand',
                    markdown: typeof markdown === 'undefined' ? false : markdown,
                },
            });
        },
        appendCard: (card: Card) => {
            if (message.messageName !== 'ANSWER_TO_USER') {
                throw new Error('Wrong message type');
            }

            message.payload.items.push({ card });
        },
        appendCommand: <T extends SaluteCommand>(command: T) => {
            if (message.messageName !== 'ANSWER_TO_USER') {
                throw new Error('Wrong message type');
            }

            message.payload.items.push({ command: { type: 'smart_app_data', smart_app_data: { ...command } } });
        },
        openDeepLink: (deepLink: string) => {
            if (message.messageName !== 'ANSWER_TO_USER') {
                throw new Error('Wrong message type');
            }

            message.payload.items.push({
                command: { type: 'action', action: { type: 'deep_link', deep_link: deepLink } },
            });
        },
        appendItem: (item) => {
            if (message.messageName !== 'ANSWER_TO_USER') {
                throw new Error('Wrong message type');
            }

            message.payload.items.push(item);
        },
        appendError: (error: SmartAppErrorCommand['smart_app_error']) => {
            if (message.messageName !== 'ANSWER_TO_USER') {
                throw new Error('Wrong message type');
            }

            message.payload.items.push({ command: { type: 'smart_app_error', smart_app_error: error } });
        },
        appendSuggestions: (suggestions: Array<string | Button>) => {
            if (message.messageName !== 'ANSWER_TO_USER') {
                throw new Error('Wrong message type');
            }

            if (message.payload.suggestions == null) {
                message.payload.suggestions = { buttons: [] };
            }

            for (let i = 0; i < suggestions.length; i++) {
                const suggest = suggestions[i];
                if (typeof suggest === 'string') {
                    message.payload.suggestions.buttons.push({
                        title: suggest,
                        action: { type: 'text', text: suggest, should_send_to_backend: true },
                    });
                } else {
                    message.payload.suggestions.buttons.push(suggest);
                }
            }

            message.payload.suggestions.buttons;
        },
        askPayment: (invoiceId: number) => {
            runApp({
                app_info: { systemName: 'payment_app' },
                parameters: {
                    invoice_id: invoiceId.toString(),
                    app_info: {
                        projectId: (req as NLPRequestSA).payload.app_info.projectId,
                    },
                },
            });
        },
        finish: () => {
            if (message.messageName !== 'ANSWER_TO_USER') {
                throw new Error('Wrong message type');
            }

            message.payload.finished = true;
        },
        runApp,
        getProfileData,
        chooseProfileData,
        getDetailedProfileData,
        setIntent: (intent: string) => {
            if (message.messageName !== 'ANSWER_TO_USER') {
                throw new Error('Wrong message type');
            }

            message.payload.intent = intent;
        },
        setPronounceText: (text: string, options: { ssml?: boolean } = { ssml: false }) => {
            if (message.messageName !== 'ANSWER_TO_USER') {
                throw new Error('Wrong message type');
            }

            if (options.ssml) {
                if (!/^<speak>.*<\/speak>$/gi.test(text)) {
                    text = `<speak>${text}</speak>`;
                }

                message.payload.pronounceTextType = 'application/ssml';
            }

            message.payload.pronounceText = text;
        },
        setEmotion: (emotion: EmotionId) => {
            if (message.messageName !== 'ANSWER_TO_USER') {
                throw new Error('Wrong message type');
            }

            message.payload.emotion = {
                emotionId: emotion,
            };
        },
        setAutoListening: (value) => {
            if (message.messageName !== 'ANSWER_TO_USER') {
                throw new Error('Wrong message type');
            }

            message.payload.auto_listening = value;
        },
        setASRHints: (hints) => {
            if (message.messageName !== 'ANSWER_TO_USER') {
                throw new Error('Wrong message type');
            }

            message.payload.asr_hints = hints;
        },
        overrideFrontendEndpoint: (frontendEndpoint: string) => {
            if (message.messageName !== 'ANSWER_TO_USER') {
                throw new Error('Wrong message type');
            }

            message.payload.app_info = {
                ...payload.app_info,
                frontendEndpoint,
            };
        },
        get message(): NLPResponse {
            return message;
        },
    };
};
