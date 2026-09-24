import { q, quiz } from './helpers'
import type { Unit } from '../types'

export const UNITS_PART_2: Unit[] = [
  {
    id: 'unit-12',
    number: 12,
    title: 'Budgeting Your Money',
    summary:
      'Learn how to plan where your money goes so paychecks, groceries, and goals all fit together.',
    buildingId: 'grocery',
    topics: [
      {
        id: 'unit-12-t1',
        title: 'Building a Simple Budget',
        summary:
          'A budget is a written plan for your income and spending—start with needs, wants, and savings.',
        lesson: {
          id: 'unit-12-l1',
          title: 'Your First Money Plan',
          body: `A budget is a written plan that shows the money you expect to receive and the money you plan to spend over a set period, such as a week or a month. Think of it as a map: without one, it is easy to wander into overspending and wonder where your paycheck went. With a budget, you decide in advance how each dollar will be used.

Start by listing your income. Income is money you receive, such as pay from a first job, tips, or a regular allowance. Use take-home pay—the amount that actually lands in your bank account after taxes and other deductions—because that is what you can spend. If your hours change from week to week, average a few recent pay stubs so your plan is realistic.

Next, list expenses. Expenses are the things you pay for. Split them into needs and wants. Needs are essentials you must cover to live safely and keep agreements you have made: rent for a first apartment, groceries, bus fare or gas to get to work, phone service if you rely on it for work and school, and minimum payments on any debt. Wants are nice-to-haves: streaming subscriptions, eating out with friends, new sneakers when you already have shoes that work. Both categories matter; the goal is not to erase fun, but to choose fun on purpose.

A practical starter method is the idea of giving every dollar a job. After you write down income, assign dollars to needs first, then to savings, then to wants. Savings is money you set aside for later—an emergency fund for a surprise car repair, or a goal like a deposit on an apartment. Even a small automatic transfer on payday builds the habit.

Track your spending for two weeks. Keep receipts from the grocery store, note card swipes, and check your banking app. Compare what you planned with what actually happened. If groceries ran higher than expected, adjust next month’s grocery line instead of pretending the plan was perfect. A budget that never changes is usually a budget that is ignored.

When money is tight, cut wants before you cut needs, and look for cheaper ways to meet needs—store brands, meal planning, or a cheaper transit pass. Review your budget whenever your income or living situation changes. The point is progress, not perfection: a simple plan you update beats a complicated spreadsheet you abandon.`,
          whyItMatters:
            'A clear budget turns a confusing paycheck into choices you control—rent, food, savings, and the fun you can actually afford.',
          quiz: quiz('unit-12-q1', 'Budgeting Basics', [
            q(
              'unit-12-q1-a',
              'What is a budget?',
              [
                'A written plan for expected income and planned spending',
                'A loan from a bank that you never repay',
                'A list of only the things you want to buy',
                'A tax form your employer fills out for you',
              ],
              0,
              'A budget maps income and spending so you decide where money goes before it disappears.',
            ),
            q(
              'unit-12-q1-b',
              'When building a budget, which income figure should you use?',
              [
                'Your take-home pay after taxes and deductions',
                'Your hourly wage before any taxes',
                'The highest paycheck you might earn someday',
                'Your friend’s income, so you can match their lifestyle',
              ],
              0,
              'Take-home pay is what you can actually spend; budgeting with pre-tax pay overstates your money.',
            ),
            q(
              'unit-12-q1-c',
              'Which of these is best classified as a need for someone renting a first apartment?',
              [
                'Monthly rent and basic groceries',
                'A new gaming console on release day',
                'Daily coffee-shop drinks',
                'Concert tickets every weekend',
              ],
              0,
              'Rent and basic food keep you housed and healthy; entertainment purchases are usually wants.',
            ),
            q(
              'unit-12-q1-d',
              'What should you do if your actual grocery spending is higher than your budget?',
              [
                'Adjust the grocery line next period and review your shopping habits',
                'Delete the budget and stop tracking money',
                'Ignore the difference because budgets never change',
                'Skip paying rent so the grocery line looks correct',
              ],
              0,
              'Budgets work when you update them with real numbers and fix the plan, not when you hide from them.',
            ),
          ]),
        },
      },
    ],
  },
  {
    id: 'unit-13',
    number: 13,
    title: 'Smart Spending',
    summary:
      'Compare prices, spot marketing tricks, and decide when a purchase is worth the cost.',
    buildingId: 'grocery',
    topics: [
      {
        id: 'unit-13-t1',
        title: 'Getting More Value From Every Dollar',
        summary:
          'Smart spending means comparing options, understanding unit prices, and pausing before impulse buys.',
        lesson: {
          id: 'unit-13-l1',
          title: 'Think Before You Swipe',
          body: `Smart spending is the habit of choosing purchases that give you solid value for the money you give up. Value does not always mean the cheapest item. It means the option that best fits your needs, quality expectations, and budget after you compare alternatives.

At the grocery store, start with a list based on meals you will actually cook. Lists reduce impulse buys—those unplanned items that jump into the cart because they are near the checkout or on a bright endcap. Marketing is designed to nudge you; your list is designed to protect your plan. Check unit price, which is the cost per ounce, per pound, or per count shown on the shelf tag. A giant box can cost more per ounce than a smaller one, and a store brand often matches the national brand for staples like rice, beans, and cleaning supplies.

Before any non-urgent purchase—new headphones, a second streaming service, a trendy jacket—use a short pause. Ask: Do I need this, or am I bored or stressed? Will I still want it in a week? Can I borrow, wait for a sale, or buy used? A twenty-four-hour rule for wants over a set dollar amount gives emotions time to cool so your future self does not regret the swipe.

Watch for common pricing tricks. A “sale” may still be expensive compared with another store. “Buy one, get one” only helps if you would have bought at least one and can use the second before it expires. Subscriptions renew automatically; calendar reminders before free trials end prevent surprise charges on a first credit card statement.

Quality matters for things you use daily or that affect safety. Cheap shoes that fall apart in a month can cost more over a year than a sturdier pair. For rare-use tools, renting or borrowing may beat buying. For food, wasting groceries you never cook is as expensive as overpaying.

Compare total cost, not just sticker price. A bargain across town that burns a tank of gas may not be a bargain. Delivery fees and tips can erase grocery “savings.” When you pay with a credit card, only spend what you can repay by the due date so interest does not raise the real price.

Smart spending is not about guilt. It is about matching your money to your priorities so the things you buy support the life you are building—steady meals, reliable gear, and room left for goals.`,
          whyItMatters:
            'Thoughtful spending stretches a first paycheck further and keeps impulse buys from quietly wrecking your budget.',
          quiz: quiz('unit-13-q1', 'Smart Spending Check', [
            q(
              'unit-13-q1-a',
              'What does unit price help you compare at the grocery store?',
              [
                'Cost per ounce, pound, or count so different package sizes are fair to compare',
                'Which product has the brightest packaging',
                'How many loyalty points a celebrity endorses',
                'Whether the store accepts only cash',
              ],
              0,
              'Unit price levels the comparison so a big box is not automatically the better deal.',
            ),
            q(
              'unit-13-q1-b',
              'What is an impulse buy?',
              [
                'An unplanned purchase made in the moment, often nudged by displays or emotion',
                'A bill you scheduled weeks in advance',
                'Rent paid on the first of the month',
                'A deposit into a savings account',
              ],
              0,
              'Impulse buys skip the planning step; lists and pause rules help you avoid them.',
            ),
            q(
              'unit-13-q1-c',
              'When is “buy one, get one” most likely a smart deal?',
              [
                'When you already needed at least one and can use the free item before it goes bad',
                'Whenever a sign is red, no matter what you already own',
                'Only if you throw the second item away immediately',
                'When the product is something you dislike but feels free',
              ],
              0,
              'Free extras only save money if they replace spending you would have done and do not go to waste.',
            ),
            q(
              'unit-13-q1-d',
              'Why should you consider total cost, not only the sticker price?',
              [
                'Fees, travel, tips, and credit interest can make a “cheap” option more expensive overall',
                'Sticker prices are illegal to print',
                'Total cost always ignores quality',
                'Banks refuse to let you compare prices',
              ],
              0,
              'Gas, delivery fees, and interest change what you truly pay—compare the full picture.',
            ),
          ]),
        },
      },
    ],
  },
  {
    id: 'unit-14',
    number: 14,
    title: 'Investing Fundamentals',
    summary:
      'Understand what investing is, how risk and time connect, and why starting small can matter.',
    buildingId: 'office',
    topics: [
      {
        id: 'unit-14-t1',
        title: 'What Investing Really Means',
        summary:
          'Investing means using money to buy assets that may grow over time—after you cover emergencies and high-interest debt.',
        lesson: {
          id: 'unit-14-l1',
          title: 'Growing Money Over Time',
          body: `Investing means using money you will not need right away to buy assets—things that can grow in value or pay you income over time. Common investment assets include shares of companies, bonds, and funds that hold many investments at once. Investing is different from saving. Saving keeps money safe and available for near-term needs, usually in a bank account. Investing accepts some risk of ups and downs in exchange for a chance at higher long-term growth.

Before you invest, cover basics. Build a small emergency fund—cash set aside for surprises like a lost shift or a broken phone—so you are not forced to sell investments at a bad moment. If you carry a high-interest credit card balance from a first card, paying that down often beats investing new money, because interest charges can grow faster than typical market returns.

Risk is the chance that an investment’s value will drop or that you will earn less than you hoped. In general, investments with higher potential returns come with higher risk. Time horizon is how long you plan to leave the money invested. A teen investing for retirement decades away can usually tolerate more short-term swings than someone who needs the money next year for an apartment deposit.

Compound growth is the idea that earnings can generate their own earnings. If your investment gains value and those gains stay invested, future growth can apply to a larger amount. Starting early—even with small amounts from a first job—gives compounding more years to work. Waiting for a “perfect” lump sum often costs more in lost time than it saves in confidence.

Diversification means spreading money across different investments so one bad result hurts less. Putting every spare dollar into a single company’s stock is riskier than owning a broad mix. Costs matter too: account fees and fund expenses quietly reduce returns, so lower-cost options are often wiser for beginners.

Investing is not a lottery ticket and not a get-rich-quick chat tip. It is a long game built on goals, patience, and learning. Start by understanding accounts you may use later—such as a workplace retirement plan when you get a full-time job—and by practicing with education before you commit money you cannot afford to lose.`,
          whyItMatters:
            'Knowing how investing differs from saving helps you grow future goals without gambling money you need today.',
          quiz: quiz('unit-14-q1', 'Investing Fundamentals Quiz', [
            q(
              'unit-14-q1-a',
              'How does investing differ from saving in a bank account?',
              [
                'Investing buys assets that may grow over time but can rise and fall in value',
                'Investing always guarantees you cannot lose money',
                'Saving is illegal once you turn eighteen',
                'Investing means spending cash on daily groceries',
              ],
              0,
              'Saving prioritizes safety and access; investing trades some risk for long-term growth potential.',
            ),
            q(
              'unit-14-q1-b',
              'What should you usually do before investing money you might need soon?',
              [
                'Build an emergency fund and address high-interest credit card debt',
                'Buy as many single stocks as possible the same day',
                'Ignore your budget because investing replaces planning',
                'Lend your rent money to a stranger online',
              ],
              0,
              'Cash reserves and crushing high-interest debt protect you so investing stays long-term.',
            ),
            q(
              'unit-14-q1-c',
              'What is diversification?',
              [
                'Spreading money across different investments so one loss hurts less',
                'Putting your entire paycheck into one company’s stock',
                'Spending only on wants and never on needs',
                'Closing your bank account before payday',
              ],
              0,
              'Diversification reduces the damage from any single investment going poorly.',
            ),
            q(
              'unit-14-q1-d',
              'Why can starting to invest early with small amounts still help?',
              [
                'Compound growth has more years to build on prior earnings',
                'Early investing removes all risk forever',
                'Banks refuse deposits from young workers',
                'Small amounts automatically become loans',
              ],
              0,
              'Time lets earnings potentially generate more earnings; waiting delays that clock.',
            ),
          ]),
        },
      },
    ],
  },
  {
    id: 'unit-15',
    number: 15,
    title: 'Stocks, Bonds, and Funds',
    summary:
      'Learn what stocks, bonds, and funds are and how each fits different goals and risk levels.',
    buildingId: 'office',
    topics: [
      {
        id: 'unit-15-t1',
        title: 'The Building Blocks of Portfolios',
        summary:
          'Stocks are ownership, bonds are loans, and funds package many investments into one purchase.',
        lesson: {
          id: 'unit-15-l1',
          title: 'Stocks, Bonds, and Funds Explained',
          body: `Once you know why people invest, the next step is understanding the main building blocks you will hear about: stocks, bonds, and funds.

A stock is a small ownership slice of a company. If you buy stock, you become a shareholder. Shareholders may benefit if the company grows and the share price rises, and some companies pay dividends—cash distributions of profits. Stock prices can jump or drop on news, earnings, or market moods. Owning stock in one company ties your results closely to that firm’s success or failure, which is why a single stock from a hot tip can be risky for a beginner.

A bond is a loan you make to a government or company. In return, the issuer typically promises to pay interest over time and to repay the principal—the original amount—on a set date. Bonds are often described as steadier than stocks, but they are not risk-free. If interest rates rise, existing bonds can lose market value. If an issuer gets into deep trouble, it might miss payments. Still, many people use bonds to balance a mix that also includes stocks.

A fund pools money from many investors to buy a collection of stocks, bonds, or both. Instead of researching dozens of companies alone, you buy shares of the fund and own a slice of everything inside it. Mutual funds and exchange-traded funds (ETFs) are common types. An index fund aims to match a broad market slice, such as a large group of U.S. companies, usually at a low cost. Actively managed funds try to beat the market and often charge higher fees.

For someone with a first job, the practical path is often: learn the definitions, avoid putting rent money into individual stocks, and recognize that a simple diversified fund can be a beginner-friendly way to invest when you are ready. Match choices to your goal and timeline. Money for a first apartment in two years should stay safer and more accessible. Money for decades-ahead goals can usually hold more stock-heavy funds through ups and downs.

You do not need to memorize every ticker symbol. You need to know what you own, what could go wrong, and what fees you pay. Clear labels beat confusing products with flashy promises.`,
          whyItMatters:
            'Naming stocks, bonds, and funds correctly helps you choose tools that match your timeline instead of chasing hype.',
          quiz: quiz('unit-15-q1', 'Stocks, Bonds, and Funds', [
            q(
              'unit-15-q1-a',
              'What do you own when you buy a stock?',
              [
                'A small ownership share of a company',
                'A guaranteed government paycheck for life',
                'A loan that the company must never repay',
                'A coupon for free groceries',
              ],
              0,
              'Stock means ownership; your results rise and fall with the company’s value.',
            ),
            q(
              'unit-15-q1-b',
              'What is a bond, in simple terms?',
              [
                'A loan you make to a government or company that typically pays interest',
                'A type of grocery loyalty card',
                'Ownership of every product a company sells',
                'A fee your landlord charges for parking',
              ],
              0,
              'Bond investors lend money and usually receive interest plus repayment of principal later.',
            ),
            q(
              'unit-15-q1-c',
              'What is a main advantage of a diversified fund for beginners?',
              [
                'It holds many investments in one purchase, spreading risk',
                'It removes the need for any emergency savings',
                'It guarantees higher returns than any stock every year',
                'It lets you skip paying rent legally',
              ],
              0,
              'Funds bundle many holdings so one company’s failure is less likely to wipe you out.',
            ),
            q(
              'unit-15-q1-d',
              'Which money is generally a poor fit for risky individual stocks?',
              [
                'Cash you need soon for rent or an apartment deposit',
                'Money you will not need for several decades',
                'Long-term retirement contributions you can leave invested',
                'Spare cash after emergencies and high-interest debt are handled',
              ],
              0,
              'Near-term needs should stay accessible and stable; stocks can drop right when bills are due.',
            ),
          ]),
        },
      },
    ],
  },
  {
    id: 'unit-16',
    number: 16,
    title: 'Taxes and Your Paycheck',
    summary:
      'See why your paycheck is smaller than your wage and what common tax terms on a stub mean.',
    buildingId: 'office',
    topics: [
      {
        id: 'unit-16-t1',
        title: 'Reading a Pay Stub Without Panic',
        summary:
          'Gross pay, net pay, withholding, and common deductions explain the gap between wage and deposit.',
        lesson: {
          id: 'unit-16-l1',
          title: 'Where Your Paycheck Goes',
          body: `When you land a first job, the offer might say sixteen dollars an hour—but your bank deposit will be smaller. That gap is normal. Understanding a pay stub, the document that details each paycheck, turns confusion into clarity.

Gross pay is your earnings before deductions: hours worked times hourly wage, plus tips or overtime if they apply. Net pay—also called take-home pay—is what remains after deductions and is what you can budget with. Budgeting with gross pay is a common beginner mistake that leaves rent and groceries short.

Withholding is money your employer sends to the government from your paycheck toward taxes you likely owe. Federal income tax supports national programs. Many states also withhold state income tax. FICA taxes fund Social Security and Medicare—programs that provide retirement and health benefits later. You may also see local taxes depending on where you live and work.

Your Form W-4 tells your employer how to estimate withholding. When life changes—a new second job, a move, or a shift from part-time summer work to year-round hours—reviewing the W-4 can prevent a shock at tax time. If too little is withheld, you may owe money when you file. If too much is withheld, you may receive a refund, which is your own money returned interest-free.

Other deductions might include health insurance premiums if you enroll in a workplace plan, retirement contributions if you opt into a workplace plan, or uniforms and tools in some jobs. Voluntary deductions are choices; required tax withholdings are not.

Each year, workers typically file a tax return—a report that compares what you owe based on income with what you already paid through withholding. Forms like a W-2 from your employer summarize wages and taxes withheld. Keeping digital copies of pay stubs and W-2s helps if numbers look wrong.

Taxes can feel abstract until you see them next to your hours. The skill to practice now is reading the stub line by line, matching net pay to your budget, and asking a trusted adult or tax help resource when a label is unclear. Knowing the vocabulary is the first step to planning around the paycheck you actually receive.`,
          whyItMatters:
            'Reading your stub correctly means you budget with real take-home pay and avoid April surprises.',
          quiz: quiz('unit-16-q1', 'Paychecks and Taxes', [
            q(
              'unit-16-q1-a',
              'What is the difference between gross pay and net pay?',
              [
                'Gross is before deductions; net is what you take home after deductions',
                'Gross is always smaller than net',
                'Net pay ignores all hours you worked',
                'Gross pay is only tips, never wages',
              ],
              0,
              'Net pay is the spendable amount after taxes and other deductions leave gross pay.',
            ),
            q(
              'unit-16-q1-b',
              'What is tax withholding on a paycheck?',
              [
                'Money your employer sends to the government toward taxes you may owe',
                'A bonus the company adds for fun',
                'A fee the grocery store charges employees',
                'Interest you earn on a savings account',
              ],
              0,
              'Withholding prepays taxes during the year so you are less likely to owe a huge lump sum later.',
            ),
            q(
              'unit-16-q1-c',
              'What does Form W-4 help your employer do?',
              [
                'Estimate how much tax to withhold from your pay',
                'Approve your apartment lease',
                'Set the price of store-brand cereal',
                'Cancel your credit card automatically',
              ],
              0,
              'The W-4 guides withholding; updating it when life changes can improve accuracy.',
            ),
            q(
              'unit-16-q1-d',
              'Why should you budget with net pay instead of gross pay?',
              [
                'Only net pay is available to spend on rent, food, and other bills',
                'Gross pay is deleted from history after one day',
                'Net pay is illegal to look at',
                'Banks only accept gross pay numbers',
              ],
              0,
              'Planning with money you never receive leads to shortfalls; use take-home amounts.',
            ),
          ]),
        },
      },
    ],
  },
  {
    id: 'unit-17',
    number: 17,
    title: 'Insurance and Risk',
    summary:
      'Learn how insurance shares the cost of big risks and which coverage teens often meet first.',
    buildingId: 'home',
    topics: [
      {
        id: 'unit-17-t1',
        title: 'Protecting Yourself From Costly Surprises',
        summary:
          'Insurance trades small regular payments for help with large, rare expenses you could not easily cover alone.',
        lesson: {
          id: 'unit-17-l1',
          title: 'Insurance as a Safety Net',
          body: `Risk is the chance that something harmful or expensive will happen. You cannot remove every risk from life, but you can prepare for the ones that would wreck your finances. Insurance is a contract where you pay a premium—a regular amount—to an insurance company, and in return the company helps pay covered losses if a defined event happens.

Think of a first car. A crash or theft could cost thousands of dollars you do not have in a starter savings account. Auto insurance helps cover repairs, medical bills, or damage to others, depending on the policy. Health insurance helps with doctor visits, hospital care, and prescriptions so one illness does not become lifelong debt. Renters insurance—often inexpensive—can protect belongings in a first apartment from theft or fire and may help with liability if someone is hurt in your place.

Key terms show up on almost every policy. A premium is what you pay to keep coverage active. A deductible is what you pay out of pocket toward a covered claim before insurance pays its share. A higher deductible often means a lower premium, but only choose what you could actually pay in an emergency. A policy limit is the maximum the insurer will pay for a covered event.

Insurance works best for large, unlikely costs you could not absorb alone. It is usually a poor tool for tiny routine expenses you can budget for. Filing claims for every small ding can raise future premiums. Read what is covered and excluded—floods, certain valuables, or driving for pay may need extra coverage.

How do you decide what to buy? Start with legal requirements: many states require auto liability coverage if you drive. If a parent adds you to a family policy, learn what is covered when you borrow the car. When you move into your own place, ask the landlord whether renters insurance is required. At a job with benefits, compare workplace health plans during enrollment instead of guessing.

Insurance is not exciting, and that is the point. It is a boring payment that protects the exciting parts of your life—your mobility, your health, and the apartment you are proud to call yours—from a single unlucky day.`,
          whyItMatters:
            'The right insurance keeps one accident or illness from erasing years of careful saving.',
          quiz: quiz('unit-17-q1', 'Insurance and Risk', [
            q(
              'unit-17-q1-a',
              'What is an insurance premium?',
              [
                'The regular payment you make to keep a policy active',
                'The maximum amount a store will discount sneakers',
                'A tip you leave for a rideshare driver',
                'Interest charged on a credit card purchase',
              ],
              0,
              'Premiums are the ongoing cost of coverage, paid whether or not you file a claim.',
            ),
            q(
              'unit-17-q1-b',
              'What is a deductible?',
              [
                'The amount you pay toward a covered claim before insurance pays its share',
                'A free gift insurers mail every holiday',
                'Your hourly wage at a first job',
                'A type of grocery coupon',
              ],
              0,
              'You share in the loss up to the deductible; insurance helps beyond that, up to policy limits.',
            ),
            q(
              'unit-17-q1-c',
              'Which situation is insurance especially designed to help with?',
              [
                'Large, costly events you could not easily pay for alone, like a major car accident',
                'Buying snacks every afternoon',
                'Remembering a friend’s birthday',
                'Choosing a movie on Friday night',
              ],
              0,
              'Insurance pools risk for big shocks; everyday small purchases belong in your budget instead.',
            ),
            q(
              'unit-17-q1-d',
              'Why might a renter want renters insurance?',
              [
                'It can help replace belongings after theft or fire and may cover certain liability claims',
                'It pays your friend’s phone bill automatically',
                'It replaces the need for any door locks',
                'It cancels all taxes on your paycheck',
              ],
              0,
              'Landlords’ policies usually cover the building, not your stuff—renters insurance fills that gap.',
            ),
          ]),
        },
      },
    ],
  },
  {
    id: 'unit-18',
    number: 18,
    title: 'Housing Decisions',
    summary:
      'Compare renting costs, deposits, and tradeoffs so a first apartment decision fits your income.',
    buildingId: 'home',
    topics: [
      {
        id: 'unit-18-t1',
        title: 'Choosing and Affording a Place to Live',
        summary:
          'Housing costs more than rent—include deposits, utilities, and rules before you sign a lease.',
        lesson: {
          id: 'unit-18-l1',
          title: 'Your First Place, On Purpose',
          body: `Housing is often the largest monthly cost a young adult faces. A housing decision is a choice about where you live and how you pay for it—staying with family longer, sharing a room with roommates, or signing a lease on a first apartment. A lease is a legal rental agreement that spells out rent, length of stay, and rules for both you and the landlord.

Rent is the regular payment for living in the space, but total housing cost is bigger. Utilities—electricity, gas, water, trash, and internet—may be extra. Many landlords require a security deposit, money held to cover damage beyond normal wear; you may get it back if you leave the place clean and intact. Application fees, parking, and renter’s insurance add more. When you compare apartments, compare the full monthly picture, not the advertised rent alone.

A common guideline is to keep housing costs from swallowing your whole paycheck. Exact percentages vary by city, but if rent and utilities would leave too little for food, transport, and savings, the unit is too expensive—even if it looks perfect online. Roommates can split rent and utilities, yet you also share risk: if someone moves out, you may owe more. Put roommate agreements in writing—who pays which bill, how guests work, and how notice to leave works.

Location affects money. A cheaper place far from work or school can burn cash and hours on gas, buses, or rideshares. A slightly higher rent near a transit line might cost less overall. Visit in daylight and after dark when you can, and read reviews for maintenance responsiveness.

Before you sign, read the lease for pet rules, guest limits, early termination fees, and what repairs you must pay for. Never skip the move-in inspection checklist with photos—proof protects your deposit later. If a deal requires cash only, pressure to sign immediately, or wiring a deposit before you see a real unit, treat it as a warning sign and walk away.

Housing choices trade money, privacy, commute, and flexibility. The smartest first apartment is the one your budget can sustain for the full lease—not the one that impresses a social feed for a week.`,
          whyItMatters:
            'Understanding full housing costs and lease terms helps you avoid a first apartment that quietly breaks your budget.',
          quiz: quiz('unit-18-q1', 'Housing Decisions', [
            q(
              'unit-18-q1-a',
              'What is a lease?',
              [
                'A legal rental agreement that sets rent, length of stay, and rules',
                'A grocery receipt for household cleaners',
                'A type of stock certificate',
                'A free month of streaming',
              ],
              0,
              'Signing a lease creates binding responsibilities for renter and landlord.',
            ),
            q(
              'unit-18-q1-b',
              'Why is advertised rent alone a poor way to judge affordability?',
              [
                'Utilities, deposits, insurance, and fees can raise the true monthly cost',
                'Rent numbers are never printed correctly',
                'Landlords only accept payment in gold',
                'Utilities are always free by law',
              ],
              0,
              'Total housing cost includes extras beyond the headline rent figure.',
            ),
            q(
              'unit-18-q1-c',
              'What is a security deposit typically for?',
              [
                'Money held to cover damage beyond normal wear, often refundable if you leave the unit in good shape',
                'A tip for the moving-truck driver only',
                'Prepayment of all future utilities for life',
                'A fine for visiting the grocery store',
              ],
              0,
              'Deposits protect the landlord against damage; documentation helps you reclaim what you deserve.',
            ),
            q(
              'unit-18-q1-d',
              'Which is a smart step before signing a first apartment lease?',
              [
                'Read the lease, do a photo move-in inspection, and confirm total monthly costs fit your budget',
                'Wire a deposit to a stranger without touring any unit',
                'Ignore roommate responsibilities because verbal promises are enough',
                'Assume early termination is always free',
              ],
              0,
              'Careful reading and documentation prevent expensive surprises after you move in.',
            ),
          ]),
        },
      },
    ],
  },
  {
    id: 'unit-19',
    number: 19,
    title: 'Cars and Transportation',
    summary:
      'Weigh buying, financing, insurance, and alternatives so getting around matches your real budget.',
    buildingId: 'home',
    topics: [
      {
        id: 'unit-19-t1',
        title: 'The True Cost of Getting Around',
        summary:
          'Cars cost more than the purchase price—fuel, insurance, repairs, and loans all count.',
        lesson: {
          id: 'unit-19-l1',
          title: 'Wheels, Rides, and Tradeoffs',
          body: `Transportation is how you get to work, school, and life. Options include walking, biking, buses and trains, rideshares, borrowing a family car, or buying your own. Each choice trades money, time, and flexibility. A car feels like freedom, yet it is one of the fastest ways a teen or new worker can overload a budget.

The sticker price of a car is only the beginning. Ownership costs include fuel or charging, insurance, registration, parking, maintenance like oil changes and tires, and repairs when something breaks. A used car may cost less upfront but need more repairs; a newer car may cost more to buy or lease. Depreciation—the drop in a car’s value over time—means most vehicles are worth less each year you own them.

If you borrow money to buy a car, that loan adds monthly payments and interest. Longer loans lower the monthly bill but often increase total interest paid. Stretching a loan to afford a nicer car can trap you: if the car loses value faster than you repay, you may owe more than it is worth. A reliable, cheaper car that you can pay off sooner usually supports a first job better than a flashy one.

Insurance is required in many places for drivers. Younger drivers often face higher premiums. Shopping quotes, choosing a sensible deductible, and maintaining a clean driving record help. Tickets and crashes cost more than pride—they raise prices for years.

Before buying, calculate a full monthly transportation budget and compare it with alternatives. A transit pass plus occasional rideshare might beat car ownership if you live near good routes. Living closer to work can save more than a raise. If you need a car, save a down payment, get a pre-purchase inspection for used vehicles, and avoid dealers who rush you past the numbers.

Transportation should expand your opportunities—not drain the paycheck that makes those opportunities possible. Choose the option that reliably gets you there while still leaving money for rent, food, and savings.`,
          whyItMatters:
            'Seeing the full cost of a car keeps a first vehicle from turning into a financial breakdown.',
          quiz: quiz('unit-19-q1', 'Cars and Transportation', [
            q(
              'unit-19-q1-a',
              'Which costs belong in a full car budget besides the purchase price?',
              [
                'Fuel, insurance, maintenance, repairs, registration, and parking',
                'Only the air freshener hanging on the mirror',
                'Your streaming subscriptions',
                'College tuition for a stranger',
              ],
              0,
              'Owning a car creates ongoing costs that can exceed the monthly payment alone.',
            ),
            q(
              'unit-19-q1-b',
              'What is a downside of choosing a much longer car loan to lower the monthly payment?',
              [
                'You often pay more total interest and may owe more than the car is worth',
                'The car becomes illegal to drive after twelve months',
                'Insurance becomes free and optional',
                'Gas stations refuse to serve you',
              ],
              0,
              'Longer loans stretch payments but usually raise total cost and risk of being upside down.',
            ),
            q(
              'unit-19-q1-c',
              'Why might transit plus occasional rideshares beat owning a car for some people?',
              [
                'Total monthly costs can be lower when you avoid payments, insurance, and repairs',
                'Buses erase the need to ever be on time',
                'Rideshares are always free for teens',
                'Car ownership has zero hidden costs',
              ],
              0,
              'Comparing total costs—not just convenience—reveals when a car is unnecessary.',
            ),
            q(
              'unit-19-q1-d',
              'What is a smart step before buying a used car?',
              [
                'Get an independent inspection and calculate whether the full monthly costs fit your budget',
                'Skip reading any paperwork so you can drive off faster',
                'Assume repairs will never happen',
                'Finance the maximum amount a dealer offers without comparing rates',
              ],
              0,
              'Inspections and honest budgeting prevent buying someone else’s expensive problem.',
            ),
          ]),
        },
      },
    ],
  },
  {
    id: 'unit-20',
    number: 20,
    title: 'Consumer Protection',
    summary:
      'Know your rights as a buyer, how returns and warranties work, and where to get help with disputes.',
    buildingId: 'grocery',
    topics: [
      {
        id: 'unit-20-t1',
        title: 'Your Rights When You Buy',
        summary:
          'Consumer protection laws and store policies help when products fail, ads mislead, or billing goes wrong.',
        lesson: {
          id: 'unit-20-l1',
          title: 'Shopping With Rights on Your Side',
          body: `A consumer is anyone who buys goods or services for personal use—groceries for an apartment, a phone plan, or shoes for a first job. Consumer protection refers to laws and rules that aim to keep advertising truthful, products reasonably safe, and billing practices fair. Knowing the basics helps you fix problems instead of shrugging and losing money.

Start with records. Keep receipts, order confirmations, and photos of damaged items. If a carton of milk is spoiled on the day you buy it, or a blender dies after two uses, documentation makes refunds and exchanges smoother. Store return policies vary: some allow thirty days, some mark final sale on clearance, and some require original packaging. Read the policy before you need it.

A warranty is a promise about how a product will work and what the seller or maker will do if it fails. A manufacturer warranty comes from the company that made the item. An extended warranty is often sold at checkout for extra money—sometimes useful for pricey electronics, often skippable for cheap gadgets if you already have card benefits or savings for replacements. “As is” sales usually mean fewer remedies, so price should reflect that risk.

False advertising means promoting features or prices in a misleading way. If an ad promises a free month and then bills you immediately, contact the company in writing, note dates, and escalate if needed. For credit cards, federal rules give tools to dispute certain billing errors and unauthorized charges—another reason to review each statement from a first credit card.

When a business ignores you, third parties can help. Many communities have consumer protection offices. National agencies publish complaint tools for unfair practices. Credit card chargebacks and payment-provider disputes are options after you try the merchant. Stay factual and polite; clear timelines and copies of emails work better than anger alone.

Consumer protection is not about winning every argument. It is about expecting honesty, using policies that already exist, and knowing when to walk away from sellers who refuse basic fairness.`,
          whyItMatters:
            'Knowing your buyer rights turns a bad purchase or shady bill into a problem you can challenge—not a silent loss.',
          quiz: quiz('unit-20-q1', 'Consumer Protection', [
            q(
              'unit-20-q1-a',
              'Who is a consumer in this lesson’s sense?',
              [
                'Someone who buys goods or services for personal use',
                'Only a professional stock trader',
                'A person who never shops',
                'A company’s factory machine',
              ],
              0,
              'Everyday buyers—teens included—are consumers with rights and remedies.',
            ),
            q(
              'unit-20-q1-b',
              'Why should you keep receipts and order confirmations?',
              [
                'They provide proof that helps with returns, refunds, and disputes',
                'Stores fine you for holding paper',
                'Receipts replace the need to ever budget',
                'They cancel insurance automatically',
              ],
              0,
              'Documentation is your evidence when a product fails or a charge looks wrong.',
            ),
            q(
              'unit-20-q1-c',
              'What is a warranty?',
              [
                'A promise about how a product should work and what happens if it fails',
                'A type of apartment lease for cars',
                'A grocery loyalty mascot',
                'Interest charged on unpaid rent',
              ],
              0,
              'Warranties define repair or replacement help; always check what is covered and for how long.',
            ),
            q(
              'unit-20-q1-d',
              'What is a reasonable first step if a company bills you for a “free trial” that was not free?',
              [
                'Contact the company in writing with dates and details, then escalate or dispute if needed',
                'Post your Social Security number publicly for help',
                'Ignore the charge forever and hope it vanishes',
                'Pay unrelated strangers to yell at the cashier',
              ],
              0,
              'Written records and official dispute channels work better than silence or unsafe oversharing.',
            ),
          ]),
        },
      },
    ],
  },
  {
    id: 'unit-21',
    number: 21,
    title: 'Scams and Fraud',
    summary:
      'Spot common scams, protect personal information, and know what to do if you are targeted.',
    buildingId: 'home',
    topics: [
      {
        id: 'unit-21-t1',
        title: 'Spotting and Stopping Fraud',
        summary:
          'Scammers use urgency and fear to steal money or identity—slow down, verify, and never share secrets.',
        lesson: {
          id: 'unit-21-l1',
          title: 'Don’t Take the Bait',
          body: `A scam is a dishonest trick designed to steal your money or personal information. Fraud is intentional deception for unlawful gain. Scammers target people of every age, including teens with a first job, a first bank account, or a first credit card—because new accounts and less experience can mean faster mistakes.

Common patterns repeat. Phishing uses fake emails, texts, or sites that look like a bank, store, or delivery service to make you click and enter passwords. A “prize” scam claims you won money if you pay a small fee first—real prizes do not require you to wire fees. Impersonation scams pretend to be a landlord, employer, tech support agent, or even a family member in trouble, pushing you to act before you can think. Romance and “friend” scams build trust online, then ask for money.

Urgency and secrecy are warning lights. If someone says you must pay in gift cards, cryptocurrency, or a wire transfer right now, pause. If they tell you not to talk to parents, bank staff, or friends, that is a control tactic. Legitimate banks and government agencies will not demand gift cards to “protect” your account.

Protect personal data. Your Social Security number, bank login, one-time passcodes, and credit card CVV are keys to your financial life. Do not share them in response to unexpected messages. Use unique passwords and turn on multi-factor authentication—an extra step like a code on your phone—so a stolen password alone is not enough. Check account apps weekly for charges you do not recognize.

If you think you clicked a bad link or sent money, act quickly. Change passwords, call your bank or card issuer using the number on the back of your card (not a number from a suspicious text), report unauthorized charges, and note dates and screenshots. Tell a trusted adult. Report scams to official consumer protection channels so others are warned.

Confidence is not the same as safety. The strongest defense is a habit: slow down, verify through official channels, and remember that anyone who needs your money today without proof is rarely worth trusting tomorrow.`,
          whyItMatters:
            'Recognizing scam patterns protects your first paycheck, accounts, and identity from thieves who rely on rush and fear.',
          quiz: quiz('unit-21-q1', 'Scams and Fraud', [
            q(
              'unit-21-q1-a',
              'What is phishing?',
              [
                'Fake messages or sites that trick you into revealing passwords or personal data',
                'A method for catching fish with a credit card',
                'A legitimate bank visit in person',
                'A type of apartment security deposit',
              ],
              0,
              'Phishing imitates trusted brands so you hand over access; verify through official apps or phone numbers.',
            ),
            q(
              'unit-21-q1-b',
              'Which payment request is a major red flag in a scam?',
              [
                'Demanding immediate payment with gift cards or a wire transfer',
                'A documented rent payment to a known landlord through a normal method',
                'Buying groceries with your own debit card in a store',
                'Setting up a savings transfer you scheduled yourself',
              ],
              0,
              'Gift cards and urgent wires are favorites of scammers because they are hard to reverse.',
            ),
            q(
              'unit-21-q1-c',
              'What should you do if a text claims to be your bank and asks for a one-time passcode?',
              [
                'Do not share the code; contact the bank using a number from your card or official app',
                'Reply with the code and your Social Security number',
                'Forward the code to anyone who messages next',
                'Post the code on social media for verification',
              ],
              0,
              'Passcodes prove it is you—giving them away can hand scammers control of your account.',
            ),
            q(
              'unit-21-q1-d',
              'What is a smart first move if you spot a charge you did not make on a first credit card?',
              [
                'Call the number on the back of the card, report the charge, and change passwords if needed',
                'Wait a year to see if it disappears',
                'Send more money to the mystery merchant to settle it',
                'Share your full card number in a public comment',
              ],
              0,
              'Quick official reports limit damage; delays give fraudsters more room to operate.',
            ),
          ]),
        },
      },
    ],
  },
]
