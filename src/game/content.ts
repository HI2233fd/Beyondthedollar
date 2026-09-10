import type {
  Housing,
  Job,
  LifeStage,
  SkillKey,
  Transport,
} from './types'

// ---- City districts & buildings ---------------------------------------

export interface Building {
  id: string
  name: string
  emoji: string
  blurb: string
  action:
    | 'bank'
    | 'housing'
    | 'dealership'
    | 'shopping'
    | 'career'
    | 'invest'
    | 'learn'
    | 'school'
    | 'restaurant'
    | 'civic'
}

export interface District {
  id: string
  name: string
  tagline: string
  emoji: string
  gradient: string
  buildings: Building[]
}

export const CITY: District[] = [
  {
    id: 'downtown',
    name: 'Downtown',
    tagline: 'Skyscrapers, banks, and big opportunities.',
    emoji: '🏙️',
    gradient: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
    buildings: [
      { id: 'firstcity-bank', name: 'FirstCity Bank', emoji: '🏦', blurb: 'Open accounts, manage credit, and take loans.', action: 'bank' },
      { id: 'summit-brokerage', name: 'Summit Brokerage', emoji: '📈', blurb: 'Invest in funds, stocks, and more.', action: 'invest' },
      { id: 'career-tower', name: 'Career Tower', emoji: '💼', blurb: 'Job listings, raises, and side hustles.', action: 'career' },
    ],
  },
  {
    id: 'residential',
    name: 'Suburban / Residential',
    tagline: 'Where you make a place your own.',
    emoji: '🏡',
    gradient: 'linear-gradient(135deg,#34d399,#0ea5e9)',
    buildings: [
      { id: 'maple-leasing', name: 'Maple Leasing Office', emoji: '🔑', blurb: 'Tour apartments and sign a lease.', action: 'housing' },
      { id: 'auto-mile', name: 'Auto Mile Dealership', emoji: '🚗', blurb: 'Buy a car — or choose transit.', action: 'dealership' },
    ],
  },
  {
    id: 'education',
    name: 'Education',
    tagline: 'Skills that unlock new paths.',
    emoji: '🎓',
    gradient: 'linear-gradient(135deg,#a78bfa,#6366f1)',
    buildings: [
      { id: 'central-high', name: 'Central High / Community College', emoji: '🏫', blurb: 'Advance your life stage and study.', action: 'school' },
      { id: 'money-lab', name: 'The Money Lab', emoji: '💡', blurb: 'Interactive lessons on money concepts.', action: 'learn' },
    ],
  },
  {
    id: 'commercial',
    name: 'Commercial',
    tagline: 'Shops, deals, and temptations.',
    emoji: '🛍️',
    gradient: 'linear-gradient(135deg,#fbbf24,#f97316)',
    buildings: [
      { id: 'market-square', name: 'Market Square', emoji: '🛒', blurb: 'Shop for needs and wants.', action: 'shopping' },
      { id: 'the-corner', name: 'The Corner Diner', emoji: '🍔', blurb: 'Eat out, meet friends, spend a little.', action: 'restaurant' },
    ],
  },
  {
    id: 'civic',
    name: 'Civic / Health',
    tagline: 'City hall, clinics, and community.',
    emoji: '🏛️',
    gradient: 'linear-gradient(135deg,#f472b6,#a78bfa)',
    buildings: [
      { id: 'city-hall', name: 'City Hall', emoji: '🏛️', blurb: 'Taxes, benefits, and civic life.', action: 'civic' },
      { id: 'wellness-clinic', name: 'Wellness Clinic', emoji: '🩺', blurb: 'Health matters — and so do medical bills.', action: 'civic' },
    ],
  },
]

// ---- NPCs --------------------------------------------------------------

export interface NPC {
  name: string
  role: string
  emoji: string
  line: string
}

export const NPCS: NPC[] = [
  { name: 'Marcus', role: 'Banker', emoji: '🧑🏾‍💼', line: '“A good credit score opens doors you can’t see yet.”' },
  { name: 'Rosa', role: 'Landlord', emoji: '👩🏻‍🦰', line: '“Rent’s due the 1st. Pay on time and we’ll get along great.”' },
  { name: 'Dev', role: 'Coworker', emoji: '🧑🏽', line: '“I put 15% in the index fund every check and forget about it.”' },
  { name: 'Aisha', role: 'Career Coach', emoji: '👩🏽‍💼', line: '“Ask for the raise. The worst they say is not yet.”' },
  { name: 'Leo', role: 'Friend', emoji: '🧑🏼', line: '“Road trip this weekend? It’s only like… a few hundred bucks?”' },
]

// ---- Jobs --------------------------------------------------------------

export const JOBS: Job[] = [
  { id: 'barista', title: 'Barista', employer: 'Bean Scene', hourlyWage: 15, hoursPerWeek: 15, stage: 'highSchool', benefits: 'Free coffee, flexible hours' },
  { id: 'retail', title: 'Retail Associate', employer: 'Market Square', hourlyWage: 14, hoursPerWeek: 18, stage: 'highSchool', benefits: 'Employee discount' },
  { id: 'tutor', title: 'Peer Tutor', employer: 'Central High', hourlyWage: 20, hoursPerWeek: 8, stage: 'highSchool', requiresConcept: 'budgeting', benefits: 'Looks great on applications' },
  { id: 'intern', title: 'Marketing Intern', employer: 'Summit Media', hourlyWage: 19, hoursPerWeek: 25, stage: 'college', benefits: 'Resume gold' },
  { id: 'server', title: 'Restaurant Server', employer: 'The Corner Diner', hourlyWage: 12, hoursPerWeek: 28, stage: 'college', benefits: 'Tips can be big' },
  { id: 'itsupport', title: 'IT Support', employer: 'FirstCity Bank', hourlyWage: 26, hoursPerWeek: 40, stage: 'firstJob', benefits: 'Health insurance, 401(k) match' },
  { id: 'nurse', title: 'Junior Nurse', employer: 'Wellness Clinic', hourlyWage: 34, hoursPerWeek: 40, stage: 'firstJob', requiresConcept: 'compound', benefits: 'Great benefits' },
  { id: 'analyst', title: 'Financial Analyst', employer: 'Summit Brokerage', hourlyWage: 42, hoursPerWeek: 45, stage: 'careerGrowth', requiresConcept: 'diversification', benefits: 'Bonuses, stock options' },
  { id: 'manager', title: 'Operations Manager', employer: 'Market Square', hourlyWage: 48, hoursPerWeek: 45, stage: 'careerGrowth', benefits: 'Leadership track' },
  { id: 'founder', title: 'Startup Founder', employer: 'Self-employed', hourlyWage: 60, hoursPerWeek: 55, stage: 'entrepreneurship', requiresConcept: 'risk', benefits: 'Unlimited upside & risk' },
]

export const SIDE_HUSTLES = [
  { id: 'reselling', name: 'Online Reselling', monthly: 180, note: 'Flip thrift finds for profit.' },
  { id: 'freelance', name: 'Freelance Design', monthly: 320, note: 'Sell your creative skills.' },
  { id: 'dogwalk', name: 'Dog Walking', monthly: 140, note: 'Steady, low effort.' },
  { id: 'content', name: 'Content Creator', monthly: 260, note: 'Unpredictable but scalable.' },
]

// ---- Housing -----------------------------------------------------------

export const HOUSING: Housing[] = [
  { id: 'family', name: 'Family Home', district: 'Residential', monthlyRent: 0, quality: 2, deposit: 0, description: 'Live with family. Free, but limited independence.' },
  { id: 'studio-shared', name: 'Shared Studio', district: 'Downtown', monthlyRent: 620, quality: 2, deposit: 620, description: 'Split a small studio with a roommate.' },
  { id: 'one-bed', name: '1-Bed Apartment', district: 'Residential', monthlyRent: 1150, quality: 3, deposit: 1150, description: 'Your own place with a real kitchen.' },
  { id: 'loft', name: 'Downtown Loft', district: 'Downtown', monthlyRent: 1850, quality: 5, deposit: 1850, description: 'Stylish, central, and pricey.' },
]

// ---- Transport ---------------------------------------------------------

export const TRANSPORT: Transport[] = [
  { id: 'walk', name: 'Walk & Bike', type: 'none', price: 0, monthlyCost: 0, reliability: 2, description: 'Free and healthy, but slow and weather-dependent.' },
  { id: 'transit', name: 'Transit Pass', type: 'transit', price: 0, monthlyCost: 70, reliability: 4, description: 'Reliable city transit for a flat monthly fee.' },
  { id: 'beater', name: 'Used Sedan ($4,000)', type: 'used', price: 4000, monthlyCost: 190, reliability: 3, description: 'Freedom on wheels — with repair surprises.' },
  { id: 'newcar', name: 'New SUV ($32,000)', type: 'new', price: 32000, monthlyCost: 560, reliability: 5, description: 'Shiny, reliable, and a big monthly payment.' },
]

// ---- Concepts (learning) ----------------------------------------------

export interface Concept {
  id: string
  title: string
  skill: SkillKey
  short: string
  body: string
  emoji: string
}

export const CONCEPTS: Concept[] = [
  { id: 'budgeting', title: 'Budgeting & the 50/30/20 Rule', skill: 'budgeting', emoji: '🧮', short: 'Give every dollar a job.', body: 'A budget splits income into needs (50%), wants (30%), and savings/debt (20%). It is a plan, not a punishment — it tells your money where to go instead of wondering where it went.' },
  { id: 'emergencyfund', title: 'Emergency Fund', skill: 'saving', emoji: '🛟', short: '3–6 months of expenses in cash.', body: 'An emergency fund is money set aside for surprises — car repairs, medical bills, lost income. It keeps a bad week from becoming high-interest debt.' },
  { id: 'compound', title: 'Compound Interest', skill: 'investing', emoji: '🌱', short: 'Interest earning interest.', body: 'When your earnings also earn, money snowballs. Starting early beats starting big: time is the most powerful ingredient in investing.' },
  { id: 'apr', title: 'APR & Interest', skill: 'debt', emoji: '💳', short: 'The yearly price of borrowing.', body: 'APR is the annual cost of a loan or card balance. A 24% APR card balance grows fast — paying only the minimum can take years and cost more than you borrowed.' },
  { id: 'creditscore', title: 'Credit Scores', skill: 'credit', emoji: '📊', short: 'Your borrowing reputation.', body: 'A credit score (300–850) predicts how reliably you repay. On-time payments and low utilization (under 30%) build it. It affects loans, apartments, even jobs.' },
  { id: 'diversification', title: 'Diversification', skill: 'investing', emoji: '🧺', short: 'Don’t put all eggs in one basket.', body: 'Spreading money across many investments lowers risk. An index fund does this instantly by holding hundreds of companies at once.' },
  { id: 'risk', title: 'Risk vs. Reward', skill: 'investing', emoji: '⚖️', short: 'Higher potential reward = higher risk.', body: 'Safe assets grow slowly; risky ones swing wildly. Match your risk to your timeline and how much loss you can stomach.' },
  { id: 'taxes', title: 'How Taxes Work', skill: 'budgeting', emoji: '🧾', short: 'Gross vs. take-home pay.', body: 'Your paycheck is smaller than your wage because of taxes: FICA (Social Security + Medicare), plus federal and state income tax. Budget from net pay, not gross.' },
  { id: 'raise', title: 'Negotiating & Raises', skill: 'career', emoji: '📈', short: 'Your income is your biggest tool.', body: 'Growing income often matters more than cutting lattes. Learning skills, switching jobs, and asking for raises compound over a career.' },
]

// ---- Achievements ------------------------------------------------------

export interface Achievement {
  id: string
  title: string
  desc: string
  emoji: string
  xp: number
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'firstaccount', title: 'Banked', desc: 'Open your first savings account.', emoji: '🏦', xp: 40 },
  { id: 'firstjob', title: 'On the Payroll', desc: 'Land your first job.', emoji: '💼', xp: 50 },
  { id: 'firstinvest', title: 'Investor', desc: 'Make your first investment.', emoji: '📈', xp: 60 },
  { id: 'efund', title: 'Safety Net', desc: 'Build a $1,000 emergency fund.', emoji: '🛟', xp: 80 },
  { id: 'debtfree', title: 'Debt Slayer', desc: 'Pay off a loan or card completely.', emoji: '⚔️', xp: 90 },
  { id: 'credit700', title: 'Trusted', desc: 'Reach a 700+ credit score.', emoji: '📊', xp: 100 },
  { id: 'net10k', title: 'Five Figures', desc: 'Reach $10,000 net worth.', emoji: '💎', xp: 120 },
  { id: 'scholar', title: 'Money Scholar', desc: 'Learn 6 money concepts.', emoji: '🎓', xp: 100 },
  { id: 'stage', title: 'Growing Up', desc: 'Advance to a new life stage.', emoji: '🌟', xp: 70 },
]

// ---- Challenges --------------------------------------------------------

export interface Challenge {
  id: string
  title: string
  desc: string
  emoji: string
  target: number
  unit: string
  xp: number
}

export const CHALLENGES: Challenge[] = [
  { id: 'save1000', title: 'First $1,000', desc: 'Grow your savings to $1,000.', emoji: '🐷', target: 1000, unit: '$', xp: 80 },
  { id: 'invest500', title: 'Get Invested', desc: 'Put $500 into investments.', emoji: '🌱', target: 500, unit: '$', xp: 70 },
  { id: 'learn5', title: 'Curious Mind', desc: 'Learn 5 money concepts.', emoji: '💡', target: 5, unit: 'concepts', xp: 90 },
  { id: 'survive12', title: 'A Year of Life', desc: 'Reach month 12 solvent.', emoji: '📅', target: 12, unit: 'months', xp: 100 },
  { id: 'net5k', title: 'Building Wealth', desc: 'Reach $5,000 net worth.', emoji: '💰', target: 5000, unit: '$', xp: 110 },
]

// ---- Leaderboard NPCs --------------------------------------------------

export const LEADERBOARD_NPCS = [
  { name: 'Jordan_M', avatar: '🦊', xp: 2400 },
  { name: 'PennyWise', avatar: '🦉', xp: 1980 },
  { name: 'InvestKid', avatar: '🐢', xp: 1610 },
  { name: 'BudgetBoss', avatar: '🐝', xp: 1240 },
  { name: 'SaverSam', avatar: '🦫', xp: 890 },
  { name: 'CashKween', avatar: '🐬', xp: 640 },
  { name: 'NewbieNate', avatar: '🐣', xp: 220 },
]

export const AVATARS = ['🦊', '🐨', '🦉', '🐢', '🐬', '🦁', '🐼', '🦄', '🐙', '🦋', '🐝', '🦫']

export const TRAITS: { id: string; label: string; desc: string }[] = [
  { id: 'saver', label: 'Natural Saver', desc: 'You start with a bit more cash and savings instincts.' },
  { id: 'hustler', label: 'Go-Getter', desc: 'Side hustles earn you a little more.' },
  { id: 'scholar', label: 'Quick Learner', desc: 'You start already knowing budgeting.' },
  { id: 'dreamer', label: 'Big Dreamer', desc: 'You aim high — bigger risks, bigger goals.' },
]

export const STAGE_ORDER: LifeStage[] = [
  'highSchool',
  'college',
  'firstJob',
  'careerGrowth',
  'entrepreneurship',
]
