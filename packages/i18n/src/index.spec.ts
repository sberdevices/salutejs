import { CharacterId } from '@salutejs/types';

import { i18n } from '.';

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
    });

    describe('joy', () => {
        it('should get simple text', () => {
            expect(i18n(CharacterId.joy)(keysetDict)('Пример')).toEqual('Example');
        });

        it('should substitute params', () => {
            expect(i18n(CharacterId.joy)(keysetDict)('ул. {street} неподалеку', { street: 'Тверская' })).toEqual(
                'Тверская st. nearby',
            );
        });

        it('should handle pluralization', () => {
            const adapterI18n = i18n(CharacterId.joy)(keysetDict);

            expect(adapterI18n('{count} яблок', { count: 0 })).toEqual('no apples');
            expect(adapterI18n('{count} яблок', { count: 1 })).toEqual('1 apple');
            expect(adapterI18n('{count} яблок', { count: 2 })).toEqual('2 apples');
            expect(adapterI18n('{count} яблок', { count: 1001 })).toEqual('1001 apple');
        });
    });

    describe('missing translate', () => {
        it('missing in athena', () => {
            expect(i18n(CharacterId.athena)(keysetDict)('Только СБЕР')).toEqual('Только СБЕР');
        });

        it('missing in everywhere', () => {
            expect(i18n(CharacterId.athena)(keysetDict)('Нигде нет перевода')).toEqual('Нигде нет перевода');
        });
    });
});
