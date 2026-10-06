const LOWER_WORDS = new Set([
  'da','das','de','do','dos','e','em','na','nas','no','nos','por','para'
])

export function formatName(value = '') {
  const text = String(value).trim().replace(/\s+/g, ' ')
  if (!text) return ''

  return text
    .toLocaleLowerCase('pt-BR')
    .split(' ')
    .map((word, index) => {
      if (index > 0 && LOWER_WORDS.has(word)) return word
      return word.charAt(0).toLocaleUpperCase('pt-BR') + word.slice(1)
    })
    .join(' ')
}
