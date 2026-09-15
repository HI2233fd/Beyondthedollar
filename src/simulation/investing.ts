export type AssetId = 'stock' | 'bond'

export interface MarketAsset {
  id: AssetId
  name: string
  /** Short risk label shown in UI. */
  risk: 'high' | 'low'
  price: number
  /** Typical daily drift (fraction). */
  drift: number
  /** Daily volatility (std-ish fraction). */
  volatility: number
}

export interface Holdings {
  stock: number
  bond: number
}

export const INITIAL_ASSETS: Record<AssetId, MarketAsset> = {
  stock: {
    id: 'stock',
    name: 'Growth Stock ETF',
    risk: 'high',
    price: 48,
    drift: 0.0015,
    volatility: 0.028,
  },
  bond: {
    id: 'bond',
    name: 'Steady Bond Fund',
    risk: 'low',
    price: 22,
    drift: 0.0004,
    volatility: 0.006,
  },
}

export function portfolioValue(prices: Record<AssetId, number>, holdings: Holdings): number {
  return prices.stock * holdings.stock + prices.bond * holdings.bond
}

/** One game-day price step using a simple random walk. */
export function stepPrices(
  prices: Record<AssetId, number>,
  assets: Record<AssetId, MarketAsset> = INITIAL_ASSETS,
): Record<AssetId, number> {
  const next = { ...prices }
  ;(Object.keys(assets) as AssetId[]).forEach((id) => {
    const a = assets[id]
    const shock = (Math.random() * 2 - 1) * a.volatility
    const raw = prices[id] * (1 + a.drift + shock)
    next[id] = Math.max(1, Math.round(raw * 100) / 100)
  })
  return next
}
