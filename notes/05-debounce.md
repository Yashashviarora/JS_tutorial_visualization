# 5 · Debounce — closures + the event loop, working together

Interactive demos: [`closure-visualizer.html`](../closure-visualizer.html) (lesson 5, live search box) · [`debounce-explained.js`](../debounce-explained.js) (paste into Console)

## The problem

A search box fires an event on EVERY keystroke. One API call per keystroke = wasteful. We want: *"wait until the user stops typing for 500 ms, THEN call the API once."*

## The two phases (the key to understanding the code)

```text
PHASE 1 — happens ONCE, at setup:
    debounce(searchAPI, 500) runs one time.
    Its job: create the timerId box, return the wrapper function.
    debounce itself never runs again.

PHASE 2 — happens on EVERY keystroke:
    the WRAPPER runs, again and again —
    still seeing timerId / fn / delay via its 🎒 closure.
```

## The code, every line explained

```js
function debounce(fn, delay) {
  let timerId = null;              // 🎒 created ONCE, shared by ALL future calls.
                                   //    THE whole trick — without this box surviving
                                   //    between keystrokes, nothing can be cancelled.
  return function (...args) {      // the wrapper — `search` will be this function
    clearTimeout(timerId);         // STEP A: kill the previous keystroke's plan.
                                   //    First call ever? clearTimeout(null) = safe no-op.
    timerId = setTimeout(() => {   // STEP B: make a new plan. setTimeout runs NOTHING now —
      fn(...args);                 //    it schedules, instantly returns a ticket number,
    }, delay);                     //    which we store in the SAME shared box.
  };
}

const search = debounce((q) => console.log("API:", q), 500);
input.addEventListener("input", (e) => search(e.target.value));
```

`timerId` is just a **plain number** — a ticket. Its one purpose in life: being handed to `clearTimeout` so the browser knows WHICH waiting timer to erase.

## Timeline: type "c", "cl", "clo" fast, then stop

| time | what happens | timerId box |
|---|---|---|
| 0 ms | search("c") → cancel null (nothing), schedule timer **#1** | #1 |
| 150 ms | search("cl") → **cancel #1** ✂, schedule **#2** | #2 |
| 300 ms | search("clo") → **cancel #2** ✂, schedule **#3** | #3 |
| 300–800 ms | silence... nobody cancels #3 | #3 |
| 800 ms | #3 fires → `API: clo` — **the only call** 🎯 | — |

3 keystrokes, 1 API call. Each keystroke resets the fuse; only silence lets it burn down.

## Why the closure is non-negotiable

If `timerId` were declared INSIDE the wrapper, every keystroke would get a fresh `timerId = null` — the wrapper could never remember the previous ticket, never cancel it, and every keystroke would fire. Debounce works **only because** `timerId` lives one level up, surviving between calls.

## Where each concept does its part

```text
CLOSURE (JS):        remembers the ticket number between keystrokes  🎒
WEB APIs (browser):  holds the actual timer counting down            ⏲
clearTimeout:        the handoff — closure supplies the ticket,
                     browser deletes that timer from the waiting room 🗑
```

## Not built in!

`setTimeout`/`clearTimeout` are Web APIs; **debounce is a pattern YOU write** (or import: lodash `_.debounce`). That's why "implement debounce" is a classic interview question — it proves closures + timers clicked. Its sibling **throttle** ("at most once per X ms") is the same family.

## Bonus: debounce is also a higher-order function

Takes a function in, returns a function out — with `fn`, `delay`, `timerId` in the backpack. Closures (memory) + HOF (shape) + event loop (timing) = one tool.

## Say it in one breath

> "Debounce wraps a function so it only runs after N ms of silence: the wrapper, created once, keeps timerId in a closure; every call cancels the previously scheduled timer (found via the closure) and schedules a new one; only when calls stop does a timer survive long enough to fire. Closure = memory, event loop = timing."
