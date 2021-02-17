import { DefaultScenario, SaluteHandler } from '../types/salute';

type CustomScenario<T = string> = {
    [Key in keyof T]: SaluteHandler | Partial<CustomScenario<T>>;
};

export function createScenario<T>(intents: T) {
    return (handlers: DefaultScenario & Partial<CustomScenario<T>>) => {
        return {
            intents,
            handlers,
            resolve(...path: Array<keyof T | keyof DefaultScenario | string>): SaluteHandler {
                // FIXME: dive to children
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const dive = handlers[path[0]];

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                return dive;
            },
        };
    };
}

export type Scenario = ReturnType<ReturnType<typeof createScenario>>;
