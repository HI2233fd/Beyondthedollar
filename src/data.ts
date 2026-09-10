export type Lesson = {
  icon: string
  title: string
  description: string
  level: string
}

export const lessons: Lesson[] = [
  {
    icon: '💸',
    title: 'Budgeting Basics',
    description:
      'Learn the 50/30/20 rule and build a plan that balances needs, wants, and savings.',
    level: 'Beginner',
  },
  {
    icon: '🏦',
    title: 'Saving & Banking',
    description:
      'Understand checking vs. savings accounts, interest, and why an emergency fund matters.',
    level: 'Beginner',
  },
  {
    icon: '📈',
    title: 'Investing 101',
    description:
      'Explore compound interest, stocks, and index funds — and how time is your biggest advantage.',
    level: 'Intermediate',
  },
  {
    icon: '💳',
    title: 'Credit & Debt',
    description:
      'Decode credit scores, interest rates, and how to use credit responsibly without traps.',
    level: 'Intermediate',
  },
  {
    icon: '🧾',
    title: 'Taxes Made Simple',
    description:
      'See where your paycheck really goes and what a W-2 actually means for your first job.',
    level: 'Intermediate',
  },
  {
    icon: '🎯',
    title: 'Goal Setting',
    description:
      'Turn dreams into SMART money goals — from a new laptop to your first car.',
    level: 'Beginner',
  },
]

export type QuizQuestion = {
  question: string
  options: string[]
  answer: number
  explanation: string
}

export const quizQuestions: QuizQuestion[] = [
  {
    question: 'In the popular 50/30/20 budgeting rule, what does the 20% represent?',
    options: ['Wants', 'Needs', 'Savings & debt payoff', 'Taxes'],
    answer: 2,
    explanation:
      'The 20% is set aside for savings and paying down debt — paying your future self first.',
  },
  {
    question: 'What makes compound interest so powerful over time?',
    options: [
      'You earn interest only on your original deposit',
      'You earn interest on your interest',
      'Banks add bonus money each year',
      'It removes all investment risk',
    ],
    answer: 1,
    explanation:
      'Compound interest means your earnings also earn — so money can snowball the longer it stays invested.',
  },
  {
    question: 'Which habit most helps build a healthy credit score?',
    options: [
      'Maxing out every credit card',
      'Paying bills on time and in full',
      'Opening many cards at once',
      'Never checking your statement',
    ],
    answer: 1,
    explanation:
      'Payment history is the biggest factor in your credit score — on-time payments matter most.',
  },
  {
    question: 'What is an emergency fund for?',
    options: [
      'Buying the latest phone',
      'Unexpected costs like car repairs or medical bills',
      'A vacation you booked in advance',
      'Daily coffee runs',
    ],
    answer: 1,
    explanation:
      'An emergency fund cushions surprise expenses so you do not have to rely on high-interest debt.',
  },
]
