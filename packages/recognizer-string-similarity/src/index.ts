import ss from 'string-similarity';
import { Inference, IntentsDict, TextIntent, Recognizer, Variant } from '@salutejs/scenario';

function getRestOfMessageText(message) {
    const { original_text } = message;

    const res: string[] = [];
    const words = original_text.split(' ');

    for (let i = 1; i < words.length; i++) {
        const word = words[i];

        res.push(word.substr(0, 1).toUpperCase() + word.substr(1));
    }

    return res.join(' ');
}

const SLOT_FILLING_NOTE = 'купить хлеб';

export class StringSimilarityRecognizer implements Recognizer {
    private _intents: IntentsDict;

    constructor({ intents }: { intents: IntentsDict }) {
        this._intents = intents;
    }

    inference = async ({ req }) => {
        if (!req.message || req.server_action) {
            return Promise.resolve();
        }

        const { tokenized_elements_list: tokens } = req.message;
        const matches = Object.keys(this._intents).reduce((arr, key) => {
            const intent = this._intents[key] as TextIntent;
            if (intent.matchers?.length) {
                arr.push({ key, matchers: intent.matchers, rating: 0 });
            }

            return arr;
        }, [] as Array<{ key: string; matchers: TextIntent['matchers']; rating: number }>);

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

                    const intent: Variant = {
                        intent: {
                            id: 0,
                            path: match.key,
                            slots: [],
                        },
                        confidence: match.rating,
                        slots: [],
                    };

                    arr.push(intent);

                    const vars = this._intents[match.key].variables;
                    if (vars != null && getRestOfMessageText(req.message)) {
                        intent.slots.push({
                            name: `${vars[0] || 'note'}`,
                            value: getRestOfMessageText(req.message),
                            array: false,
                        });
                    }

                    return arr;
                }, [] as Variant[])
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .sort((a: any, b: any) => b - a),
        };

        // детект ответа на дозапрос note для done_note
        if (!result.variants.length && req.message.original_text === SLOT_FILLING_NOTE) {
            result.variants.push({
                confidence: 0.7,
                intent: {
                    id: 0,
                    path: 'done_note',
                    slots: [],
                },
                slots: [
                    {
                        name: 'note',
                        value: SLOT_FILLING_NOTE,
                        array: false,
                    },
                ],
            });
        }

        req.setInference(result);

        return Promise.resolve();
    };
}
