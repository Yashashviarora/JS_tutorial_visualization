# 1 · Closures — the 🎒 backpack

> **A closure = a function + the variables from its birth scope, kept alive even after the outer function has finished.**

Interactive demo: [`closure-visualizer.html`](../closure-visualizer.html) · DevTools lab: [`closures-devtools.html`](../closures-devtools.html)

## The mental model first

```text
Function created inside another function
        ↓
Inner function USES an outer variable
        ↓
Outer function finishes (should die...)
        ↓
...but the inner function still holds a 🎒 backpack
        ↓
The remembered variable stays alive, usable later
```

Think of every function as carrying a **backpack** of the outer variables it uses.

## The basic example, traced line by line

```js
function createCounter() {
  let count = 0;              // born inside createCounter
  return function () {        // inner function closes over `count`
    count++;
    return count;
  };
}
const counter = createCounter();  // createCounter is DONE here!
counter(); // 1
counter(); // 2  ← it REMEMBERED
```

Trace:

1. `createCounter()` runs → creates `count = 0` → creates the inner function → returns it.
2. `createCounter` finishes. Normally `count` would be garbage collected...
3. ...but the returned function references `count` → the engine keeps it alive in the closure.
4. Every `counter()` call reads/writes the **same** `count`. No global variable exists anywhere.

## See it in the browser (proof, not faith)

1. Open DevTools (F12), run the code above in the Console.
2. `console.dir(counter)` → expand the printed function → expand **`[[Scopes]]`** → you'll see `Closure { count: 2 }`. Chrome literally shows you the backpack.
3. Or put a `debugger;` inside the inner function: when paused, the **Scope panel** shows a section named **Closure**.

## Each call to the factory = a NEW backpack

```js
const counterA = createCounter();  // backpack #1
const counterB = createCounter();  // backpack #2 — completely separate
counterA(); counterA();  // 1, 2
counterB();              // 1  ← untouched by A
```

One factory function → many independent instances. This is how you get "objects with private state" without classes.

## Use case: truly private variables (module pattern)

```js
function createAccount() {
  let balance = 0;                       // 🔒 nobody outside can touch this
  return {
    deposit(n)  { balance += n; return balance; },
    withdraw(n) { if (n > balance) return null; balance -= n; return balance; },
  };
}
const account = createAccount();
account.balance;          // undefined — it's NOT a property!
account.balance = 999999; // useless — real balance lives in the closure
```

The only doors into the backpack are the functions you chose to return.

## The famous interview trap: var vs let in loops

```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 0 1 2
```

- `var`: ONE shared `i` — all three callbacks share one backpack; by the time they run, the loop finished with `i = 3`.
- `let`: a FRESH `i` per iteration — three separate backpacks.

⭐ **Closures capture VARIABLES, not values.** (The variable itself, not a snapshot.)

## Where do you choose the lifetime?

Where you DECLARE a variable decides how long it lives:

| Want the value to... | Declare it... |
|---|---|
| survive between calls (counter, debounce timerId) | one level UP → closure |
| reset every call (temp results) | INSIDE the function |
| reset on demand | expose a `reset()` sharing the same backpack |

## Say it in one breath

> "A closure is created every time a function is created; it gives the function access to its birth scope's variables even after the outer function returns. Uses: remembering state, privacy, factories, callbacks with memory (debounce). Trap: it captures variables, not values — hence the var-loop bug."
