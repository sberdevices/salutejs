import { useEffect } from 'react';
import io from 'socket.io-client';
import { NLPRequest, NLPResponse } from '@salutejs/scenario';

const ioSocket = io();

export const useTransport = (cb: (request: NLPRequest, sendRequest: (response: NLPResponse) => void) => void) => {
    useEffect(() => {
        ioSocket.on('incoming', (request: NLPRequest) => {
            cb(request, (response: NLPResponse) => {
                ioSocket.emit('outcoming', response);
            });
        });

        return function useSocketCleanup() {
            ioSocket.off('incoming', cb);
        };
    }, [cb]);
};
