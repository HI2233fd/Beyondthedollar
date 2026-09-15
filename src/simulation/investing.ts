export type AssetId = 'stock' | 'bond'

export interface MarketAsset {
  id: AssetId
  name: string
  risk: 'high' | 'low'
  price: number
  drift: number
  volatility: number
}

export interface Holdings {
  stock: number
  bond: number
}

export type MarketEventKind = 'spike' | 'crash' | null

export interface PriceStepResult {
  prices: Record<AssetId, number>
  event: MarketEventKind
  eventNote: string | null
}

export const INITIAL_ASSETS: Record<AssetId, MarketAsset> = {
  stock: {
    id: 'stock',
    name: 'Growth Stock ETF',
    risk: 'high',
    price: 48,
    drift: 0.001,
    /** Large daily swings so risk is visible in the phone portfolio. */
    volatility: 0.055,
  },
  bond: {
    id: 'bond',
    name: 'Steady Bond Fund',
    risk: 'low',
    price: 22,
    drift: 0.00035,
    volatility: 0.004,
  },
}

export function portfolioValue(prices: Record<AssetId, number>, holdings: Holdings): number {
  return prices.stock * holdings.stock + prices.bond * holdings.bond
}

function clampPrice(n: number): number {
  return Math.max(1, Math.round(n * 100) / 100)
}

/**
 * One game-day price step.
 * Stocks move hard; bonds stay calm. ~4% chance of a sharp stock spike/crash.
 */
export function stepPrices(
  prices: Record<AssetId, number>,
  assets: Record<AssetId, MarketAsset> = INITIAL_ASSETS,
): PriceStepResult {
  const next = { ...prices }
  let event: MarketEventKind = null
  let eventNote: string | null = null

  // Bond: slow walk
  {
    const a = assets.bond
    const shock = (Math.random() * 2 - 1) * a.volatility
    next.bond = clampPrice(prices.bond * (1 + a.drift + shock))
  }

  // Stock: noisier walk + rare event
  {
    const a = assets.stock
    const roll = Math.random()
    if (roll < 0.02) {
      const pct = 0.12 + Math.random() * 0.08
      next.stock = clampPrice(prices.stock * (1 + pct))
      event = 'spike'
      eventNote = `Market spike: Growth Stock ETF jumped +${Math.round(pct * 100)}% today.`
    } else if (roll < 0.04) {
      const pct = 0.12 + Math.random() * 0.1
      next.stock = clampPrice(prices.stock * (1 - pct))
      event = 'crash'
      eventNote = `Market drop: Growth Stock ETF fell −${Math.round(pct * 100)}% today.`
    } else {
      // Two intra-day shocks so the line feels jumpy vs bonds
      let p = prices.stock
      for (let i = 0; i < 2; i++) {
        const shock = (Math.random() * 2 - 1) * a.volatility
        p = p * (1 + a.drift / 2 + shock)
      }
      next.stock = clampPrice(p)
    }
  }

  return { prices: next, event, eventNote }
}
