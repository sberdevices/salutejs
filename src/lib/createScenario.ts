import { DefaultScenario, IntentsDict, SaluteHandler, SaluteIntent } from '../types/salute';

export type ScenarioObject<T = string> = {
    callback: SaluteHandler;
    children: { [Key in keyof T]: SaluteHandler | ScenarioObject<T> };
};

export class ScenarioIntent {
    private _type: 'handler' | 'children';

    constructor(private _handler: SaluteHandler | ScenarioObject) {
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
}

type SaluteHandlerArgs = Parameters<SaluteHandler>;

type CustomScenario<T = string> = {
    [Key in keyof T]: SaluteHandler | ScenarioObject<T>;
};

export function createScenario<T extends Record<string, SaluteIntent> = IntentsDict>(intents: T) {
    return (handlers: DefaultScenario & Partial<CustomScenario<T>>) => {
        const resolve = (...path: Array<keyof T | keyof DefaultScenario | string>): ScenarioIntent | undefined => {
            const handler = path.reduce((vert: SaluteHandler | ScenarioObject<T>, branch: string) => {
                if (vert == null) {
                    return vert;
                }

                if ('children' in vert && typeof vert.children !== 'function') {
                    return vert.children[branch];
                }

                return vert[branch];
            }, handlers);

            return handler == null ? undefined : new ScenarioIntent(handler);
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
        ): { name: string; question?: string }[] => {
            const missing = [];
            const vars = intents[intent].variables || {};

            Object.keys(vars).forEach((v) => {
                if (vars[v].required && variables[v] === undefined) {
                    missing.push({ name: v, question: (vars[v].questions || [])[0] });
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
