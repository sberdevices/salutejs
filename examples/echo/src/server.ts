import express from 'express';
import { Server } from 'http';
import { Server as SocketServer } from 'socket.io';
import type { Socket } from 'socket.io';
import next from 'next';
import { NLPRequest, NLPResponse } from '@salutejs/scenario';

const app = express();
const server = new Server(app);
const io = new SocketServer(server);
let socket: Socket;

app.use(express.json());

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

const requestMap: Record<string, (data: NLPResponse) => void> = {};

// socket.io server
io.on('connection', (ioSocket) => {
    socket = ioSocket;

    ioSocket.on('outcoming', (data: NLPResponse) => {
        requestMap[data.messageId](data);
        delete requestMap[data.messageId];
    });
});

nextApp.prepare().then(() => {
    app.post('/hook', async ({ body }: { body: NLPRequest }, response) => {
        const answer: NLPResponse = await new Promise((resolve) => {
            requestMap[body.messageId] = resolve;
            socket.emit('incoming', body);
        });

        response.status(200).json(answer);
    });

    app.get('*', (req, res) => {
        return nextHandler(req, res);
    });

    server.listen(port);
});
