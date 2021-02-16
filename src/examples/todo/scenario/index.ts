import * as dotenv from 'dotenv';

import { NLPRequest, NLPRequestMTS, NLPRequestSA } from '../../../types/request';
import { ActionCommand, DataCommand, NLPResponse, NLPResponseATU, NLPResponseType } from '../../../types/response';
import { Inference, SaluteMiddleware, SaluteRequest, SaluteResponse, Variant } from '../../../types/salute';

dotenv.config();

const initSaluteRequest = (request: NLPRequest): SaluteRequest => {
    let inference: Inference;
    let variant: Variant;

    return {
        get message() {
            return (request as NLPRequestMTS).payload.message;
        },
        get intent() {
            return (request as NLPRequestMTS).payload.intent;
        },
        get inference() {
            return inference;
        },
        get request() {
            return request;
        },
        get state() {
            return (request as NLPRequestMTS).payload.meta.current_app.state;
        },
        get serverAction() {
            return (request as NLPRequestSA).payload.server_action;
        },
        get variant() {
            return variant;
        },
        setInference: (value: Inference) => {
            inference = value;
        },
        setVariant: (value: Variant) => {
            variant = value;
        },
    };
};

const initSaluteResponse = (req: NLPRequest): SaluteResponse => {
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
        appendBubble: (bubble: string) => {
            message.payload.items.push({ bubble: { text: bubble, expand_policy: 'auto_expand' } });
        },
        appendCommand: (command: DataCommand | ActionCommand) => {
            message.payload.items.push({ command });
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

export const createScenarioHandler = ({ middlewares }: { middlewares: SaluteMiddleware[] }) => async (
    req: NLPRequest,
): Promise<NLPResponse> => {
    const request: SaluteRequest = initSaluteRequest(req);
    const response: SaluteResponse = initSaluteResponse(req);

    // инициализация контекста
    for (const current of middlewares) {
        // eslint-disable-next-line no-await-in-loop
        await current(request, response);
    }
    // сохранение контекста

    return response.message;
};
