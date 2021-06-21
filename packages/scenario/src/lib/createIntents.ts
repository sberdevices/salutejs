import { IntentsDict } from './types/salute';

export const createIntents = <G extends IntentsDict>(intents: G): G => intents;
