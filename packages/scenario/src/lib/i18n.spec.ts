import { i18n } from './i18n';

describe('i18n', () => {
    const keysetDict = {
        joy: {
            '{count} яблок': {
                many: '{count} apples',
                none: 'no apples',
                one: '{count} apple',
                some: '{count} apples',
            },
            Пример: 'Example',
            'ул. {street} неподалеку': '{street} st. nearby',
        },
        sber: {
            '{count} яблок у {number} студентов': {
                many: '{count} яблок у {number} студентов',
                none: 'нет яблок',
                one: '{count} яблоко у {number} студентов',
                some: '{count} яблока у {number} студентов',
            },
            Пример: 'Пример',
            'ул. {street} неподалеку': 'ул. {street} совсем рядом',
            'Только СБЕР': 'Только СБЕР',
            Привет: ['Дорый день!', 'Как долго вас не было!'],
        },
    };

    describe('sber (default)', () => {
        it('should handle pluralization', () => {
            const adapterI18n = i18n()(keysetDict);

            expect(adapterI18n('{count} яблок у {number} студентов', { count: 0, number: 42 })).toEqual('нет яблок');
            expect(adapterI18n('{count} яблок у {number} студентов', { count: 1, number: 42 })).toEqual(
                '1 яблоко у 42 студентов',
            );
            expect(adapterI18n('{count} яблок у {number} студентов', { count: 3, number: 42 })).toEqual(
                '3 яблока у 42 студентов',
            );
            expect(adapterI18n('{count} яблок у {number} студентов', { count: 5, number: 42 })).toEqual(
                '5 яблок у 42 студентов',
            );
            expect(adapterI18n('{count} яблок у {number} студентов', { count: 22, number: 42 })).toEqual(
                '22 яблока у 42 студентов',
            );
            expect(adapterI18n('{count} яблок у {number} студентов', { count: 25, number: 42 })).toEqual(
                '25 яблок у 42 студентов',
            );
            expect(adapterI18n('{count} яблок у {number} студентов', { count: 1001, number: 42 })).toEqual(
                '1001 яблоко у 42 студентов',
            );
        });

        it('should get random phrase', () => {
            const adapterI18n = i18n()(keysetDict);
            const phrase = adapterI18n('Привет');

            expect(['Дорый день!', 'Как долго вас не было!'].includes(phrase)).toBeTruthy();
        });
    });

    describe('joy', () => {
        it('should get simple text', () => {
            expect(i18n('joy')(keysetDict)('Пример')).toEqual('Example');
        });

        it('should substitute params', () => {
            expect(i18n('joy')(keysetDict)('ул. {street} неподалеку', { street: 'Тверская' })).toEqual(
                'Тверская st. nearby',
            );
        });

        it('should handle pluralization', () => {
            const adapterI18n = i18n('joy')(keysetDict);

            expect(adapterI18n('{count} яблок', { count: 0 })).toEqual('no apples');
            expect(adapterI18n('{count} яблок', { count: 1 })).toEqual('1 apple');
            expect(adapterI18n('{count} яблок', { count: 2 })).toEqual('2 apples');
            expect(adapterI18n('{count} яблок', { count: 1001 })).toEqual('1001 apple');
        });
    });

    describe('missing translate', () => {
        it('missing in eva', () => {
            expect(i18n('eva')(keysetDict)('Только СБЕР')).toEqual('Только СБЕР');
        });

        it('missing in everywhere', () => {
            expect(i18n('eva')(keysetDict)('Нигде нет перевода')).toEqual('Нигде нет перевода');
        });
    });
});
