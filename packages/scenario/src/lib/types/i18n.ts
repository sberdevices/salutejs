export interface IPluralForms {
    one: string;
    some: string;
    many?: string;
    none?: string;
}
export type I18nBaseOptions = Record<string, string | Record<string, unknown> | number | undefined>;
export type I18nPluralOptions = I18nBaseOptions & {
    count: number;
};
export type I18nOptions = I18nBaseOptions | I18nPluralOptions;
export type KeysetKey = string | string[] | IPluralForms;
export type Keyset = Record<string, KeysetKey>;
export type KeysetDictionary = Record<string, Keyset>;
