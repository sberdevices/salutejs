import { SaluteRequest, ScenarioSchema } from '@salutejs/types';

export function createUserScenario<R extends SaluteRequest = SaluteRequest>(scenarioSchema: ScenarioSchema) {
    const getByPath = (path: string[]) => {
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

    const resolve = (path: string[], req: R) => {
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
}
