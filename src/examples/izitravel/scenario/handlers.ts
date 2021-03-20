import { SaluteHandler } from '../../..';
import { SaluteRequest } from '../../../types/salute';

const config = {
    screen: {
        MainPage: 'Screen.MainPage',
        TourPage: 'Screen.TourPage',
        TourStop: 'Screen.TourStop',
    },
    message: {
        PAGE_LOADED: {
            ALL_ON_MAIN_PAGE: 'Это пока все аудиогиды. Скоро появятся новые.',
            TourPage: 'Открываю для вас аудиогид',
        },
        ENTITY_NOT_FOUND: 'Пока нет такого аудиогида',
        TO_MAIN_PAGE: {
            ON_MAIN_PAGE: 'Мы уже на главной',
            CONFIRMATION: 'Вы уверены, что хотите перейти на главную?',
        },
        TO_EXHIBIT_PAGE: {
            CONFIRMATION: 'Вы хотите поставить на паузу?',
        },
        HELLO: 'Антоша Лапушка',
    },
    suggestions: {
        'Screen.MainPage': ['Открой первую экскурсию'],
        'Screen.TourPage': ['Начнем экскурсию', 'Покажи содержание', 'Все экскурсии'],
        'Screen.TourStop': ['Play', 'Пауза', 'Следующая остановка', 'Выйти из прослушивания'],
    },
};

export const run_app: SaluteHandler = ({ res, req }) => {
    console.log('run_app');
    res.appendSuggestions(config.suggestions['Screen.MainPage']);
    res.setPronounceText(config.message.HELLO);
};

export const failure: SaluteHandler = ({ res }) => {
    res.setPronounceText('Я не понимаю');
    res.appendBubble('Я не понимаю');
};

interface ReqWithOrder extends SaluteRequest {
    order: number;
}

const createIziAction = (item: any) => {
    return {
        command: {
            type: 'smart_app_data',
            action: {
                // @ts-ignore
                ...(item.action || {}),
                payload: { id: item.id, number: item.number, ...item.action?.payload },
            },
        },
    };
};

export const openItemIndex: SaluteHandler<ReqWithOrder> = ({ req, res }) => {
    const { screen } = req.state;
    if (screen === 'Screen.TourPage') {
        res.appendSuggestions(config.suggestions['Screen.TourStop']);
    }

    req.state.item_selector.items.forEach((item) => {
        if (item.number === +req.variables.number) {
            res.appendItem(createIziAction(item));
        }
    });
};

export const runAudioTour: SaluteHandler = ({ req, res }) => {
    res.appendItem(
        createIziAction({
            action: {
                type: 'run_audiotour',
            },
        }),
    );
};

export const push: SaluteHandler = ({ req, res }) => {
    // @ts-ignore
    const { id: uiElementId } = JSON.parse(req.variables.UIElement);
    // @ts-ignore
    const { id: elementId } = JSON.parse(req.variables.element);
    const item = req.state.item_selector.items.find((item) => item.id === uiElementId);

    const { screen } = req.state;

    if (screen === 'Screen.TourStop' || (screen === 'Screen.TourPage' && elementId === 'run_audiotour')) {
        res.appendSuggestions(config.suggestions['Screen.TourStop']);
    }

    res.appendItem(createIziAction(item));
};

export const toMainPageFromMainPage: SaluteHandler = ({ req, res }) => {
    res.setPronounceText(config.message.TO_MAIN_PAGE.ON_MAIN_PAGE);
};

export const toMainPageFromTourPage: SaluteHandler = ({ req, res }) => {
    res.appendItem(
        createIziAction({
            action: {
                type: 'GOTO',
                payload: {
                    screen: config.screen.MainPage,
                },
            },
        }),
    );
};

export const ToMainPageNo: SaluteHandler = ({ req, res }) => {
    res.setPronounceText('А жаль');
};

export const toMainPage: SaluteHandler = ({ req, res }) => {
    res.setPronounceText(config.message.TO_MAIN_PAGE.CONFIRMATION);
};

export const showAllFromMainPage: SaluteHandler = ({ res }) => {
    res.setPronounceText(config.message.PAGE_LOADED.ALL_ON_MAIN_PAGE);
};

export const showAll: SaluteHandler = (arg) => {
    const { req, res } = arg;
    const { screen } = req.state;

    if (screen === config.screen.MainPage) {
        res.setPronounceText(config.message.PAGE_LOADED.ALL_ON_MAIN_PAGE);
    } else {
        toMainPage(arg);
    }
};
