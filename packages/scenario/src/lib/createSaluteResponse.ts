import {
    NLPRequest,
    NLPResponse,
    NLPResponseATU,
    NLPResponseType,
    ErrorCommand,
    SaluteCommand,
    SaluteResponse,
    EmotionType,
    Button,
    NLPRequestSA,
    NLPResponsePRA,
} from '@salutejs/types';

export const createSaluteResponse = (req: NLPRequest): SaluteResponse => {
    const { messageId, sessionId, uuid, payload } = req;
    let message: NLPResponseATU | NLPResponsePRA = {
        messageName: NLPResponseType.ANSWER_TO_USER,
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
            messageName: NLPResponseType.POLICY_RUN_APP,
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
        appendBubble: (bubble: string) => {
            if (message.messageName !== NLPResponseType.ANSWER_TO_USER) {
                throw new Error('Wrong message type');
            }

            message.payload.items.push({ bubble: { text: bubble, expand_policy: 'auto_expand' } });
        },
        appendCommand: <T extends SaluteCommand>(command: T) => {
            if (message.messageName !== NLPResponseType.ANSWER_TO_USER) {
                throw new Error('Wrong message type');
            }

            message.payload.items.push({ command: { type: 'smart_app_data', smart_app_data: { ...command } } });
        },
        // TODO: fix types
        appendItem: (item) => {
            if (message.messageName !== NLPResponseType.ANSWER_TO_USER) {
                throw new Error('Wrong message type');
            }

            message.payload.items.push(item);
        },
        appendError: (error: ErrorCommand['smart_app_error']) => {
            if (message.messageName !== NLPResponseType.ANSWER_TO_USER) {
                throw new Error('Wrong message type');
            }

            message.payload.items.push({ command: { type: 'smart_app_error', smart_app_error: error } });
        },
        appendSuggestions: (suggestions: Array<string | Button>) => {
            if (message.messageName !== NLPResponseType.ANSWER_TO_USER) {
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
        askPayment: (invoiceId) => {
            runApp(
                { systemName: 'payment_app' },
                {
                    invoice_id: invoiceId,
                    app_info: {
                        projectId: (req as NLPRequestSA).payload.app_info.projectId,
                    },
                },
            );
        },
        runApp,
        setIntent: (intent: string) => {
            if (message.messageName !== NLPResponseType.ANSWER_TO_USER) {
                throw new Error('Wrong message type');
            }

            message.payload.intent = intent;
        },
        setPronounceText: (text: string) => {
            if (message.messageName !== NLPResponseType.ANSWER_TO_USER) {
                throw new Error('Wrong message type');
            }

            message.payload.pronounceText = text;
        },
        // getI18nText()
        // setI18nPronounceText()
        setEmotion: (emotion: EmotionType) => {
            if (message.messageName !== NLPResponseType.ANSWER_TO_USER) {
                throw new Error('Wrong message type');
            }

            message.payload.emotion = {
                emotionId: emotion,
            };
        },
        get message(): NLPResponse {
            return message;
        },
    };
};
