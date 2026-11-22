import type { ModuleDef } from '../../types';

const m: ModuleDef = {
  id: 'stacks',
  title: 'Stacks & Queues',
  description: 'Last-in-first-out thinking: matching brackets, parsing and monotonic stacks.',
  challenges: [
    {
      title: 'Valid Parentheses', fn: 'isValid', args: ['s'],
      prompt: 's contains only the characters ()[]{}. Return true if every bracket is closed by the same type of bracket, in the correct order.',
      tests: [[['()'], true], [['()[]{}'], true], [['(]'], false], [['([)]'], false], [['{[]}'], true], [[''], true], [['(('], false], [['))'], false]],
      js: String.raw`function isValid(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const c of s) {
    if (c in pairs) {
      if (stack.pop() !== pairs[c]) return false;
    } else {
      stack.push(c);
    }
  }
  return stack.length === 0;
}`,
      py: String.raw`def is_valid(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for c in s:
        if c in pairs:
            if not stack or stack.pop() != pairs[c]:
                return False
        else:
            stack.append(c)
    return not stack`,
      explain: `The most recently opened bracket must be the first one closed. That is exactly last-in-first-out, which is what a stack provides.

1. Push every opening bracket.
2. On a closing bracket, pop the top of the stack. It must be the matching opener, otherwise the string is invalid. An empty stack also means it is invalid: there is nothing to close.
3. At the end the stack must be empty, or some brackets were never closed.

"([)]" fails because when ) arrives, the top of the stack is [, not (.

A map from each closer to its opener keeps the code short and makes adding new bracket types trivial.

In JavaScript, popping an empty array returns undefined, which never equals an opener, so the empty case is handled automatically. In Python, pop() on an empty list raises an error, so check first.

Stacks power every parser and compiler, the browser's back button, undo, and the call stack itself.`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'Evaluate Reverse Polish Notation', fn: 'evalRPN', args: ['tokens'],
      prompt: 'Evaluate an expression in Reverse Polish (postfix) notation. Tokens are integers or one of + - * /. Division truncates toward zero. ["2","1","+","3","*"] means (2 + 1) * 3 = 9.',
      tests: [[[['2', '1', '+', '3', '*']], 9], [[['4', '13', '5', '/', '+']], 6], [[['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+']], 22], [[['42']], 42], [[['7', '-2', '/']], -3]],
      js: String.raw`function evalRPN(tokens) {
  const st = [];
  for (const tok of tokens) {
    if ('+-*/'.includes(tok) && tok.length === 1) {
      const b = st.pop(), a = st.pop();
      if (tok === '+') st.push(a + b);
      else if (tok === '-') st.push(a - b);
      else if (tok === '*') st.push(a * b);
      else st.push(Math.trunc(a / b));
    } else {
      st.push(Number(tok));
    }
  }
  return st[0];
}`,
      py: String.raw`def eval_rpn(tokens):
    st = []
    for tok in tokens:
        if tok in ("+", "-", "*", "/"):
            b = st.pop()
            a = st.pop()
            if tok == "+":
                st.append(a + b)
            elif tok == "-":
                st.append(a - b)
            elif tok == "*":
                st.append(a * b)
            else:
                st.append(int(a / b))
        else:
            st.append(int(tok))
    return st[0]`,
      explain: `In postfix notation, each operator applies to the two values computed most recently, so a stack evaluates it naturally.

1. Numbers are pushed.
2. An operator pops two values, applies itself, and pushes the result.
3. At the end, the single value left is the answer.

Order matters for - and /: the second pop is the left operand. For ["4", "2", "-"] you pop b = 2, then a = 4, and compute a - b = 2.

Truncating toward zero: -7 / 2 should give -3. JavaScript's Math.trunc does that. In Python, // floors (-7 // 2 = -4), so use int(a / b) instead.

Careful in JavaScript: "-11" contains a minus sign, so a token is an operator only if it is exactly one character long.

RPN needs no parentheses and no precedence rules. That is why stack machines (the JVM, WebAssembly, old HP calculators) use it, and compilers convert ordinary infix expressions into it.`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'Daily Temperatures', fn: 'dailyTemperatures', args: ['temps'],
      prompt: 'For each day, return how many days you must wait until a warmer temperature. Use 0 if no warmer day follows.',
      tests: [[[[73, 74, 75, 71, 69, 72, 76, 73]], [1, 1, 4, 2, 1, 1, 0, 0]], [[[30, 40, 50, 60]], [1, 1, 1, 0]], [[[30, 60, 90]], [1, 1, 0]], [[[90, 80, 70]], [0, 0, 0]], [[[]], []]],
      js: String.raw`function dailyTemperatures(temps) {
  const ans = new Array(temps.length).fill(0);
  const stack = []; // indices of days still waiting, temps decreasing
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[i] > temps[stack[stack.length - 1]]) {
      const j = stack.pop();
      ans[j] = i - j;
    }
    stack.push(i);
  }
  return ans;
}`,
      py: String.raw`def daily_temperatures(temps):
    ans = [0] * len(temps)
    stack = []
    for i, t in enumerate(temps):
        while stack and t > temps[stack[-1]]:
            j = stack.pop()
            ans[j] = i - j
        stack.append(i)
    return ans`,
      explain: `This is the classic monotonic stack problem.

Keep a stack of the days that have not yet found a warmer day. Their temperatures are always in decreasing order from bottom to top, because a warmer day would already have resolved the colder days above it.

For each new day i:
1. While today is warmer than the day on top of the stack, that day's wait is over. Pop it and record i - j.
2. Push today, which is now waiting too.

Days left on the stack at the end never warm up, and keep their default answer of 0.

Why O(n)? Each index is pushed once and popped at most once, so the while loops do O(n) work in total. Brute force (scan forward from every day) is O(n²).

Whenever a question asks for the next greater or next smaller element, think of a monotonic stack.`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'Next Greater Element', fn: 'nextGreater', args: ['nums'],
      prompt: 'For each element, return the first element to its right that is strictly greater, or -1 if there is none.',
      tests: [[[[2, 1, 2, 4, 3]], [4, 2, 4, -1, -1]], [[[1, 2, 3]], [2, 3, -1]], [[[3, 2, 1]], [-1, -1, -1]], [[[5]], [-1]], [[[1, 1, 2]], [2, 2, -1]]],
      js: String.raw`function nextGreater(nums) {
  const ans = new Array(nums.length).fill(-1);
  const stack = []; // indices waiting for a greater value
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[i] > nums[stack[stack.length - 1]]) {
      ans[stack.pop()] = nums[i];
    }
    stack.push(i);
  }
  return ans;
}`,
      py: String.raw`def next_greater(nums):
    ans = [-1] * len(nums)
    stack = []
    for i, x in enumerate(nums):
        while stack and x > nums[stack[-1]]:
            ans[stack.pop()] = x
        stack.append(i)
    return ans`,
      explain: `This is the same monotonic stack as Daily Temperatures, recording the value instead of the distance.

The stack holds indices whose next greater element has not appeared yet. When a bigger value arrives, it is the answer for every smaller value waiting on top of the stack, so pop them all.

Strictly greater: in [1, 1, 2] the first 1 is not resolved by the second 1. Both wait until 2 arrives. That is why the comparison is > rather than >=.

Variations, each a small change to the same code:
- Next smaller: flip the comparison.
- Previous greater: scan from the right, or read the answer from the stack top before pushing.
- Circular array: loop over the indices twice (i from 0 to 2n - 1, using i % n).

Largest Rectangle in Histogram in the Hard level relies on this same "previous / next smaller" idea.`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'Simplify Path', fn: 'simplifyPath', args: ['path'],
      prompt: 'Simplify an absolute Unix-style path. "." means the current directory, ".." goes up one level (never above root), repeated slashes act as one, and the result has no trailing slash. "/a/./b/../../c/" becomes "/c".',
      tests: [[['/home/'], '/home'], [['/../'], '/'], [['/home//foo/'], '/home/foo'], [['/a/./b/../../c/'], '/c'], [['/a/../../b/../c//.//'], '/c'], [['/...'], '/...']],
      js: String.raw`function simplifyPath(path) {
  const stack = [];
  for (const part of path.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') stack.pop();
    else stack.push(part);
  }
  return '/' + stack.join('/');
}`,
      py: String.raw`def simplify_path(path):
    stack = []
    for part in path.split("/"):
        if part in ("", "."):
            continue
        if part == "..":
            if stack:
                stack.pop()
        else:
            stack.append(part)
    return "/" + "/".join(stack)`,
      explain: `A path describes a walk through folders: going into a folder pushes it, and ".." pops back out. That makes a stack the natural model.

1. Split on "/". Repeated slashes produce empty strings, and you skip those.
2. Skip "." (stay where you are).
3. For "..", pop the last folder if there is one. At the root you cannot go higher, so do nothing.
4. Anything else is a folder name, so push it.
5. Join the stack with "/" and add a leading "/".

Edge case: "..." is a legitimate folder name, not a special token. Only exactly "." and ".." are special.

This is a small example of tokenize-then-interpret: split the input into meaningful pieces, then process them with simple rules.`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'Decode String', fn: 'decodeString', args: ['s'],
      prompt: 'Decode a string where k[text] means text repeated k times. Encodings can be nested: "3[a2[c]]" becomes "accaccacc".',
      tests: [[['3[a]2[bc]'], 'aaabcbc'], [['3[a2[c]]'], 'accaccacc'], [['2[abc]3[cd]ef'], 'abcabccdcdcdef'], [['abc'], 'abc'], [['10[x]'], 'xxxxxxxxxx'], [['2[2[2[a]]]'], 'aaaaaaaa']],
      js: String.raw`function decodeString(s) {
  const stack = []; // [stringBefore, repeatCount]
  let cur = '', num = 0;
  for (const c of s) {
    if (c >= '0' && c <= '9') num = num * 10 + Number(c);
    else if (c === '[') {
      stack.push([cur, num]);
      cur = '';
      num = 0;
    } else if (c === ']') {
      const [prev, k] = stack.pop();
      cur = prev + cur.repeat(k);
    } else cur += c;
  }
  return cur;
}`,
      py: String.raw`def decode_string(s):
    stack = []
    cur, num = "", 0
    for c in s:
        if c.isdigit():
            num = num * 10 + int(c)
        elif c == "[":
            stack.append((cur, num))
            cur, num = "", 0
        elif c == "]":
            prev, k = stack.pop()
            cur = prev + cur * k
        else:
            cur += c
    return cur`,
      explain: `Nested brackets need a stack. Each "[" starts a new context, and each "]" finishes the innermost one.

State while scanning:
- cur: the text built so far in the current bracket level.
- num: the repeat count being read. Counts can have several digits, like 10, so build it as num × 10 + digit.

Rules:
1. Digit: extend num.
2. "[": save (cur, num) on the stack and start fresh inside the brackets.
3. "]": pop (prev, k). The finished inner text is repeated k times and appended to prev, the text from just before the bracket.
4. Letter: append it to cur.

Trace "3[a2[c]]": at the inner ] we pop ("a", 2), so cur = "a" + "cc" = "acc". At the outer ] we pop ("", 3), so cur = "accaccacc".

Recursive alternative: a helper that parses until the matching "]" and returns what it built. Both work. The explicit stack makes the saved state visible.`,
      complexity: 'O(output length) time and space',
    },
    {
      title: 'Remove Adjacent Duplicates', fn: 'removeDuplicates', args: ['s'],
      prompt: 'Repeatedly remove pairs of equal adjacent letters until none remain, and return the final string. "abbaca" → "aaca" → "ca".',
      tests: [[['abbaca'], 'ca'], [['azxxzy'], 'ay'], [['aa'], ''], [['abc'], 'abc'], [[''], ''], [['aabbcc'], '']],
      js: String.raw`function removeDuplicates(s) {
  const st = [];
  for (const c of s) {
    if (st.length && st[st.length - 1] === c) st.pop();
    else st.push(c);
  }
  return st.join('');
}`,
      py: String.raw`def remove_duplicates(s):
    st = []
    for c in s:
        if st and st[-1] == c:
            st.pop()
        else:
            st.append(c)
    return "".join(st)`,
      explain: `Simulating "repeat until nothing changes" by scanning the string again and again is O(n²). A stack handles every cascade in one pass.

The stack holds the characters that survive so far. For each new character:
- if it equals the top of the stack, the two cancel, so pop;
- otherwise push it.

Cascades happen by themselves. In "abba", the two b's cancel, which exposes the first a on top, and then the final a cancels with it. Because the stack always represents the fully reduced string so far, no rescanning is needed.

The same idea appears in Asteroid Collision (next), in "remove k adjacent duplicates" (store [char, count] pairs instead) and in polymer-reaction puzzles.`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'Asteroid Collision', fn: 'asteroidCollision', args: ['asteroids'],
      prompt: 'Each value is an asteroid: its absolute value is its size and its sign is its direction (+ right, − left). All move at the same speed. When two meet, the smaller explodes; equal sizes both explode. Asteroids moving in the same direction never meet. Return the survivors in order.',
      tests: [[[[5, 10, -5]], [5, 10]], [[[8, -8]], []], [[[10, 2, -5]], [10]], [[[-2, -1, 1, 2]], [-2, -1, 1, 2]], [[[1, -2, -2, -2]], [-2, -2, -2]], [[[]], []]],
      js: String.raw`function asteroidCollision(asteroids) {
  const st = [];
  for (let a of asteroids) {
    let alive = true;
    while (alive && a < 0 && st.length && st[st.length - 1] > 0) {
      const top = st[st.length - 1];
      if (top < -a) st.pop(); // top explodes; keep checking
      else {
        if (top === -a) st.pop(); // both explode
        alive = false; // a explodes
      }
    }
    if (alive) st.push(a);
  }
  return st;
}`,
      py: String.raw`def asteroid_collision(asteroids):
    st = []
    for a in asteroids:
        alive = True
        while alive and a < 0 and st and st[-1] > 0:
            top = st[-1]
            if top < -a:
                st.pop()
            else:
                if top == -a:
                    st.pop()
                alive = False
        if alive:
            st.append(a)
    return st`,
      explain: `A collision only happens when a left-moving asteroid (negative) meets a right-moving one (positive) that came before it. Keep a stack of survivors so far.

For each asteroid a:
- If a moves right, or the stack top moves left, there is no collision, so push it.
- If a moves left and the top moves right, they collide:
  - the top is smaller: it explodes (pop), and a keeps going to hit the next one;
  - they are equal: both explode;
  - the top is bigger: a explodes.

Why only "left-mover after right-mover"? [-2, -1, 1, 2] never collide. The negatives fly off to the left, ahead of everything, and the positives fly away to the right.

The while loop lets one big asteroid destroy several in a row: in [1, -2, -2, -2] the first -2 destroys the 1.

Each asteroid is pushed and popped at most once, so the total time is O(n).`,
      complexity: 'O(n) time, O(n) space',
    },
    {
      title: 'Backspace String Compare', fn: 'backspaceCompare', args: ['s', 't'],
      prompt: '"#" means backspace. Return true if s and t are equal after typing both into empty text editors. Backspace on empty text does nothing.',
      tests: [[['ab#c', 'ad#c'], true], [['ab##', 'c#d#'], true], [['a#c', 'b'], false], [['a##c', '#a#c'], true], [['', '#'], true], [['bxj##tw', 'bxo#j##tw'], true]],
      js: String.raw`function backspaceCompare(s, t) {
  const build = (str) => {
    const st = [];
    for (const c of str) {
      if (c === '#') st.pop();
      else st.push(c);
    }
    return st.join('');
  };
  return build(s) === build(t);
}`,
      py: String.raw`def backspace_compare(s, t):
    def build(text):
        st = []
        for c in text:
            if c == "#":
                if st:
                    st.pop()
            else:
                st.append(c)
        return "".join(st)
    return build(s) == build(t)`,
      explain: `A text editor's buffer behaves like a stack: typing pushes a character and backspace pops one.

1. Simulate typing each string into a stack.
2. Compare the results.

Popping an empty stack does nothing in this problem, so "#" on empty text is harmless. JavaScript's pop() on an empty array just returns undefined. Python needs the if st check.

O(1) space follow-up (a classic): walk both strings from the end. Keep a count of pending backspaces for each string, skip characters that would be deleted, and compare the next surviving characters one at a time. Reading backwards works because a backspace only affects characters before it.

Choosing a data structure that mirrors real-world behavior, like editor to stack, often makes the solution obvious.`,
      complexity: 'O(n + m) time, O(n + m) space (O(1) with the reverse scan)',
    },
    {
      title: 'Min Stack', fn: 'MinStack', args: [],
      prompt: 'Design a stack that supports push(x), pop(), top() and getMin() (the smallest element currently in the stack), all in O(1) time.',
      methods: [{ name: 'push', args: ['x'] }, { name: 'pop', args: [] }, { name: 'top', args: [] }, { name: 'getMin', args: [] }],
      tests: [
        [[['MinStack', 'push', 'push', 'push', 'getMin', 'pop', 'top', 'getMin'], [[], [-2], [0], [-3], [], [], [], []]], [null, null, null, null, -3, null, 0, -2]],
        [[['MinStack', 'push', 'getMin', 'push', 'getMin', 'push', 'getMin', 'pop', 'getMin'], [[], [5], [], [3], [], [7], [], [], []]], [null, null, 5, null, 3, null, 3, null, 3]],
        [[['MinStack', 'push', 'push', 'getMin', 'pop', 'getMin'], [[], [1], [1], [], [], []]], [null, null, null, 1, null, 1]],
      ],
      js: String.raw`class MinStack {
  constructor() {
    this.items = []; // [value, minSoFar] pairs
  }
  push(x) {
    const min = this.items.length ? Math.min(x, this.getMin()) : x;
    this.items.push([x, min]);
  }
  pop() {
    this.items.pop();
  }
  top() {
    return this.items[this.items.length - 1][0];
  }
  getMin() {
    return this.items[this.items.length - 1][1];
  }
}`,
      py: String.raw`class MinStack:
    def __init__(self):
        self.items = []  # (value, min_so_far)

    def push(self, x):
        m = min(x, self.items[-1][1]) if self.items else x
        self.items.append((x, m))

    def pop(self):
        self.items.pop()

    def top(self):
        return self.items[-1][0]

    def get_min(self):
        return self.items[-1][1]`,
      explain: `The hard part is getMin after a pop. If you only tracked a single minimum and then popped it, you would need to rescan the stack to find the new one, which is O(n).

The fix is to store, alongside each element, the minimum of the stack at the moment it was pushed.

- push(x): its minimum is min(x, the minimum below it), so store the pair (x, min).
- pop(): drop the top pair. The pair underneath already holds the correct minimum for the smaller stack.
- top(): the value from the top pair.
- getMin(): the minimum from the top pair.

Every operation is O(1).

This works because a stack only changes at the top. The minimum of the bottom k elements never changes while those elements remain, so caching it is safe.

A space-saving variant keeps a second stack that only receives a value when it is less than or equal to the current minimum.

Design questions like this test whether you can find the extra information that makes each operation cheap.`,
      complexity: 'O(1) time per operation, O(n) space',
    },
  ],
};

export default m;
