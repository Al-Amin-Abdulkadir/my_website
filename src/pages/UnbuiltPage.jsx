// Shown on routes whose new design hasn't been built yet (or whose content
// Alamin hasn't handed over). Deliberately plain — no old-site layout.
export default function UnbuiltPage({ name }) {
  return (
    <main style={s.page}>
      <p style={s.name}>{name}</p>
      <p style={s.note}>Being rebuilt from the new designs</p>
    </main>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '120px 20px',
    textAlign: 'center',
  },
  name: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'var(--text-xl)',
  },
  note: {
    fontFamily: 'var(--font-ui)',
    fontSize: 'var(--text-sm)',
    color: 'var(--ink-muted)',
  },
}
