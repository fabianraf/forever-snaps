import 'server-only';
import { DICTIONARY } from '@/app/constants/translations';

export type Locale = 'es' | 'en';

export const getDictionary = async (locale: Locale) => {
    const key = locale.toUpperCase() as keyof typeof DICTIONARY;
    return DICTIONARY[key] || DICTIONARY.ES;
};