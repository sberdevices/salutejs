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
        matchers: ['выполнил', 'сделал'],
        variables: ['note'],
    },
    done_note_action: {
        actionId: 'done',
    },
    delete_note: {
        matchers: ['Удалить', 'Удали'],
        variables: ['note'],
    },
    delete_note_action: {
        actionId: 'delete_note',
    },
    yes: {
        matchers: ['да', 'продолжить'],
    },
    no: {
        matchers: ['нет', 'отменить'],
    },
};
