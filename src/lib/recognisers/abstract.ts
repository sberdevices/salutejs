import fetch, { RequestInfo, RequestInit } from 'node-fetch';

import { SaluteMiddleware } from '../../types/salute';

type URL = string;

export interface Recognizer {
    inference: SaluteMiddleware;
}

export abstract class AbstractRecognizer implements Recognizer {
    private host: URL;

    constructor(host: string) {
        this.host = host;
    }

    protected async callApi<T>(url: RequestInfo, init?: RequestInit): Promise<T> {
        return fetch(`${this.host}${url}`, init).then((response) => response.json());
    }

    public abstract inference: SaluteMiddleware;
}
