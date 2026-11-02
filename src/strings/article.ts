/**
 * The Hungarian definite article for a word or number: 'az' before a vowel sound, otherwise 'a'.
 * Numbers are read aloud from their leading digit group: 1 (egy), 5 (öt), 50 (ötven), 500 (ötszáz)
 * and 1500 (ezerötszáz) start with a vowel; 10 (tíz) and 150 (százötven) do not.
 */
export function article(word: string): 'a' | 'az' {
  const w = word.trimStart()
  const digits = /^\d+/.exec(w)?.[0]
  if (digits) {
    const groupLength = digits.length % 3 || 3 // 1500 → "1", 150 → "150"
    return digits[0] === '5' || (digits[0] === '1' && groupLength === 1) ? 'az' : 'a'
  }
  return /^[aáeéiíoóöőuúüű]/i.test(w) ? 'az' : 'a'
}
