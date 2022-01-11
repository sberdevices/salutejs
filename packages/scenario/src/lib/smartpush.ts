import fetch from 'node-fetch';

import { DeliveryConfig, Destination, SmartPushRequest, SmartPushResponse } from './types/push';
import { DefaultChannels } from './types/systemMessage';

const URL = 'https://salute.online.sberbank.ru:9443/api/v2/smartpush/apprequest';
const TOKEN_URL = 'https://salute.online.sberbank.ru:9443/api/v2/oauth';

const uuidv4 = () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        // eslint-disable-next-line no-bitwise
        const r = (Math.random() * 16) | 0;
        // eslint-disable-next-line no-bitwise
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });

const requestAccesToken = async ({
    clientId,
    secret,
    scope,
    requestId,
}: {
    clientId: string;
    secret: string;
    scope: string[];
    requestId: string;
}): Promise<{ access_token?: string; expires_at?: number; code?: number; message?: string }> => {
    return fetch(TOKEN_URL, {
        headers: {
            Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            Rquid: requestId,
        },
        method: 'POST',
        body: `scope=${scope}`,
    }).then((res) => res.json());
};

export interface SendPushConfiguration {
    projectId: string;
    clientIdSub: string;
    deliveryConfig: {
        destinations: Omit<Destination, 'channel'>[];
    } & Omit<DeliveryConfig, 'destinations'>;
}

const sendPush = async (
    accessToken: string,
    requestId: string,
    messageId: number,
    { projectId, clientIdSub, deliveryConfig }: SendPushConfiguration,
): Promise<SmartPushResponse> => {
    const { destinations, ...delivery } = deliveryConfig;
    const body: SmartPushRequest = {
        protocolVersion: 'V1',
        messageName: 'SEND_PUSH',
        messageId,
        payload: {
            sender: {
                projectId,
            },
            recipient: {
                clientId: {
                    idType: 'SUB',
                    id: clientIdSub,
                },
            },
            deliveryConfig: {
                ...delivery,
                destinations: destinations.map(({ surface, ...destination }) => ({
                    ...destination,
                    surface,
                    channel: DefaultChannels[surface],
                })),
            },
        },
    };

    const answer = await fetch(URL, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            Rquid: requestId,
        },
        method: 'post',
        body: JSON.stringify({ requestPayload: body }),
    });

    return answer.json();
};

export const createSmartPushSender = async (
    { clientId, secret }: { clientId: string; secret: string } = {
        clientId: process.env.SMARTPUSH_CLIENTID || '',
        secret: process.env.SMARTPUSH_SECRET || '',
    },
) => {
    if (!clientId || !secret) {
        throw new Error('clientId and secret must be defined');
    }

    const accessTokenReqId = uuidv4();
    const { access_token, message } = await requestAccesToken({
        clientId,
        secret,
        scope: ['SMART_PUSH'],
        requestId: accessTokenReqId,
    });

    if (typeof access_token === 'undefined') {
        throw new Error(
            `Authorization failed. Please, check clientId and secret values. RequestId: ${accessTokenReqId}. ${message}`,
        );
    }

    let messageId = 0;

    return (push: SendPushConfiguration) => sendPush(access_token, uuidv4(), ++messageId, push);
};
