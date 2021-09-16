import { Inference, SaluteRequest, Recognizer } from '@salutejs/scenario';
import fetch, { RequestInfo, RequestInit } from 'node-fetch';

import { ProjectData } from './projectData';

// Пример использования SmartAppBrain для распознования текста
// const brain = new SmartAppBrainRecognizer(process.env.ACCESS_TOKEN);

// brain.inference('Забронировать столик на 2 на завтра').then((response) => {
//     console.log(util.inspect(response, false, 10, true));
// });

interface KnownSlot {
    name: string;
    value: string;
    array: boolean;
}

interface Entity {
    entity: string;
    slot: string;
    startPos: number;
    endPos: number;
    text: string;
    value: string;
    default: boolean;
    system: boolean;
    entityId: number;
}

interface Phrase {
    text: string;
    entities?: Entity[];
    stagedPhraseIdx?: number;
}

interface SmartAppBrainInferenceRequest {
    phrase: Phrase;
    knownSlots?: KnownSlot[];
    nBest: number;
    showDebugInfo?: boolean;
    clientId?: string;
}

interface SmartAppBrainInferenceResponse extends Inference {
    phrase: Phrase;
}

class FetchError extends Error {
    status: number;

    data: any;

    constructor(message: string, status: number, data: any) {
        super(message);
        this.status = status;
        this.data = data;
    }
}

export class SmartAppBrainRecognizer implements Recognizer {
    private static defaultInfereRequestOptions: SmartAppBrainInferenceRequest = {
        phrase: {
            text: '',
        },
        nBest: 10,
        showDebugInfo: false,
    };

    private _options: Partial<SmartAppBrainInferenceRequest> = {};

    protected async ask<T>(url: RequestInfo, init: RequestInit = {}): Promise<T> {
        const response = await fetch(`${this.host}/cailapub/api/caila/p/${this.accessToken}${url}`, {
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
            method: 'POST',
            ...init,
        });

        const data = await response.json();

        if (response.status >= 400) {
            const error = new FetchError(response.statusText, response.status, data);
            throw error;
        }

        return data;
    }

    constructor(
        private accessToken = process.env.SMARTAPP_BRAIN_TOKEN,
        private host = 'https://smartapp-code.sberdevices.ru',
    ) {
        if (!accessToken) throw new Error('Wrong SmartApp Brain token.');
    }

    public get options(): Partial<SmartAppBrainInferenceRequest> {
        return this._options;
    }

    public set options(options: Partial<SmartAppBrainInferenceRequest>) {
        this._options = options;
    }

    private buildInferenceRequest(text: string): SmartAppBrainInferenceRequest {
        return {
            ...SmartAppBrainRecognizer.defaultInfereRequestOptions,
            ...this.options,
            ...{
                phrase: {
                    ...(this.options.phrase || {}),
                    text,
                },
            },
        };
    }

    public inference = async ({ req }: { req: SaluteRequest }) => {
        const payload = this.buildInferenceRequest(req.message?.original_text);

        if (req.message == null) {
            return Promise.resolve();
        }

        const resp: SmartAppBrainInferenceResponse = await this.ask('/nlu/inference', {
            body: JSON.stringify(payload),
        });

        req.setInference(resp);
    };

    public export = (): Promise<ProjectData> => this.ask('/export');

    public import = (projectData: ProjectData): Promise<ProjectData> =>
        this.ask('/import', {
            body: JSON.stringify(projectData),
        });
}
