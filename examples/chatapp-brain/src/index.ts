import express from 'express';
import { config as dotenv } from 'dotenv';
import { createIntents, createSystemScenario, createUserScenario, createMatchers } from '@salutejs/scenario';
import { SmartAppBrainRecognizer } from '@salutejs/recognizer-smartapp-brain';
import { SaluteMemoryStorage } from '@salutejs/storage-adapter-memory';

import { saluteExpressMiddleware } from './middleware';
import * as dictionary from './system.i18n';
import model from './intents.json';

dotenv();

const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());

const { intent } = createMatchers();

app.post(
    '/app-connector',
    saluteExpressMiddleware({
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
        storage: new SaluteMemoryStorage(),
    }),
);

app.listen(port, () => console.log(`Salute on ${port}`));
