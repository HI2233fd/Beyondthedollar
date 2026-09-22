/** Progression gates for the just-graduated start arc. */

export const GRADUATION_CASH = 250

/** Savings buffer required before investing unlocks (safety net idea). */
export const INVEST_SAVINGS_MIN = 1200

/** Minimum established credit score for credit card / loan products. */
export const CREDIT_PRODUCT_MIN = 600

/** Car dealership gates. */
export const CAR_CREDIT_MIN = 580
export const CAR_SAVINGS_MIN = 800

/** First score when credit file is created via banking activity. */
export const CREDIT_SCORE_ON_FILE = 560

/** Home gates (also in GameState exports for deals). */
export const HOME_CREDIT_MIN = 640
export const HOME_DOWN_PAYMENT = 15000

/** Summit Office Assistant — geared for ~$300 take-home after 18% tax. */
export const OFFICE_HOURLY = 20
export const OFFICE_HOURS_PER_WEEK = 18.5
/** Gross weekly before tax (~$370). Net ≈ $303 after 18% withholding. */
export const OFFICE_WEEKLY_GROSS = Math.round(OFFICE_HOURLY * OFFICE_HOURS_PER_WEEK)
export const PAYROLL_TAX_RATE = 0.18

/**
 * First payday lands morning of Sept 2 (day index 1 @ 09:00).
 * Calendar epoch is Sept 1 — so new hires on day one get paid the next morning.
 */
export const FIRST_PAYDAY_TOTAL_MINUTES = 1 * 24 * 60 + 9 * 60
