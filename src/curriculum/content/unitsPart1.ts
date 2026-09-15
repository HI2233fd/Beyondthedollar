import { q, quiz } from './helpers'
import type { Unit } from '../types'

export const UNITS_PART_1: Unit[] = [
  {
    id: 'unit-01',
    number: 1,
    title: 'Foundations of Economics',
    summary:
      'Learn what economics studies, why scarcity forces choices, and how trade-offs show up in everyday money decisions.',
    buildingId: 'college',
    topics: [
      {
        id: 'unit-01-t1',
        title: 'Scarcity, Choice, and Opportunity Cost',
        summary:
          'Economics starts with limited resources and unlimited wants—and the trade-offs that follow.',
        lesson: {
          id: 'unit-01-l1',
          title: 'Why Every Choice Has a Cost',
          body: `Economics is the study of how people, businesses, and governments decide what to do with limited resources. A resource is anything useful for producing goods or services—time, money, workers, tools, land, or ideas. The central fact of economics is scarcity: there is never enough of every resource to satisfy every want at the same time. Because of scarcity, you cannot have everything you want, so you must choose.

Imagine you just got paid from your first job. You have eighty dollars left after putting some money aside for bus fare. You want new headphones, a concert ticket with friends, and groceries for the week. You cannot buy all three with eighty dollars. That tension—wants bigger than resources—is scarcity in daily life. Economics does not tell you which option is “fun.” It helps you see what you give up when you pick one path.

Every choice creates a trade-off: when you gain one thing, you give up something else. The opportunity cost of a choice is the value of the next-best option you did not take. If you spend the eighty dollars on headphones, the opportunity cost might be the concert you skip—or the groceries you delay. Opportunity cost is not only money. If you work an extra Saturday shift, the opportunity cost could be a study session or rest before a test.

People make decisions at the margin, meaning they compare a little more of one thing with a little less of another. You might ask, “Is one more hour of overtime worth missing practice?” rather than “Should I work forever or never work?” Thinking at the margin keeps decisions realistic.

Incentives are rewards or penalties that change behavior. A raise is a positive incentive to keep a job. Late fees on a bill are a negative incentive to pay on time. When you understand scarcity, trade-offs, opportunity cost, marginal thinking, and incentives, you have the basic toolkit for every later money topic—from renting a first apartment to choosing a credit card.`,
          whyItMatters:
            'Seeing opportunity cost clearly helps you spend, save, and work in ways that match your real goals instead of only your first impulse.',
          quiz: quiz('unit-01-q1', 'Foundations of Economics Check', [
            q(
              'unit-01-q1-a',
              'What does scarcity mean in economics?',
              [
                'Prices are always rising',
                'Wants exceed available resources',
                'Banks refuse to lend money',
                'Governments print too much cash',
              ],
              1,
              'Scarcity means limited resources cannot satisfy unlimited wants, so choices are required.',
            ),
            q(
              'unit-01-q1-b',
              'You spend your paycheck on concert tickets instead of a new phone case. The opportunity cost is best described as:',
              [
                'The fun you had at the concert',
                'The sticker price printed on the tickets',
                'The next-best thing you gave up, such as the phone case',
                'Any tax withheld from your paycheck',
              ],
              2,
              'Opportunity cost is the value of the next-best alternative you did not choose.',
            ),
            q(
              'unit-01-q1-c',
              'Deciding whether one more hour of overtime is worth missing a study session is an example of:',
              [
                'Thinking at the margin',
                'Eliminating scarcity',
                'Avoiding all trade-offs',
                'Setting a price ceiling',
              ],
              0,
              'Marginal thinking compares a little more of one option with a little less of another.',
            ),
            q(
              'unit-01-q1-d',
              'A late fee on an unpaid bill is best classified as:',
              [
                'A free resource',
                'A positive incentive',
                'A negative incentive',
                'An unlimited want',
              ],
              2,
              'Negative incentives discourage a behavior—in this case, paying late.',
            ),
          ]),
        },
      },
    ],
  },
  {
    id: 'unit-02',
    number: 2,
    title: 'Economic Systems',
    summary:
      'Compare how different societies answer what to produce, how to produce it, and who receives the results.',
    buildingId: 'college',
    topics: [
      {
        id: 'unit-02-t1',
        title: 'How Societies Organize Production',
        summary:
          'Traditional, command, market, and mixed systems answer the same three economic questions differently.',
        lesson: {
          id: 'unit-02-l1',
          title: 'Who Decides What Gets Made?',
          body: `Every society faces the same three basic economic questions. What goods and services should be produced? How should they be produced? Who will receive them? An economic system is the set of rules and habits a society uses to answer those questions. Understanding systems helps you see why grocery shelves, job ads, and apartment rents look different from place to place.

In a traditional economy, custom and family roles guide production. People often make what their community has always made, using methods passed down over time. Trade may rely on barter—exchanging goods directly—more than on money. Traditional systems can feel stable, but they may change slowly when new needs appear.

In a command economy, a central authority such as a government agency decides most of what is produced, how it is made, and how it is distributed. Planners might order factories to make more buses and fewer private cars. The goal is often equality or rapid national projects, but shortages can appear if planners misjudge what people actually want.

In a market economy, private individuals and businesses make most decisions. A market is any arrangement where buyers and sellers exchange. Prices send signals: if many teens want the same limited sneakers, the price rises and producers may make more. Ownership of private property—control over resources and products—and voluntary exchange are key features. Profit, the money left after costs, attracts people to produce what others value.

Most real countries use a mixed economy: markets handle many choices, while government sets rules, provides public goods like roads, and offers safety nets. When you land a first job, your wage is mostly a market outcome, but minimum-wage laws and payroll taxes show the mixed side. When you rent a first apartment, the landlord sets rent in a market, yet building codes and tenant rules come from government. Credit cards exist because private banks compete, while consumer-protection laws limit unfair practices.

No system is perfect. Markets reward innovation but can leave some people behind. Command systems can mobilize resources quickly but may ignore individual preferences. Knowing which question a rule is answering—what, how, or for whom—helps you judge news about policy and your own money choices.`,
          whyItMatters:
            'Recognizing market and government roles helps you interpret wages, rents, and credit rules instead of treating them as random.',
          quiz: quiz('unit-02-q1', 'Economic Systems Check', [
            q(
              'unit-02-q1-a',
              'Which set lists the three basic economic questions?',
              [
                'When, where, and why to tax',
                'What, how, and for whom to produce',
                'Who prints money, who spends it, who saves it',
                'How to advertise, package, and ship goods',
              ],
              1,
              'Societies must decide what to produce, how to produce it, and who receives it.',
            ),
            q(
              'unit-02-q1-b',
              'In a command economy, most production decisions are made by:',
              [
                'Custom and family tradition alone',
                'A central authority or planners',
                'Only foreign investors',
                'Random lottery among shoppers',
              ],
              1,
              'Command systems rely on central planners to direct what and how to produce.',
            ),
            q(
              'unit-02-q1-c',
              'A country where private firms set most prices but the government funds highways and enforces workplace safety is best called:',
              [
                'A pure traditional economy',
                'A pure command economy',
                'A mixed economy',
                'A barter-only economy',
              ],
              2,
              'Mixed economies combine market decisions with government roles and rules.',
            ),
            q(
              'unit-02-q1-d',
              'Private property in a market economy mainly means:',
              [
                'Only the government may own land',
                'Individuals and firms can own and control resources',
                'Nobody may sell anything for profit',
                'All goods must be shared equally each week',
              ],
              1,
              'Private property lets people own resources and decide how to use or trade them.',
            ),
          ]),
        },
      },
    ],
  },
  {
    id: 'unit-03',
    number: 3,
    title: 'Markets and Prices',
    summary:
      'See how supply and demand meet to form prices, and what happens when the market is out of balance.',
    buildingId: 'college',
    topics: [
      {
        id: 'unit-03-t1',
        title: 'Supply, Demand, and Equilibrium',
        summary:
          'Buyers and sellers respond to price; their interaction sets the market clearing price and quantity.',
        lesson: {
          id: 'unit-03-l1',
          title: 'How Prices Get Settled',
          body: `A market is where buyers and sellers interact—online, in a store, or through an app. Demand describes how much of a good buyers are willing and able to purchase at different prices. Usually, when the price of something falls, people want to buy more of it, holding other factors constant. That inverse relationship is called the law of demand. If streaming music drops from twelve dollars a month to six, more teens will subscribe.

Supply describes how much sellers are willing and able to offer at different prices. Usually, a higher price encourages producers to offer more, because the extra revenue can cover costs and profit. That direct relationship is the law of supply. A café may bake more pastries at peak lunch prices than at closing-time discounts.

Equilibrium is the price and quantity where quantity demanded equals quantity supplied. At that market-clearing price, there is no built-in pressure to change. If the price is too high, a surplus appears: sellers have leftovers. They tend to lower prices to attract buyers. If the price is too low, a shortage appears: shelves empty. Buyers compete, and sellers can raise prices. Over time, those adjustments push the market toward equilibrium—unless rules freeze the price.

Other factors shift demand or supply even when the product’s own price has not changed yet. Higher income can increase demand for a first apartment in a nicer area. A popular influencer can raise demand for a sneaker brand. Higher flour costs can reduce supply of bakery goods. New coffee machines can increase café supply by lowering production costs.

Price is a signal and a rationing device. It tells producers what to make more of and helps decide who gets limited items—those willing and able to pay. When you compare rents for a first apartment or choose between phone plans, you are reading market signals. Understanding surplus, shortage, and equilibrium helps you predict why concert tickets sell out, why clearance racks appear, and why “too good to be true” prices often do not last.`,
          whyItMatters:
            'Reading supply and demand helps you anticipate price changes on rent, food, and gadgets before they surprise your budget.',
          quiz: quiz('unit-03-q1', 'Markets and Prices Check', [
            q(
              'unit-03-q1-a',
              'The law of demand says that, other things equal, when price falls:',
              [
                'Quantity demanded usually rises',
                'Quantity supplied always falls to zero',
                'Demand becomes illegal',
                'Sellers must leave the market',
              ],
              0,
              'Lower prices typically lead buyers to purchase larger quantities.',
            ),
            q(
              'unit-03-q1-b',
              'A surplus in a market means:',
              [
                'Quantity demanded exceeds quantity supplied',
                'Quantity supplied exceeds quantity demanded',
                'Price equals zero',
                'No one wants the product at any price',
              ],
              1,
              'A surplus is leftover supply when the price is above equilibrium.',
            ),
            q(
              'unit-03-q1-c',
              'Equilibrium price is best described as the price where:',
              [
                'The government sets every wage',
                'Quantity demanded equals quantity supplied',
                'Only one buyer exists',
                'Costs are ignored by sellers',
              ],
              1,
              'At equilibrium, the amount buyers want matches the amount sellers offer.',
            ),
            q(
              'unit-03-q1-d',
              'If many teens suddenly want the same limited concert tickets, what is most likely in the short run?',
              [
                'A shortage at the old price, with pressure for higher prices',
                'An automatic surplus of empty seats',
                'Supply falling because demand rose',
                'Prices becoming irrelevant',
              ],
              0,
              'A demand surge at the old price creates a shortage and upward pressure on price.',
            ),
          ]),
        },
      },
    ],
  },
  {
    id: 'unit-04',
    number: 4,
    title: 'Market Structures',
    summary:
      'Learn how competition levels—from many rivals to one seller—shape prices, choices, and advertising.',
    buildingId: 'college',
    topics: [
      {
        id: 'unit-04-t1',
        title: 'Competition Along a Spectrum',
        summary:
          'Perfect competition, monopolistic competition, oligopoly, and monopoly differ in seller count and pricing power.',
        lesson: {
          id: 'unit-04-l1',
          title: 'From Many Sellers to One',
          body: `Market structure describes how competitive an industry is—how many sellers there are, how similar their products are, and how easy it is for new firms to enter. Structure matters because it affects prices, quality, and the power sellers have over buyers.

Perfect competition is a textbook case with many sellers offering nearly identical products, easy entry, and no single firm able to set the market price. Think of many small farms selling the same grade of wheat. Each farmer is a price taker: the market price is given, and each sells at that price. Real markets rarely match this ideal perfectly, but it is a useful comparison point.

Monopolistic competition has many sellers, easy entry, and differentiated products—goods that buyers see as slightly different. Coffee shops near campus compete this way. Each shop has a bit of pricing power because of location, flavors, or vibe, but rivals are close substitutes. Advertising matters because brands try to stand out. Your first favorite lunch spot likely lives in this structure.

An oligopoly has a few large sellers that dominate. Phone carriers or major game console makers often look like oligopolies. Firms watch each other’s prices carefully. They may compete hard on ads and features, or they may avoid price wars. Barriers to entry—high start-up costs, brand loyalty, or exclusive tech—keep new rivals out.

A monopoly is a market with a single seller of a product with no close substitute. A local water utility can be a regulated monopoly because duplicating pipes is wasteful. Monopolies have the most pricing power, so governments often regulate rates or block unfair practices.

When you compare credit cards, you usually face monopolistic competition or oligopoly features: a handful of big issuers, lots of brand marketing, and cards that differ by rewards and fees. When you hunt for a first apartment, many landlords compete, but unique locations create differentiation. Knowing structure helps you ask, “How many real options do I have?” More rivalry usually means better deals and more innovation for buyers; less rivalry means you should read terms carefully and compare alternatives.`,
          whyItMatters:
            'Spotting how competitive a market is helps you negotiate harder—or walk away—when sellers have unusual power.',
          quiz: quiz('unit-04-q1', 'Market Structures Check', [
            q(
              'unit-04-q1-a',
              'A price taker is a seller who:',
              [
                'Can set any price without losing customers',
                'Must accept the market price as given',
                'Is the only legal seller in a region',
                'Refuses to advertise under any condition',
              ],
              1,
              'In highly competitive markets, individual sellers take the market price as given.',
            ),
            q(
              'unit-04-q1-b',
              'Many coffee shops with unique menus near a college is closest to:',
              [
                'Perfect competition with identical products',
                'Monopolistic competition with differentiation',
                'A pure monopoly with no substitutes',
                'A command economy with one planner',
              ],
              1,
              'Many firms selling differentiated products describes monopolistic competition.',
            ),
            q(
              'unit-04-q1-c',
              'An industry dominated by a few large firms is called:',
              [
                'An oligopoly',
                'Perfect competition',
                'A barter circle',
                'A traditional household',
              ],
              0,
              'Oligopoly means a small number of large sellers dominate the market.',
            ),
            q(
              'unit-04-q1-d',
              'A barrier to entry is best defined as:',
              [
                'A sale that lasts one weekend',
                'Something that makes it hard for new firms to join a market',
                'A rule that forces all prices to zero',
                'A customer loyalty card with points',
              ],
              1,
              'Barriers to entry protect existing firms by blocking or delaying new rivals.',
            ),
          ]),
        },
      },
    ],
  },
  {
    id: 'unit-05',
    number: 5,
    title: 'Macroeconomics Basics',
    summary:
      'Zoom out from one shop to the whole economy: output, unemployment, inflation, and the business cycle.',
    buildingId: 'college',
    topics: [
      {
        id: 'unit-05-t1',
        title: 'The Economy as a Whole',
        summary:
          'GDP, unemployment, inflation, and business cycles describe national economic health.',
        lesson: {
          id: 'unit-05-l1',
          title: 'Reading the Big Picture',
          body: `Microeconomics looks at individual choices and markets. Macroeconomics looks at the economy as a whole—total production, jobs, and the average level of prices. Even if you only care about your first paycheck, macro trends shape whether jobs are plentiful, whether rent rises fast, and whether your savings buy less next year.

Gross Domestic Product, or GDP, measures the market value of final goods and services produced within a country during a period. “Final” means we count the finished car, not the tires separately if they are already included in the car’s price. Rising real GDP—output adjusted for price changes—usually signals growth. Falling GDP over a sustained stretch can mean a recession, a period of weak economic activity.

Unemployment occurs when people who want to work and are looking for a job cannot find one. The unemployment rate is the share of the labor force that is unemployed. A high rate can make a first job harder to land. Some unemployment is temporary as people switch roles; long spells are more painful for households.

Inflation is a general rise in the average price level. If inflation runs high, the same wages buy fewer groceries and make a first apartment harder to afford. Deflation is a general fall in prices; it sounds helpful but can lead businesses to delay hiring if they expect lower sales revenue. Purchasing power is what your money can actually buy.

Economies move through a business cycle: expansion (growth and more hiring), peak, contraction (slowdown), and trough before recovery. During expansions, overtime and new openings appear. During contractions, hours may be cut. Policymakers use fiscal policy—government spending and taxes—and monetary policy—actions that influence money and credit conditions—to try to smooth severe swings.

When headlines mention GDP, unemployment, or inflation, translate them into personal stakes: job odds, wage growth, and the cost of living. Macro numbers will not pick your career for you, but they explain the weather around your money decisions.`,
          whyItMatters:
            'Macro indicators help you time big moves—like job hunting or signing a lease—with eyes open to the wider economy.',
          quiz: quiz('unit-05-q1', 'Macroeconomics Basics Check', [
            q(
              'unit-05-q1-a',
              'GDP mainly measures:',
              [
                'The happiness of every citizen',
                'The market value of final goods and services produced in a country',
                'Only government spending on the military',
                'The number of credit cards issued',
              ],
              1,
              'GDP sums the market value of final output produced within a country in a period.',
            ),
            q(
              'unit-05-q1-b',
              'Inflation means:',
              [
                'A general rise in the average price level',
                'A permanent freeze on all wages',
                'A surplus of every product in every store',
                'Unemployment falling to exactly zero',
              ],
              0,
              'Inflation is a broad increase in prices, reducing money’s purchasing power.',
            ),
            q(
              'unit-05-q1-c',
              'A person who wants a job, is available to work, and is actively searching but has no job is counted as:',
              [
                'Employed full time',
                'Unemployed',
                'Outside the idea of a labor force forever',
                'A monopolist',
              ],
              1,
              'Unemployment includes people without a job who are available and actively looking.',
            ),
            q(
              'unit-05-q1-d',
              'During an economic expansion, you would most expect:',
              [
                'Rising output and usually more hiring',
                'GDP to stop existing as a concept',
                'All prices to become illegal',
                'Every business to close permanently',
              ],
              0,
              'Expansions feature growing production and typically stronger job markets.',
            ),
          ]),
        },
      },
    ],
  },
  {
    id: 'unit-06',
    number: 6,
    title: 'Money and the Financial System',
    summary:
      'Discover what money does, why it beats barter, and how financial institutions channel funds.',
    buildingId: 'bank',
    topics: [
      {
        id: 'unit-06-t1',
        title: 'What Money Is and Why It Circulates',
        summary:
          'Money serves as medium of exchange, unit of account, and store of value within a wider financial system.',
        lesson: {
          id: 'unit-06-l1',
          title: 'More Than Coins and Cards',
          body: `Money is anything widely accepted as payment for goods and services and as repayment of debt. Before money, people relied heavily on barter—trading goods for goods. Barter requires a double coincidence of wants: each person must want exactly what the other offers. If you have extra concert merch and need groceries, you must find a grocer who wants merch. Money removes that friction.

Money has three classic functions. As a medium of exchange, it is what you hand over to buy pizza after a shift. As a unit of account, it provides a common measuring stick—prices and wages are quoted in dollars, not in random items. As a store of value, it lets you save purchasing power for later, though inflation can weaken that function. Liquidity describes how quickly an asset can be turned into spending money without a big loss; cash in a checking account is highly liquid, while a rare collectible may not be.

Currency is physical cash. Most of the money people use day to day also includes balances in checking accounts that move with debit cards and transfers. When you get paid by direct deposit into your first account, that balance is money even though you never touch paper bills.

The financial system is the network of institutions and markets that move funds from savers to borrowers. Banks, credit unions, and other intermediaries gather deposits and make loans. Capital markets help governments and companies raise longer-term funds. Payment systems clear transfers so your rent can leave your account and arrive at a landlord’s.

Trust matters. People accept money because they believe others will accept it tomorrow. Rules against fraud, clear ownership records, and reliable payment rails keep that trust intact. When you swipe a first credit card or pay a deposit on a first apartment, you are using money’s functions inside a financial system designed to make exchange fast, measurable, and—when it works—reasonably safe.

Think of your first paycheck journey: employer to bank deposit, then rent transfer, then a debit purchase at the grocery. Each step depends on money’s three functions and on institutions that keep balances accurate. If any link breaks—a delayed deposit, a failed transfer—you feel scarcity more sharply. Learning the system helps you ask better questions when something looks wrong on an app screen.`,
          whyItMatters:
            'Knowing what money does—and how the financial system moves it—keeps you from treating banks and cards as mysteries.',
          quiz: quiz('unit-06-q1', 'Money and the Financial System Check', [
            q(
              'unit-06-q1-a',
              'A double coincidence of wants is a problem mainly with:',
              [
                'Barter',
                'Using a unit of account',
                'Direct deposit alone',
                'Writing a budget on paper',
              ],
              0,
              'Barter needs each trader to want exactly what the other offers.',
            ),
            q(
              'unit-06-q1-b',
              'Which is a function of money?',
              [
                'Guaranteeing you will never face scarcity',
                'Serving as a medium of exchange',
                'Eliminating all unemployment',
                'Setting college majors for every student',
              ],
              1,
              'Money functions as a medium of exchange, unit of account, and store of value.',
            ),
            q(
              'unit-06-q1-c',
              'Liquidity refers to:',
              [
                'How quickly an asset can become spendable money without a big loss',
                'How heavy coins feel in a pocket',
                'Whether a product is sold online only',
                'The number of ATMs in another country',
              ],
              0,
              'Liquid assets convert to spending power quickly and with little value loss.',
            ),
            q(
              'unit-06-q1-d',
              'Financial intermediaries such as banks mainly:',
              [
                'Print textbooks for colleges',
                'Channel funds from savers toward borrowers',
                'Set the weather for harvest seasons',
                'Replace the need for any prices',
              ],
              1,
              'Intermediaries gather savings and help allocate them through loans and related services.',
            ),
          ]),
        },
      },
    ],
  },
  {
    id: 'unit-07',
    number: 7,
    title: 'Banking Basics',
    summary:
      'Open the hood on checking and savings accounts, deposits, fees, and how banks earn a living.',
    buildingId: 'bank',
    topics: [
      {
        id: 'unit-07-t1',
        title: 'Accounts, Deposits, and Everyday Banking',
        summary:
          'Banks safeguard deposits, move payments, and lend—while fees and account features shape your costs.',
        lesson: {
          id: 'unit-07-l1',
          title: 'Your First Account Without the Confusion',
          body: `A bank is a business that accepts deposits, helps customers make payments, and makes loans. When you open a checking account for a first job, you are placing deposits—money you entrust to the bank—into an account designed for frequent spending. A debit card and online transfer tools let you pay without carrying much cash. A savings account is built more for holding money you do not need immediately; it may earn a bit of interest, which is a payment the bank gives you for keeping funds there.

Banks profit partly from the spread between what they pay depositors and what they charge borrowers. They also charge fees for some services. Common fees include monthly maintenance fees, overdraft fees when you spend more than your balance, and out-of-network ATM fees. Reading the fee schedule before you sign up can save real money in your first months of independence.

Deposit insurance, where available through a government-backed program, protects qualifying deposits up to a limit if a bank fails. That protection is about deposit safety, not about investment returns. Keeping emergency cash in an insured account is different from investing in stocks, which can lose value.

Routing numbers and account numbers identify where your money lives so employers can send direct deposit and landlords can receive rent. Mobile deposit lets you capture a paycheck image; always confirm the funds are available before you spend them. A hold is a temporary delay before deposited funds can be withdrawn.

Credit unions are member-owned cooperatives that offer similar account services; banks are typically for-profit corporations. Compare both for fees, ATM access near your school or first apartment, and customer support. Good banking habits include tracking your balance, turning on alerts, and separating “spend” money in checking from “save” money in savings so a weekend purchase does not silently wipe out next month’s rent reserve.

Before you switch banks, list what you need: free checking if possible, a nearby ATM, easy mobile deposit, and clear overdraft settings you control. Ask whether student or youth accounts waive fees. A shiny app is useless if every transfer costs you. Treat account choice like comparing phone plans—features matter, but surprise costs matter more.`,
          whyItMatters:
            'Choosing and managing a first account wisely prevents fee leaks and keeps rent and paycheck money where you expect it.',
          quiz: quiz('unit-07-q1', 'Banking Basics Check', [
            q(
              'unit-07-q1-a',
              'A checking account is primarily designed for:',
              [
                'Frequent spending and payments',
                'Owning a share of a factory',
                'Avoiding all forms of money',
                'Setting national interest rates',
              ],
              0,
              'Checking accounts support day-to-day deposits, withdrawals, and payments.',
            ),
            q(
              'unit-07-q1-b',
              'An overdraft fee typically occurs when:',
              [
                'You earn a raise at work',
                'You spend more than your available balance',
                'You open a savings account',
                'You decline a debit card',
              ],
              1,
              'Overdraft fees can apply when transactions exceed the money available in the account.',
            ),
            q(
              'unit-07-q1-c',
              'Deposit insurance is meant to:',
              [
                'Guarantee stock market gains',
                'Protect qualifying deposits if a bank fails, up to program limits',
                'Eliminate every banking fee forever',
                'Force you to use only cash',
              ],
              1,
              'Insurance programs protect eligible deposits within stated limits when a bank fails.',
            ),
            q(
              'unit-07-q1-d',
              'Compared with a typical bank, a credit union is generally:',
              [
                'Member-owned rather than a standard for-profit bank corporation',
                'Unable to offer checking accounts',
                'A type of grocery store',
                'A government that prints currency',
              ],
              0,
              'Credit unions are cooperatives owned by members and often offer similar retail banking services.',
            ),
          ]),
        },
      },
    ],
  },
  {
    id: 'unit-08',
    number: 8,
    title: 'Saving and Interest',
    summary:
      'Learn why saving matters, how interest works, and how time turns small deposits into larger balances.',
    buildingId: 'bank',
    topics: [
      {
        id: 'unit-08-t1',
        title: 'Building Savings with Interest',
        summary:
          'Interest rates, compounding, and goals turn spare cash into a cushion for real life.',
        lesson: {
          id: 'unit-08-l1',
          title: 'Letting Time Work for You',
          body: `Saving means setting aside money today for use tomorrow. An emergency fund is savings reserved for unexpected costs—a phone repair, a medical bill, or a gap between jobs—so you are less likely to swipe a credit card in panic. Even on a first-job budget, automatic transfers of small amounts into savings create a habit before lifestyle spending expands to fill every paycheck.

Interest is the price of using money over time. When you save in a bank account, the bank may pay you interest. When you borrow, you pay interest to the lender. The interest rate is usually stated as a percent per year. Simple interest is calculated mainly on the original principal—the starting amount. Compound interest means you earn interest on both the principal and on interest already added, so growth can accelerate if you leave the money invested or deposited.

Suppose you save fifty dollars a month from weekend shifts. Alone, each deposit looks small. Over many months, the balance becomes a real cushion for a first apartment deposit or a month of rent. The earlier you start, the more periods compounding has to work—though low rates grow slowly, and inflation can reduce purchasing power if rates lag behind price rises.

A goal needs a number and a date. “I need nine hundred dollars for first and last month’s rent in ten months” is clearer than “I should save more.” Divide the target by the months you have, then automate that amount on payday. Opportunity cost still applies: money saved cannot be spent on concert merch today, but it buys options and safety later.

Risk and return usually move together for investments beyond basic savings accounts. Money in an insured savings account prioritizes safety and liquidity over high growth. As you learn more in later units, you will see other tools—but the foundation is consistent saving, understanding interest, and giving time a chance to multiply disciplined deposits.

If your first job income varies with hours or tips, save a higher share in strong weeks and a smaller floor amount in weak weeks so the habit survives. Name your savings sub-goals in the app—“apartment,” “phone repair,” “trip”—so you are less tempted to raid the whole balance for one impulse buy.`,
          whyItMatters:
            'Small, automatic saving plus compounding is how first-job income turns into apartment deposits and real security.',
          quiz: quiz('unit-08-q1', 'Saving and Interest Check', [
            q(
              'unit-08-q1-a',
              'Principal in a savings context usually means:',
              [
                'The original amount of money deposited or invested',
                'A school administrator',
                'A type of credit card reward only',
                'A government tax on groceries',
              ],
              0,
              'Principal is the starting sum on which interest may be calculated.',
            ),
            q(
              'unit-08-q1-b',
              'Compound interest differs from simple interest because compound interest:',
              [
                'Is never measured in percents',
                'Earns interest on prior interest as well as principal',
                'Can only be paid in cash coins',
                'Applies solely to unpaid parking tickets',
              ],
              1,
              'Compounding adds interest to the balance, so future interest can be earned on a larger amount.',
            ),
            q(
              'unit-08-q1-c',
              'An emergency fund is best used for:',
              [
                'Impulse shopping every weekend',
                'Unexpected necessary expenses',
                'Replacing the need for any income',
                'Paying interest to a friend as a hobby',
              ],
              1,
              'Emergency savings cover surprises so you rely less on high-interest debt.',
            ),
            q(
              'unit-08-q1-d',
              'Automating a transfer to savings on payday mainly helps you:',
              [
                'Ignore all future goals',
                'Build balances before spending money elsewhere',
                'Increase overdraft fees on purpose',
                'Cancel deposit insurance',
              ],
              1,
              'Paying yourself first through automation makes saving consistent.',
            ),
          ]),
        },
      },
    ],
  },
  {
    id: 'unit-09',
    number: 9,
    title: 'Credit and Borrowing',
    summary:
      'Understand loans, credit cards, interest costs, and how to borrow without trapping your future income.',
    buildingId: 'bank',
    topics: [
      {
        id: 'unit-09-t1',
        title: 'Using Other People’s Money Carefully',
        summary:
          'Credit lets you buy now and pay later—with rules, interest, and responsibilities attached.',
        lesson: {
          id: 'unit-09-l1',
          title: 'Borrowing Without Blind Spots',
          body: `Credit is an agreement to receive money, goods, or services now and pay later. A loan is a lump sum you repay on a schedule. A credit card is a revolving line of credit: you can borrow up to a credit limit, repay, and borrow again. When you get a first credit card, you are not getting free money—you are getting a flexible loan that becomes expensive if you carry a balance.

Interest on debt is the cost of borrowing. Card issuers often quote an annual percentage rate, or APR, which expresses yearly interest cost. If you pay the full statement balance by the due date, many cards charge no interest on new purchases for that cycle. If you pay only the minimum, interest can pile up on the remaining balance, and a small purchase can cost far more over time.

Secured credit is backed by collateral—an asset the lender can claim if you do not pay, such as a car for an auto loan. Unsecured credit, including most credit cards, has no collateral; lenders rely more on your promise and credit history, so rates may be higher. A cosigner promises to repay if you do not; that helps some first-time borrowers but puts the cosigner’s finances at risk.

Fees matter too: annual fees, late fees, and cash-advance fees can add cost beyond interest. Always read the Schumer box—the summary table of rates and fees on card offers—before you apply. Borrowing for a depreciating want, like a weekend trip you cannot repay soon, is riskier than borrowing for a carefully planned need with a payoff path.

Healthy habits include charging only what you can repay quickly, setting calendar reminders for due dates, and keeping utilization—how much of your limit you use—moderate. Credit can help you build a rental history bridge toward a first apartment when used responsibly, but missed payments can haunt applications and budgets for years.

Before you borrow, write the monthly payment you can truly afford after rent, food, and transit. If the number only works if nothing goes wrong, the loan is too big. Credit is a tool for timing purchases—not a raise. Using it that way protects your future self from paying yesterday’s fun twice.`,
          whyItMatters:
            'Understanding APR, balances, and fees turns a first credit card from a trap into a controlled tool.',
          quiz: quiz('unit-09-q1', 'Credit and Borrowing Check', [
            q(
              'unit-09-q1-a',
              'Revolving credit, such as a credit card, means:',
              [
                'You may borrow, repay, and borrow again up to a limit',
                'You must repay a fixed car loan with no card involved',
                'Interest is illegal on all balances',
                'You can only spend cash you already withdrew',
              ],
              0,
              'Revolving credit reopens as you repay, up to the credit limit.',
            ),
            q(
              'unit-09-q1-b',
              'APR on a credit card mainly describes:',
              [
                'The color of the plastic card',
                'The yearly cost of interest expressed as a rate',
                'Your work schedule at a first job',
                'The number of ATMs downtown',
              ],
              1,
              'APR is the annualized percentage rate used to express interest cost.',
            ),
            q(
              'unit-09-q1-c',
              'A secured loan is one that:',
              [
                'Has collateral the lender may claim if you default',
                'Never requires repayment',
                'Can only be issued by a roommate',
                'Ignores all contracts',
              ],
              0,
              'Collateral backs secured loans and reduces lender risk.',
            ),
            q(
              'unit-09-q1-d',
              'Paying only the minimum credit card payment each month most often:',
              [
                'Erases interest permanently',
                'Can leave a balance that keeps accruing interest',
                'Raises your deposit insurance limit',
                'Converts the card into a savings account',
              ],
              1,
              'Minimum payments can stretch repayment while interest continues on remaining balances.',
            ),
          ]),
        },
      },
    ],
  },
  {
    id: 'unit-10',
    number: 10,
    title: 'Credit Scores and Reports',
    summary:
      'See what credit reports record, how scores are built, and why landlords and lenders care.',
    buildingId: 'bank',
    topics: [
      {
        id: 'unit-10-t1',
        title: 'Your Financial Reputation on Paper',
        summary:
          'Credit reports and scores summarize payment history and influence loans, cards, and sometimes housing.',
        lesson: {
          id: 'unit-10-l1',
          title: 'What Lenders Look Up About You',
          body: `A credit report is a detailed record of your credit history compiled by credit bureaus—companies that gather information from lenders and public records. It typically lists accounts, credit limits, balances, payment history, and inquiries when someone checks your credit. A credit score is a three-digit summary model that translates report data into a number lenders use to estimate risk. Higher scores generally mean lower predicted risk of missed payments.

Common score factors include payment history (whether you pay on time), amounts owed and credit utilization, length of credit history, mix of account types, and recent new credit. Payment history usually weighs heavily: a late payment on a first credit card can hurt more than you expect. Opening many new accounts at once can also look risky.

Landlords evaluating a first apartment, auto lenders, and card issuers may review reports or scores. Employers in some roles may use related checks under legal rules. That is why accuracy matters. You have the right to review your reports and dispute errors—wrong accounts or payments marked late incorrectly. Regular check-ins help you catch identity theft early, such as an account you never opened.

A hard inquiry occurs when you apply for new credit and a lender checks your report; several hard inquiries in a short period can nudge scores down temporarily. A soft inquiry—like checking your own score—typically does not hurt. Building credit as a teen or young adult can start with a responsible card, becoming an authorized user under careful family rules, or small installment loans paid on time—always with a plan to repay.

Credit scores are not character judgments; they are risk tools. You can improve them with time and consistent on-time payments, keeping balances manageable, and avoiding unnecessary applications. Protecting your report is part of protecting your future rent approvals and loan rates.

Set a recurring reminder to review your reports a few times a year, especially before applying for a card, auto loan, or apartment. Freeze or lock your credit if your bureau offers that option and you are not actively applying—it adds a barrier against new accounts opened in your name. Good credit is built slowly and damaged quickly; treat on-time payment like a non-negotiable bill to yourself.`,
          whyItMatters:
            'On-time payments and clean reports make first apartments and fair loan offers far more reachable.',
          quiz: quiz('unit-10-q1', 'Credit Scores and Reports Check', [
            q(
              'unit-10-q1-a',
              'A credit report is best described as:',
              [
                'A detailed history of your credit accounts and related activity',
                'A list of your favorite stores only',
                'Your high-school transcript',
                'A grocery receipt total',
              ],
              0,
              'Credit reports compile account history, payments, and related credit data.',
            ),
            q(
              'unit-10-q1-b',
              'Which factor often has a major influence on credit scores?',
              [
                'Your favorite music genre',
                'Payment history—paying on time',
                'The color of your debit card',
                'How many hobbies you list online',
              ],
              1,
              'On-time payment history is typically one of the most important score factors.',
            ),
            q(
              'unit-10-q1-c',
              'Checking your own credit report is usually a:',
              [
                'Soft inquiry that typically does not hurt your score',
                'Hard inquiry that always deletes your history',
                'Criminal investigation',
                'Requirement to close all accounts',
              ],
              0,
              'Self-checks are generally soft inquiries and do not penalize your score like applications may.',
            ),
            q(
              'unit-10-q1-d',
              'If your credit report shows an account you never opened, you should:',
              [
                'Ignore it forever',
                'Dispute the error and watch for identity theft',
                'Pay random bills on that account without reading',
                'Cancel your first job immediately',
              ],
              1,
              'Unknown accounts may be errors or fraud; disputing and investigating protects you.',
            ),
          ]),
        },
      },
    ],
  },
  {
    id: 'unit-11',
    number: 11,
    title: 'Career and Income',
    summary:
      'Connect skills, jobs, and paystubs so your first earnings support both today and future goals.',
    buildingId: 'office',
    topics: [
      {
        id: 'unit-11-t1',
        title: 'From Skills to Paychecks',
        summary:
          'Career paths, gross versus net pay, and income types explain what actually lands in your account.',
        lesson: {
          id: 'unit-11-l1',
          title: 'Earning Your Way Forward',
          body: `A career is a longer path of work that can grow over time; a job is a specific role you hold now. Your first job might be in retail, food service, or an office—valuable for skills even if it is not your forever plan. Human capital is the skills, knowledge, and experience you bring to work. Education, practice, certifications, and reliable habits raise human capital and can raise your earning potential.

Income is money received. Earned income comes from work—wages (often hourly) or salary (a set annual amount). Unearned income can include interest on savings or gifts. Tips and commissions reward performance in some roles. When employers talk about a pay rate, ask whether it is hourly or salaried and how overtime works if you are eligible.

Gross pay is what you earn before deductions. Net pay—take-home pay—is what remains after deductions such as income tax withholding, Social Security and Medicare contributions where they apply, and optional items like health insurance premiums. Your first paystub can look surprising: the hourly rate times hours does not equal the deposit. Reading each line prevents budgeting from fantasy numbers.

Benefits are non-wage compensation: health coverage, paid time off, retirement plan matches, or transit subsidies. A slightly lower wage with strong benefits can beat a higher wage with none, depending on your situation. When comparing offers, convert benefits into rough yearly value instead of staring only at the headline rate.

Career decisions involve opportunity cost. An unpaid internship might build skills for a better role later, but only if you can afford the short-term income loss. Overtime at a first job can fund a first apartment deposit faster, yet tiredness can cost grades or health. Keep a simple record of skills you gain—customer service, software tools, teamwork—so your next application is concrete. Income is the fuel for saving, credit building, and independence; understanding how it is calculated keeps that fuel from springing leaks.

When a manager offers more hours, calculate net pay, not just gross, and compare it with sleep and study needs. Ask early how raises and promotions work. A clear path—even a small one—turns a first job from a temporary paycheck into the start of a career story you control.`,
          whyItMatters:
            'Knowing gross versus net pay and how skills raise earnings helps you plan rent, saving, and the next step up.',
          quiz: quiz('unit-11-q1', 'Career and Income Check', [
            q(
              'unit-11-q1-a',
              'Human capital refers to:',
              [
                'Your skills, knowledge, and experience that have value at work',
                'Only the cash in your wallet',
                'A type of factory machine',
                'Government-printed coupons',
              ],
              0,
              'Human capital is the productive abilities people develop and bring to jobs.',
            ),
            q(
              'unit-11-q1-b',
              'Net pay is best defined as:',
              [
                'Pay before any deductions',
                'Take-home pay after deductions',
                'A loan from your employer',
                'The sticker price of a credit card',
              ],
              1,
              'Net pay is what you receive after taxes and other deductions.',
            ),
            q(
              'unit-11-q1-c',
              'Gross pay is:',
              [
                'Earnings before deductions',
                'Only tip money in cash',
                'Interest charged on a credit card',
                'Rent owed to a landlord',
              ],
              0,
              'Gross pay is the total earned before withholding and other deductions.',
            ),
            q(
              'unit-11-q1-d',
              'Which of the following is an example of a job benefit beyond wages?',
              [
                'Employer-sponsored health insurance',
                'An unpaid parking ticket',
                'A higher APR on a credit card',
                'A grocery surplus in a market graph',
              ],
              0,
              'Benefits include non-wage compensation such as health coverage or retirement matches.',
            ),
          ]),
        },
      },
    ],
  },
]
