# 6 · Higher-Order Functions — functions as values

Interactive demo: [`hof-visualizer.html`](../hof-visualizer.html)

## Definition

> A **higher-order function (HOF)** takes a function as an argument, returns a function, or both.

Possible only because JS functions are **first-class citizens** — values you can store, pass, and return like numbers:

```js
const greet = function () { return "hello"; };  // stored in a variable
function callTwice(fn) { fn(); fn(); }          // passed in       → HOF
function makeCounter() { return () => {}; }     // returned         → HOF (+ closure!)
```

You've been using HOFs since day one: `addEventListener(type, fn)`, `setTimeout(fn, ms)`, `arr.sort(cmp)`, `promise.then(fn)`. And every closure factory (createCounter, debounce) IS a HOF.

## The Namaste JS classic — extract WHAT varies

Bad code repeats the loop (violates DRY):

```js
function calculateArea(arr) { const out = []; for (const r of arr) out.push(Math.PI*r*r); return out; }
function calculateCircumference(arr) { const out = []; for (const r of arr) out.push(2*Math.PI*r); return out; }
// same loop, only the MATH differs...
```

Insight: pass the math IN as a function:

```js
const area          = r => Math.PI * r * r;
const circumference = r => 2 * Math.PI * r;
const diameter      = r => 2 * r;

function calculate(arr, logic) {          // ← the HOF: one reusable loop
  const output = [];
  for (const r of arr) output.push(logic(r));
  return output;
}
calculate([1,2,3,4], area);   // any logic, same loop 🎯
```

⭐ You just wrote `map` by hand: `calculate(arr, logic)` ≡ `arr.map(logic)`.

## The big three: map · filter · reduce

Each takes YOUR function and applies it per element — but answers a different question:

```js
const nums = [1, 2, 3, 4, 5, 6];

nums.map(n => n * 2);               // [2,4,6,8,10,12]  "transform each" — same length
nums.filter(n => n % 2 === 0);      // [2,4,6]          "keep which?" — your fn is a yes/no judge
nums.reduce((acc, n) => acc + n, 0);// 21               "boil down to ONE value" — acc rolls like a snowball
```

Reduce trace: `(0,1)→1  (1,2)→3  (3,3)→6  (6,4)→10  (10,5)→15  (15,6)→21`.

Chaining (each returns a new array, so they snap together):

```js
nums.filter(n => n % 2 === 0)   // [2,4,6]
    .map(n => n * 2)            // [4,8,12]
    .reduce((a, n) => a + n, 0);// 24
```

## Say it in one breath

> "A higher-order function takes and/or returns functions — possible because functions are first-class values. map/filter/reduce take one (transform / keep / fold); debounce and factories return one. Extracting the varying logic into a passed-in function is how you stop repeating loops — writing calculate(arr, logic) is literally rebuilding map."
