import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'math',
  title: 'Math & Logic',
  description: 'Number puzzles interviewers love: cycles, factor tricks, bases, clocks and repeating decimals.',
  challenges: [
    {
      title: 'Happy Number', fn: 'isHappy', args: ['n'],
      prompt: 'Replace n by the sum of the squares of its digits, repeatedly. n is happy if this process reaches 1; otherwise it loops forever in a cycle. Return true if n is happy.',
      tests: [[[19], true], [[2], false], [[1], true], [[7], true], [[4], false], [[100], true], [[116], false]],
      js: String.raw`function isHappy(n) {
  const next = (x) => {
    let s = 0;
    while (x > 0) {
      const d = x % 10;
      s += d * d;
      x = Math.floor(x / 10);
    }
    return s;
  };
  // Floyd's cycle detection: no extra memory
  let slow = n, fast = next(n);
  while (fast !== 1 && slow !== fast) {
    slow = next(slow);
    fast = next(next(fast));
  }
  return fast === 1;
}`,
      py: String.raw`def is_happy(n):
    def nxt(x):
        s = 0
        while x:
            x, d = divmod(x, 10)
            s += d * d
        return s
    slow, fast = n, nxt(n)
    while fast != 1 and slow != fast:
        slow = nxt(slow)
        fast = nxt(nxt(fast))
    return fast == 1`,
      explain: `The sequence either reaches 1 (and stays there, since 1² = 1) or enters a cycle that never includes 1. So this is cycle detection on an implicit linked list, where each number points to the next.

Why must it end or cycle? Numbers shrink fast. Any number with 4 or more digits maps to something with fewer digits, so the sequence quickly falls into a bounded range (below 243), and in a bounded range it must eventually repeat.

Two approaches:
1. A set of seen numbers: stop when you see 1 or a repeat. O(log n) space.
2. Floyd's tortoise and hare (used here): slow takes one step, fast takes two. If there is a cycle they meet. If 1 is reached, fast gets there first. O(1) space.

19 → 82 → 68 → 100 → 1, so it is happy.
2 → 4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4 → ..., an endless cycle.

It is the same Floyd technique as Linked List Cycle and Find the Duplicate Number. Recognizing "a repeated function applied to a value" as a linked list is a useful reflex.`,
      complexity: 'O(log n) time, O(1) space',
    },
    {
      title: 'Factorial Trailing Zeroes', fn: 'trailingZeroes', args: ['n'],
      prompt: 'Return the number of trailing zeros in n! without computing the factorial.',
      tests: [[[3], 0], [[5], 1], [[0], 0], [[10], 2], [[25], 6], [[100], 24], [[1000], 249]],
      js: String.raw`function trailingZeroes(n) {
  let count = 0;
  while (n > 0) {
    n = Math.floor(n / 5); // multiples of 5, then of 25, 125, ...
    count += n;
  }
  return count;
}`,
      py: String.raw`def trailing_zeroes(n):
    count = 0
    while n:
        n //= 5
        count += n
    return count`,
      explain: `Each trailing zero comes from a factor of 10 = 2 × 5. In n! there are many more factors of 2 than of 5, so the number of 5s decides the answer.

Count the factors of 5 in 1 × 2 × ... × n:
- every multiple of 5 contributes at least one: floor(n / 5);
- every multiple of 25 contributes one more: floor(n / 25);
- multiples of 125 contribute another, and so on.

The total is floor(n/5) + floor(n/25) + floor(n/125) + ... (Legendre's formula).

The loop repeatedly divides n by 5 and adds the quotient, which computes exactly that sum.

25! has 25/5 = 5 multiples of 5, plus 25/25 = 1 extra, so 6 zeros.

Computing n! directly is hopeless: 1000! has 2,568 digits. Recognizing that you only need to count a specific prime factor turns it into an O(log n) loop.`,
      complexity: 'O(log₅ n) time, O(1) space',
    },
    {
      title: 'Ugly Number', fn: 'isUgly', args: ['n'],
      prompt: 'An ugly number is a positive integer whose only prime factors are 2, 3 and 5. Return true if n is ugly. (1 counts as ugly.)',
      tests: [[[6], true], [[1], true], [[14], false], [[0], false], [[-6], false], [[30], true], [[1024], true], [[49], false]],
      js: String.raw`function isUgly(n) {
  if (n <= 0) return false;
  for (const p of [2, 3, 5]) while (n % p === 0) n /= p;
  return n === 1;
}`,
      py: String.raw`def is_ugly(n):
    if n <= 0:
        return False
    for p in (2, 3, 5):
        while n % p == 0:
            n //= p
    return n == 1`,
      explain: `Divide out every factor of 2, 3 and 5. If anything other than 1 is left, it contains some other prime factor.

14 = 2 × 7: removing the 2 leaves 7, so it is not ugly.
30 = 2 × 3 × 5: everything divides out, leaving 1, so it is ugly.

Non-positive numbers are not ugly by definition. Guarding against 0 is also essential, because 0 % p == 0 for every p and the loop would never end.

1 is considered ugly: it has no prime factors at all, so none of them are outside {2, 3, 5}.

The next challenge asks for the n-th ugly number, which needs a completely different idea: generating them in order rather than testing candidates one by one.`,
      complexity: 'O(log n) time, O(1) space',
    },
    {
      title: 'Ugly Number II', fn: 'nthUglyNumber', args: ['n'],
      prompt: 'Return the n-th ugly number (positive numbers whose prime factors are only 2, 3, 5). The sequence starts 1, 2, 3, 4, 5, 6, 8, 9, 10, 12, ...',
      tests: [[[1], 1], [[10], 12], [[7], 8], [[11], 15], [[150], 5832], [[1690], 2123366400]],
      js: String.raw`function nthUglyNumber(n) {
  const ugly = [1];
  let i2 = 0, i3 = 0, i5 = 0; // next ugly number to multiply by 2, 3, 5
  while (ugly.length < n) {
    const a = ugly[i2] * 2, b = ugly[i3] * 3, c = ugly[i5] * 5;
    const next = Math.min(a, b, c);
    ugly.push(next);
    // advance every pointer that produced it (avoids duplicates like 6 = 2*3 = 3*2)
    if (next === a) i2++;
    if (next === b) i3++;
    if (next === c) i5++;
  }
  return ugly[n - 1];
}`,
      py: String.raw`def nth_ugly_number(n):
    ugly = [1]
    i2 = i3 = i5 = 0
    while len(ugly) < n:
        a, b, c = ugly[i2] * 2, ugly[i3] * 3, ugly[i5] * 5
        nxt = min(a, b, c)
        ugly.append(nxt)
        if nxt == a:
            i2 += 1
        if nxt == b:
            i3 += 1
        if nxt == c:
            i5 += 1
    return ugly[n - 1]`,
      explain: `Testing every integer with Is Ugly is far too slow, since ugly numbers become rare. Generate them in order instead.

Every ugly number after 1 is a smaller ugly number times 2, 3 or 5. So the sequence is a merge of three sorted streams:
- the ugly numbers × 2,
- the ugly numbers × 3,
- the ugly numbers × 5.

Use three pointers (i2, i3, i5) into the list built so far. Each step, the next ugly number is the smallest of the three candidates. Append it, and advance every pointer whose candidate equals it.

Advancing all the matching pointers is the duplicate fix. 6 can be produced as 3 × 2 and 2 × 3, and moving both pointers ensures it is added only once.

This is the three-way merge from Merge K Sorted Lists, where the streams are generated from the output itself. It is a DP in which each value is built from earlier values.

A heap of candidates (pop the smallest, push it times 2, 3 and 5, skipping duplicates with a set) also works, in O(n log n).`,
      complexity: 'O(n) time and space',
    },
    {
      title: 'Power of Three', fn: 'isPowerOfThree', args: ['n'],
      prompt: 'Return true if n is a power of three (3^k for some integer k ≥ 0).',
      tests: [[[27], true], [[0], false], [[-1], false], [[1], true], [[45], false], [[1162261467], true], [[1162261466], false]],
      js: String.raw`function isPowerOfThree(n) {
  if (n < 1) return false;
  while (n % 3 === 0) n /= 3;
  return n === 1;
}`,
      py: String.raw`def is_power_of_three(n):
    if n < 1:
        return False
    while n % 3 == 0:
        n //= 3
    return n == 1`,
      explain: `The direct approach: divide by 3 while you can. A power of three reduces all the way to 1.

The guard n < 1 rejects 0 (which would loop forever, since 0 % 3 == 0) and negative numbers.

A trick that often comes up as a follow-up ("can you do it without loops?"): within 32-bit integers, the largest power of 3 is 3^19 = 1162261467. Since 3 is prime, the only divisors of 3^19 are smaller powers of 3. So n is a power of three exactly when n > 0 and 1162261467 % n == 0.

Watch out for the logarithm approach (log(n) / log(3) is an integer). Floating-point rounding makes it unreliable: log(243) / log(3) can come out as 4.999999.

For powers of two there is a bit trick: n > 0 and (n & (n - 1)) == 0, because a power of two has exactly one set bit.

The tests include 3^19 and 3^19 - 1 to check the boundary.`,
      complexity: 'O(log₃ n) time, O(1) space',
    },
    {
      title: 'Add Strings', fn: 'addStrings', args: ['a', 'b'],
      prompt: 'a and b are non-negative integers as decimal strings. Return their sum as a string without converting the inputs to numbers directly.',
      tests: [[['11', '123'], '134'], [['456', '77'], '533'], [['0', '0'], '0'], [['999', '1'], '1000'], [['12345678901234567890', '98765432109876543210'], '111111111011111111100']],
      js: String.raw`function addStrings(a, b) {
  let i = a.length - 1, j = b.length - 1, carry = 0;
  const out = [];
  while (i >= 0 || j >= 0 || carry) {
    const s = (i >= 0 ? a.charCodeAt(i--) - 48 : 0) + (j >= 0 ? b.charCodeAt(j--) - 48 : 0) + carry;
    out.push(s % 10);
    carry = Math.floor(s / 10);
  }
  return out.reverse().join('');
}`,
      py: String.raw`def add_strings(a, b):
    i, j, carry = len(a) - 1, len(b) - 1, 0
    out = []
    while i >= 0 or j >= 0 or carry:
        s = carry
        if i >= 0:
            s += ord(a[i]) - 48
            i -= 1
        if j >= 0:
            s += ord(b[j]) - 48
            j -= 1
        out.append(str(s % 10))
        carry = s // 10
    return "".join(reversed(out))`,
      explain: `This is Add Binary in base 10, the same template as every "add two numbers digit by digit" problem.

1. Two pointers start at the last digit of each string.
2. Add the two digits (0 once a string has run out) plus the carry.
3. Write sum % 10, and carry sum // 10.
4. Continue while digits or a carry remain, then reverse the output.

Converting a character to a digit with its character code minus 48 ("0" is 48) avoids parsing the whole string.

The last test has 20-digit numbers, beyond JavaScript's 2^53 safe-integer limit, which is why big-number arithmetic is done on strings or digit arrays.

You have now seen this pattern four times (Plus One, Add Two Numbers, Add Binary, Add Strings). Spotting a template you already know and adapting it quickly is how strong candidates move fast.`,
      complexity: 'O(max(n, m)) time and space',
    },
    {
      title: 'Base 7', fn: 'convertToBase7', args: ['num'],
      prompt: 'Return the base-7 representation of the integer num as a string (negative numbers get a leading "-").',
      tests: [[[100], '202'], [[-7], '-10'], [[0], '0'], [[6], '6'], [[49], '100'], [[-1], '-1'], [[10000000], '150666343']],
      js: String.raw`function convertToBase7(num) {
  if (num === 0) return '0';
  const neg = num < 0;
  num = Math.abs(num);
  let out = '';
  while (num > 0) {
    out = (num % 7) + out; // least significant digit first
    num = Math.floor(num / 7);
  }
  return neg ? '-' + out : out;
}`,
      py: String.raw`def convert_to_base7(num):
    if num == 0:
        return "0"
    neg = num < 0
    num = abs(num)
    digits = []
    while num:
        num, d = divmod(num, 7)
        digits.append(str(d))
    return ("-" if neg else "") + "".join(reversed(digits))`,
      explain: `Converting to any base b uses the digit-peeling loop from Easy with b instead of 10:
1. digit = num % b gives the least significant digit.
2. num = num // b removes it.
3. Repeat until num is 0. The digits come out right to left.

100 in base 7: 100 = 14 × 7 + 2, 14 = 2 × 7 + 0, 2 = 0 × 7 + 2, so the result is "202". Check: 2 × 49 + 0 × 7 + 2 = 100.

Negative numbers: convert the absolute value and add the sign. Division and remainder behave differently for negatives in JavaScript and Python, so working with |num| keeps it portable.

Zero is a special case, because the loop would produce an empty string.

The reverse direction (base b to decimal) is Horner's method: value = value × b + digit.

Built-ins: num.toString(7) in JavaScript. Python has no general one, only bin, oct and hex. Writing it yourself is the expected answer.`,
      complexity: 'O(log₇ |num|) time and space',
    },
    {
      title: 'GCD of Strings', fn: 'gcdOfStrings', args: ['a', 'b'],
      prompt: 'A string t divides s if s is t repeated one or more times. Return the longest string that divides both a and b, or "" if none.',
      tests: [[['ABCABC', 'ABC'], 'ABC'], [['ABABAB', 'ABAB'], 'AB'], [['LEET', 'CODE'], ''], [['A', 'A'], 'A'], [['AAAA', 'AA'], 'AA'], [['ABAB', 'BABA'], '']],
      js: String.raw`function gcdOfStrings(a, b) {
  if (a + b !== b + a) return ''; // they don't share a common repeating unit
  const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
  return a.slice(0, gcd(a.length, b.length));
}`,
      py: String.raw`def gcd_of_strings(a, b):
    if a + b != b + a:
        return ""
    def gcd(x, y):
        return x if y == 0 else gcd(y, x % y)
    return a[:gcd(len(a), len(b))]`,
      explain: `This is a beautiful link between strings and number theory.

Step 1: a common divisor exists exactly when a + b == b + a.
- If both strings are repetitions of some unit t, then gluing them in either order gives the same repetition of t.
- Conversely, if a + b == b + a, then a and b commute, and a classic result says that strings which commute are powers of a common string.

Step 2: if a common unit exists, the longest one has length gcd(|a|, |b|). Any common divisor's length divides both lengths, and the prefix of length gcd(|a|, |b|) is itself a common divisor. So it is the largest.

"ABABAB" (6) and "ABAB" (4): the concatenations match, gcd(6, 4) = 2, so the answer is "AB".
"ABAB" and "BABA": "ABABBABA" ≠ "BABAABAB", so the answer is "".

The brute force tries every prefix length that divides both lengths, from longest to shortest, and checks whether it divides each string.

Problems that look like pure string manipulation sometimes have elegant number-theory structure underneath.`,
      complexity: 'O(n + m) time and space',
    },
    {
      title: 'Angle Between Clock Hands', fn: 'angleClock', args: ['hour', 'minutes'],
      prompt: 'Return the smaller angle in degrees between the hour and minute hands at the given time (hour 1–12, minutes 0–59).',
      compare: 'float',
      tests: [[[12, 30], 165], [[3, 30], 75], [[3, 15], 7.5], [[4, 50], 155], [[12, 0], 0], [[6, 0], 180], [[1, 57], 76.5]],
      js: String.raw`function angleClock(hour, minutes) {
  const minuteAngle = minutes * 6; // 360 / 60
  const hourAngle = (hour % 12) * 30 + minutes * 0.5; // 360 / 12, plus drift as minutes pass
  const diff = Math.abs(hourAngle - minuteAngle);
  return Math.min(diff, 360 - diff);
}`,
      py: String.raw`def angle_clock(hour, minutes):
    minute_angle = minutes * 6
    hour_angle = (hour % 12) * 30 + minutes * 0.5
    diff = abs(hour_angle - minute_angle)
    return min(diff, 360 - diff)`,
      explain: `Measure both hands clockwise from 12 o'clock.

- Minute hand: 360° / 60 minutes = 6° per minute.
- Hour hand: 360° / 12 hours = 30° per hour, but it also creeps forward as the minutes pass, 30° / 60 = 0.5° per minute.

Forgetting that creep is the classic mistake. At 3:30 the hour hand is halfway between 3 and 4 (105°), not on the 3 (90°). The angle is |105 - 180| = 75°, not 90°.

hour % 12 maps 12 o'clock to 0°.

The two hands make two angles that add up to 360°. Return the smaller: min(diff, 360 - diff).

Interview tip: questions like this check whether you model the problem carefully before coding. Write down the rates (degrees per minute) explicitly, then test the edge cases 12:00, 6:00 and 12:30.

Fun follow-up: how many times a day do the hands overlap? 22, not 24. The hands meet every 12/11 hours.`,
      complexity: 'O(1) time and space',
    },
    {
      title: 'Fraction to Recurring Decimal', fn: 'fractionToDecimal', args: ['numerator', 'denominator'],
      prompt: 'Return numerator / denominator as a decimal string, enclosing any repeating part in parentheses: 1/2 → "0.5", 2/3 → "0.(6)", 4/333 → "0.(012)", 1/6 → "0.1(6)".',
      tests: [[[1, 2], '0.5'], [[2, 1], '2'], [[4, 333], '0.(012)'], [[1, 6], '0.1(6)'], [[-50, 8], '-6.25'], [[0, -5], '0'], [[1, 7], '0.(142857)'], [[-1, -3], '0.(3)'], [[22, 7], '3.(142857)']],
      js: String.raw`function fractionToDecimal(numerator, denominator) {
  if (numerator === 0) return '0';
  let out = (numerator < 0) !== (denominator < 0) ? '-' : '';
  let n = Math.abs(numerator), d = Math.abs(denominator);
  out += Math.floor(n / d);
  let rem = n % d;
  if (rem === 0) return out;
  out += '.';
  const seen = new Map(); // remainder -> position in out where its digit starts
  while (rem !== 0) {
    if (seen.has(rem)) {
      const i = seen.get(rem);
      return out.slice(0, i) + '(' + out.slice(i) + ')';
    }
    seen.set(rem, out.length);
    rem *= 10;
    out += Math.floor(rem / d);
    rem %= d;
  }
  return out;
}`,
      py: String.raw`def fraction_to_decimal(numerator, denominator):
    if numerator == 0:
        return "0"
    out = "-" if (numerator < 0) != (denominator < 0) else ""
    n, d = abs(numerator), abs(denominator)
    out += str(n // d)
    rem = n % d
    if rem == 0:
        return out
    out += "."
    seen = {}
    while rem:
        if rem in seen:
            i = seen[rem]
            return out[:i] + "(" + out[i:] + ")"
        seen[rem] = len(out)
        rem *= 10
        out += str(rem // d)
        rem %= d
    return out`,
      explain: `This simulates long division, and detects the repeating part by remembering remainders.

1. Sign: the result is negative if exactly one input is negative. Then work with absolute values.
2. Integer part: n // d. If the remainder is 0, you are done.
3. Fractional part: repeatedly multiply the remainder by 10, append remainder // d as the next digit, and keep remainder % d.
4. Cycle detection: the digits from now on depend only on the current remainder. So if a remainder repeats, the digits repeat from the position where it first appeared. Record each remainder's position in a map, and when one comes back, wrap the digits from that position onward in parentheses.

1/6: the remainder 1 produces digit 1 with remainder 4, which produces digit 6 with remainder 4 again. Remainder 4 has been seen before, so the result is "0.1(6)".

There are at most d - 1 distinct non-zero remainders, so the loop ends within d steps. Every fraction is either a terminating or a repeating decimal.

Edge cases: 0 divided by anything is "0", with no "-0"; negative over negative is positive; and in languages with 32-bit ints, abs(-2147483648) overflows, so use 64-bit there.

This is cycle detection with a hash map, the "seen set" version of Happy Number.`,
      complexity: 'O(d) time and space in the worst case',
    },
  ],
};

export default m;
