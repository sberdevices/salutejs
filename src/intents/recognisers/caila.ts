import assert from 'assert';

import { AbstractRecognizer, Inference } from './abstract';

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

interface CailaInferenceRequest {
    phrase: Phrase;
    knownSlots?: KnownSlot[];
    nBest: number;
    showDebugInfo?: boolean;
    clientId?: string;
}

interface CailaInferenceResponse extends Inference {
    phrase: Phrase;
}

export class CailaRecognizer extends AbstractRecognizer {
    private static defaultInfereRequestOptions: CailaInferenceRequest = {
        phrase: {
            text: '',
        },
        nBest: 1,
        showDebugInfo: false,
    };

    private _options: Partial<CailaInferenceRequest> = {};

    constructor(private accessToken: string, host = process.env.CAILA_HOST) {
        super(host);

        assert(host, 'Необходимо указать хост CAILA');
    }

    public get options(): Partial<CailaInferenceRequest> {
        return this._options;
    }

    public set options(options: Partial<CailaInferenceRequest>) {
        this._options = options;
    }

    private buildInferenceRequest(text: string): CailaInferenceRequest {
        return {
            ...CailaRecognizer.defaultInfereRequestOptions,
            ...this.options,
            ...{
                phrase: {
                    ...(this.options.phrase || {}),
                    text,
                },
            },
        };
    }

    public async inference(text: string): Promise<CailaInferenceResponse> {
        const payload = this.buildInferenceRequest(text);

        return this.callApi(`/cailapub/api/caila/p/${this.accessToken}/nlu/inference`, {
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }
}
