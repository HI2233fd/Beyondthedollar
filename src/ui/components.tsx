import type { ReactNode } from 'react'

export function StatTile({
  label,
  value,
  sub,
  icon,
  tone,
}: {
  label: string
  value: string
  sub?: string
  icon?: string
  tone?: 'pos' | 'neg'
}) {
  return (
    <div className="stat-tile">
      <div className="lbl">
        {icon && <span>{icon}</span>}
        {label}
      </div>
      <div className={`val ${tone ?? ''}`}>{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  )
}

export function Bar({ value, max = 100, variant }: { value: number; max?: number; variant?: 'warm' | 'cool' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={`bar ${variant ?? ''}`}>
      <span style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>
}

export function Modal({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export function Tag({ children, tone }: { children: ReactNode; tone?: 'good' | 'bad' | 'warn' | 'info' }) {
  return <span className={`tag ${tone ?? ''}`}>{children}</span>
}
