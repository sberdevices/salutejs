import { SaluteSession, SaluteSessionStorage } from '@salutejs/scenario';
import * as admin from 'firebase-admin';

/**
 * Session storage adapter for Firebase Database
 */
export class SaluteFirebaseSessionStorage implements SaluteSessionStorage {
    /** Database in your Firebase. */
    private db: admin.database.Database;

    /** Specific location in your Firebase Database for session data. */
    private path: string;

    /**
     * @param {admin.database.Database} db Database in your Firebase
     * for session data.
     * @param {string} path Specific location in your Firebase Database
     * for session data.
     * @example
     * admin.initializeApp(functions.config().firebase);
     * const storage = new SaluteFirebaseSessionStorage(admin.database());
     * @example
     * admin.initializeApp(functions.config().firebase);
     * const storage =
     *   new SaluteFirebaseSessionStorage(admin.database(), 'sessions');
     * @example
     * admin.initializeApp(functions.config().firebase);
     * const storage =
     *   new SaluteFirebaseSessionStorage(admin.database(), 'sber/sessions');
     */
    constructor(db: admin.database.Database, path = 'sessions') {
        this.db = db;
        this.path = path.replace(/\/$/, '');
    }

    /**
     * @param {string} id Session id
     * @returns {admin.database.Reference} Firebase DB reference
     */
    getRef(id: string): admin.database.Reference {
        return this.db.ref(`${this.path}/${id}`);
    }

    /**
     * Resolve session data with session id
     * @param {string} id Salute session id.
     * @returns {Promise<void>} A promise to resolve session data.
     */
    async resolve(id: string): Promise<SaluteSession> {
        const { val: data } = await this.getRef(id).once('value');
        return {
            path: [],
            variables: {},
            slotFilling: false,
            state: {},
            ...(data || {}),
        };
    }

    /**
     * Reset session data with session id
     * @param {string} id Salute session id.
     * @returns {Promise<void>} A promise to reset session data.
     */
    reset(id: string): Promise<void> {
        return this.getRef(id).remove();
    }

    /**
     * Save session data with session id
     * @param {string} id Salute session id.
     * @param {SaluteSession} session Salute session data.
     * @returns {Promise<void>} A promise to save session data.
     */
    save({ id, session }: { id: string; session: SaluteSession }): Promise<void> {
        const value = { ...session };
        // remove undefined fields, because firebase crashes with undefined-values
        Object.keys(value).forEach((key) => typeof value[key] === 'undefined' && delete value[key]);

        return this.getRef(id).set(value);
    }
}
