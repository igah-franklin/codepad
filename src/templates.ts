import type { Language } from './theme';

export type Template = {
  id: string;
  language: Language;
  title: string;
  description: string;
  filename: string;
  tags: string[];
  stdin?: string;
  code: string;
};

export const TEMPLATES: Template[] = [
  // ---------------- JavaScript ----------------
  {
    id: 'js-hello', language: 'javascript', title: 'Hello, World', filename: 'hello', tags: ['basics'],
    description: 'Variables, template strings and console output.',
    code: `// Welcome to Codepad ✨  Tap ▶ Run to execute.
const name = 'World';
const now = new Date();

console.log(\`Hello, \${name}!\`);
console.log('Today is', now.toDateString());

const langs = ['JavaScript', 'Python'];
langs.forEach((l, i) => console.log(\`\${i + 1}. \${l}\`));

// The value of the last expression is not printed in JS —
// use return to show a result:
return { langs, count: langs.length };
`,
  },
  {
    id: 'js-input', language: 'javascript', title: 'Reading input', filename: 'greeter', tags: ['input'],
    description: 'Use input() / prompt() with values from the Input tab.',
    stdin: 'Ada\n36\n',
    code: `// Values come from the Input tab — one per line.
const name = input('What is your name? ');
const age = Number(input('How old are you? '));

console.log(\`Nice to meet you, \${name}!\`);
console.log(\`In 10 years you will be \${age + 10}.\`);
`,
  },
  {
    id: 'js-fizzbuzz', language: 'javascript', title: 'FizzBuzz', filename: 'fizzbuzz', tags: ['loops'],
    description: 'The classic interview warm-up.',
    code: `for (let i = 1; i <= 30; i++) {
  let out = '';
  if (i % 3 === 0) out += 'Fizz';
  if (i % 5 === 0) out += 'Buzz';
  console.log(out || i);
}
`,
  },
  {
    id: 'js-async', language: 'javascript', title: 'Async / await', filename: 'async_demo', tags: ['async'],
    description: 'Promises, timers and top-level await.',
    code: `const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function task(name, ms) {
  console.log(\`▶ \${name} started\`);
  await sleep(ms);
  console.log(\`✓ \${name} done in \${ms}ms\`);
  return name;
}

console.time('all');
const results = await Promise.all([
  task('download', 600),
  task('resize', 300),
  task('upload', 450),
]);
console.timeEnd('all');
console.log('Results:', results);
`,
  },
  {
    id: 'js-classes', language: 'javascript', title: 'Classes & objects', filename: 'bank', tags: ['oop'],
    description: 'A tiny bank account with getters and errors.',
    code: `class Account {
  #balance = 0;
  constructor(owner) { this.owner = owner; }
  deposit(amount) {
    if (amount <= 0) throw new RangeError('Amount must be positive');
    this.#balance += amount;
    return this;
  }
  withdraw(amount) {
    if (amount > this.#balance) throw new Error('Insufficient funds');
    this.#balance -= amount;
    return this;
  }
  get balance() { return this.#balance; }
}

const acct = new Account('Chidi').deposit(5000).withdraw(1200);
console.log(acct.owner, 'has ₦' + acct.balance.toLocaleString());

try {
  acct.withdraw(1_000_000);
} catch (e) {
  console.error('Oops:', e.message);
}
`,
  },
  {
    id: 'js-table', language: 'javascript', title: 'Array methods + table', filename: 'scores', tags: ['arrays'],
    description: 'map / filter / reduce and console.table.',
    code: `const students = [
  { name: 'Amaka', score: 88 },
  { name: 'Tunde', score: 72 },
  { name: 'Zainab', score: 95 },
  { name: 'Emeka', score: 64 },
];

const graded = students.map((s) => ({
  ...s,
  grade: s.score >= 90 ? 'A' : s.score >= 75 ? 'B' : s.score >= 65 ? 'C' : 'D',
}));

console.table(graded);

const avg = graded.reduce((sum, s) => sum + s.score, 0) / graded.length;
console.log('Average:', avg.toFixed(1));
console.log('Top:', graded.filter((s) => s.grade === 'A').map((s) => s.name));
`,
  },
  {
    id: 'js-algo', language: 'javascript', title: 'Sorting algorithms', filename: 'sorting', tags: ['algorithms'],
    description: 'Quick sort vs. built-in sort, timed.',
    code: `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const [pivot, ...rest] = arr;
  return [
    ...quickSort(rest.filter((x) => x < pivot)),
    pivot,
    ...quickSort(rest.filter((x) => x >= pivot)),
  ];
}

const data = Array.from({ length: 20000 }, () => Math.floor(Math.random() * 1e6));

console.time('quickSort');
const a = quickSort(data);
console.timeEnd('quickSort');

console.time('Array.sort');
const b = [...data].sort((x, y) => x - y);
console.timeEnd('Array.sort');

console.log('Same result:', a.every((v, i) => v === b[i]));
console.log('First 10:', a.slice(0, 10));
`,
  },

  // ---------------- Python ----------------
  {
    id: 'py-hello', language: 'python', title: 'Hello, World', filename: 'hello', tags: ['basics'],
    description: 'f-strings, lists and loops.',
    code: `# Welcome to Codepad ✨  Tap ▶ Run to execute.
from datetime import date

name = "World"
print(f"Hello, {name}!")
print("Today is", date.today().strftime("%A, %d %B %Y"))

langs = ["JavaScript", "Python"]
for i, lang in enumerate(langs, start=1):
    print(f"{i}. {lang}")
`,
  },
  {
    id: 'py-input', language: 'python', title: 'Reading input', filename: 'greeter', tags: ['input'],
    description: 'input() reads lines from the Input tab.',
    stdin: 'Ada\n36\n',
    code: `# Values come from the Input tab — one per line.
name = input("What is your name? ")
age = int(input("How old are you? "))

print(f"Nice to meet you, {name}!")
print(f"In 10 years you will be {age + 10}.")
`,
  },
  {
    id: 'py-calc', language: 'python', title: 'Simple calculator', filename: 'calculator', tags: ['input', 'basics'],
    description: 'Parse expressions from input and handle errors.',
    stdin: '12 * 7\n100 / 0\n2 ** 10\n',
    code: `import operator

OPS = {"+": operator.add, "-": operator.sub, "*": operator.mul,
       "/": operator.truediv, "**": operator.pow, "%": operator.mod}

while True:
    try:
        line = input("calc> ")
    except EOFError:
        print("\\nBye 👋")
        break
    try:
        a, op, b = line.split()
        print("=", OPS[op](float(a), float(b)))
    except ZeroDivisionError:
        print("Error: can't divide by zero")
    except (ValueError, KeyError):
        print("Format: <number> <op> <number>")
`,
  },
  {
    id: 'py-classes', language: 'python', title: 'Dataclasses', filename: 'inventory', tags: ['oop'],
    description: 'Dataclasses, properties and sorting.',
    code: `from dataclasses import dataclass, field

@dataclass(order=True)
class Item:
    price: float
    name: str = field(compare=False)
    qty: int = field(default=1, compare=False)

    @property
    def total(self) -> float:
        return self.price * self.qty

stock = [
    Item(2500, "Rice (5kg)", 3),
    Item(800, "Bread", 5),
    Item(12000, "Yam tuber", 1),
]

for item in sorted(stock, reverse=True):
    print(f"{item.name:<12} ₦{item.price:>8,.0f} x{item.qty}  = ₦{item.total:,.0f}")

print("-" * 40)
print(f"{'Grand total':<12} ₦{sum(i.total for i in stock):,.0f}")
`,
  },
  {
    id: 'py-algo', language: 'python', title: 'Recursion & memoization', filename: 'fibonacci', tags: ['algorithms'],
    description: 'Fibonacci with lru_cache and timing.',
    code: `from functools import lru_cache
import time

def fib_slow(n):
    return n if n < 2 else fib_slow(n - 1) + fib_slow(n - 2)

@lru_cache(maxsize=None)
def fib_fast(n):
    return n if n < 2 else fib_fast(n - 1) + fib_fast(n - 2)

for fn in (fib_slow, fib_fast):
    t = time.perf_counter()
    result = fn(27)
    print(f"{fn.__name__}(27) = {result}  in {(time.perf_counter() - t) * 1000:.1f} ms")

print("fib_fast(200) =", fib_fast(200))
`,
  },
  {
    id: 'py-numpy', language: 'python', title: 'NumPy arrays', filename: 'numpy_demo', tags: ['data', 'numpy'],
    description: 'Vectorised maths. NumPy installs automatically on first run.',
    code: `import numpy as np

rng = np.random.default_rng(42)
temps = rng.normal(loc=31, scale=3, size=(4, 7)).round(1)  # 4 weeks x 7 days

print("Daily temperatures (°C):")
print(temps)
print()
print("Weekly average:", temps.mean(axis=1).round(1))
print("Hottest day:   ", temps.max(), "°C")
print("Days above 33: ", int((temps > 33).sum()))
`,
  },
  {
    id: 'py-pandas', language: 'python', title: 'Pandas DataFrame', filename: 'sales', tags: ['data', 'pandas'],
    description: 'Group, aggregate and sort tabular data.',
    code: `import pandas as pd

df = pd.DataFrame({
    "city":    ["Abuja", "Lagos", "Abuja", "Enugu", "Lagos", "Enugu"],
    "product": ["Solar", "Solar", "Inverter", "Solar", "Inverter", "Inverter"],
    "units":   [12, 30, 7, 9, 14, 5],
    "price":   [350_000, 340_000, 520_000, 360_000, 510_000, 530_000],
})
df["revenue"] = df.units * df.price

print(df)
print()
summary = df.groupby("city")[["units", "revenue"]].sum().sort_values("revenue", ascending=False)
print(summary)
`,
  },
  {
    id: 'py-plot', language: 'python', title: 'Matplotlib chart', filename: 'chart', tags: ['data', 'charts'],
    description: 'Plots render right inside the console.',
    code: `import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 2 * np.pi, 200)

fig, ax = plt.subplots(figsize=(6, 3.5))
ax.plot(x, np.sin(x), label="sin(x)", linewidth=2.5)
ax.plot(x, np.cos(x), label="cos(x)", linewidth=2.5, linestyle="--")
ax.set_title("Waves")
ax.grid(alpha=0.3)
ax.legend()
plt.show()

print("Chart rendered ✔")
`,
  },
];

export const starterCode: Record<Language, string> = {
  javascript: `// New JavaScript file\n\nconsole.log('Hello from Codepad!');\n`,
  python: `# New Python file\n\nprint("Hello from Codepad!")\n`,
};
