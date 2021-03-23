import { SaluteRequest } from '../types/salute';

const intent = (expected: string) => (req) => req.inference?.variants[0].intent.path === expected;
const text = (expected: string | RegExp) => (req) => {
    const actual = req.message.original_text;
    if (expected instanceof RegExp) {
        if (typeof actual === 'string') return expected.test(actual);
    }

    return expected === actual;
};
const state = (expected: { [key: string]: unknown }) => (req) => {
    const compare = (expected, actual) => {
        if (typeof expected !== typeof actual) return false;
        if (typeof expected !== 'object' || expected === null) {
            return expected === actual;
        }

        if (Array.isArray(expected)) {
            return expected.every((exp) => [].some.call(actual, (act) => compare(exp, act)));
        }

        return Object.keys(expected).every((key) => {
            const ao = actual[key];
            const eo = expected[key];

            if (typeof eo === 'object' && eo !== null && ao !== null) {
                return compare(eo, ao);
            }
            if (typeof eo === 'boolean') {
                return eo !== (ao == null);
            }

            return ao === eo;
        });
    };

    return compare(expected, req.state);
};
const match = (...matchers: Array<(req: SaluteRequest) => boolean>) => (req: SaluteRequest): boolean => {
    for (let i = 0; i < matchers.length; i++) {
        if (!matchers[i](req)) return false;
    }

    return true;
};

const req = {
    state: {
        screen: '5',
    },
    inference: {
        variants: [{ intent: { path: 'wow' } }],
    },
};

// @ts-ignore
console.log('intent only', match(intent('wow'))(req));

// @ts-ignore
console.log('intent and state — false', match(intent('wow'), state({ screen: '4' }))(req));

// @ts-ignore
console.log('intent and state — true', match(intent('wow'), state({ screen: '5' }))(req));
