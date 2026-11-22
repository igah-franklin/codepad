import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'conditionals',
  title: 'Conditionals & Logic',
  description: 'if / else chains, boolean logic and handling every case.',
  challenges: [
    {
      title: 'Letter Grade', fn: 'letterGrade', args: ['score'],
      prompt: 'Return the letter grade for a score from 0 to 100: 90+ is "A", 80+ is "B", 70+ is "C", 60+ is "D", anything lower is "F".',
      tests: [[[95], 'A'], [[90], 'A'], [[89], 'B'], [[75], 'C'], [[60], 'D'], [[59], 'F'], [[0], 'F'], [[100], 'A']],
      js: String.raw`function letterGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}`,
      py: String.raw`def letter_grade(score):
    if score >= 90:
        return "A"
    if score >= 80:
        return "B"
    if score >= 70:
        return "C"
    if score >= 60:
        return "D"
    return "F"`,
      explain: `Order the checks from the highest threshold down, so each condition only needs a lower bound.

When we reach "score >= 80", we already know the score is below 90, because a score of 90 or more would have returned "A" already. Early returns make that implicit, so there is no need to write ranges like 80 <= score < 90.

Test the boundaries on purpose: 90, 89, 60 and 59 are exactly where an off-by-one mistake (> instead of >=) would show up. The tests here include them for that reason.

For many thresholds, a data-driven version is cleaner: loop over [[90, 'A'], [80, 'B'], ...] and return the first grade whose threshold the score meets.`,
      complexity: 'O(1) time, O(1) space',
    },
    {
      title: 'Sign of a Number', fn: 'sign', args: ['n'],
      prompt: 'Return "positive", "negative" or "zero" depending on n.',
      tests: [[[5], 'positive'], [[-3], 'negative'], [[0], 'zero'], [[0.5], 'positive'], [[-0.001], 'negative']],
      js: String.raw`function sign(n) {
  if (n > 0) return 'positive';
  if (n < 0) return 'negative';
  return 'zero';
}`,
      py: String.raw`def sign(n):
    if n > 0:
        return "positive"
    if n < 0:
        return "negative"
    return "zero"`,
      explain: `Three outcomes, three branches. The final return needs no condition: once n is neither greater than nor less than 0, it must be 0.

This "fall-through default" style is a good habit. The last case is whatever remains, which guarantees the function always returns something. A chain where every branch has a condition can accidentally return nothing (undefined or None) when no branch matches.

Works for decimals too: 0.5 is positive and -0.001 is negative.`,
      complexity: 'O(1) time, O(1) space',
    },
    {
      title: 'Triangle Type', fn: 'triangleType', args: ['a', 'b', 'c'],
      prompt: 'Given three side lengths, return "invalid" if they cannot form a triangle (each side must be shorter than the sum of the other two, and all sides positive). Otherwise return "equilateral" (all equal), "isosceles" (exactly two equal) or "scalene" (all different).',
      tests: [[[3, 3, 3], 'equilateral'], [[3, 3, 5], 'isosceles'], [[3, 4, 5], 'scalene'], [[1, 2, 3], 'invalid'], [[1, 1, 5], 'invalid'], [[0, 0, 0], 'invalid'], [[5, 3, 5], 'isosceles']],
      js: String.raw`function triangleType(a, b, c) {
  if (a <= 0 || b <= 0 || c <= 0) return 'invalid';
  if (a + b <= c || a + c <= b || b + c <= a) return 'invalid';
  if (a === b && b === c) return 'equilateral';
  if (a === b || b === c || a === c) return 'isosceles';
  return 'scalene';
}`,
      py: String.raw`def triangle_type(a, b, c):
    if a <= 0 or b <= 0 or c <= 0:
        return "invalid"
    if a + b <= c or a + c <= b or b + c <= a:
        return "invalid"
    if a == b == c:
        return "equilateral"
    if a == b or b == c or a == c:
        return "isosceles"
    return "scalene"`,
      explain: `Validate first, then classify.

Validation (the triangle inequality): every side must be strictly shorter than the sum of the other two. With 1, 2, 3 the two short sides only just reach the third side, so they lie flat and do not form a triangle. That is why the check uses <=. Lengths of zero or less are rejected too.

Classification:
1. All three equal means equilateral. Python allows chained comparisons like a == b == c.
2. Otherwise, any pair equal means isosceles. We have already ruled out all three being equal, so this is "exactly two".
3. Otherwise scalene.

Checking the strictest case (equilateral) before the looser one (isosceles) is the same ordering principle as Letter Grade.

Shortcut: sort the sides, and then only one inequality needs checking: smallest + middle > largest.`,
      complexity: 'O(1) time, O(1) space',
    },
    {
      title: 'Ticket Price', fn: 'ticketPrice', args: ['age'],
      prompt: 'A cinema charges: under 3 free (0), ages 3–11 pay 5, ages 12–64 pay 12, and 65 or older pay 7. Return the price for the given age.',
      tests: [[[2], 0], [[3], 5], [[11], 5], [[12], 12], [[64], 12], [[65], 7], [[90], 7], [[0], 0]],
      js: String.raw`function ticketPrice(age) {
  if (age < 3) return 0;
  if (age < 12) return 5;
  if (age < 65) return 12;
  return 7;
}`,
      py: String.raw`def ticket_price(age):
    if age < 3:
        return 0
    if age < 12:
        return 5
    if age < 65:
        return 12
    return 7`,
      explain: `Age bands are ranges that touch end to end, so sort them by their upper limit and check each with a single comparison.

Translating "ages 3 to 11" into code takes care. Since the bands are whole years, "age < 12" captures 3 through 11 once "age < 3" has already been handled.

Testing at every boundary (2/3, 11/12, 64/65) is how you catch off-by-one errors. Notice the tests do exactly that. When you write your own tests, pick the values right at the edges of each rule.

The final return 7 covers everything that is left, which is everyone 65 or older.`,
      complexity: 'O(1) time, O(1) space',
    },
    {
      title: 'Rock, Paper, Scissors', fn: 'rps', args: ['p1', 'p2'],
      prompt: 'Each argument is "rock", "paper" or "scissors". Return "player1" if p1 wins, "player2" if p2 wins, or "draw". Rock beats scissors, scissors beats paper, paper beats rock.',
      tests: [[['rock', 'scissors'], 'player1'], [['rock', 'paper'], 'player2'], [['paper', 'paper'], 'draw'], [['scissors', 'paper'], 'player1'], [['scissors', 'rock'], 'player2'], [['paper', 'rock'], 'player1']],
      js: String.raw`function rps(p1, p2) {
  if (p1 === p2) return 'draw';
  const beats = { rock: 'scissors', scissors: 'paper', paper: 'rock' };
  return beats[p1] === p2 ? 'player1' : 'player2';
}`,
      py: String.raw`def rps(p1, p2):
    if p1 == p2:
        return "draw"
    beats = {"rock": "scissors", "scissors": "paper", "paper": "rock"}
    return "player1" if beats[p1] == p2 else "player2"`,
      explain: `You could write nine if statements, one for every pair, but storing the rules as data is cleaner.

1. Same choice means a draw.
2. A lookup table records what each move beats: rock beats scissors, and so on.
3. If p1's move beats p2's move, player 1 wins. Otherwise, since it is not a draw, player 2 wins.

Replacing branches with a lookup table is a useful technique. The logic stays the same size however many rules there are. Adding "lizard" and "Spock" would just change the table, with each move mapping to the set of moves it beats.`,
      complexity: 'O(1) time, O(1) space',
    },
    {
      title: 'Clamp a Value', fn: 'clamp', args: ['x', 'lo', 'hi'],
      prompt: 'Return x limited to the range [lo, hi]: lo if x is below it, hi if x is above it, otherwise x itself.',
      tests: [[[5, 0, 10], 5], [[-5, 0, 10], 0], [[15, 0, 10], 10], [[0, 0, 10], 0], [[10, 0, 10], 10], [[-3, -5, -1], -3]],
      js: String.raw`function clamp(x, lo, hi) {
  if (x < lo) return lo;
  if (x > hi) return hi;
  return x;
}`,
      py: String.raw`def clamp(x, lo, hi):
    if x < lo:
        return lo
    if x > hi:
        return hi
    return x`,
      explain: `Clamping keeps a value inside a range. You will see it everywhere: keeping a slider within its track, a game character on screen, or the font size between 10 and 24 in Codepad's settings.

The two guard checks handle the out-of-range cases, and everything else passes through unchanged.

One-liner: Math.min(Math.max(x, lo), hi). Read it from the inside out: first raise x to at least lo, then cap it at hi. In Python: min(max(x, lo), hi).

Values exactly at lo or hi are already inside the range and are returned as they are.`,
      complexity: 'O(1) time, O(1) space',
    },
    {
      title: 'Day of the Week', fn: 'dayName', args: ['n'],
      prompt: 'Return the name of day n where 1 is "Monday" and 7 is "Sunday". For any other value return "invalid".',
      tests: [[[1], 'Monday'], [[3], 'Wednesday'], [[7], 'Sunday'], [[0], 'invalid'], [[8], 'invalid'], [[-1], 'invalid'], [[6], 'Saturday']],
      js: String.raw`function dayName(n) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  if (n < 1 || n > 7) return 'invalid';
  return days[n - 1];
}`,
      py: String.raw`def day_name(n):
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    if n < 1 or n > 7:
        return "invalid"
    return days[n - 1]`,
      explain: `When an input maps to a fixed set of outputs, an array lookup beats a long switch statement.

1. Check that n is in range before indexing, so a bad input cannot cause a bad lookup.
2. Convert from the 1-based day number to the 0-based array index with n - 1.

Why validate? Python allows negative indices: days[-1] is "Sunday", so day_name(0) would wrongly return "Sunday" without the check. JavaScript returns undefined for out-of-range indices. Either way you would silently get the wrong answer, so check first.

Converting between 1-based (how people count) and 0-based (how arrays count) is a constant source of off-by-one bugs, so make it explicit as here.`,
      complexity: 'O(1) time, O(1) space',
    },
    {
      title: 'Point Quadrant', fn: 'quadrant', args: ['x', 'y'],
      prompt: 'Return the quadrant (1–4) of point (x, y): 1 is top-right (x>0, y>0), 2 top-left, 3 bottom-left, 4 bottom-right. Return 0 if the point lies on an axis.',
      tests: [[[1, 1], 1], [[-1, 1], 2], [[-1, -1], 3], [[1, -1], 4], [[0, 5], 0], [[5, 0], 0], [[0, 0], 0]],
      js: String.raw`function quadrant(x, y) {
  if (x === 0 || y === 0) return 0;
  if (x > 0) return y > 0 ? 1 : 4;
  return y > 0 ? 2 : 3;
}`,
      py: String.raw`def quadrant(x, y):
    if x == 0 or y == 0:
        return 0
    if x > 0:
        return 1 if y > 0 else 4
    return 2 if y > 0 else 3`,
      explain: `Handle the special case (on an axis) first. After that, two yes/no questions (is x positive? is y positive?) give four combinations, one per quadrant.

Branching on x first and then on y halves the problem at each step:
- x > 0: the point is on the right, quadrant 1 (above) or 4 (below).
- x < 0: the point is on the left, quadrant 2 (above) or 3 (below).

Nesting decisions this way, like a small decision tree, keeps each line simple and makes it easy to confirm that all four cases are covered.`,
      complexity: 'O(1) time, O(1) space',
    },
    {
      title: 'Valid Clock Time', fn: 'isValidTime', args: ['h', 'm'],
      prompt: 'Return true if h:m is a valid 24-hour clock time: h is an integer 0–23 and m is an integer 0–59.',
      tests: [[[0, 0], true], [[23, 59], true], [[24, 0], false], [[12, 60], false], [[-1, 30], false], [[9, 5], true], [[1.5, 0], false]],
      js: String.raw`function isValidTime(h, m) {
  return Number.isInteger(h) && Number.isInteger(m) &&
    h >= 0 && h <= 23 && m >= 0 && m <= 59;
}`,
      py: String.raw`def is_valid_time(h, m):
    return (isinstance(h, int) and isinstance(m, int)
            and 0 <= h <= 23 and 0 <= m <= 59)`,
      explain: `Validation means every condition must be true, so join them with AND.

1. Both values must be whole numbers. 1.5 hours is not a clock reading.
2. Hours must be in 0..23.
3. Minutes must be in 0..59.

Python's chained comparison 0 <= h <= 23 reads just like math notation. In JavaScript you have to write the two halves separately.

AND short-circuits: as soon as one condition is false, the rest are skipped. That is why the type checks come first. The range checks only run on values we already know are integers.

Notice that the whole function is a single boolean expression. When a function's job is to answer yes or no, returning the condition directly is often the cleanest form.`,
      complexity: 'O(1) time, O(1) space',
    },
    {
      title: 'Days in a Month', fn: 'daysInMonth', args: ['month', 'year'],
      prompt: 'Return the number of days in the given month (1–12) of the given year, accounting for leap years in February.',
      tests: [[[1, 2023], 31], [[2, 2023], 28], [[2, 2024], 29], [[2, 1900], 28], [[2, 2000], 29], [[4, 2022], 30], [[12, 1999], 31], [[9, 2020], 30]],
      js: String.raw`function daysInMonth(month, year) {
  if (month === 2) {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return leap ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}`,
      py: String.raw`def days_in_month(month, year):
    if month == 2:
        leap = (year % 4 == 0 and year % 100 != 0) or year % 400 == 0
        return 29 if leap else 28
    return 30 if month in (4, 6, 9, 11) else 31`,
      explain: `This reuses the leap-year rule from Basics & Math.

1. February is the only month that varies, so it gets its own branch using the leap-year test: divisible by 4 and not by 100, or divisible by 400.
2. Of the remaining months, April, June, September and November have 30 days ("thirty days hath September...").
3. Everything else has 31.

Testing membership in a small list ([4, 6, 9, 11].includes(month) or month in (4, 6, 9, 11)) is clearer than four OR'd comparisons.

Production code should use the date library (for example, new Date(year, month, 0).getDate() in JavaScript), but knowing the rule lets you test such code with confidence.`,
      complexity: 'O(1) time, O(1) space',
    },
  ],
};

export default m;
