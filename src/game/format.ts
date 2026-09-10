export const money = (n: number): string => {
  const rounded = Math.round(n)
  const sign = rounded < 0 ? '-' : ''
  return `${sign}$${Math.abs(rounded).toLocaleString('en-US')}`
}

export const moneyCents = (n: number): string =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const pct = (n: number, digits = 0): string => `${(n * 100).toFixed(digits)}%`

export const clamp = (n: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, n))

export const uid = (): string =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3)
