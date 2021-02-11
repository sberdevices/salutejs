import * as dotenv from 'dotenv';
import util from 'util';

import { CailaRecognizer } from './intents/recognisers/caila';

dotenv.config();

// Пример использования Caila для распознования текста
const caila = new CailaRecognizer(process.env.ACCESS_TOKEN);

caila.inference('Забронировать столик на 2 на завтра').then((response) => {
    console.log(util.inspect(response, false, 10, true));
});
