/**
 * Author: Saad Kamal
 * Public language metadata. Keep this list aligned with fully translated and
 * tested locale files so browser detection never selects an incomplete locale.
 */
export type TextDirection = 'ltr' | 'rtl'

export interface Language {
  code: string
  name: string
  dir: TextDirection
}

const languages: Language[] = [
  { code: 'en', name: 'English', dir: 'ltr' },
]

export default languages
