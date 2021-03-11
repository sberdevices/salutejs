import { Scenario } from '../lib/createScenario';
import { SaluteSession } from '../lib/session';

import { ServerAction } from './global';
import { AppState, Message, NLPRequest } from './request';
import { NLPResponse, ErrorCommand, DataCommand } from './response';

interface IntentSlot {
    name: string; // имя сущности
    entity: string; // тип сущности
    required: boolean; // наличие сущности обязательно
    prompts: string[]; // ???
    array: boolean;
}

interface FoundSlot {
    name: string;
    value: string;
    array: boolean;
}

export interface Intent {
    id: number;
    path: string;
    answer?: string;
    customData?: string;
    slots: IntentSlot[]; // сущности в фразе
}

export interface Variant {
    intent: Intent;
    confidence: number; // вероятностная оценка соответствия интента
    slots: FoundSlot[]; // распознанные сущности
}

export interface Inference {
    variants: Variant[];
}

export interface SaluteCommand {
    type: string;
    payload: { [key: string]: unknown };
}

export type SaluteRequestVariable = Record<string, unknown>;

export interface SaluteRequest<V = SaluteRequestVariable> {
    readonly message: Message;
    readonly serverAction?: ServerAction;
    readonly intent: string;
    readonly inference?: Inference;
    readonly request: NLPRequest;
    readonly state?: AppState;
    readonly variables: V;
    setInference: (value: Inference) => void;
    setVariable: (name: string, value: unknown) => void;
}

export interface SaluteResponse {
    appendBubble: (bubble: string) => void;
    appendCommand: <T extends SaluteCommand>(command: T) => void;
    appendError: (error: ErrorCommand['smart_app_error']) => void;
    appendItem: (item: { command: DataCommand | ErrorCommand }) => void;
    appendSuggestions: (suggestions: string[]) => void;
    setIntent: (text: string) => void;
    setPronounceText: (text: string) => void;
    readonly message: NLPResponse;
}

export type SaluteHandler<
    Rq extends SaluteRequest = SaluteRequest,
    S extends Record<string, unknown> = Record<string, unknown>,
    Rs extends SaluteResponse = SaluteResponse,
    H extends Record<string, unknown> = Record<string, unknown>
> = (options: { req: Rq; res: Rs; session: S; history: H }) => void;

export interface SaluteIntentVariable {
    required?: boolean;
    questions?: string[];
}

export interface TextIntent {
    matchers: string[];
}

export interface ServerActionIntent {
    action: string;
}

export type SaluteIntent = (
    | (Required<TextIntent> & Partial<ServerActionIntent>)
    | (Required<ServerActionIntent> & Partial<TextIntent>)
) & {
    variables?: Record<string, SaluteIntentVariable>;
};

export interface DefaultScenario {
    failure: SaluteHandler;
    run_app: SaluteHandler;
    close_app?: SaluteHandler;
}

export type IntentsDict = Record<string, SaluteIntent>;

export type SaluteMiddleware = (options: {
    req: SaluteRequest;
    res: SaluteResponse;
    session: SaluteSession;
}) => Promise<void>;
export type SaluteMiddlewareCreator = (options: { scenario: Scenario }) => SaluteMiddleware;

export interface SaluteHistory<T extends Record<string, unknown> = Record<string, unknown>> {
    readonly path: string[];
    variables: T;
}
