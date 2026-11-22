import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'bits-math',
  title: 'Bits & Math',
  description: 'XOR tricks, bit counting, fast exponentiation and the sieve of Eratosthenes.',
  challenges: [
    {
      title: 'Single Number', fn: 'singleNumber', args: ['nums'],
      prompt: 'Every element of nums appears twice except one. Return that single one in O(n) time and O(1) extra space.',
      tests: [[[[2, 2, 1]], 1], [[[4, 1, 2, 1, 2]], 4], [[[1]], 1], [[[-3, 7, 7]], -3], [[[0, 5, 5, 0, 9]], 9]],
      js: String.raw`function singleNumber(nums) {
  let x = 0;
  for (const n of nums) x ^= n;
  return x;
}`,
      py: String.raw`def single_number(nums):
    x = 0
    for n in nums:
        x ^= n
    return x`,
      explain: `XOR (^) has three properties that make this work:
- a ^ a = 0 (a value cancels itself out),
- a ^ 0 = a,
- it is commutative and associative, so order does not matter.

XOR everything together. Every pair cancels to 0, and the single value is left over.

4 ^ 1 ^ 2 ^ 1 ^ 2 = 4 ^ (1 ^ 1) ^ (2 ^ 2) = 4 ^ 0 ^ 0 = 4.

Bit by bit, XOR is addition without carry: each bit position counts how many times a 1 appears there, modulo 2. Paired values contribute an even count, so they disappear.

A hash set or counting also solves it, but uses O(n) space. The XOR trick is O(1).

Negative numbers work too, because XOR operates on the two's-complement bits.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Single Number II', fn: 'singleNumberII', args: ['nums'],
      prompt: 'Every element appears three times except one, which appears once. Return it in O(n) time and O(1) space.',
      tests: [[[[2, 2, 3, 2]], 3], [[[0, 1, 0, 1, 0, 1, 99]], 99], [[[-2, -2, 1, 1, 4, 1, 4, 4, -4, -2]], -4], [[[7]], 7]],
      js: String.raw`function singleNumberII(nums) {
  // ones/twos hold bits seen (count mod 3) == 1 / == 2
  let ones = 0, twos = 0;
  for (const n of nums) {
    ones = (ones ^ n) & ~twos;
    twos = (twos ^ n) & ~ones;
  }
  return ones;
}`,
      py: String.raw`def single_number_ii(nums):
    # count each bit position mod 3 (works for negatives via 32-bit view)
    result = 0
    for bit in range(32):
        count = sum((n >> bit) & 1 for n in nums)
        if count % 3:
            result |= 1 << bit
    if result >= 1 << 31:  # convert from 32-bit two's complement
        result -= 1 << 32
    return result`,
      explain: `XOR cancels pairs, not triples. Generalize the idea: count the 1s in each bit position modulo 3.

Bit counting (the Python solution, easiest to understand):
1. For each of the 32 bit positions, count how many numbers have that bit set.
2. Values appearing three times contribute a multiple of 3. If count % 3 is not 0, the single number has that bit.
3. Assemble the bits. In Python, convert from 32-bit two's complement so negative answers come out right.

That is O(32n) time and O(1) space.

Bit state machine (the JavaScript solution, the elegant one): track two masks, ones and twos, where a bit is set in ones if its count mod 3 is 1, and in twos if it is 2. For each n:
- ones = (ones ^ n) & ~twos
- twos = (twos ^ n) & ~ones
A bit moves through the states 0 → 1 → 2 → 0 as it is seen, so after all numbers, ones holds exactly the single value's bits.

This works because JavaScript's bitwise operators use 32-bit integers, which matches the problem.

The general rule: for elements appearing k times, count each bit modulo k.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Single Number III', fn: 'singleNumberIII', args: ['nums'],
      prompt: 'Exactly two elements appear once and all others appear twice. Return the two singles in any order, using O(1) extra space.',
      compare: 'unordered',
      tests: [[[[1, 2, 1, 3, 2, 5]], [3, 5]], [[[-1, 0]], [-1, 0]], [[[0, 1]], [0, 1]], [[[4, 4, 7, 9, 2, 2]], [7, 9]]],
      js: String.raw`function singleNumberIII(nums) {
  let xor = 0;
  for (const n of nums) xor ^= n; // = a ^ b, non-zero since a != b
  const bit = xor & -xor; // lowest bit where a and b differ
  let a = 0, b = 0;
  for (const n of nums) {
    if (n & bit) a ^= n;
    else b ^= n;
  }
  return [a, b];
}`,
      py: String.raw`def single_number_iii(nums):
    xor = 0
    for n in nums:
        xor ^= n
    bit = xor & -xor
    a = b = 0
    for n in nums:
        if n & bit:
            a ^= n
        else:
            b ^= n
    return [a, b]`,
      explain: `XOR-ing everything gives a ^ b, the two singles mixed together. Separate them by splitting the numbers into two groups.

1. xor = a ^ b. Since a ≠ b, at least one bit of xor is 1, and at that bit a and b differ.
2. Pick one such bit. The lowest set bit, xor & -xor, is a standard trick (two's complement makes -x flip every bit above the lowest 1).
3. Split all the numbers by whether they have that bit set. a and b land in different groups, and each pair of duplicates lands in the same group (equal numbers have equal bits).
4. XOR each group separately. The duplicates cancel, leaving a in one group and b in the other.

This reduces the problem to two copies of Single Number. Partitioning by one distinguishing bit is a neat, reusable idea.

x & -x isolating the lowest set bit is also the core operation of Fenwick trees (binary indexed trees), and it appeared in the bitmask N-Queens.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Counting Bits', fn: 'countBits', args: ['n'],
      prompt: 'Return an array ans of length n + 1 where ans[i] is the number of 1 bits in the binary representation of i, in O(n) total time.',
      tests: [[[2], [0, 1, 1]], [[5], [0, 1, 1, 2, 1, 2]], [[0], [0]], [[8], [0, 1, 1, 2, 1, 2, 2, 3, 1]], [[15], [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4]]],
      js: String.raw`function countBits(n) {
  const ans = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) ans[i] = ans[i >> 1] + (i & 1); // drop the last bit, then add it back
  return ans;
}`,
      py: String.raw`def count_bits(n):
    ans = [0] * (n + 1)
    for i in range(1, n + 1):
        ans[i] = ans[i >> 1] + (i & 1)
    return ans`,
      explain: `DP over the binary representation: each number's bit count follows from a smaller number's.

i >> 1 is i with its last bit removed (integer division by 2). So:
bits(i) = bits(i >> 1) + (i & 1), where the last term adds 1 if the removed bit was a 1.

Since i >> 1 < i, its value is already computed, which makes the whole array O(n), one step per number.

Example: 13 = 1101. 13 >> 1 = 6 (110), which has 2 bits, and 13 is odd, so 13 has 3 bits.

Another recurrence: bits(i) = bits(i & (i - 1)) + 1. i & (i - 1) clears the lowest set bit (Brian Kernighan's trick, used in the next challenge).

Computing each count from scratch with a loop is O(n log n). Reusing smaller answers is what turns it into DP.`,
      complexity: 'O(n) time, O(n) space for the output',
    },
    {
      title: 'Number of 1 Bits', fn: 'hammingWeight', args: ['n'],
      prompt: 'Return the number of 1 bits (the Hamming weight) of the non-negative integer n.',
      tests: [[[11], 3], [[128], 1], [[0], 0], [[4294967293], 31], [[255], 8], [[2147483648], 1]],
      js: String.raw`function hammingWeight(n) {
  let count = 0;
  n = n >>> 0; // treat as unsigned 32-bit
  while (n !== 0) {
    n = (n & (n - 1)) >>> 0; // clear the lowest set bit
    count++;
  }
  return count;
}`,
      py: String.raw`def hamming_weight(n):
    count = 0
    while n:
        n &= n - 1
        count += 1
    return count`,
      explain: `Brian Kernighan's trick: n & (n - 1) clears the lowest set bit of n.

Why? Subtracting 1 flips the lowest 1 bit to 0 and turns every 0 below it into a 1. ANDing with the original n zeroes out exactly that region, so only the lowest 1 is removed.

12 (1100) - 1 = 11 (1011), and 1100 & 1011 = 1000.

So loop while n ≠ 0, clearing one set bit per iteration and counting. It runs once per 1 bit, not once per bit position.

JavaScript detail: bitwise operators work on signed 32-bit integers, so 4294967293 would be read as negative. >>> 0 converts a value to unsigned 32-bit, which keeps the loop correct. Python integers are unbounded, so non-negative inputs need no special handling.

Built-ins: bin(n).count("1") or n.bit_count() in Python 3.10+. CPUs have a dedicated POPCNT instruction.

Uses include Hamming distance (popcount(a ^ b)), counting set flags, and subset sizes in bitmask DP.`,
      complexity: 'O(number of set bits) time, O(1) space',
    },
    {
      title: 'Reverse Bits', fn: 'reverseBits', args: ['n'],
      prompt: 'Reverse the bits of a 32-bit unsigned integer n and return the result as an unsigned integer.',
      tests: [[[43261596], 964176192], [[4294967293], 3221225471], [[0], 0], [[1], 2147483648], [[4294967295], 4294967295]],
      js: String.raw`function reverseBits(n) {
  let result = 0;
  for (let i = 0; i < 32; i++) {
    result = (result << 1) | (n & 1); // append n's lowest bit
    n >>>= 1; // move to the next bit (unsigned shift)
  }
  return result >>> 0; // as unsigned
}`,
      py: String.raw`def reverse_bits(n):
    result = 0
    for _ in range(32):
        result = (result << 1) | (n & 1)
        n >>= 1
    return result`,
      explain: `This is the reverse-the-digits loop from Easy, done in base 2 with bit operations.

32 times:
1. Shift result left by one to make room.
2. Copy n's lowest bit into result's lowest position (n & 1).
3. Shift n right by one to expose the next bit.

The bits read first from n (its lowest) end up highest in result, which is exactly a reversal.

Always loop exactly 32 times, even when n becomes 0 early, because leading zeros become trailing zeros in the result. That is why 1 becomes 2147483648 (1 followed by 31 zeros).

In JavaScript use >>> (unsigned right shift) on n, and >>> 0 on the result. Otherwise the top bit is read as a sign and results show up negative.

Optimizations for many calls: swap bits in groups with masks (swap halves, then bytes, nibbles, pairs, single bits), which takes 5 steps instead of 32, or use a 256-entry lookup table for bytes.`,
      complexity: 'O(32) = O(1) time and space',
    },
    {
      title: 'Sum Without +', fn: 'getSum', args: ['a', 'b'],
      prompt: 'Return a + b for 32-bit signed integers without using the + or − operators.',
      tests: [[[1, 2], 3], [[2, 3], 5], [[-1, 1], 0], [[-5, -7], -12], [[0, 0], 0], [[1000, -999], 1], [[2147483646, 1], 2147483647]],
      js: String.raw`function getSum(a, b) {
  while (b !== 0) {
    const carry = (a & b) << 1; // positions where both have 1 carry into the next bit
    a = a ^ b; // add without carry
    b = carry;
  }
  return a;
}`,
      py: String.raw`def get_sum(a, b):
    MASK, MAX = 0xFFFFFFFF, 0x7FFFFFFF
    a &= MASK
    b &= MASK
    while b:
        carry = ((a & b) << 1) & MASK
        a = (a ^ b) & MASK
        b = carry
    return a if a <= MAX else ~(a ^ MASK)  # back to signed`,
      explain: `This is how adder circuits work in hardware.

For two bits:
- the sum bit (ignoring carry) is a XOR b;
- the carry bit is a AND b, moved one position left.

So a + b = (a ^ b) + ((a & b) << 1). That is still an addition, so repeat it. Each round pushes the carries further left, and eventually there are none left (b becomes 0).

Trace 2 + 3 (010 + 011): xor = 001, carry = 100. Then xor = 101, carry = 000, so the answer is 5.

Negative numbers use two's complement, where this same bit-level addition works unchanged.

JavaScript: bitwise operators work on 32-bit integers, which is exactly the problem's domain, so the loop is direct.

Python: integers are unbounded, so a negative number has infinitely many leading 1 bits and the loop would never end. Mask everything to 32 bits with & 0xFFFFFFFF, then convert back: if the top bit is set, the result is negative, so compute ~(a ^ MASK).

This shows the gap between mathematical integers and machine integers, which matters in systems programming.`,
      complexity: 'O(32) = O(1) iterations',
    },
    {
      title: 'Pow(x, n)', fn: 'myPow', args: ['x', 'n'],
      prompt: 'Compute x raised to the integer power n (n may be negative) in O(log |n|) multiplications, without using the built-in power operator.',
      compare: 'float',
      tests: [[[2, 10], 1024], [[2.1, 3], 9.261], [[2, -2], 0.25], [[1, 2147483647], 1], [[0.5, 0], 1], [[-2, 3], -8], [[1.0001, 10000], 2.7181459268249255]],
      js: String.raw`function myPow(x, n) {
  if (n < 0) {
    x = 1 / x;
    n = -n;
  }
  let result = 1;
  while (n > 0) {
    if (n % 2 === 1) result *= x; // this bit of n is set
    x *= x; // x, x^2, x^4, x^8, ...
    n = Math.floor(n / 2);
  }
  return result;
}`,
      py: String.raw`def my_pow(x, n):
    if n < 0:
        x, n = 1 / x, -n
    result = 1.0
    while n > 0:
        if n & 1:
            result *= x
        x *= x
        n >>= 1
    return result`,
      explain: `Multiplying x by itself n times is O(n), which is hopeless for n = 2 billion. Use fast exponentiation (exponentiation by squaring).

Write n in binary. x^13 = x^(8 + 4 + 1) = x^8 × x^4 × x^1. Repeated squaring produces x, x², x⁴, x⁸, and so on, and you multiply in the powers that correspond to the 1 bits of n.

1. Negative n: x^(-n) = (1/x)^n.
2. Loop while n > 0:
- if the lowest bit of n is 1, multiply result by the current x;
- square x;
- shift n right.

That is about log₂(n) iterations, so 31 for n = 2³¹.

Recursive form: x^n = (x^(n/2))² for even n, and x × x^(n-1) for odd n.

The same algorithm drives modular exponentiation (pow(a, b, m)) in cryptography (RSA, Diffie-Hellman), computing Fibonacci with matrix powers, and any "apply an operation n times" problem where the operation can be composed with itself.

In languages with 32-bit ints, -n overflows when n is the minimum integer, so convert to a 64-bit value first. JavaScript and Python are fine.`,
      complexity: 'O(log |n|) time, O(1) space',
    },
    {
      title: 'Count Primes', fn: 'countPrimes', args: ['n'],
      prompt: 'Return the number of prime numbers strictly less than n.',
      tests: [[[10], 4], [[0], 0], [[1], 0], [[2], 0], [[3], 1], [[100], 25], [[100000], 9592]],
      js: String.raw`function countPrimes(n) {
  if (n < 3) return 0;
  const composite = new Uint8Array(n);
  let count = 0;
  for (let i = 2; i < n; i++) {
    if (composite[i]) continue;
    count++;
    // start at i*i: smaller multiples were already crossed out by smaller primes
    for (let j = i * i; j < n; j += i) composite[j] = 1;
  }
  return count;
}`,
      py: String.raw`def count_primes(n):
    if n < 3:
        return 0
    is_prime = bytearray([1]) * n
    is_prime[0] = is_prime[1] = 0
    i = 2
    while i * i < n:
        if is_prime[i]:
            is_prime[i * i::i] = bytearray(len(range(i * i, n, i)))
        i += 1
    return sum(is_prime)`,
      explain: `Testing each number individually (Is Prime from Easy) is O(n√n). The Sieve of Eratosthenes finds all primes below n in nearly linear time.

1. Assume every number from 2 up is prime.
2. Take the smallest number not crossed out. It is prime. Cross out all of its multiples.
3. Repeat.

Two optimizations:
- Start crossing out at i × i. Smaller multiples like 2i or 3i already have a smaller prime factor, so they were crossed out earlier.
- So you can stop the outer loop once i × i ≥ n. Everything still unmarked after that is prime.

Total work is n × (1/2 + 1/3 + 1/5 + ...) over the primes, which is O(n log log n), practically linear.

Memory: use a byte array (Uint8Array, bytearray), not a list of booleans. Python's slice assignment is_prime[i*i::i] = ... crosses out a whole arithmetic progression at C speed.

For very large n, a segmented sieve processes blocks that fit in the CPU cache.`,
      complexity: 'O(n log log n) time, O(n) space',
    },
    {
      title: 'Bitwise AND of a Range', fn: 'rangeBitwiseAnd', args: ['left', 'right'],
      prompt: 'Return the bitwise AND of every integer from left to right inclusive (0 ≤ left ≤ right ≤ 2^31 − 1).',
      tests: [[[5, 7], 4], [[0, 0], 0], [[1, 2147483647], 0], [[12, 15], 12], [[6, 7], 6], [[7, 7], 7], [[26, 30], 24]],
      js: String.raw`function rangeBitwiseAnd(left, right) {
  let shift = 0;
  // the answer is the common binary prefix of left and right
  while (left !== right) {
    left >>>= 1;
    right >>>= 1;
    shift++;
  }
  return (left << shift) >>> 0;
}`,
      py: String.raw`def range_bitwise_and(left, right):
    shift = 0
    while left != right:
        left >>= 1
        right >>= 1
        shift += 1
    return left << shift`,
      explain: `Looping from left to right and ANDing everything could mean 2 billion operations. Look at the bits instead.

Key insight: the result is the common binary prefix of left and right, followed by zeros.

Why? Find the highest bit where left and right differ. Counting from left up to right, that bit has to change from 0 to 1, so some number in between has all the bits below it as 0s (and another has them as 1s). Every bit at or below the first difference is therefore 0 in at least one number, and the AND clears it. Bits above it are identical in every number of the range, so they survive.

Algorithm: shift both numbers right until they are equal, counting the shifts. That equal value is the common prefix. Shift it back left to restore its position.

5 (101) to 7 (111): one shift gives 10 and 11, a second gives 1 and 1. The prefix 1 shifted back by 2 is 100 = 4.

Alternative: while right > left, do right &= right - 1 (Kernighan's trick clearing low set bits). Return right.

Questions about all the numbers in a range often reduce to how the bits vary across that range.`,
      complexity: 'O(32) = O(1) time and space',
    },
  ],
};

export default m;
