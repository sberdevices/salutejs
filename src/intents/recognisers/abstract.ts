import fetch, { RequestInfo, RequestInit } from 'node-fetch';

type URL = string;

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

interface Variant {
    intent: Intent;
    confidence: number; // вероятностная оценка соответствия интента
    slots: FoundSlot[]; // распознанные сущности
}

export interface Inference {
    variants: Variant[];
}

export interface Recognizer {
    inference(text: string): Promise<Inference>;
}

export abstract class AbstractRecognizer implements Recognizer {
    private host: URL;

    constructor(host: string) {
        this.host = host;
    }

    protected async callApi<T>(url: RequestInfo, init?: RequestInit): Promise<T> {
        return fetch(`${this.host}${url}`, init).then((response) => response.json());
    }

    public abstract inference(text: string): Promise<Inference>;
}
