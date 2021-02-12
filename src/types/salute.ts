import { ServerAction } from './global';
import { AppState, Message, NLPRequest } from './request';
import { NLPResponse } from './response';

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

interface Intent {
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

export interface SaluteRequest {
    readonly message: Message;
    readonly serverAction?: ServerAction;
    readonly intent: string;
    readonly inference?: Inference;
    readonly request: NLPRequest;
    readonly state?: AppState;
    readonly variant?: Variant;
    setInference: (value: Inference) => void;
    setVariant: (value: Variant) => void;
}

export interface SaluteResponse {
    appendBubble: (bubble: string) => void;
    appendCommand: (command: unknown) => void;
    appendSuggestions: (suggestions: string[]) => void;
    setIntent: (text: string) => void;
    setPronounceText: (text: string) => void;
    readonly message: NLPResponse;
}

export interface TextIntent {
    callback: (req: SaluteRequest, res: SaluteResponse) => void;
    matchers: string[];
    variables: string[];
}

export interface ServerActionIntent {
    callback: (req: SaluteRequest, res: SaluteResponse) => void;
    actionId: string;
    parameters: string[];
}

export interface SystemIntent {
    callback: (req: SaluteRequest, res: SaluteResponse) => void;
}

export type SaluteIntent = ServerActionIntent | TextIntent | SystemIntent;

export interface Intents {
    default: SystemIntent;
    run_app: SystemIntent;
    close_app?: SystemIntent;
    [key: string]: SaluteIntent;
}

export type SaluteMiddleware = (req, res) => Promise<void>;
