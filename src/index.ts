import { Request } from 'node-fetch';
import * as dotenv from 'dotenv';
import util from 'util';

import { CailaRecognizer } from './intents/recognisers/caila';

dotenv.config();

// Пример использования Caila для распознования текста
const caila = new CailaRecognizer(process.env.ACCESS_TOKEN);

caila.inference('Забронировать столик на 2 на завтра').then((response) => {
    console.log(util.inspect(response, false, 10, true));
});

const obj = {
    1: 'init',
    2: 'booking',
};

const cb1_2 = (from, to) => {
    // TODO: transition
};

// Context - current session context
const bookCallback = (req: Request, res: Response) => {
    // Process current variant
    const guestNumbers = findGuestNumbers();
    const findBookingDate = findBookingDate();

    if (!guestNumbers || !findBookingDate) {
        // Handle additional info request
    }

    const isAvailable = checkAvailability();

    if (!isAvailable) {
        // handle non available case
    }

    transitionToNextBookingStep(req, res);
};

const graph = {
    run_app: { book: bookCallback },
    vertex1: { vertex2: cb1_2 },
    vertex1: { vertex1: cb_1_1 },
};

const fn = async (req, res) => {
    // req.asr
    // req.prevPath
    // req.sub

    const prevPath = req.prevPath || 'run_app';

    if (prevPath === 'run_app') {
        // INITIALIAZE DIALOG
        // TODO: ...
    }

    // 1. Get intent
    const caila = new CailaRecognizer(process.env.ACCESS_TOKEN);

    const intent = await caila.inference(req.asr);
    const { path } = intent.variants[0].intent;

    const transitionTo = graph[prevPath][path];

    req.context = getCurrentContext();
    req.nextIntent = intent;

    if (transitionTo) {
        // transition
        transitionTo(req, res);
    }

    makeResponse(req, res);
};
