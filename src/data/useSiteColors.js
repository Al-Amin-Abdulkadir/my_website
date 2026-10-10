import { useEffect } from 'react'
import { useCmsContent } from './useCmsContent'
import { DEFAULT_COLORS, PALETTE, hexOf } from './palette'

// Paints the public site in the background/text colours chosen in the CMS
// (Admin → Site colours) by setting the two CSS variables everything uses:
// --paper (background) and --ink (text). The in-between shades in globals.css
// are mixed from these two, so they follow along.
//
// The last colours are remembered in this browser, so a returning visitor doesn't
// see the default cream flash before their colours load.
const REMEMBER_KEY = 'siteColors'

export function useSiteColors() {
  const { data, error } = useCmsContent('/api/site-settings')

  // Colours from the CMS are checked before use: if the CMS ever knows a colour
  // name this site doesn't (the two palette lists are separate files), the site
  // falls back to the defaults instead of crashing to a blank page
  const fromCms = data && isKnownPair(data) ? data : null
  const colors = fromCms ?? rememberedColors() ?? DEFAULT_COLORS

  useEffect(() => {
    if (data && !fromCms) console.error('Site colours from the CMS use a colour this site does not know:', data)
    if (error) console.warn('Could not load the site colours, using the last known ones:', error.message)
  }, [data, fromCms, error])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--paper', hexOf(colors.backgroundColor))
    root.style.setProperty('--ink', hexOf(colors.textColor))
    // Phones paint their bars from this tag, not from the page, so it needs the
    // colour too — otherwise the top and bottom of the screen stay the default cream
    const browserBars = document.querySelector('meta[name="theme-color"]')
    const defaultBarColor = browserBars?.content
    browserBars?.setAttribute('content', hexOf(colors.backgroundColor))
    if (fromCms) rememberColors(fromCms)

    // Leaving the public site (e.g. into /admin) puts the default colours back
    return () => {
      root.style.removeProperty('--paper')
      root.style.removeProperty('--ink')
      browserBars?.setAttribute('content', defaultBarColor)
    }
  }, [colors.backgroundColor, colors.textColor, fromCms])
}

// True when both colours are in this site's palette
export function isKnownPair(colors) {
  return PALETTE.some((color) => color.key === colors?.backgroundColor)
    && PALETTE.some((color) => color.key === colors?.textColor)
}

function rememberedColors() {
  try {
    const saved = JSON.parse(localStorage.getItem(REMEMBER_KEY))
    return isKnownPair(saved) ? saved : null      // ignore anything old or unknown
  } catch {
    return null      // nothing saved, or storage blocked (private mode) — use the defaults
  }
}

function rememberColors(colors) {
  try {
    localStorage.setItem(REMEMBER_KEY, JSON.stringify(colors))
  } catch {
    // storage blocked (private mode) — the colours still apply, they just aren't remembered
  }
}
