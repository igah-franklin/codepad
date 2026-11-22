import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'basics',
  title: 'Basics & Math',
  description: 'Functions, arithmetic and return values: the building blocks of every program.',
  challenges: [
    {
      title: 'Sum of Two Numbers', fn: 'add', args: ['a', 'b'],
      prompt: 'Write a function that takes two numbers a and b and returns their sum.',
      tests: [[[1, 2], 3], [[-4, 10], 6], [[0, 0], 0], [[-3, -7], -10], [[1000000, 2500000], 3500000]],
      js: String.raw`function add(a, b) {
  return a + b;
}`,
      py: String.raw`def add(a, b):
    return a + b`,
      explain: `This challenge is about the shape of a function more than the math. A function receives inputs (parameters), does some work, and hands a value back with return.

Step by step:
1. The function receives a and b.
2. The + operator adds them.
3. return sends the result back to whoever called the function.

A common beginner mistake is printing the answer instead of returning it. Printing only shows text in the console; the caller (here, the test runner) gets nothing back. Always return the value when a function is asked to "return" something.

Negative numbers and zero need no special handling because + already works for every integer.`,
      complexity: 'O(1) time, O(1) space',
    },
    {
      title: 'Even or Odd', fn: 'isEven', args: ['n'],
      prompt: 'Return true if the integer n is even and false if it is odd.',
      tests: [[[4], true], [[7], false], [[0], true], [[-2], true], [[-3], false], [[1000001], false]],
      js: String.raw`function isEven(n) {
  return n % 2 === 0;
}`,
      py: String.raw`def is_even(n):
    return n % 2 == 0`,
      explain: `The remainder operator % gives what is left over after division. A number is even exactly when dividing it by 2 leaves nothing over, so n % 2 is 0 for even numbers.

The comparison n % 2 === 0 already produces a boolean, so you can return it directly. Writing "if (cond) return true; else return false;" works but is longer than it needs to be.

Negative numbers: in JavaScript, -3 % 2 is -1, not 1. That is why the check compares with 0 rather than testing "n % 2 === 1" for odd. Comparing against 0 is correct in both languages for every integer, including negatives and zero.`,
      complexity: 'O(1) time, O(1) space',
    },
    {
      title: 'Largest of Three', fn: 'maxOfThree', args: ['a', 'b', 'c'],
      prompt: 'Return the largest of the three numbers a, b and c. Try solving it with comparisons before reaching for a built-in max.',
      tests: [[[1, 2, 3], 3], [[9, 4, 7], 9], [[5, 8, 2], 8], [[-1, -5, -3], -1], [[4, 4, 2], 4], [[0, 0, 0], 0]],
      js: String.raw`function maxOfThree(a, b, c) {
  let best = a;
  if (b > best) best = b;
  if (c > best) best = c;
  return best;
}`,
      py: String.raw`def max_of_three(a, b, c):
    best = a
    if b > best:
        best = b
    if c > best:
        best = c
    return best`,
      explain: `Keep a "best so far" value and challenge it with each remaining number.

1. Assume the first number, a, is the largest.
2. If b is bigger than the current best, b becomes the best.
3. If c is bigger than the current best, c becomes the best.
4. Return best.

This "running champion" pattern scales to any number of values: it is exactly how you find the maximum of a whole list with a loop, which you will do in the Arrays module.

Ties are handled naturally. With 4, 4, 2 the first 4 is kept and the second 4 is not strictly greater, so the answer is 4 either way.

In real code you would write Math.max(a, b, c) in JavaScript or max(a, b, c) in Python, and both are fine here too.`,
      complexity: 'O(1) time, O(1) space',
    },
    {
      title: 'Celsius to Fahrenheit', fn: 'celsiusToFahrenheit', args: ['c'],
      prompt: 'Convert a temperature from Celsius to Fahrenheit using F = C × 9/5 + 32.',
      compare: 'float',
      tests: [[[0], 32], [[100], 212], [[-40], -40], [[37], 98.6], [[21.5], 70.7]],
      js: String.raw`function celsiusToFahrenheit(c) {
  return c * 9 / 5 + 32;
}`,
      py: String.raw`def celsius_to_fahrenheit(c):
    return c * 9 / 5 + 32`,
      explain: `This is a direct translation of a formula into code. Multiplication and division happen before addition (operator precedence), so c * 9 / 5 + 32 is evaluated as ((c * 9) / 5) + 32, which is exactly the formula.

Floating point: computers store decimals in binary, so 37 * 9 / 5 + 32 may come out as 98.60000000000001 instead of 98.6. That is normal, and the tests for this challenge accept answers within a tiny tolerance. When you compare decimals in your own code, compare with a tolerance (Math.abs(x - y) < 1e-9) instead of ===.

Sanity checks help: 0 °C is 32 °F (water freezes), 100 °C is 212 °F (water boils), and -40 is the same in both scales.`,
      complexity: 'O(1) time, O(1) space',
    },
    {
      title: 'Average of Three', fn: 'average', args: ['a', 'b', 'c'],
      prompt: 'Return the average (arithmetic mean) of three numbers.',
      compare: 'float',
      tests: [[[1, 2, 3], 2], [[10, 20, 25], 18.333333333], [[0, 0, 0], 0], [[-3, 3, 6], 2], [[1, 2, 2], 1.6666666667]],
      js: String.raw`function average(a, b, c) {
  return (a + b + c) / 3;
}`,
      py: String.raw`def average(a, b, c):
    return (a + b + c) / 3`,
      explain: `The mean is the total divided by how many values there are.

The parentheses matter. Without them, a + b + c / 3 divides only c by 3, because division binds tighter than addition. Writing (a + b + c) / 3 forces the sum to be computed first.

In Python 3 the / operator always produces a float, so 7 / 2 is 3.5. (The // operator does integer division.) In JavaScript all numbers are floating point, so / never truncates.

Results such as 18.333... cannot be written exactly in binary, so the tests compare with a small tolerance.`,
      complexity: 'O(1) time, O(1) space',
    },
    {
      title: 'Absolute Difference', fn: 'absDiff', args: ['a', 'b'],
      prompt: 'Return the distance between a and b on the number line, which is always zero or positive. Do it without a built-in abs function.',
      tests: [[[3, 10], 7], [[10, 3], 7], [[-5, 5], 10], [[4, 4], 0], [[-8, -2], 6]],
      js: String.raw`function absDiff(a, b) {
  const d = a - b;
  return d < 0 ? -d : d;
}`,
      py: String.raw`def abs_diff(a, b):
    d = a - b
    return -d if d < 0 else d`,
      explain: `Subtracting gives a signed difference: 3 - 10 is -7, 10 - 3 is 7. The distance is the same in both cases, so a negative result just needs its sign flipped.

1. Compute d = a - b.
2. If d is negative, return -d (which is positive); otherwise return d.

The ternary expression (cond ? x : y in JavaScript, x if cond else y in Python) chooses between two values in one line.

With built-ins it is simply Math.abs(a - b) or abs(a - b). Writing it by hand shows what abs does internally.`,
      complexity: 'O(1) time, O(1) space',
    },
    {
      title: 'Sum from 1 to N', fn: 'sumToN', args: ['n'],
      prompt: 'Return 1 + 2 + ... + n for a non-negative integer n. For n = 0 the sum is 0.',
      tests: [[[1], 1], [[5], 15], [[10], 55], [[0], 0], [[100], 5050], [[1000000], 500000500000]],
      js: String.raw`function sumToN(n) {
  return n * (n + 1) / 2;
}`,
      py: String.raw`def sum_to_n(n):
    return n * (n + 1) // 2`,
      explain: `There are two good solutions.

Loop: start total at 0 and add every number from 1 to n. That takes n steps.

Formula (used here): pair the first and last numbers. 1 + n, 2 + (n - 1), 3 + (n - 2) and so on all equal n + 1, and there are n / 2 such pairs. So the total is n × (n + 1) / 2. This is the formula young Gauss is said to have used, and it takes a single step however large n is.

n × (n + 1) is always even (one of two consecutive numbers is even), so the division is exact. In Python we use // so the result stays an integer instead of becoming a float like 5050.0.

The last test uses n = 1,000,000. A loop handles that fine, but the formula is instant.`,
      complexity: 'O(1) time with the formula (O(n) with a loop), O(1) space',
    },
    {
      title: 'Factorial', fn: 'factorial', args: ['n'],
      prompt: 'Return n! = 1 × 2 × ... × n for a non-negative integer n (n ≤ 20). By definition 0! = 1.',
      tests: [[[0], 1], [[1], 1], [[5], 120], [[7], 5040], [[10], 3628800], [[15], 1307674368000]],
      js: String.raw`function factorial(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}`,
      py: String.raw`def factorial(n):
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result`,
      explain: `Factorial is a running product, just like a running sum but with multiplication.

1. Start result at 1. It has to be 1, not 0: multiplying by 0 would wipe everything out, and 1 is the "do nothing" value for multiplication.
2. Multiply result by every integer from 2 up to n.
3. Return result.

With result starting at 1, the cases n = 0 and n = 1 need no special code: the loop simply never runs.

Recursive version: factorial(n) = n × factorial(n - 1), with factorial(0) = 1. It is elegant, but each call uses stack space, so the loop is safer for large n.

Size limits: factorials grow very fast. 20! still fits exactly in a JavaScript number; 21! and beyond lose precision (use BigInt). Python integers have no size limit.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Leap Year', fn: 'isLeapYear', args: ['year'],
      prompt: 'Return true if year is a leap year in the Gregorian calendar. A year is a leap year if it is divisible by 4, except century years (divisible by 100), which are leap years only if they are also divisible by 400.',
      tests: [[[2024], true], [[2023], false], [[1900], false], [[2000], true], [[2100], false], [[1996], true], [[1600], true]],
      js: String.raw`function isLeapYear(year) {
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  return year % 4 === 0;
}`,
      py: String.raw`def is_leap_year(year):
    if year % 400 == 0:
        return True
    if year % 100 == 0:
        return False
    return year % 4 == 0`,
      explain: `The rule has exceptions, and exceptions to the exception, so check the most specific case first.

1. Divisible by 400: always a leap year (1600, 2000).
2. Otherwise divisible by 100: not a leap year (1900, 2100).
3. Otherwise it is a leap year exactly when divisible by 4 (1996, 2024).

Order matters. If you checked "divisible by 4" first, 1900 would wrongly pass, because 1900 is divisible by 4.

As a single expression: (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0. Both versions are correct; the step-by-step one is easier to read and to check against the rule.`,
      complexity: 'O(1) time, O(1) space',
    },
    {
      title: 'Minutes to Clock Time', fn: 'formatMinutes', args: ['minutes'],
      prompt: 'Given a non-negative number of minutes, return a string "H:MM" with hours and two-digit minutes. For example 135 becomes "2:15" and 5 becomes "0:05".',
      tests: [[[135], '2:15'], [[5], '0:05'], [[60], '1:00'], [[0], '0:00'], [[1439], '23:59'], [[600], '10:00']],
      js: String.raw`function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h + ':' + String(m).padStart(2, '0');
}`,
      py: String.raw`def format_minutes(minutes):
    h = minutes // 60
    m = minutes % 60
    return f"{h}:{m:02d}"`,
      explain: `Integer division and remainder split a quantity into units, here hours and minutes.

1. Hours: how many whole 60s fit into the total. Use Math.floor(minutes / 60) in JavaScript or minutes // 60 in Python.
2. Minutes left over: minutes % 60.
3. Pad the minutes to two digits so 5 becomes "05".

Padding: JavaScript has String(m).padStart(2, '0'). Python's format spec :02d means "integer, at least 2 wide, padded with zeros".

The same divide-and-remainder pattern converts seconds to minutes, cents to dollars, or a number into its digits.`,
      complexity: 'O(1) time, O(1) space',
    },
  ],
};

export default m;
