import { cs } from './cs';
import { en } from './en';

const dictionaries = {
  cs,
  en,
};

export const getDictionary = (locale: 'cs' | 'en') => dictionaries[locale] ?? dictionaries.cs;
