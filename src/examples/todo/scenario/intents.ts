import { IntentsDict } from '../../../types/salute';

export const intents: IntentsDict = {
    add_note: {
        matchers: [
            'добавить',
            'установить',
            // 'запиши',
            'записать',
            'поставь',
            'закинь',
            'напомнить',
            'напоминание',
            'заметка',
            'задание',
            'задача',
        ],
        variables: {
            note: {
                required: true,
                questions: ['Не поняла, повторите, пожалуйста'],
            },
        },
    },
    done_note: {
        action: 'done',
        matchers: ['выполнил', 'сделал'],
        variables: {
            note: {
                required: true,
                questions: ['Не поняла, повторите, пожалуйста'],
            },
        },
    },
    delete_note: {
        action: 'delete_note',
        matchers: ['Удалить', 'Удали'],
        variables: {
            note: {
                required: true,
                questions: ['Не поняла, повторите, пожалуйста'],
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
