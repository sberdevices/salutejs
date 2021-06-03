import ruPlural from './plural/ru';
import { I18nBaseOptions, I18nOptions, I18nPluralOptions, IPluralForms, KeysetDictionary } from './types/i18n';
import { CharacterId } from './types/systemMessage';

export type PluralFunction = (count: number, params: IPluralForms) => string;

const pluralMap = {
    ru: ruPlural,
};

export type I18nRaw = Array<string | Record<string, unknown> | number | undefined>;
/**
 * Поддерживаемые персонажи.
 */
export type Character = CharacterId;
/**
 * Поддерживаемые языки.
 */
export type Language = keyof typeof pluralMap;
/**
 * Текущий язык
 */
const _lang: Language = 'ru';
/**
 * Язык для замены, если нет перевода для текущего языка
 */
const _defLang: Language = 'ru';
/**
 * Подставляет параметры в шаблон локализационного ключа.
 * Разбирает ключ в массив: 'foo {bar} zoo {too}' => ['foo ', bar, ' zoo ', too]
 *
 * @param template шаблон ключа
 * @param options параметры для подстановки в шаблон
 */
function generateText(template: string, options: I18nBaseOptions): I18nRaw {
    const res: Array<string | number | Record<string, unknown>> = [];
    const len = template.length;
    let pos = 0;

    while (pos < len) {
        const p1 = template.indexOf('{', pos);
        if (p1 === -1) {
            // нет открывающих фигурных скобок - копируем весь остаток строки
            res.push(template.substring(pos));
            return res;
        }

        const p2 = template.indexOf('}', p1);
        if (p2 === -1) {
            res.push(template.substring(pos));
            // edge case: не хватает закрывающей фигурной скобки - копируем весь остаток строки
            // чтобы быть полностью совместимым с оригинальной реализацией, надо сделать
            // res.push(
            //     template.substring(pos, p1),
            //     template.substring(p1 + 1)
            // );
            return res;
        }

        res.push(template.substring(pos, p1));

        const opts = options[template.substring(p1 + 1, p2)];
        if (opts) res.push(opts);

        pos = p2 + 1;
    }

    return res;
}
/**
 * Плюрализует локализационный ключ
 *
 * @param plural формы плюрализации
 * @param options динамические параметры ключа
 */
function generateTextWithPlural(plural: IPluralForms, options: I18nPluralOptions): I18nRaw {
    const pluralizer = pluralMap[_lang] || pluralMap[_defLang];
    const template: string = pluralizer(options.count, plural);

    return generateText(template, options);
}
/**
 * Разбора ключа.
 *
 * @param character текущий персонаж
 * @param keyset словарь с переводами
 * @param key ключ для кейсета
 * @param options динамические параметры ключа
 */
function _i18n(character: Character, keyset: KeysetDictionary, key: string, options: I18nOptions = {}): I18nRaw {
    const keysetKey = (keyset[character] && keyset[character][key]) || keyset.sber[key];

    if (Array.isArray(keysetKey)) {
        return generateText(keysetKey[Math.floor(Math.random() * keysetKey.length)], options);
    }

    if (typeof keysetKey === 'string') {
        return generateText(keysetKey, options);
    }

    if (keysetKey) {
        return generateTextWithPlural(keysetKey, options as I18nPluralOptions);
    }

    return [key];
}
/**
 * Локализация ключей по словарю.
 *
 * @param character текущий персонаж
 * @param keyset словарь с переводами
 * @param key ключ для кейсета
 * @param options динамические параметры ключа
 */
export const i18n = (character: Character = 'sber') => (keyset: KeysetDictionary) => (
    key: string,
    options: I18nOptions = {},
) => _i18n(character, keyset, key, options).join('');
