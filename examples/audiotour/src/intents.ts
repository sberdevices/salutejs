import { createIntents } from '@salutejs/scenario';

const convertToNewFormatMatcher = (rule: string) => {
    return {
        type: 'phrase' as const,
        rule,
    };
};

export const intents = createIntents({
    '/Navigation/OpenItemIndex': {
        matchers: ['покажи', 'открой', 'открой номер'].map(convertToNewFormatMatcher),
        variables: {
            number: {
                required: true,
            },
        },
    },
    '/Izi/RunAudiotour': {
        matchers: [
            'Запустить аудио тур',
            'начать аудио тур',
            'начать воспроизведение',
            'начнем экскурсию',
            'начать аудиотур',
            'Запустить аудиотур',
        ].map(convertToNewFormatMatcher),
    },
    '/Navigation/Push': {
        matchers: ['@UIElement', 'открой @UIElement', 'нажать @UIElement', 'нажми @UIElement'].map(
            convertToNewFormatMatcher,
        ),
    },
    '/Izi/ShowAll': {
        matchers: ['Что еще у тебя есть'].map(convertToNewFormatMatcher),
    },
    '/Izi/ToMainPage': {
        matchers: ['Все экскурсии', 'Покажи все экскурсии'].map(convertToNewFormatMatcher),
    },
    yes: {
        matchers: ['да', 'продолжить'].map(convertToNewFormatMatcher),
    },
    no: {
        matchers: ['нет', 'отменить'].map(convertToNewFormatMatcher),
    },
    '/SlotFillingIntent': {
        matchers: [],
        variables: {
            a: {
                required: true,
                questions: ['Сколько?'],
            },
        },
    },
});
