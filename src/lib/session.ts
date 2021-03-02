export interface SaluteSession {
    path: string[];
    slotFilling: boolean;
    variables: {
        [key: string]: unknown;
    };
    state: Record<string, unknown>;
}

export interface SaluteSessionStorage {
    resolve: (id: string) => Promise<SaluteSession>;
    save: ({ id, session }: { id: string; session: SaluteSession }) => Promise<void>;
    reset: (id: string) => Promise<void>;
}

export class SaluteMemoryStorage implements SaluteSessionStorage {
    private sessions: Record<string, SaluteSession> = {};

    async resolve(id: string) {
        return Promise.resolve(
            this.sessions[id] || {
                path: [],
                variables: {},
                slotFilling: false,
                state: {},
            },
        );
    }

    async save({ id, session }: { id: string; session: SaluteSession }) {
        this.sessions[id] = session;

        return Promise.resolve();
    }

    async reset(id: string) {
        this.sessions[id] = this.sessions[id] || {
            path: [],
            variables: {},
            slotFilling: false,
            state: {},
        };

        return Promise.resolve();
    }
}
