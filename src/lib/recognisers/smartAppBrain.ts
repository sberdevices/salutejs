import assert from 'assert';

import { Inference, SaluteRequest } from '../../types/salute';

import { AbstractRecognizer } from './abstract';

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

export class SmartAppBrainRecognizer extends AbstractRecognizer {
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

    constructor(private accessToken: string, host = process.env.SMARTAPP_BRAIN_HOST) {
        super(host);

        assert(host, 'Необходимо указать хост SmartAppBrain');
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
        }).then((resp: SmartAppBrainInferenceResponse) => {
            req.setInference(SmartAppBrainRecognizer.normalizeInference(resp));
        });
    };
}
