import { AppState, SaluteRequest, SaluteHandler, SaluteRequestVariable } from '@salutejs/scenario';

export interface IziAppState extends AppState {
    screen?: 'Screen.MainPage' | 'Screen.TourPage' | 'Screen.TourStop';
}

export interface IziItentsVariables extends SaluteRequestVariable {
    UIElement?: string;
    element?: string;
    number?: string;
    a?: string;
    phrase?: string;
}

export type IziRequest = SaluteRequest<IziItentsVariables, IziAppState>;
export type IziHandler = SaluteHandler<IziRequest>;
