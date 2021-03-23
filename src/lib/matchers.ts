import { SaluteRequest } from '../types/salute';

export const compare = (expected, actual) => {
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

export function createMatchers<R extends SaluteRequest = SaluteRequest>() {
    // TODO: map keys from intentsDict
    const intent = (expected: string) => (req: R) => req.inference?.variants[0].intent.path === expected;

    const text = (expected: string | RegExp) => (req: R) => {
        const actual = req.message.original_text;
        if (expected instanceof RegExp) {
            if (typeof actual === 'string') return expected.test(actual);
        }

        return expected === actual;
    };

    const state = (expected: Partial<R['state']>) => (req: R) => compare(expected, req.state);

    const match = (...matchers: Array<(req: R) => boolean>) => (req: R): boolean => {
        for (let i = 0; i < matchers.length; i++) {
            if (!matchers[i](req)) return false;
        }

        return true;
    };

    return { match, intent, text, state };
}
