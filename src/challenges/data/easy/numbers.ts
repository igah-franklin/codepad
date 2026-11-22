import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'numbers',
  title: 'Number Theory',
  description: 'Primes, divisors, digits and classic integer puzzles.',
  challenges: [
    {
      title: 'Is Prime', fn: 'isPrime', args: ['n'],
      prompt: 'Return true if n is a prime number: an integer greater than 1 with no divisors other than 1 and itself.',
      tests: [[[2], true], [[3], true], [[4], false], [[1], false], [[0], false], [[17], true], [[25], false], [[97], true], [[7919], true], [[1000000], false]],
      js: String.raw`function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}`,
      py: String.raw`def is_prime(n):
    if n < 2:
        return False
    d = 2
    while d * d <= n:
        if n % d == 0:
            return False
        d += 1
    return True`,
      explain: `Trial division: try possible divisors, and stop as soon as one divides n evenly.

The key optimization is that you only need to test up to the square root of n. Divisors come in pairs, d × (n / d) = n, and in every pair one of the two numbers is at most the square root of n. If no divisor exists up to that point, none exists above it either.

For n = 97 that means testing 2 through 9 instead of 2 through 96.

Writing the loop condition as d * d <= n avoids computing a floating-point square root, along with its rounding issues.

Edge cases: 0 and 1 are not prime by definition, and 2 is the only even prime. A further speedup is to test 2 separately and then only odd divisors.`,
      complexity: 'O(√n) time, O(1) space',
    },
    {
      title: 'Greatest Common Divisor', fn: 'gcd', args: ['a', 'b'],
      prompt: 'Return the greatest common divisor of two non-negative integers (not both zero) using Euclid\'s algorithm.',
      tests: [[[12, 18], 6], [[17, 5], 1], [[0, 9], 9], [[100, 75], 25], [[48, 180], 12], [[7, 7], 7]],
      js: String.raw`function gcd(a, b) {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}`,
      py: String.raw`def gcd(a, b):
    while b:
        a, b = b, a % b
    return a`,
      explain: `Euclid's algorithm is over 2,000 years old and still the standard method.

The insight: any number that divides both a and b also divides a % b, the remainder after dividing a by b. So gcd(a, b) = gcd(b, a % b). Keep replacing the pair until the remainder is 0. The other number is then the answer.

Trace gcd(48, 180): (48, 180), then (180, 48), then (48, 36), then (36, 12), then (12, 0). The answer is 12. If a is smaller than b, the first step simply swaps them.

It is very fast. The numbers shrink at least by half every two steps, so it takes O(log min(a, b)) iterations.

Recursive form: gcd(a, b) = b === 0 ? a : gcd(b, a % b). Python also has math.gcd.`,
      complexity: 'O(log min(a, b)) time, O(1) space',
    },
    {
      title: 'Least Common Multiple', fn: 'lcm', args: ['a', 'b'],
      prompt: 'Return the least common multiple of two positive integers.',
      tests: [[[4, 6], 12], [[3, 5], 15], [[7, 7], 7], [[1, 9], 9], [[21, 6], 42], [[12, 18], 36]],
      js: String.raw`function lcm(a, b) {
  const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
  return (a / gcd(a, b)) * b;
}`,
      py: String.raw`def lcm(a, b):
    def gcd(x, y):
        return x if y == 0 else gcd(y, x % y)
    return a // gcd(a, b) * b`,
      explain: `Use the identity lcm(a, b) × gcd(a, b) = a × b, which means lcm = a × b / gcd.

Why it is true: write both numbers as products of primes. The gcd takes the smaller power of each prime and the lcm takes the larger. Together they use exactly the primes of a × b.

Divide before multiplying: (a / gcd) × b gives the same result as a × b / gcd, but keeps the intermediate value smaller. With very large numbers, a × b could overflow a fixed-size integer.

The brute-force alternative, trying multiples of a until one is divisible by b, works but can be slow.

Solving a new problem by reducing it to one you already solved (here, GCD) is a core technique.`,
      complexity: 'O(log min(a, b)) time, O(1) space',
    },
    {
      title: 'Digit Sum', fn: 'digitSum', args: ['n'],
      prompt: 'Return the sum of the decimal digits of a non-negative integer n.',
      tests: [[[123], 6], [[0], 0], [[9], 9], [[9999], 36], [[1000001], 2], [[987654321], 45]],
      js: String.raw`function digitSum(n) {
  let total = 0;
  while (n > 0) {
    total += n % 10;
    n = Math.floor(n / 10);
  }
  return total;
}`,
      py: String.raw`def digit_sum(n):
    total = 0
    while n > 0:
        total += n % 10
        n //= 10
    return total`,
      explain: `This is the digit-peeling loop from Loops & Patterns, but adding the digits instead of collecting them.

n % 10 is the last digit, and integer division by 10 drops it. Repeat until n is 0.

For 123: add 3 (n becomes 12), add 2 (n becomes 1), add 1 (n becomes 0). The total is 6.

No reversal is needed because addition does not care about order. When n is 0 the loop never runs and the answer is 0, which is correct.

The string approach also works: String(n).split('').reduce((s, d) => s + Number(d), 0), or sum(map(int, str(n))) in Python.`,
      complexity: 'O(d) time for d digits, O(1) space',
    },
    {
      title: 'Reverse an Integer', fn: 'reverseNumber', args: ['n'],
      prompt: 'Return the digits of the integer n in reverse order as a number, keeping the sign. Trailing zeros disappear (1200 → 21, -45 → -54).',
      tests: [[[123], 321], [[-45], -54], [[1200], 21], [[0], 0], [[7], 7], [[-100], -1]],
      js: String.raw`function reverseNumber(n) {
  const sign = n < 0 ? -1 : 1;
  n = Math.abs(n);
  let rev = 0;
  while (n > 0) {
    rev = rev * 10 + (n % 10);
    n = Math.floor(n / 10);
  }
  return sign * rev;
}`,
      py: String.raw`def reverse_number(n):
    sign = -1 if n < 0 else 1
    n = abs(n)
    rev = 0
    while n > 0:
        rev = rev * 10 + n % 10
        n //= 10
    return sign * rev`,
      explain: `Build the reversed number digit by digit: rev = rev × 10 + next digit. Multiplying by 10 shifts the existing digits one place left to make room for the new one.

Trace 123: rev = 3, then 30 + 2 = 32, then 320 + 1 = 321.

Negative numbers: % and floor division behave differently for negatives across languages. In Python -45 % 10 is 5, while in JavaScript it is -5. So remember the sign, work with the absolute value, and reapply the sign at the end.

Trailing zeros vanish naturally. 1200 gives rev = 0, 0, 2, 21, because leading zeros have no value in a number.

The same "rev × 10 + digit" pattern appears in Palindrome Number and in parsing strings into integers.`,
      complexity: 'O(d) time, O(1) space',
    },
    {
      title: 'Palindrome Number', fn: 'isPalindromeNumber', args: ['n'],
      prompt: 'Return true if the integer n reads the same forwards and backwards (121 yes, -121 no, 10 no). Solve it without converting to a string.',
      tests: [[[121], true], [[-121], false], [[10], false], [[0], true], [[12321], true], [[1221], true], [[123], false]],
      js: String.raw`function isPalindromeNumber(n) {
  if (n < 0) return false;
  let rev = 0, x = n;
  while (x > 0) {
    rev = rev * 10 + (x % 10);
    x = Math.floor(x / 10);
  }
  return rev === n;
}`,
      py: String.raw`def is_palindrome_number(n):
    if n < 0:
        return False
    rev, x = 0, n
    while x > 0:
        rev = rev * 10 + x % 10
        x //= 10
    return rev == n`,
      explain: `Reverse the number using the technique from Reverse an Integer and compare it with the original.

1. Negative numbers are never palindromes: "-121" reversed is "121-".
2. Reverse a copy of n, keeping the original for the comparison.
3. Return whether the reversed number equals n.

Numbers ending in 0, other than 0 itself, cannot be palindromes, because their reversal drops the zero. 10 reverses to 1, so the comparison correctly fails.

Optimization (a classic interview follow-up): reverse only half the digits, stopping when the reversed half is at least as large as what remains, then compare the two halves. This halves the work and avoids any risk of overflow when reversing.`,
      complexity: 'O(d) time, O(1) space',
    },
    {
      title: 'Perfect Number', fn: 'isPerfect', args: ['n'],
      prompt: 'A perfect number equals the sum of its proper divisors (divisors excluding itself). 6 = 1 + 2 + 3. Return true if the positive integer n is perfect.',
      tests: [[[6], true], [[28], true], [[12], false], [[1], false], [[496], true], [[8128], true], [[100], false]],
      js: String.raw`function isPerfect(n) {
  if (n < 2) return false;
  let sum = 1;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) {
      sum += d;
      if (d !== n / d) sum += n / d;
    }
  }
  return sum === n;
}`,
      py: String.raw`def is_perfect(n):
    if n < 2:
        return False
    total = 1
    d = 2
    while d * d <= n:
        if n % d == 0:
            total += d
            if d != n // d:
                total += n // d
        d += 1
    return total == n`,
      explain: `Sum all proper divisors, using the divisor-pair trick from Is Prime to stay fast.

1. 1 divides everything, so start the sum at 1. We never add n itself, because it is not a proper divisor.
2. For each d from 2 up to the square root of n that divides n, add both d and its partner n / d.
3. If d equals its partner (n is a perfect square and d is its root), add it only once. Otherwise 16 would count 4 twice.

For 28: 1, then d = 2 adds 2 and 14, then d = 4 adds 4 and 7. The total is 28, so 28 is perfect.

n = 1 is a special case: it has no proper divisors other than itself, so it is not perfect.

Perfect numbers are rare: 6, 28, 496, 8128, then 33,550,336.`,
      complexity: 'O(√n) time, O(1) space',
    },
    {
      title: 'Armstrong Number', fn: 'isArmstrong', args: ['n'],
      prompt: 'An Armstrong number equals the sum of its digits each raised to the power of the number of digits. 153 = 1³ + 5³ + 3³. Return true if the non-negative integer n is one.',
      tests: [[[153], true], [[370], true], [[9474], true], [[10], false], [[0], true], [[9], true], [[100], false], [[9475], false]],
      js: String.raw`function isArmstrong(n) {
  const digits = String(n).split('').map(Number);
  const k = digits.length;
  let sum = 0;
  for (const d of digits) sum += d ** k;
  return sum === n;
}`,
      py: String.raw`def is_armstrong(n):
    digits = [int(c) for c in str(n)]
    k = len(digits)
    return sum(d ** k for d in digits) == n`,
      explain: `This needs the digits and also how many there are, so converting to a string is the simplest route: the string's length is the digit count.

1. Split n into its digits: "153" becomes [1, 5, 3].
2. k = the number of digits, which is 3 here.
3. Sum each digit raised to the power k: 1 + 125 + 27 = 153.
4. Compare the sum with n.

Every single-digit number is an Armstrong number, because d to the power 1 is d. That includes 0.

** is the exponent operator in both JavaScript and Python. You could also extract the digits arithmetically with % 10, as in earlier challenges. The string approach is a perfectly good choice when it makes the code clearer.`,
      complexity: 'O(d) time and space for d digits',
    },
    {
      title: 'Digital Root', fn: 'digitalRoot', args: ['n'],
      prompt: 'Repeatedly sum the digits of the non-negative integer n until a single digit remains, and return it. 493 → 4+9+3 = 16 → 1+6 = 7.',
      tests: [[[493], 7], [[0], 0], [[9], 9], [[38], 2], [[999999999], 9], [[123456], 3]],
      js: String.raw`function digitalRoot(n) {
  while (n >= 10) {
    let s = 0;
    while (n > 0) {
      s += n % 10;
      n = Math.floor(n / 10);
    }
    n = s;
  }
  return n;
}`,
      py: String.raw`def digital_root(n):
    while n >= 10:
        s = 0
        while n > 0:
            s += n % 10
            n //= 10
        n = s
    return n`,
      explain: `Nest the Digit Sum loop inside an outer loop that repeats while the number still has more than one digit.

The outer loop condition n >= 10 means "two or more digits". Each pass replaces n with its digit sum, which is always much smaller than n, so the loop finishes quickly.

The math shortcut is a classic. For n > 0 the digital root is 1 + (n - 1) % 9, and for n = 0 it is 0. This works because 10 leaves a remainder of 1 when divided by 9, so every number has the same remainder mod 9 as its digit sum. That is the old "casting out nines" trick for checking arithmetic by hand.

Knowing both versions is useful. The loop is obviously correct, while the formula is O(1) but needs the explanation above to trust.`,
      complexity: 'O(d) time overall with the loop (O(1) with the formula), O(1) space',
    },
    {
      title: 'Binary to Decimal', fn: 'binaryToDecimal', args: ['bits'],
      prompt: 'Given a string of 0s and 1s, return the number it represents in base 2 ("101" → 5). Do not use parseInt(bits, 2) or int(bits, 2).',
      tests: [[['101'], 5], [['0'], 0], [['1'], 1], [['1111'], 15], [['10000000'], 128], [['110010'], 50]],
      js: String.raw`function binaryToDecimal(bits) {
  let value = 0;
  for (const b of bits) {
    value = value * 2 + (b === '1' ? 1 : 0);
  }
  return value;
}`,
      py: String.raw`def binary_to_decimal(bits):
    value = 0
    for b in bits:
        value = value * 2 + (1 if b == "1" else 0)
    return value`,
      explain: `This uses the same idea as building a reversed number, but in base 2: value = value × base + next digit.

Reading left to right, each new bit doubles everything seen so far, which shifts it one place left, and then adds the new bit.

Trace "110010": 1, 3, 6, 12, 25, 50.

This is called Horner's method, and it works for any base. Use × 16 for hexadecimal, or × 10 to parse a decimal string into a number. It is exactly how parseInt works internally.

Going the other way (decimal to binary) uses the digit-peeling loop with % 2 and // 2.`,
      complexity: 'O(n) time, O(1) space',
    },
  ],
};

export default m;
