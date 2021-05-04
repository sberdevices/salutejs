import { IntentsDict } from '@salutejs/scenario';

const convertToNewFormatMatcher = (rule: string) => {
    return {
        type: 'phrase' as const,
        rule,
    };
};

const intents: IntentsDict = {
    append: {
        matchers: ['добавь', 'хочу'].map(convertToNewFormatMatcher),
        variables: {
            product: {
                required: true,
            },
        },
    },
    remove: {
        matchers: ['удали', 'убери', 'не хочу'].map(convertToNewFormatMatcher),
        variables: {
            product: {
                required: true,
            },
        },
    },
    cart: {
        matchers: ['в корзину', 'покажи корзину', 'перейди в корзину', 'готово'].map(convertToNewFormatMatcher),
    },
    payment: {
        matchers: ['продолжить', 'оплатить'].map(convertToNewFormatMatcher),
    },
};

export default intents;
