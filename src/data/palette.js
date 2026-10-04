// The muted palette from the redesign (Personal Website Redesign/ColorType), plus pure white.
// The CMS stores colours by `key`; the site turns a key into its colour here.
// (The API accepts exactly these keys — see PaletteColor in cms-api/app/database/schemas.py.)
export const PALETTE = [
  { key: 'white',           name: 'Pure White',      hex: '#FFFFFF' },   // not from the redesign — a plain option
  { key: 'parchment',       name: 'Parchment',       hex: '#F1EDE3' },
  { key: 'old-paper',       name: 'Old Paper',       hex: '#E4DED1' },
  { key: 'weathered-stone', name: 'Weathered Stone', hex: '#CBC2B7' },
  { key: 'stone-grey',      name: 'Stone Grey',      hex: '#77736C' },
  { key: 'warm-charcoal',   name: 'Warm Charcoal',   hex: '#353331' },
  { key: 'obsidian-ink',    name: 'Obsidian Ink',    hex: '#181716' },
  { key: 'dusty-blue',      name: 'Dusty Blue',      hex: '#7E96A3' },
  { key: 'dusty-rose',      name: 'Dusty Rose',      hex: '#B9828F' },
  { key: 'washed-lilac',    name: 'Washed Lilac',    hex: '#AEA5B5' },
  { key: 'faded-ochre',     name: 'Faded Ochre',     hex: '#B39A67' },
  { key: 'faded-plum',      name: 'Faded Plum',      hex: '#897487' },
  { key: 'weathered-teal',  name: 'Weathered Teal',  hex: '#668B87' },
  { key: 'sage-moss',       name: 'Sage Moss',       hex: '#8D9880' },
  { key: 'dried-olive',     name: 'Dried Olive',     hex: '#73795F' },
  { key: 'burnt-clay',      name: 'Burnt Clay',      hex: '#A86F59' },
  { key: 'faded-apricot',   name: 'Faded Apricot',   hex: '#D0A28F' },
]

export const DEFAULT_COLORS = { backgroundColor: 'parchment', textColor: 'obsidian-ink' }

export function hexOf(key) {
  const color = PALETTE.find((entry) => entry.key === key)
  if (!color) throw new Error(`“${key}” isn’t a colour in the palette`)
  return color.hex
}

// How readable text of one colour is on another, as the standard WCAG contrast
// ratio: 1 (identical) up to 21 (black on white). 4.5+ is comfortable for body text.
export function contrastRatio(hexA, hexB) {
  const [lighter, darker] = [luminance(hexA), luminance(hexB)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

// Plain-words verdict for the CMS's readability meter
export function readability(ratio) {
  if (ratio >= 4.5) return { level: 'good', label: 'Easy to read' }
  if (ratio >= 3) return { level: 'okay', label: 'Fine for big headings, hard for small text' }
  return { level: 'poor', label: 'Hard to read — pick colours further apart' }
}

// How bright a colour looks to the eye (0 = black, 1 = white), per the WCAG formula
function luminance(hex) {
  const [red, green, blue] = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
  const linear = (channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue)
}
