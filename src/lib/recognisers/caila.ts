import assert from 'assert';

import { Inference, SaluteRequest, SaluteResponse } from '../../types/salute';

import { AbstractRecognizer } from './abstract';

// Пример использования Caila для распознования текста
// const caila = new CailaRecognizer(process.env.ACCESS_TOKEN);

// caila.inference('Забронировать столик на 2 на завтра').then((response) => {
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

    public async inference(req: SaluteRequest, res: SaluteResponse): Promise<void> {
        const payload = this.buildInferenceRequest(req.message.original_text);

        if (req.message == null) {
            return Promise.resolve();
        }

        return this.callApi(`/cailapub/api/caila/p/${this.accessToken}/nlu/inference`, {
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(payload),
        }).then((resp: CailaInferenceResponse) => {
            req.setInference(resp);
        });
    }
}
