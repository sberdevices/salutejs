
const express = require('express');

const processors = require('./src/processors');

const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());


app.post('/', (req, res) => {
    console.log(req.headers);
    console.log('BODY');
    console.log(req.body);
    res.send({
        'hello': 'world'
    });
});

app.post('/app-connector', (req, res) => {
    console.log(req.headers);
    console.log('BODY');
    console.log(req.body);

    const { body } = req;
    const { messageName, payload } = body;

    const process = processors[messageName];

    if (!process) {
        console.log('Something gone wrong', messageName);
    }


    const extend = process(payload);

    console.log(JSON.stringify(extend));

    const { sessionId, messageId, uuid } = body;
    const { device } = body;

    const response = {
        messageName: 'ANSWER_TO_USER',
        sessionId,
        messageId,
        uuid,
        payload: {
            device,
            emotion: {
                "emotionId": "oups"
            },
            ...extend
        }
    };

    res.send(response);
});


app.get('/ping', (req, res) => {
    res.send('pong\n');
});

app.listen(port, () => {
    console.log('Listening on', port);
});
