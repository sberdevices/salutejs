import fetch, { RequestInfo, RequestInit } from 'node-fetch';
import { Recognizer, SaluteRequest, SaluteResponse, SaluteSession } from '@salutejs/types';

type URL = string;

export abstract class AbstractRecognizer implements Recognizer {
    private host: URL;

    constructor(host: string) {
        this.host = host;
    }

    protected async callApi<T>(url: RequestInfo, init?: RequestInit): Promise<T> {
        return fetch(`${this.host}${url}`, init).then((response) => response.json());
    }

    public abstract inference: (options: { req: SaluteRequest; res: SaluteResponse; session: SaluteSession }) => void;
}
