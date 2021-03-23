import { SaluteHandler, SaluteRequest } from '../../..';

import config from './config';

type IziRequest = SaluteRequest<{ UIElement?: string; element?: string; number?: string; a?: string }>;
type IziHandler = SaluteHandler<IziRequest>;

const createLegacyAction = (item: any) => {
    return {
        command: {
            type: 'smart_app_data',
            action: {
                ...(item.action || {}),
                payload: { id: item.id, number: item.number, ...item.action?.payload },
            },
        },
    };
};

export const run_app: IziHandler = ({ res }) => {
    res.appendSuggestions(config.suggestions['Screen.MainPage']);
    res.setPronounceText(config.message.HELLO);
};

export const failure: IziHandler = ({ res }) => {
    res.setPronounceText('Я не понимаю');
    res.appendBubble('Я не понимаю');
};

export const openItemIndex: IziHandler = ({ req, res }) => {
    const { screen } = req.state;
    if (screen === 'Screen.TourPage') {
        res.appendSuggestions(config.suggestions['Screen.TourStop']);
    }

    req.state.item_selector.items.forEach((item) => {
        if (item.number === +req.variables.number) {
            res.appendItem(createLegacyAction(item));
        }
    });
};

export const runAudioTour: IziHandler = ({ res }) => {
    res.appendItem(
        createLegacyAction({
            action: {
                type: 'run_audiotour',
            },
        }),
    );
};

export const push: IziHandler = ({ req, res }) => {
    const { id: uiElementId } = JSON.parse(req.variables.UIElement);
    const { id: elementId } = JSON.parse(req.variables.element);
    const item = req.state.item_selector.items.find((item) => item.id === uiElementId);

    const { screen } = req.state;

    if (screen === 'Screen.TourStop' || (screen === 'Screen.TourPage' && elementId === 'run_audiotour')) {
        res.appendSuggestions(config.suggestions['Screen.TourStop']);
    }

    res.appendItem(createLegacyAction(item));
};

export const toMainPageFromMainPage: IziHandler = ({ res }) => {
    res.setPronounceText(config.message.TO_MAIN_PAGE.ON_MAIN_PAGE);
};

export const toMainPageFromTourPage: IziHandler = ({ res }) => {
    res.appendItem(
        createLegacyAction({
            action: {
                type: 'GOTO',
                payload: {
                    screen: config.screen.MainPage,
                },
            },
        }),
    );
};

export const ToMainPageNo: IziHandler = ({ res }) => {
    res.setPronounceText('А жаль');
};

export const toMainPage: IziHandler = ({ res }) => {
    res.setPronounceText(config.message.TO_MAIN_PAGE.CONFIRMATION);
};

export const showAllFromMainPage: IziHandler = ({ res }) => {
    res.setPronounceText(config.message.PAGE_LOADED.ALL_ON_MAIN_PAGE);
};

export const slotFillingIntent: IziHandler = ({ res, req }) => {
    res.setPronounceText(`Вы попросили ${req.variables.a} яблок`);
};
