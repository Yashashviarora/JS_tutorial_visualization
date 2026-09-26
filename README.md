# 🎒 JavaScript Visualized — Learn by Seeing

Interactive, zero-dependency visualizations of JavaScript's hardest concepts:
**closures, debounce, garbage collection, memory leaks, the event loop, and higher-order functions.**

Built while following the [Namaste JavaScript](https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUccPVNP) series by Akshay Saini —
every abstract diagram from the videos turned into something you can **click, type, scroll, and step through**.

No frameworks, no build step, no dependencies. Every file is plain HTML + CSS + JavaScript.

## 🚀 How to run

You need the pages served over `http://` (browsers block local `file://` pages from loading sibling scripts).
Pick either option:

**Option A — Node.js (no install):**
```bash
npx http-server -p 5500 -c-1
```
Then open <http://127.0.0.1:5500>

**Option B — VS Code Live Server:**
Install the *Live Server* extension → right-click `index.html` → **Open with Live Server**.

`index.html` is the hub: **all lessons live in tabs** — switch tabs to move through the learning path.

## 📚 The learning path

| Tab | File | What you'll see |
|-----|------|-----------------|
| 1 · Closures | `closure-visualizer.html` | What a closure is (a function + its "backpack" 🎒 of remembered variables): a counter with no globals, independent counters, truly private variables (try to hack the bank account!), the famous `var` vs `let` loop trap, and a live **debounce search box** with a timer bar and "API calls saved" stats. |
| 2 · DevTools Lab | `closures-devtools.html` | See closures in the browser's own UI. Open the Console (F12) and type `lesson1()` … `lesson5()` — the debugger pauses and Chrome's **Scope panel** literally shows a section named *Closure*. |
| 3 · Garbage Collection | `closure-gc.html` | The Namaste JS example: `var x = 0, z = 10` — while paused in the debugger, `x` exists in the closure but `z` throws `ReferenceError`, because V8 garbage-collected it (the inner function never uses it). Add one `console.log(z)` and watch it survive. |
| 4 · Memory Leak | `leak-demo.html` | The dark side of closures: a leaky fake SPA that stacks scroll listeners (each closure pinning ~4 MB) side-by-side with the fixed version. Click "Open Chats ×10" on both, scroll, and *feel* the lag — then see the 3-line cleanup fix. |
| 5 · Event Loop | `event-loop-visualizer.html` | A step-by-step animation of the **Call Stack, Web APIs, Microtask Queue, and Task Queue**. Four scenarios: setTimeout basics · Promise vs setTimeout(0) · debounce (closure + event loop together) · the Namaste JS *fetch vs setTimeout* whiteboard example. |
| 6 · Higher-Order Functions | `hof-visualizer.html` | Functions as first-class values: the radius/area/circumference example (accidentally building your own `map`!), then `map` / `filter` / `reduce` animated element-by-element, and why debounce = HOF + closure + event loop in one tool. |

Extra file: `debounce-explained.js` — debounce annotated line-by-line in slow motion; paste it into the Console and it simulates fast typing.

## 🧠 Key takeaways (the whole repo in six lines)

1. **Closure** = a function + the variables of its birth scope, kept alive even after the outer function returns. It captures *variables, not values*.
2. **Debounce** works only because `timerId` lives in a closure — surviving between keystrokes so each new call can cancel the previous timer.
3. **Garbage collection** is smart: the closure keeps only the variables the inner function actually references; the rest are freed.
4. **Memory leaks** happen when long-lived closures (event listeners, intervals) pin big data and are never removed. Every `addEventListener` needs a matching `removeEventListener`.
5. **The event loop**: sync code → *all* microtasks (promises) → one task (timers/events) → repeat. `setTimeout(fn, 0)` means "at least 0ms", never "now".
6. **Higher-order functions** take and/or return functions — possible because functions are first-class values. `map`/`filter`/`reduce` take one; `debounce` and counter factories return one.

## 🛠 How to explore deeper

Every page is designed for DevTools (F12):
- Expand any function's `[[Scopes]]` via `console.dir(fn)` to see its closure.
- Use `debug(fn)` in the Console to pause whenever `fn` runs, then read the Scope panel.
- Record the Performance tab while scrolling the leak demo to see long tasks blocking the main thread.

---

*Made for learning. Fork it, break it, fix it — that's the point.* 🙏
