export interface Intent {
    id: string;
    transitions: Record<string, boolean>; // must be callback (req, res) => void
}

const createIntent = (id: string) => {
    return {
        id,
        transitions: {},
    };
};

export class Scenario {
    private intents: Record<string, Intent> = {};

    addIntent(...ids: string[]): void {
        ids.forEach((id) => {
            if (!this.intents[id]) {
                this.intents[id] = createIntent(id);
            } else throw new Error(`Intent "${id}" already exists ¯\\_(ツ)_/¯"`);
        });
    }

    getIntent(id: string): Intent {
        return this.intents[id];
    }

    addTransition(...transitions: Array<[string, string]>): void {
        transitions.forEach(([from, to]) => {
            if (!this.intents[from]) throw new Error(`Intent "${from}" doesn't exists ¯\\_(ツ)_/¯"`);
            if (!this.intents[to]) throw new Error(`Intent "${to}" doesn't exists ¯\\_(ツ)_/¯"`);

            if (!this.intents[from].transitions[to]) {
                this.intents[from].transitions[to] = true;
            }
        });
    }

    getTransition(from: string, to: string): boolean | undefined {
        return this.intents[from].transitions[to];
    }
}
