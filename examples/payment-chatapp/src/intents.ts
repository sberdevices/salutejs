import { IntentsDict } from '@salutejs/scenario';

const convertToNewFormatMatcher = (rule: string) => {
    return {
        type: 'phrase' as const,
        rule,
    };
};

const intents: IntentsDict = {
    append: {
        matchers: ['добавить', 'хотеть'].map(convertToNewFormatMatcher),
        variables: {
            product: {
                required: true,
            },
        },
    },
    remove: {
        matchers: ['удалить', 'убрать', 'не хотеть'].map(convertToNewFormatMatcher),
        variables: {
            product: {
                required: true,
            },
        },
    },
    cart: {
        matchers: ['в корзина', 'показать корзина', 'перейти в корзина', 'готово'].map(convertToNewFormatMatcher),
    },
    payment: {
        matchers: ['продолжить', 'оплатить'].map(convertToNewFormatMatcher),
    },
};

export default intents;
