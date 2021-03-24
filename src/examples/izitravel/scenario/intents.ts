import { IntentsDict } from '../../..';

export const intents: IntentsDict = {
    'Navigation/OpenItemIndex': {
        matchers: ['покажи', 'открой', 'открой номер'],
        variables: {
            number: {
                required: true,
            },
        },
    },
    'Izi/RunAudiotour': {
        matchers: [
            'Запустить аудио тур',
            'начать аудио тур',
            'начать воспроизведение',
            'начнем экскурсию',
            'начать аудиотур',
            'Запустить аудиотур',
        ],
    },
    'Navigation/Push': {
        matchers: ['@UIElement', 'открой @UIElement', 'нажать @UIElement', 'нажми @UIElement'],
    },
    'Izi/ShowAll': {
        matchers: ['Что еще у тебя есть'],
    },
    'Izi/ToMainPage': {
        matchers: ['Все экскурсии', 'Покажи все экскурсии'],
    },
    yes: {
        matchers: ['да', 'продолжить'],
    },
    no: {
        matchers: ['нет', 'отменить'],
    },
    SlotFillingIntent: {
        matchers: [],
        variables: {
            a: {
                required: true,
                questions: ['Сколько?'],
            },
        },
    },
};
