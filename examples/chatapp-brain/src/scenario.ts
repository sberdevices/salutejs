import { SmartAppBrainRecognizer } from '@salutejs/recognizer-smartapp-brain';
import {
    createIntents,
    createMatchers,
    createSaluteRequest,
    createSaluteResponse,
    createScenarioWalker,
    createSystemScenario,
    createUserScenario,
    NLPRequest,
    NLPResponse,
} from '@salutejs/scenario';
import { SaluteMemoryStorage } from '@salutejs/storage-adapter-memory';

import * as dictionary from './system.i18n';
import model from './intents.json';

const { intent } = createMatchers();
const storage = new SaluteMemoryStorage();

const scenarioWalker = createScenarioWalker({
    intents: createIntents(model.intents),
    recognizer: new SmartAppBrainRecognizer(),
    systemScenario: createSystemScenario({
        RUN_APP: ({ req, res }) => {
            const keyset = req.i18n(dictionary);
            res.setPronounceText(keyset('Привет'));
        },
        NO_MATCH: ({ req, res }) => {
            const keyset = req.i18n(dictionary);
            res.setPronounceText(keyset('404'));
        },
    }),
    userScenario: createUserScenario({
        calc: {
            match: intent('/sum'),
            handle: ({ req, res }) => {
                const keyset = req.i18n(dictionary);
                const { num1, num2 } = req.variables;

                res.setPronounceText(
                    keyset('{result}. Это было легко!', {
                        result: Number(num1) + Number(num2),
                    }),
                );
            },
        },
    }),
});

export const handleNlpRequest = async (request: NLPRequest): Promise<NLPResponse> => {
    const req = createSaluteRequest(request);
    const res = createSaluteResponse(request);
    const id = request.uuid.userId;
    const session = await storage.resolve(id);

    await scenarioWalker({ req, res, session });
    await storage.save({ id, session });

    return res.message;
};
