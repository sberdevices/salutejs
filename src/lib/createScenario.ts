import { DefaultScenario, IntentsDict, SaluteHandler, SaluteIntent } from '../types/salute';

export type ScenarioObject<T = string> = {
    callback: SaluteHandler;
    children: { [Key in keyof T]: SaluteHandler | ScenarioObject<T> };
};

export class ScenarioIntentCallback {
    private _type: 'handler' | 'children';

    constructor(private _handler: SaluteHandler | ScenarioObject, private _path: string) {
        this._type = typeof this._handler === 'function' ? 'handler' : 'children';
    }

    get kind() {
        return this._type;
    }

    get callback(): SaluteHandler | undefined {
        if (this._type === 'handler') {
            return this._handler as SaluteHandler;
        }

        return (this._handler as ScenarioObject).callback;
    }

    get hasChildren() {
        if (this._type === 'handler') {
            return false;
        }

        return Object.keys((this._handler as ScenarioObject).children || {}).length > 0;
    }

    get path() {
        return this._path;
    }
}

type SaluteHandlerArgs = Parameters<SaluteHandler>;

type CustomScenario<T = string> = {
    [Key in keyof T]: SaluteHandler | ScenarioObject<T>;
};

export function createScenario<T extends Record<string, SaluteIntent> = IntentsDict>(intents: T) {
    return (handlers: DefaultScenario & Partial<CustomScenario<T>>) => {
        const resolve = (
            ...path: Array<keyof T | keyof DefaultScenario | string>
        ): ScenarioIntentCallback | undefined => {
            const handler = path.reduce((vert: SaluteHandler | ScenarioObject<T>, branch: string) => {
                if (vert == null) {
                    return vert;
                }

                if ('children' in vert && typeof vert.children !== 'function') {
                    return vert.children[branch];
                }

                return vert[branch];
            }, handlers);

            return handler == null ? undefined : new ScenarioIntentCallback(handler, path.join('/'));
        };

        const ask = (intent: keyof T | keyof DefaultScenario | string, ...options: SaluteHandlerArgs) => {
            const cb = resolve(intent)?.callback;
            if (cb == null) {
                return Promise.resolve();
            }

            return cb(...options);
        };

        const findActionPath = (action: string): keyof T | undefined => {
            const result = Object.keys(intents).find((i) => intents[i].action === action);

            return result ? (result as keyof T) : undefined;
        };

        const getIntentMissingVariables = (
            intent: keyof T,
            variables: Record<string, unknown>,
        ): { name: string; question: string }[] => {
            const missing = [];
            const vars = intents[intent].variables || {};

            Object.keys(vars).forEach((v) => {
                if (vars[v].required && variables[v] === undefined && vars[v].questions?.length) {
                    const questionNo = Math.floor(Math.random() * vars[v].questions.length);
                    missing.push({ name: v, question: vars[v].questions[questionNo] });
                }
            });

            return missing;
        };

        return {
            intents,
            handlers,
            ask,
            findActionPath,
            getIntentMissingVariables,
            resolve,
        };
    };
}

export type Scenario = ReturnType<ReturnType<typeof createScenario>>;
