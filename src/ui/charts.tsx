interface LinePoint {
  month: number
  netWorth: number
}

export function LineChart({ data, height = 160 }: { data: LinePoint[]; height?: number }) {
  const width = 520
  if (data.length < 2) {
    return (
      <div className="muted small" style={{ padding: '30px 0', textAlign: 'center' }}>
        Advance a few months to see your net worth trend appear here. 📈
      </div>
    )
  }
  const values = data.map((d) => d.netWorth)
  const min = Math.min(...values, 0)
  const max = Math.max(...values, 1)
  const range = max - min || 1
  const pad = 8
  const stepX = (width - pad * 2) / (data.length - 1)
  const points = data.map((d, i) => {
    const x = pad + i * stepX
    const y = height - pad - ((d.netWorth - min) / range) * (height - pad * 2)
    return { x, y }
  })
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = `${path} L${points[points.length - 1].x.toFixed(1)},${height - pad} L${points[0].x.toFixed(1)},${height - pad} Z`
  const zeroY = height - pad - ((0 - min) / range) * (height - pad * 2)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="chart-wrap" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="nwFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#34d399" stopOpacity="0.34" />
          <stop offset="1" stopColor="#34d399" stopOpacity="0" />
        </linearGradient>
      </defs>
      {min < 0 && max > 0 && (
        <line x1={pad} y1={zeroY} x2={width - pad} y2={zeroY} stroke="rgba(255,255,255,0.14)" strokeDasharray="4 4" />
      )}
      <path d={area} fill="url(#nwFill)" />
      <path d={path} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill="#6ee7b7" />
    </svg>
  )
}

interface Slice {
  label: string
  value: number
  color: string
}

export function Donut({ slices, size = 150 }: { slices: Slice[]; size?: number }) {
  const total = slices.reduce((s, x) => s + x.value, 0)
  const r = size / 2
  const stroke = size * 0.16
  const radius = r - stroke / 2
  const circ = 2 * Math.PI * radius
  let offset = 0

  if (total <= 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={r} cy={r} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
      </svg>
    )
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${r} ${r})`}>
        {slices.map((s, i) => {
          const frac = s.value / total
          const dash = frac * circ
          const el = (
            <circle
              key={i}
              cx={r}
              cy={r}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          )
          offset += dash
          return el
        })}
      </g>
    </svg>
  )
}

export function MiniBars({ values, color = '#38bdf8', height = 40 }: { values: number[]; color?: string; height?: number }) {
  const max = Math.max(...values, 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height }}>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${Math.max(6, (v / max) * height)}px`,
            background: color,
            borderRadius: 3,
            opacity: 0.5 + 0.5 * (v / max),
          }}
        />
      ))}
    </div>
  )
}
