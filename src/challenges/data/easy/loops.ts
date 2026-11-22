import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'loops',
  title: 'Loops & Patterns',
  description: 'for and while loops, counters, sequences and text patterns.',
  challenges: [
    {
      title: 'FizzBuzz', fn: 'fizzBuzz', args: ['n'],
      prompt: 'Return an array of strings for the numbers 1..n. Use "Fizz" for multiples of 3, "Buzz" for multiples of 5, "FizzBuzz" for multiples of both, and the number itself (as a string) otherwise.',
      tests: [[[5], ['1', '2', 'Fizz', '4', 'Buzz']], [[15], ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz']], [[1], ['1']], [[0], []]],
      js: String.raw`function fizzBuzz(n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    let s = '';
    if (i % 3 === 0) s += 'Fizz';
    if (i % 5 === 0) s += 'Buzz';
    out.push(s || String(i));
  }
  return out;
}`,
      py: String.raw`def fizz_buzz(n):
    out = []
    for i in range(1, n + 1):
        s = ""
        if i % 3 == 0:
            s += "Fizz"
        if i % 5 == 0:
            s += "Buzz"
        out.append(s or str(i))
    return out`,
      explain: `FizzBuzz is famous because it tests whether you can handle overlapping conditions cleanly.

The trap is the order of checks. If you write "if divisible by 3 → Fizz, else if divisible by 5 → Buzz, else if divisible by 15 → FizzBuzz", the 15 case is never reached, because 15 already matched the first branch. You must check 15 first, or use the approach here.

Building the string avoids the problem entirely:
1. Start with an empty string.
2. Append "Fizz" if divisible by 3 and "Buzz" if divisible by 5. Both can apply, which produces "FizzBuzz".
3. If the string is still empty, use the number instead.

s || String(i) (or s or str(i) in Python) picks the number when s is empty, because the empty string is falsy. This version is also easy to extend: adding "Bazz" for 7 is one more line.`,
      complexity: 'O(n) time, O(n) space for the output',
    },
    {
      title: 'Multiplication Table', fn: 'timesTable', args: ['n', 'k'],
      prompt: 'Return the first k multiples of n: [n×1, n×2, ..., n×k].',
      tests: [[[3, 5], [3, 6, 9, 12, 15]], [[7, 1], [7]], [[2, 0], []], [[-2, 3], [-2, -4, -6]], [[10, 4], [10, 20, 30, 40]]],
      js: String.raw`function timesTable(n, k) {
  const out = [];
  for (let i = 1; i <= k; i++) out.push(n * i);
  return out;
}`,
      py: String.raw`def times_table(n, k):
    return [n * i for i in range(1, k + 1)]`,
      explain: `A counting loop that produces one value per step.

The loop variable i runs from 1 to k inclusive, so in Python range(1, k + 1) is needed: range stops before its end value. Off-by-one errors like using range(1, k) are the most common loop bug, so check the first and last values against a small example (n = 3, k = 5 should end at 15).

The Python version uses a list comprehension, [expression for i in range(...)], a compact way to build a list from a loop. In JavaScript, Array.from({ length: k }, (_, i) => n * (i + 1)) is the closest equivalent.`,
      complexity: 'O(k) time and space',
    },
    {
      title: 'Sum of Even Numbers', fn: 'sumEvens', args: ['n'],
      prompt: 'Return the sum of all even numbers from 1 to n inclusive.',
      tests: [[[10], 30], [[1], 0], [[2], 2], [[7], 12], [[0], 0], [[100], 2550]],
      js: String.raw`function sumEvens(n) {
  let total = 0;
  for (let i = 2; i <= n; i += 2) total += i;
  return total;
}`,
      py: String.raw`def sum_evens(n):
    return sum(range(2, n + 1, 2))`,
      explain: `Rather than visiting every number and testing whether it is even, step through only the even numbers.

Start at 2 and add 2 each time (i += 2, or range(2, n + 1, 2) in Python). This does half the work and needs no if statement.

Check the boundaries: for n = 7 the loop visits 2, 4, 6 and stops, because 8 > 7. The total is 12. For n = 1 or 0 the loop never runs, so the answer is 0.

Math shortcut: the even numbers up to n are 2 × (1 + 2 + ... + m) with m = floor(n / 2), so the sum is m × (m + 1). For n = 10, m = 5 and the sum is 30.`,
      complexity: 'O(n) time with the loop (O(1) with the formula), O(1) space',
    },
    {
      title: 'Powers of Two', fn: 'powersOfTwo', args: ['n'],
      prompt: 'Return the first n powers of two, starting at 2^0: [1, 2, 4, 8, ...].',
      tests: [[[5], [1, 2, 4, 8, 16]], [[1], [1]], [[0], []], [[11], [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024]]],
      js: String.raw`function powersOfTwo(n) {
  const out = [];
  let p = 1;
  for (let i = 0; i < n; i++) {
    out.push(p);
    p *= 2;
  }
  return out;
}`,
      py: String.raw`def powers_of_two(n):
    out = []
    p = 1
    for _ in range(n):
        out.append(p)
        p *= 2
    return out`,
      explain: `Each term is the previous one doubled, so carry the current value along instead of recomputing 2 to the power i from scratch every time.

1. p = 1 (that is 2 to the power 0).
2. Each step, record p and then double it.

Computing each term from the previous one is a powerful general idea. Factorials, Fibonacci numbers and running sums all work the same way, and it is the seed of dynamic programming.

The loop runs exactly n times, so n = 0 gives an empty list. Using _ as the loop variable in Python signals "I do not need this value".`,
      complexity: 'O(n) time and space',
    },
    {
      title: 'Countdown', fn: 'countdown', args: ['n'],
      prompt: 'Return the numbers from n down to 1 using a while loop. For n ≤ 0 return an empty array.',
      tests: [[[5], [5, 4, 3, 2, 1]], [[1], [1]], [[0], []], [[-3], []], [[3], [3, 2, 1]]],
      js: String.raw`function countdown(n) {
  const out = [];
  while (n >= 1) {
    out.push(n);
    n--;
  }
  return out;
}`,
      py: String.raw`def countdown(n):
    out = []
    while n >= 1:
        out.append(n)
        n -= 1
    return out`,
      explain: `A while loop repeats as long as its condition holds. It is the natural choice when you think "keep going until something happens".

Every while loop needs three parts:
1. A starting state (n as given).
2. A condition that is checked before each repetition (n >= 1).
3. Progress toward making the condition false (n--).

Forget the third part and the loop never ends. In Codepad the time limit would stop it, but in real programs that is a hang.

For n ≤ 0 the condition is false from the start, so the loop body never runs, which handles the edge case with no extra code.`,
      complexity: 'O(n) time and space',
    },
    {
      title: 'Fibonacci Number', fn: 'fib', args: ['n'],
      prompt: 'Return the n-th Fibonacci number, where fib(0) = 0, fib(1) = 1 and fib(n) = fib(n-1) + fib(n-2). n can be up to 70, so avoid the slow recursive version.',
      tests: [[[0], 0], [[1], 1], [[2], 1], [[10], 55], [[20], 6765], [[50], 12586269025], [[70], 190392490709135]],
      js: String.raw`function fib(n) {
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) {
    [a, b] = [b, a + b];
  }
  return a;
}`,
      py: String.raw`def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a`,
      explain: `The recursive definition translates directly into code, fib(n) = fib(n - 1) + fib(n - 2), but that version recomputes the same values again and again. fib(50) would make billions of calls.

Iterative approach: keep only the last two numbers.
1. a = fib(0) = 0 and b = fib(1) = 1.
2. Each step shifts the window forward: the new a is the old b, and the new b is a + b.
3. After n steps, a holds fib(n).

Simultaneous assignment ([a, b] = [b, a + b] in JavaScript, a, b = b, a + b in Python) computes the right-hand side using the old values before assigning anything, so you do not need a temporary variable.

This is dynamic programming in its simplest form: build the answer bottom-up from smaller answers, keeping only what you need. fib(70) is about 1.9 × 10^14, which still fits exactly in a JavaScript number.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Collatz Steps', fn: 'collatzSteps', args: ['n'],
      prompt: 'Starting from a positive integer n, repeatedly apply: if n is even, n = n / 2; if odd, n = 3n + 1. Return how many steps it takes to reach 1.',
      tests: [[[1], 0], [[2], 1], [[6], 8], [[7], 16], [[27], 111], [[97], 118]],
      js: String.raw`function collatzSteps(n) {
  let steps = 0;
  while (n !== 1) {
    n = n % 2 === 0 ? n / 2 : 3 * n + 1;
    steps++;
  }
  return steps;
}`,
      py: String.raw`def collatz_steps(n):
    steps = 0
    while n != 1:
        n = n // 2 if n % 2 == 0 else 3 * n + 1
        steps += 1
    return steps`,
      explain: `You do not know in advance how many steps there will be, which makes this a natural while loop: repeat until n becomes 1.

Each iteration applies the rule and counts one step. For n = 6 the sequence is 6 → 3 → 10 → 5 → 16 → 8 → 4 → 2 → 1, which is 8 steps.

In Python use // for the halving step so n stays an integer. n / 2 would turn it into a float like 3.0.

Fun fact: the Collatz conjecture says this always reaches 1 for every positive integer. It has been checked for enormous numbers, but nobody has proven it. Starting at 27 takes 111 steps and climbs as high as 9232 along the way.`,
      complexity: 'Unknown in general (that is the open problem); fast in practice. O(1) space',
    },
    {
      title: 'Star Triangle', fn: 'triangle', args: ['n'],
      prompt: 'Return an array of n strings forming a right triangle of stars: row i (1-based) has i stars.',
      tests: [[[3], ['*', '**', '***']], [[1], ['*']], [[0], []], [[5], ['*', '**', '***', '****', '*****']]],
      js: String.raw`function triangle(n) {
  const rows = [];
  let row = '';
  for (let i = 1; i <= n; i++) {
    row += '*';
    rows.push(row);
  }
  return rows;
}`,
      py: String.raw`def triangle(n):
    return ["*" * i for i in range(1, n + 1)]`,
      explain: `Pattern problems are about finding the relationship between the row number and its contents. Here row i has exactly i stars.

JavaScript: each row is the previous row plus one more star, so keep growing a single string and push a snapshot at each step. Strings are immutable, so each pushed value is an independent copy.

Python: "*" * i repeats the star i times, and a comprehension builds all rows.

The classic version uses two nested loops: an outer loop over rows and an inner loop that adds the stars. Nested loops are worth understanding, but recognizing that each row can build on the previous one makes the code shorter.

Try the variations yourself: right-aligned triangles (pad with spaces), pyramids (2i - 1 stars per row) and diamonds.`,
      complexity: 'O(n²) time and space (total characters)',
    },
    {
      title: 'Digits of a Number', fn: 'digits', args: ['n'],
      prompt: 'Given a non-negative integer n, return its digits as an array from left to right using arithmetic (% and division), not string conversion.',
      tests: [[[123], [1, 2, 3]], [[0], [0]], [[7], [7]], [[1000], [1, 0, 0, 0]], [[90210], [9, 0, 2, 1, 0]]],
      js: String.raw`function digits(n) {
  if (n === 0) return [0];
  const out = [];
  while (n > 0) {
    out.push(n % 10);
    n = Math.floor(n / 10);
  }
  return out.reverse();
}`,
      py: String.raw`def digits(n):
    if n == 0:
        return [0]
    out = []
    while n > 0:
        out.append(n % 10)
        n //= 10
    return out[::-1]`,
      explain: `n % 10 is the last digit of n, and integer-dividing by 10 removes that digit. Repeating the two steps peels off the digits from right to left.

For 123: 123 % 10 = 3, leaving 12. Then 12 % 10 = 2, leaving 1. Then 1 % 10 = 1, leaving 0. The loop stops when n reaches 0.

Because we collect the digits right-to-left ([3, 2, 1]), reverse them at the end. Reversing once is cheaper than inserting at the front each time, because inserting at the start of an array shifts every element.

Zero is the special case: the loop would never run and return [], so handle it up front.

The same peel-off loop is used for digit sums, reversing a number, palindrome numbers and converting to other bases.`,
      complexity: 'O(d) time and space, where d is the number of digits',
    },
    {
      title: 'Multiples of 3 or 5', fn: 'multiplesSum', args: ['n'],
      prompt: 'Return the sum of all natural numbers below n that are multiples of 3 or 5. (Below 10 these are 3, 5, 6 and 9, which sum to 23.)',
      tests: [[[10], 23], [[1], 0], [[16], 60], [[20], 78], [[1000], 233168]],
      js: String.raw`function multiplesSum(n) {
  let total = 0;
  for (let i = 1; i < n; i++) {
    if (i % 3 === 0 || i % 5 === 0) total += i;
  }
  return total;
}`,
      py: String.raw`def multiples_sum(n):
    return sum(i for i in range(1, n) if i % 3 == 0 or i % 5 == 0)`,
      explain: `Loop through every number below n and add it if either condition holds.

Two details matter:
1. "Below n" means strictly less than n, so the loop condition is i < n (range(1, n) in Python).
2. Use OR, not two separate additions. A number like 15 is a multiple of both, and the single test makes sure it is counted only once.

Math version (inclusion-exclusion): add the multiples of 3, add the multiples of 5, then subtract the multiples of 15, which were counted twice. Each group is an arithmetic series, so the whole problem can be solved in O(1). This is Project Euler problem 1.`,
      complexity: 'O(n) time, O(1) space',
    },
  ],
};

export default m;
