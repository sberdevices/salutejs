import { IziAppState } from './types';

/** @deprecated */
export const createLegacyAction = (item: any) => {
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

export const createLegacyGoToAction = (screen: IziAppState['screen']) =>
    createLegacyAction({
        action: {
            type: 'GOTO',
            payload: {
                screen,
            },
        },
    });
