interface Record {
    id: number;
    type: 'synonyms' | 'pattern';
    rule: string[];
    value: string;
}

interface EntityEntity {
    id: number;
    name: string;
    enabled: boolean;
    type: string;
    priority: number;
    noSpelling: boolean;
    noMorph: boolean;
}

interface ProjectDataEntity {
    entity: EntityEntity;
    records: Record[];
}

interface PhraseEntity {
    entity: string;
    slot: string;
    startPos: number;
    endPos: number;
    text: string;
    value: string;
    default: boolean;
    system: boolean;
    entityId: number;
}

export interface Phrase {
    text: string;
    entities: PhraseEntity[] | null;
    stagedPhraseIdx: number | null;
}

interface Slot {
    name: string;
    entity?: string;
    required?: boolean;
    prompts?: string[];
    array?: boolean;
}

export interface Intent {
    id: number;
    path: string;
    description: string | null;
    answer: string | null;
    customData: string | null;
    enabled: boolean;
    phrases: Phrase[];
    patterns: string[];
    slots: Slot[] | null;
}

interface Project {
    id: string;
    name: string;
    folder: string;
}

interface MlpsClassifierSettingsClass {}

interface ExtendedSettings {
    patternsEnabled: boolean | null;
    tokenizerEngine: string;
    stsSettings?: MlpsClassifierSettingsClass;
    mlpsClassifierSettings?: MlpsClassifierSettingsClass;
}

interface Settings {
    language: string;
    spellingCorrection: boolean;
    classificationAlgorithm: string;
    timezone: string;
    extendedSettings: ExtendedSettings;
}

export interface ProjectData {
    project: Project;
    settings: Settings;
    intents: Intent[];
    entities: ProjectDataEntity[];
    enabledSystemEntities: string[];
}
