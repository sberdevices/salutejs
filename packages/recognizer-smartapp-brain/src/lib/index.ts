import * as assert from 'assert';
import { Inference, SaluteRequest, Recognizer } from '@salutejs/types';
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

export class SmartAppBrainRecognizer implements Recognizer {
    private static defaultInfereRequestOptions: SmartAppBrainInferenceRequest = {
        phrase: {
            text: '',
        },
        nBest: 1,
        showDebugInfo: false,
    };

    private static normalizeInference(source: Inference): Inference {
        return {
            ...source,
            variants: source.variants.map((v) => ({
                ...v,
                intent: { ...v.intent, path: v.intent.path.replace(/^\//, '') },
            })),
        };
    }

    private _options: Partial<SmartAppBrainInferenceRequest> = {};

    protected async ask<T>(url: RequestInfo, init?: RequestInit): Promise<T> {
        return fetch(`${this.host}/cailapub/api/caila/p/${this.accessToken}${url}`, init).then((response) =>
            response.json(),
        );
    }

    constructor(private accessToken: string, private host = 'https://smartapp-code.sberdevices.ru') {
        assert.ok(host, 'Необходимо указать хост SmartAppBrain');
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

        return this.ask('/nlu/inference', {
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(payload),
        }).then((resp: SmartAppBrainInferenceResponse) => {
            req.setInference(SmartAppBrainRecognizer.normalizeInference(resp));
        });
    };

    public export = async (): Promise<ProjectData> => {
        return this.ask('/export', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
        });
    };

    public import = async (projectData: ProjectData): Promise<ProjectData> => {
        return this.ask('/import', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
            body: JSON.stringify(projectData),
        });
    };
}