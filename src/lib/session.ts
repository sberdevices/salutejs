export interface SaluteSession {
    path: string[];
    variables: {
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

export interface SaluteSessionStorage {
    resolve: (id: string) => SaluteSession;
    save: ({ id, session }: { id: string; session: SaluteSession }) => void;
    reset: (id: string) => void;
}

export class SaluteMemoryStorage implements SaluteSessionStorage {
    private sessions: Record<string, SaluteSession>;

    resolve(id: string) {
        return (
            this.sessions[id] || {
                path: [],
                variables: {},
            }
        );
    }

    save({ id, session }: { id: string; session: SaluteSession }) {
        this.sessions[id] = session;
    }

    reset(id: string) {
        this.sessions[id] = this.sessions[id] || {
            path: [],
            variables: {},
        };
    }
}
