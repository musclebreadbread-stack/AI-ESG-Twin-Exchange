/**
 * Task 24: i18n — Korean-first, English secondary.
 */

export type Locale = 'ko' | 'en';

export const DEFAULT_LOCALE: Locale = 'ko';
export const SUPPORTED_LOCALES: readonly Locale[] = ['ko', 'en'];

export function isValidLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}

export function getLocaleFromHeader(acceptLanguage?: string): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  if (acceptLanguage.includes('ko')) return 'ko';
  if (acceptLanguage.includes('en')) return 'en';
  return DEFAULT_LOCALE;
}
