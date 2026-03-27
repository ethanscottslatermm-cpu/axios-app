// Shared scrollable history list used across modules

function formatDate(ds) {
  return new Date(ds + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

export default function HistoryList({ rows = [], renderRow, emptyText = 'No history yet.' }) {
  if (!rows.length) {
    return (
      <p style={{
        color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic',
        fontFamily: "'EB Garamond',serif", textAlign: 'center', padding: '20px 0',
      }}>
        {emptyText}
      </p>
    )
  }

  return (
    <div style={{
      maxHeight: 340,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      scrollbarWidth: 'thin',
      scrollbarColor: 'var(--scrollbar) transparent',
    }}>
      {rows.map((row, i) => renderRow(row, i, formatDate))}
    </div>
  )
}
