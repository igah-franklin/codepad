import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'mock',
  title: 'Mock Interview Mix',
  description: 'Story problems from real interview loops. Translate the story, spot the pattern, prove the greedy.',
  challenges: [
    {
      title: 'Two City Scheduling', fn: 'twoCitySchedCost', args: ['costs'],
      prompt: '2n people will be interviewed; costs[i] = [costA, costB] is the price of flying person i to city A or B. Exactly n people must go to each city. Return the minimum total cost.',
      tests: [[[[[10, 20], [30, 200], [400, 50], [30, 20]]], 110], [[[[259, 770], [448, 54], [926, 667], [184, 139], [840, 118], [577, 469]]], 1859], [[[[1, 2], [3, 4]]], 5], [[[[5, 1], [1, 5]]], 2]],
      js: String.raw`function twoCitySchedCost(costs) {
  // sort by how much cheaper A is than B; the first half goes to A
  const sorted = costs.slice().sort((x, y) => (x[0] - x[1]) - (y[0] - y[1]));
  const n = sorted.length / 2;
  let total = 0;
  for (let i = 0; i < sorted.length; i++) total += i < n ? sorted[i][0] : sorted[i][1];
  return total;
}`,
      py: String.raw`def two_city_sched_cost(costs):
    s = sorted(costs, key=lambda c: c[0] - c[1])
    n = len(s) // 2
    return sum(c[0] for c in s[:n]) + sum(c[1] for c in s[n:])`,
      explain: `Imagine first sending everyone to city B. Moving person i to A then changes the total by costA - costB. You must move exactly n people, so move the n with the smallest (most negative) differences, meaning the people for whom A is the biggest saving relative to B.

1. Sort the people by costA - costB.
2. The first half flies to A, the second half to B.

Why is this optimal? With a fixed baseline of everyone at B, the total is the baseline plus the sum of the chosen differences, and picking the n smallest differences minimizes that sum. Exchange argument: swapping any A-person with a B-person who has a smaller difference would lower the total.

Greedy on raw costs fails. "Send each person to their cheaper city" can put too many in one city. The relative difference is the right measure.

A DP over (people processed, number sent to A) also works in O(n²), and is useful when the quotas are not equal halves.`,
      complexity: 'O(n log n) time, O(n) space',
    },
    {
      title: 'Boats to Save People', fn: 'numRescueBoats', args: ['people', 'limit'],
      prompt: 'Each boat carries at most two people with total weight ≤ limit (every person weighs ≤ limit). Return the minimum number of boats needed.',
      tests: [[[[1, 2], 3], 1], [[[3, 2, 2, 1], 3], 3], [[[3, 5, 3, 4], 5], 4], [[[5], 5], 1], [[[1, 1, 1, 1], 2], 2], [[[2, 49, 10, 7, 11, 41, 47, 2, 22, 6, 13, 12, 33, 18, 10, 26, 2, 6, 50, 10], 50], 11]],
      js: String.raw`function numRescueBoats(people, limit) {
  const p = people.slice().sort((a, b) => a - b);
  let i = 0, j = p.length - 1, boats = 0;
  while (i <= j) {
    if (p[i] + p[j] <= limit) i++; // lightest rides with the heaviest
    j--; // heaviest always leaves
    boats++;
  }
  return boats;
}`,
      py: String.raw`def num_rescue_boats(people, limit):
    p = sorted(people)
    i, j, boats = 0, len(p) - 1, 0
    while i <= j:
        if p[i] + p[j] <= limit:
            i += 1
        j -= 1
        boats += 1
    return boats`,
      explain: `This is a greedy two-pointer: the heaviest remaining person always takes a boat, and they share it with the lightest person if the two fit together.

1. Sort by weight.
2. j = the heaviest person, i = the lightest.
3. If p[i] + p[j] ≤ limit, they share a boat (move both pointers). Otherwise the heaviest person goes alone (move j only).
4. Count a boat each time.

Why pair the heaviest with the lightest? The heaviest person needs a boat no matter what. If anyone can share with them, the lightest person can. Using the lightest person here never hurts, because any other partner would be at least as heavy and harder to pair later. That is the exchange argument again.

The i <= j condition handles the final single person (i == j), who gets a boat alone.

Sorting dominates, so O(n log n). If the weights are small integers, a counting sort makes it O(n + limit).

This pattern (sort, then pair from both ends) also solves "maximize the number of pairs with sum ≤ K".`,
      complexity: 'O(n log n) time, O(1) extra space after sorting',
    },
    {
      title: 'Partition Labels', fn: 'partitionLabels', args: ['s'],
      prompt: 'Split s into as many parts as possible so that each letter appears in at most one part. Return the sizes of the parts in order.',
      tests: [[['ababcbacadefegdehijhklij'], [9, 7, 8]], [['eccbbbbdec'], [10]], [['a'], [1]], [['abc'], [1, 1, 1]], [['abac'], [3, 1]]],
      js: String.raw`function partitionLabels(s) {
  const last = {};
  for (let i = 0; i < s.length; i++) last[s[i]] = i; // final position of each letter
  const sizes = [];
  let start = 0, end = 0;
  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, last[s[i]]); // the current part must reach this far
    if (i === end) {
      sizes.push(end - start + 1);
      start = i + 1;
    }
  }
  return sizes;
}`,
      py: String.raw`def partition_labels(s):
    last = {c: i for i, c in enumerate(s)}
    sizes = []
    start = end = 0
    for i, c in enumerate(s):
        end = max(end, last[c])
        if i == end:
            sizes.append(end - start + 1)
            start = i + 1
    return sizes`,
      explain: `When a part contains a letter, it must extend at least as far as that letter's last occurrence.

1. Record each letter's last index.
2. Scan, keeping end = the furthest last-index of any letter seen in the current part.
3. When i reaches end, every letter in the part has finished, so cut here, record the size, and start a new part.

Why are the parts as small (and as many) as possible? A cut is made at the first moment it is legal. Cutting any earlier would split some letter across two parts.

"ababcbacadefegdehijhklij": the first part must reach the last a (index 8). Every letter inside it (b, c) also ends by then, so the first part has size 9. The next parts work the same way.

This is Merge Intervals in disguise: each letter defines an interval [first, last], and the parts are the merged groups of overlapping intervals.

Spotting the interval structure in a string problem is the insight. The single greedy scan is the payoff.`,
      complexity: 'O(n) time, O(alphabet) space',
    },
    {
      title: 'Car Fleet', fn: 'carFleet', args: ['target', 'position', 'speed'],
      prompt: 'Cars drive toward target on a one-lane road. A faster car that catches a slower one ahead joins it and moves at the slower speed (a fleet). Cars meeting exactly at target also form a fleet. Return how many fleets arrive.',
      tests: [[[12, [10, 8, 0, 5, 3], [2, 4, 1, 1, 3]], 3], [[10, [3], [3]], 1], [[100, [0, 2, 4], [4, 2, 1]], 1], [[10, [6, 8], [3, 2]], 2], [[10, [0, 4, 2], [2, 1, 3]], 1]],
      js: String.raw`function carFleet(target, position, speed) {
  const cars = position.map((p, i) => [p, (target - p) / speed[i]]); // [position, time to arrive]
  cars.sort((a, b) => b[0] - a[0]); // closest to the target first
  let fleets = 0, slowest = 0; // arrival time of the fleet ahead
  for (const [, t] of cars) {
    if (t > slowest) {
      // can't catch the fleet ahead: starts a new fleet
      fleets++;
      slowest = t;
    }
  }
  return fleets;
}`,
      py: String.raw`def car_fleet(target, position, speed):
    cars = sorted(zip(position, speed), reverse=True)
    fleets, slowest = 0, 0.0
    for p, s in cars:
        t = (target - p) / s
        if t > slowest:
            fleets += 1
            slowest = t
    return fleets`,
      explain: `Think in arrival times rather than positions.

1. For each car, compute time = (target - position) / speed, the time it would need if it were alone on the road.
2. Process the cars from the closest to the target to the farthest.
3. A car whose solo time is at most the arrival time of the fleet ahead of it catches up (or ties at the target) and joins that fleet. Its own speed no longer matters.
4. A car with a larger time cannot catch up, so it leads a new fleet, and its time becomes the new "fleet ahead" time.

Why sort by position? Cars cannot pass each other, so only the fleet directly ahead matters. The fleet ahead's arrival time only increases as you move backwards, so one variable is enough. That is a monotonic stack reduced to a single value.

First test: times by position are 10 → 1, 8 → 1, 5 → 7, 3 → 3, 0 → 12. Scanning: 1 (new fleet), 1 (joins), 7 (new fleet), 3 (joins the fleet arriving at 7), 12 (new fleet). That is 3 fleets.

Simulating the cars moving step by step would be slow and error-prone. Changing the coordinates (from position to time) makes the problem simple.`,
      complexity: 'O(n log n) time, O(n) space',
    },
    {
      title: 'Bulls and Cows', fn: 'getHint', args: ['secret', 'guess'],
      prompt: 'In the Bulls and Cows game, bulls are digits in the guess that are in the right position, and cows are digits that are in the secret but in the wrong position (each secret digit is matched at most once). Return the hint as "xAyB" (x bulls, y cows).',
      tests: [[['1807', '7810'], '1A3B'], [['1123', '0111'], '1A1B'], [['1', '0'], '0A0B'], [['1122', '2211'], '0A4B'], [['1234', '1234'], '4A0B'], [['11', '10'], '1A0B']],
      js: String.raw`function getHint(secret, guess) {
  let bulls = 0, cows = 0;
  const count = new Array(10).fill(0); // >0: unmatched secret digits; <0: unmatched guess digits
  for (let i = 0; i < secret.length; i++) {
    const s = +secret[i], g = +guess[i];
    if (s === g) bulls++;
    else {
      if (count[s] < 0) cows++; // guess had this digit earlier
      if (count[g] > 0) cows++; // secret had this digit earlier
      count[s]++;
      count[g]--;
    }
  }
  return bulls + 'A' + cows + 'B';
}`,
      py: String.raw`def get_hint(secret, guess):
    bulls = 0
    cs, cg = [0] * 10, [0] * 10
    for s, g in zip(secret, guess):
        if s == g:
            bulls += 1
        else:
            cs[int(s)] += 1
            cg[int(g)] += 1
    cows = sum(min(a, b) for a, b in zip(cs, cg))
    return f"{bulls}A{cows}B"`,
      explain: `There are two kinds of matches, and they must not double-count.

1. Bulls: positions where the digits are equal. Count them and exclude them from the cow matching.
2. Cows: among the remaining (non-bull) positions, count how many digits of the guess can be matched to the same digits in the secret. For each digit d, that is min(how many times the secret has d, how many times the guess has d), over the non-bull positions only.

The Python solution does exactly that: count the non-bull digits on both sides, then sum the minimums.

The JavaScript solution does it in a single pass with one array: positive counts mean a secret digit is waiting for a match, and negative counts mean a guess digit is waiting. Each time a waiting partner exists, record a cow immediately.

"1123" vs "0111": position 1 is a bull (1 = 1). The remaining secret digits are 1, 2, 3, and the remaining guess digits are 0, 1, 1. They share one 1, so the result is 1A1B.

This is the multiset intersection from Intersection with Counts, after removing the exact matches.`,
      complexity: 'O(n) time, O(1) space (10 digits)',
    },
    {
      title: 'Hand of Straights', fn: 'isNStraightHand', args: ['hand', 'groupSize'],
      prompt: 'Return true if the cards in hand can be rearranged into groups of groupSize consecutive values (each card used exactly once).',
      tests: [[[[1, 2, 3, 6, 2, 3, 4, 7, 8], 3], true], [[[1, 2, 3, 4, 5], 4], false], [[[1], 1], true], [[[1, 1, 2, 2, 3, 3], 3], true], [[[8, 10, 12], 3], false], [[[1, 2, 3, 3, 4, 4, 5, 6], 4], true]],
      js: String.raw`function isNStraightHand(hand, groupSize) {
  if (hand.length % groupSize) return false;
  const count = new Map();
  for (const c of hand) count.set(c, (count.get(c) || 0) + 1);
  const values = [...count.keys()].sort((a, b) => a - b);
  for (const v of values) {
    const k = count.get(v);
    if (k === 0) continue;
    // the smallest remaining card must start k groups: v, v+1, ..., v+groupSize-1
    for (let x = v; x < v + groupSize; x++) {
      if ((count.get(x) || 0) < k) return false;
      count.set(x, count.get(x) - k);
    }
  }
  return true;
}`,
      py: String.raw`def is_n_straight_hand(hand, group_size):
    if len(hand) % group_size:
        return False
    count = {}
    for c in hand:
        count[c] = count.get(c, 0) + 1
    for v in sorted(count):
        k = count[v]
        if k == 0:
            continue
        for x in range(v, v + group_size):
            if count.get(x, 0) < k:
                return False
            count[x] -= k
    return True`,
      explain: `The greedy anchor: the smallest remaining card has to be the lowest card of some group, because nothing smaller is left to come before it.

1. If the hand size is not divisible by groupSize, it is impossible.
2. Count each value.
3. Go through the values from smallest to largest. If value v still has k copies, those k cards must each start a group v, v+1, ..., v+groupSize-1. Check that each of those values has at least k copies, and subtract k.
4. Any shortfall means it is impossible.

Processing all k copies at once (rather than building one group at a time) is a nice speedup.

[1, 2, 3, 3, 4, 4, 5, 6] with groupSize 4: 1 starts [1, 2, 3, 4], leaving 3, 4, 5, 6, which forms [3, 4, 5, 6].

Sorting the distinct values costs O(m log m), and the subtraction is O(m × groupSize) in total.

The same problem appears as "Divide Array in Sets of K Consecutive Numbers". The greedy works because "the smallest card must start a group" is forced, with no choice involved, so there is nothing to backtrack over.`,
      complexity: 'O(n + m log m + m·groupSize) time, O(m) space',
    },
    {
      title: 'Longest Mountain', fn: 'longestMountain', args: ['arr'],
      prompt: 'A mountain is a contiguous subarray of length ≥ 3 that strictly increases to a peak and then strictly decreases. Return the length of the longest mountain, or 0 if none exists.',
      tests: [[[[2, 1, 4, 7, 3, 2, 5]], 5], [[[2, 2, 2]], 0], [[[0, 1, 0]], 3], [[[1, 2, 3]], 0], [[[0, 2, 0, 2, 0]], 3], [[[875, 884, 239, 731, 723, 685]], 4], [[[1, 2, 2, 1]], 0]],
      js: String.raw`function longestMountain(arr) {
  let best = 0, i = 1;
  const n = arr.length;
  while (i < n) {
    // skip flat or descending ground: a mountain must start by climbing
    while (i < n && arr[i] <= arr[i - 1]) i++;
    let up = 0;
    while (i < n && arr[i] > arr[i - 1]) { up++; i++; }
    let down = 0;
    while (i < n && arr[i] < arr[i - 1]) { down++; i++; }
    if (up > 0 && down > 0) best = Math.max(best, up + down + 1);
  }
  return best;
}`,
      py: String.raw`def longest_mountain(arr):
    best, i, n = 0, 1, len(arr)
    while i < n:
        while i < n and arr[i] <= arr[i - 1]:
            i += 1
        up = 0
        while i < n and arr[i] > arr[i - 1]:
            up += 1
            i += 1
        down = 0
        while i < n and arr[i] < arr[i - 1]:
            down += 1
            i += 1
        if up > 0 and down > 0:
            best = max(best, up + down + 1)
    return best`,
      explain: `Walk the array once, climbing and descending mountains in turn.

1. Skip any flat or descending stretch, because a mountain has to start with a climb.
2. Count the strictly increasing steps (up).
3. Count the strictly decreasing steps that follow (down).
4. It is a mountain only if both up and down are positive. Its length is up + down + 1 (the steps plus the starting point).

The next mountain can start right where this one's descent ends (in [0, 2, 0, 2, 0], the valley 0 is shared), and the loop handles that, because it does not consume the valley before the next climb.

Flat steps (equal neighbors) break both slopes, which is why [1, 2, 2, 1] is not a mountain.

Alternative: two passes computing up[i] (the length of the increasing run ending at i) and down[i] (the length of the decreasing run starting at i), then take the max of up[i] + down[i] + 1 over the peaks. That has the same two-direction structure as Candy and Trapping Rain Water.`,
      complexity: 'O(n) time, O(1) space',
    },
    {
      title: 'Find All Duplicates', fn: 'findDuplicates', args: ['nums'],
      prompt: 'nums has n integers in the range 1..n, each appearing once or twice. Return all values that appear twice, in O(n) time and O(1) extra space (excluding the output). Any order.',
      compare: 'unordered',
      tests: [[[[4, 3, 2, 7, 8, 2, 3, 1]], [2, 3]], [[[1, 1, 2]], [1]], [[[1]], []], [[[2, 2]], [2]], [[[5, 4, 6, 7, 9, 3, 10, 9, 5, 6]], [5, 6, 9]]],
      js: String.raw`function findDuplicates(nums) {
  const a = nums.slice(), out = [];
  for (const x of a) {
    const i = Math.abs(x) - 1; // value v marks slot v - 1
    if (a[i] < 0) out.push(Math.abs(x)); // already marked: seen before
    else a[i] = -a[i];
  }
  return out;
}`,
      py: String.raw`def find_duplicates(nums):
    a = nums[:]
    out = []
    for x in a:
        i = abs(x) - 1
        if a[i] < 0:
            out.append(abs(x))
        else:
            a[i] = -a[i]
    return out`,
      explain: `Use the array itself as a seen set, with the sign of each slot as the marker. Values from 1 to n map to slots 0 to n - 1.

For each value v (take abs(v), since the slot may already have been negated):
- if slot v - 1 is already negative, v has been seen before, so it is a duplicate;
- otherwise negate it to mark v as seen.

Negation keeps the original magnitude, so the array is still readable as values (via abs) while also carrying the marks.

It runs in O(n) time with O(1) extra space. The solution copies the input to keep the tests clean. A truly in-place version would restore the signs afterwards if the caller still needs the data.

Related problems that use the same "values are indices" trick:
- First Missing Positive (cyclic placement, in Hard Arrays);
- Find the Duplicate Number (Floyd's cycle, earlier in this level), where modification is not allowed;
- Find All Numbers Disappeared (the slots still positive at the end are the missing values).

Whenever the values are in 1..n, consider using the input array as a hash table.`,
      complexity: 'O(n) time, O(1) extra space',
    },
    {
      title: 'Maximum Units on a Truck', fn: 'maximumUnits', args: ['boxTypes', 'truckSize'],
      prompt: 'boxTypes[i] = [numberOfBoxes, unitsPerBox]. The truck holds at most truckSize boxes. Return the maximum total units you can load.',
      tests: [[[[[1, 3], [2, 2], [3, 1]], 4], 8], [[[[5, 10], [2, 5], [4, 7], [3, 9]], 10], 91], [[[[1, 1]], 0], 0], [[[[2, 5]], 10], 10], [[[[3, 1], [1, 9]], 2], 10]],
      js: String.raw`function maximumUnits(boxTypes, truckSize) {
  const boxes = boxTypes.slice().sort((a, b) => b[1] - a[1]); // most units per box first
  let units = 0;
  for (const [count, perBox] of boxes) {
    const take = Math.min(count, truckSize);
    units += take * perBox;
    truckSize -= take;
    if (truckSize === 0) break;
  }
  return units;
}`,
      py: String.raw`def maximum_units(box_types, truck_size):
    units = 0
    for count, per_box in sorted(box_types, key=lambda b: -b[1]):
        take = min(count, truck_size)
        units += take * per_box
        truck_size -= take
        if truck_size == 0:
            break
    return units`,
      explain: `Every box takes one slot, whatever kind it is, so the only thing that matters is the units per box. Fill the truck with the most valuable boxes first.

1. Sort the box types by units per box, descending.
2. Take as many of each type as will fit, then move to the next type.

Why is greedy optimal here when it fails for 0/1 knapsack? All the items have the same "weight" (one slot each), so the best value per slot is simply the best value per box. Swapping a lower-value box for a higher-value one never hurts. This is the same reasoning as the fractional knapsack, where greedy by value-to-weight ratio is optimal.

Contrast it with 0/1 knapsack with different weights (Partition Equal Subset Sum), where greedy can fail and you need DP.

Counting-sort speedup: if units per box is at most 1000, bucket the box types by units and walk from high to low, giving O(n + 1000).

A useful interview skill is saying why greedy works on this problem and fails on a similar one.`,
      complexity: 'O(n log n) time, O(n) space',
    },
    {
      title: 'Minimum Deletions for Unique Frequencies', fn: 'minDeletions', args: ['s'],
      prompt: 'A string is "good" if no two different characters have the same frequency. Return the minimum number of characters to delete from s to make it good.',
      tests: [[['aab'], 0], [['aaabbbcc'], 2], [['ceabaacb'], 2], [['a'], 0], [['abcabc'], 3], [['bbcebab'], 2]],
      js: String.raw`function minDeletions(s) {
  const freq = {};
  for (const c of s) freq[c] = (freq[c] || 0) + 1;
  const counts = Object.values(freq).sort((a, b) => b - a);
  let deletions = 0, allowed = Infinity; // the highest frequency still available
  for (const f of counts) {
    const target = Math.min(f, allowed); // push this letter down to the next free slot
    deletions += f - target;
    allowed = Math.max(0, target - 1);
  }
  return deletions;
}`,
      py: String.raw`def min_deletions(s):
    freq = {}
    for c in s:
        freq[c] = freq.get(c, 0) + 1
    deletions = 0
    allowed = float("inf")
    for f in sorted(freq.values(), reverse=True):
        target = min(f, allowed)
        deletions += f - target
        allowed = max(0, target - 1)
    return deletions`,
      explain: `Only the frequencies matter. Make them all distinct (zero is allowed for any number of letters, since a deleted letter is gone) using the fewest deletions.

Greedy from the highest frequency down:
1. Sort the frequencies in descending order.
2. allowed = the largest frequency still free. It starts as unlimited.
3. Each letter keeps min(f, allowed) occurrences. Delete the rest, then set allowed to one less than what you kept (never below 0).

"aaabbbcc" has frequencies [3, 3, 2]: a keeps 3, b must drop to 2 (1 deletion), c must drop to 1 (1 deletion). That is 2 deletions.

Why go from the top? Larger frequencies have more room to stay where they are. Each letter takes the highest free level at or below its own count, which keeps the deletions minimal by an exchange argument, as with the other greedy problems.

Alternative: walk the frequencies, and while a frequency is already used, decrement it (counting a deletion) until it is free or 0, tracking used values in a set. It gives the same answer and is easier to come up with under pressure.

Story problems in this module all share the same steps: strip the story, find the quantity that matters (here, the frequencies), and then a standard greedy or DP applies.`,
      complexity: 'O(n + k log k) time for k distinct letters, O(k) space',
    },
  ],
};

export default m;
