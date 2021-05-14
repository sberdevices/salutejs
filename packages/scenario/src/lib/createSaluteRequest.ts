import {
    NLPRequest,
    NLPRequestMTS,
    NLPRequestSA,
    Inference,
    SaluteRequest,
    KeysetDictionary,
    Variant,
} from '@salutejs/types';

import { i18n } from './i18n';

export const createSaluteRequest = (request: NLPRequest): SaluteRequest => {
    let inference: Inference;
    let variant: Variant;
    const variables: { [key: string]: unknown } = {};

    return {
        get character() {
            return request.payload.character.id;
        },
        get appInfo() {
            return (request as NLPRequestSA).payload.app_info;
        },
        get message() {
            return (request as NLPRequestMTS).payload.message;
        },
        get systemIntent() {
            return (request as NLPRequestMTS).payload.intent;
        },
        get variant() {
            return variant;
        },
        get inference() {
            return inference;
        },
        get request() {
            return request;
        },
        get state() {
            return (request as NLPRequestMTS).payload.meta?.current_app?.state;
        },
        get serverAction() {
            return (request as NLPRequestSA).payload.server_action;
        },
        get voiceAction() {
            return (
                !(request as NLPRequestSA).payload.server_action &&
                (request as NLPRequestMTS).payload.intent !== 'close_app' &&
                (request as NLPRequestMTS).payload.intent !== 'run_app'
            );
        },
        get variables() {
            return variables;
        },
        setInference: (value: Inference) => {
            inference = value;
        },
        setVariable: (name: string, value: unknown) => {
            variables[name] = value;
        },
        i18n: (keyset: KeysetDictionary) => {
            return i18n(request.payload.character.id)(keyset);
        },
        setVariant(v) {
            variant = v;
        },
    };
};
