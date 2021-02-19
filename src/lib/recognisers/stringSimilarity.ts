import ss from 'string-similarity';

import { Inference, IntentsDict, TextIntent } from '../../types/salute';
import { Scenario } from '../createScenario';

import { Recognizer } from './abstract';

function getRestOfMessageText(message) {
    const { original_text } = message;

    const res = [];
    const words = original_text.split(' ');

    for (let i = 1; i < words.length; i++) {
        const word = words[i];

        res.push(word.substr(0, 1).toUpperCase() + word.substr(1));
    }

    return res.join(' ');
}

export class StringSimilarityRecognizer implements Recognizer {
    private _intents: IntentsDict;

    constructor({ scenario }: { scenario: Scenario }) {
        this._intents = scenario.intents as IntentsDict;
    }

    inference = async ({ req }) => {
        if (!req.message) {
            return Promise.resolve();
        }

        const { tokenized_elements_list: tokens } = req.message;
        const matches = Object.keys(this._intents).reduce((arr, key) => {
            const intent = this._intents[key] as TextIntent;
            if (intent.matchers?.length) {
                arr.push({ key, matchers: intent.matchers, rating: 0 });
            }

            return arr;
        }, []);

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (token.token_type === 'SENTENCE_ENDPOINT_TOKEN') {
                break;
            }

            for (let j = 0; j < matches.length; j++) {
                const { matchers } = matches[j];
                const { bestMatch } = ss.findBestMatch(token.lemma, matchers);

                if (bestMatch.rating > 0.5 && bestMatch.rating > matches[j].rating) {
                    matches[j].rating = bestMatch.rating;
                }
            }
        }

        const result: Inference = {
            variants: matches
                .reduce((arr, match) => {
                    if (match.rating === 0) {
                        return arr;
                    }

                    arr.push({
                        intent: {
                            id: 0,
                            path: match.key,
                            slots: [],
                        },
                        confidence: match.rating,
                        slots:
                            (this._intents[match.key] as TextIntent).variables != null
                                ? [
                                      {
                                          name: `${(this._intents[match.key] as TextIntent).variables[0] || 'note'}`,
                                          value: getRestOfMessageText(req.message),
                                          array: false,
                                      },
                                  ]
                                : [],
                    });

                    return arr;
                }, [])
                .sort((a, b) => b - a),
        };

        req.setInference(result);

        return Promise.resolve();
    };
}
