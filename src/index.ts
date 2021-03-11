import { config } from 'dotenv';

import { createCycleScenarioMiddleware } from './lib/middlewares/createCycleScenarioMiddleware';
import { createSystemIntentsMiddleware } from './lib/middlewares/createSystemIntentsMiddleware';
import { createServerActionMiddleware } from './lib/middlewares/createServerActionMiddleware';
import { createDefaultAnswerMiddleware } from './lib/middlewares/createDefaultAnswerMiddleware';
import { createScenarioWalker } from './lib/createScenarioWalker';
import { Scenario } from './lib/createScenario';
import { SaluteMemoryStorage, SaluteSessionStorage } from './lib/session';
import { Recognizer, SmartAppBrainRecognizer } from './lib/recognisers';

config();

export const createSaluteRequestHandler = (
    scenario: Scenario,
    params: {
        storage?: SaluteSessionStorage;
        recognizer?: Recognizer;
    } = {},
): ReturnType<typeof createScenarioWalker> =>
    createScenarioWalker({
        storage: params.storage || new SaluteMemoryStorage(),
        middlewares: [
            createSystemIntentsMiddleware({ scenario }),
            createServerActionMiddleware({ scenario }),
            (
                params.recognizer ||
                new SmartAppBrainRecognizer(process.env.ACCESS_TOKEN, process.env.SMARTAPP_BRAIN_HOST)
            ).inference,
            createCycleScenarioMiddleware({ scenario }),
            createDefaultAnswerMiddleware({ scenario }),
        ],
    });

export * from './types/salute';
export * from './lib/session';
export * from './lib/createScenario';
export * from './lib/createScenarioWalker';
export { Recognizer } from './lib/recognisers/abstract';
