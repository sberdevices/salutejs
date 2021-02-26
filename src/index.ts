import { SaluteSessionStorage } from './lib/session';
import { NLPRequest, NLPRequestMTS, NLPRequestSA } from './types/request';
import { NLPResponse, NLPResponseATU, NLPResponseType, ErrorCommand } from './types/response';
import { Inference, SaluteCommand, SaluteMiddleware, SaluteRequest, SaluteResponse, Variant } from './types/salute';

const initSaluteRequest = (request: NLPRequest): SaluteRequest => {
    let inference: Inference;
    const variables: { [key: string]: unknown } = {};

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
        get variables() {
            return variables;
        },
        setInference: (value: Inference) => {
            inference = value;
        },
        setVariable: (name: string, value: unknown) => {
            variables[name] = value;
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
        appendCommand: <T extends SaluteCommand>(command: T) => {
            message.payload.items.push({ command: { type: 'smart_app_data', smart_app_data: { ...command } } });
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

export interface ScenarioWalkerProps {
    storage: SaluteSessionStorage;
    middlewares: SaluteMiddleware[];
}

export const createScenarioWalker = ({ middlewares, storage }: ScenarioWalkerProps) => async (
    request: NLPRequest,
): Promise<NLPResponse> => {
    const req: SaluteRequest = initSaluteRequest(request);
    const res: SaluteResponse = initSaluteResponse(request);

    const session = await storage.resolve(request.sessionId);

    for (const current of middlewares) {
        // eslint-disable-next-line no-await-in-loop
        await current({ req, res, session });
    }

    await storage.save({ id: request.sessionId, session });

    return res.message;
};
