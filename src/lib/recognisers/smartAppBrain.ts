import assert from 'assert';

import { Inference, SaluteRequest } from '../../types/salute';

import { AbstractRecognizer } from './abstract';
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

enum TrainingStatus {
    None = 'NONE',
    Training = 'TRAINING',
    Ready = 'READY',
    Failed = 'FAILED',
}
interface NLUStatusData {
    trainingStatus: TrainingStatus;
    lastError: string | null;
    lastChangeInIntents: number;
    lastChangeInEntities: number;
    lastModelTrainStart: number;
    lastModelTrainTime: number;
    cachedModelTrainStart: number;
    cachedModelTrainTime: number;
}

export class SmartAppBrainRecognizer extends AbstractRecognizer {
    private static defaultInfereRequestOptions: SmartAppBrainInferenceRequest = {
        phrase: {
            text: '',
        },
        nBest: 1,
        showDebugInfo: false,
    };

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
            req.setInference(resp);
        });
    };

    public export = async (): Promise<ProjectData> => {
        return this.callApi(`/cailapub/api/caila/p/${this.accessToken}/export`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
        });
    };

    public import = async (projectData: ProjectData): Promise<ProjectData> => {
        return this.callApi(`/cailapub/api/caila/p/${this.accessToken}/import`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
            body: JSON.stringify(projectData),
        });
    };

    public train = async (incremental = true) => {
        return this.callApi(`/cailapub/api/caila/p/${this.accessToken}/nlu/train?incremental=${incremental}`, {
            method: 'POST',
        });
    };

    public trainStatus = async (): Promise<NLUStatusData> => {
        return this.callApi(`/cailapub/api/caila/p/${this.accessToken}/nlu/status`);
    };

    private pollTrainingStatus = async (
        resolve: (value: NLUStatusData) => void,
        reject: (value: NLUStatusData) => void,
    ) => {
        const status = await this.trainStatus();

        if (status.trainingStatus === TrainingStatus.Training) {
            await new Promise((r) => setTimeout(() => r(true), 3000));

            return this.pollTrainingStatus(resolve, reject);
        }

        if (status.trainingStatus === TrainingStatus.Ready) {
            return resolve(status);
        }

        return reject(status);
    };

    public waitTillTrainingIsDone = async () => {
        return new Promise((resolve, reject) => this.pollTrainingStatus(resolve, reject));
    };
}
