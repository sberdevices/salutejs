import { NLPRequest, NLPRequestMTS, NLPRequestSA } from '../types/request';
import { Inference, SaluteRequest } from '../types/salute';

export const createSaluteRequest = (request: NLPRequest): SaluteRequest => {
    let inference: Inference;
    const variables: { [key: string]: unknown } = {};

    return {
        get message() {
            return (request as NLPRequestMTS).payload.message;
        },
        get intent() {
            return (request as NLPRequestMTS).payload.intent;
        },
        get inference() {
            return inference;
        },
        get request() {
            return request;
        },
        get state() {
            return (request as NLPRequestMTS).payload.meta.current_app.state;
        },
        get serverAction() {
            return (request as NLPRequestSA).payload.server_action;
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
    };
};
