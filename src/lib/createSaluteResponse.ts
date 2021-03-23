import { NLPRequest } from '../types/request';
import { NLPResponse, NLPResponseATU, NLPResponseType, ErrorCommand } from '../types/response';
import { SaluteCommand, SaluteResponse } from '../types/salute';

export const createSaluteResponse = (req: NLPRequest): SaluteResponse => {
    const { messageId, sessionId, uuid, payload } = req;
    const message: NLPResponseATU = {
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

    return {
        dispatch: () => {},
        appendBubble: (bubble: string) => {
            message.payload.items.push({ bubble: { text: bubble, expand_policy: 'auto_expand' } });
        },
        appendCommand: <T extends SaluteCommand>(command: T) => {
            message.payload.items.push({ command: { type: 'smart_app_data', smart_app_data: { ...command } } });
        },
        // TODO: fix types
        appendItem: (item) => {
            message.payload.items.push(item);
        },
        appendError: (error: ErrorCommand['smart_app_error']) => {
            message.payload.items.push({ command: { type: 'smart_app_error', smart_app_error: error } });
        },
        appendSuggestions: (suggestions: string[]) => {
            if (message.payload.suggestions == null) {
                message.payload.suggestions = { buttons: [] };
            }

            suggestions.forEach((suggest) => {
                message.payload.suggestions.buttons.push({
                    title: suggest,
                    action: { type: 'text', text: suggest, should_send_to_backend: true },
                });
            });
            message.payload.suggestions.buttons;
        },
        setIntent: (intent: string) => {
            message.payload.intent = intent;
        },
        setPronounceText: (text: string) => {
            message.payload.pronounceText = text;
        },
        get message(): NLPResponse {
            return message;
        },
    };
};
