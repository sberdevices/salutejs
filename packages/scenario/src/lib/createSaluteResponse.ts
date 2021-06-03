import { NLPRequest, NLPRequestSA } from './types/request';
import { NLPResponse, NLPResponseATU, NLPResponsePRA } from './types/response';
import { SaluteCommand, SaluteResponse } from './types/salute';
import { Bubble, Button, Card, EmotionId, ErrorCommand } from './types/systemMessage';

export const createSaluteResponse = (req: NLPRequest): SaluteResponse => {
    const { messageId, sessionId, uuid, payload } = req;
    let message: NLPResponseATU | NLPResponsePRA = {
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

    const runApp = (appInfo: { systemName: string } | { projectId: string }, parameters: Record<string, unknown>) => {
        message = {
            messageId,
            sessionId,
            uuid,
            messageName: 'POLICY_RUN_APP',
            payload: {
                projectName: payload.projectName,
                device: payload.device,
                server_action: {
                    app_info: appInfo,
                    parameters,
                },
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
        appendItem: (item) => {
            if (message.messageName !== 'ANSWER_TO_USER') {
                throw new Error('Wrong message type');
            }

            message.payload.items.push(item);
        },
        appendError: (error: ErrorCommand['smart_app_error']) => {
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
            runApp(
                { systemName: 'payment_app' },
                {
                    invoice_id: invoiceId.toString(),
                    app_info: {
                        projectId: (req as NLPRequestSA).payload.app_info.projectId,
                    },
                },
            );
        },
        runApp,
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
        get message(): NLPResponse {
            return message;
        },
    };
};
