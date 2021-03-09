import { IntentsDict } from '../../..';

export const intents: IntentsDict = {
    openItemIndex: {
        matchers: ['покажи', 'открой', 'открой номер'],
        variables: {
            number: {
                required: true,
            },
        },
    },
    yes: {
        matchers: ['да', 'продолжить'],
    },
    no: {
        matchers: ['нет', 'отменить'],
    },
};
