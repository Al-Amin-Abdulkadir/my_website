// How the Explore page lays out its pieces. Plain functions (no React), so the
// rules are easy to read and test on their own.
//
// The page is a list of "runs":
//   banner  → one piece across the whole page
//   masonry → the pieces between two banners, in columns. Each piece goes into
//             whichever column is shortest so far, so the columns stay roughly
//             even and the newest pieces still read left to right across the top.

// The box shapes the editor can pick, as width / height
export const EXPLORE_SHAPES = {
  natural:   { label: 'Natural (its own shape)' },
  banner:    { label: 'Banner (full width)' },
  a4:        { label: 'A4 portrait', ratio: 210 / 297 },
  portrait:  { label: 'Portrait 4:5', ratio: 4 / 5 },
  square:    { label: 'Square', ratio: 1 },
  landscape: { label: 'Landscape 16:9', ratio: 16 / 9 },
}

export const EXPLORE_CATEGORIES = {
  design:      'Design',
  inspiration: 'Inspiration',
  asset:       'Asset',
}

// A banner keeps its own shape but is never taller than 16:9 — a tall photo set
// as a banner would otherwise fill several screens
const TALLEST_BANNER = 16 / 9

// The piece's box as width / height
export function ratioOf(piece) {
  const fixedRatio = EXPLORE_SHAPES[piece.shape]?.ratio
  if (fixedRatio) return fixedRatio

  // Pieces saved without their size fall back to a square until we know better
  const ownRatio = piece.width && piece.height ? piece.width / piece.height : 1
  return piece.shape === 'banner' ? Math.max(ownRatio, TALLEST_BANNER) : ownRatio
}

// The pieces as runs (see the top of this file). Every piece is kept in its run
// together with its place in the whole list (`index`), for the larger view.
export function layoutRuns(pieces, columnCount) {
  const runs = []
  let columns = null           // the masonry run being filled, if any
  let columnHeights = null

  pieces.forEach((piece, index) => {
    if (piece.shape === 'banner') {
      runs.push({ type: 'banner', piece, index })
      columns = null           // the next piece starts a fresh run under the banner
      return
    }

    if (!columns) {
      columns = Array.from({ length: columnCount }, () => [])
      columnHeights = Array(columnCount).fill(0)
      runs.push({ type: 'masonry', columns })
    }

    // Heights are in "column widths": a square adds 1, an A4 page adds 1.41
    const shortest = columnHeights.indexOf(Math.min(...columnHeights))
    columns[shortest].push({ piece, index })
    columnHeights[shortest] += 1 / ratioOf(piece)
  })

  return runs
}
