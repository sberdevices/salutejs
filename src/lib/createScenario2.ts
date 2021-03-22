import { DefaultScenario, IntentsDict, SaluteHandler, SaluteIntent, SaluteRequest } from '../types/salute';

export type ScenarioSchema = Record<
    string,
    {
        match: (req: SaluteRequest) => boolean;
        handle: SaluteHandler;
        children?: ScenarioSchema;
    }
>;

type SystemScenario = {
    RUN_APP: SaluteHandler;
    CLOSE_APP: SaluteHandler;
    NO_MATCH: SaluteHandler;
};

export const createSystemScenario = (systemScenarioSchema?: Partial<SystemScenario>): SystemScenario => {
    return {
        RUN_APP: ({ res }) => {
            res.setPronounceText('Добро пожаловать');
        },
        CLOSE_APP: ({ res }) => {},
        NO_MATCH: ({ res }) => {
            res.setPronounceText('Не понятно');
        },
        ...systemScenarioSchema,
    };
};

export const createScenario2 = (scenarioSchema: ScenarioSchema) => {
    const getByPath = (path: string[]) => {
        // path === ['state1', 'state2']
        // { children: { state1: { children: { state2: {} }}}}
        let obj = scenarioSchema[path[0]];
        for (const p of path.slice(1)) {
            if (obj.children) {
                obj = obj.children[p];
            } else {
                return undefined;
            }
        }

        return obj;
    };

    const resolve = (path: string[], req: SaluteRequest) => {
        let matchedState: {
            path: string[];
            state: ScenarioSchema['string'];
        };

        if (path.length > 0) {
            const { children } = getByPath(path);
            for (const el of Object.keys(children)) {
                const nextState = children[el];
                if (nextState.match(req)) {
                    matchedState = { state: nextState, path: [...path, el] };
                    break;
                }
            }
        }

        if (!matchedState) {
            for (const el of Object.keys(scenarioSchema)) {
                const nextState = scenarioSchema[el];
                if (nextState.match(req)) {
                    matchedState = { state: nextState, path: [el] };
                    break;
                }
            }
        }

        return matchedState;
    };

    return {
        getByPath,
        resolve,
    };
};
