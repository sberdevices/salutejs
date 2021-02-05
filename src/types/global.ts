export interface Features {
    appTypes: string[];
}

export interface Mic {
    available: boolean;
}

export interface Capabilities {
    screen: Mic;
    mic: Mic;
    speak: Mic;
}

export interface IntentMeta {}

export interface Device {
    platformType: string;
    platformVersion: string;
    surface: string;
    surfaceVersion: string;
    features: Features;
    capabilities: Capabilities;
    additionalInfo: IntentMeta;
}
