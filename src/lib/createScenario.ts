import { DefaultScenario, IntentsDict, SaluteHandler } from '../types/salute';

type CustomScenario<T = string> = {
    [Key in keyof T]: SaluteHandler | Partial<CustomScenario<T>>;
};

export function createScenario<T = IntentsDict>(intents: T) {
    return (handlers: DefaultScenario & Partial<CustomScenario<T>>) => {
        return {
            intents,
            handlers,
            resolve(...path: Array<keyof T | keyof DefaultScenario | string>): SaluteHandler {
                // FIXME: dive to children
                // @ts-ignore
                const dive = handlers[path[0]];

                // @ts-ignore
                return dive;
            },
        };
    };
}

export type Scenario = ReturnType<ReturnType<typeof createScenario>>;
