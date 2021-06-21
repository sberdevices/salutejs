import { IPluralForms } from '../types/i18n';

export default (count: number, params: IPluralForms): string => {
    const lastNumber = count % 10;
    const lastNumbers = count % 100;

    if (!count) {
        return params.none || '';
    }
    if (lastNumber === 1 && lastNumbers !== 11) {
        return params.one;
    }
    if (lastNumber > 1 && lastNumber < 5 && (lastNumbers < 10 || lastNumbers > 20)) {
        return params.some;
    }

    return params.many || '';
};
