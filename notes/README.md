# 📒 Notes — step-by-step explanations

Written notes for every topic in this repo. Each note builds a **mental model first**, then the code, then a line-by-line trace, then the traps.

## Learning path (read in order)

| # | Note | One-line summary |
|---|------|------------------|
| 1 | [Closures](01-closures.md) | A function + the 🎒 backpack of variables it remembers |
| 2 | [Garbage Collection](02-garbage-collection.md) | Memory is freed by unreachability; closures keep only what they reference |
| 3 | [Memory Leaks](03-memory-leaks.md) | Forgotten listeners + closures = pinned memory; every add needs a remove |
| 4 | [The Event Loop](04-event-loop.md) | Call stack → Web APIs → microtasks → tasks; why setTimeout(0) isn't "now" |
| 5 | [Debounce](05-debounce.md) | Closure remembers the timer, event loop runs it — line by line |
| 6 | [Higher-Order Functions](06-higher-order-functions.md) | Functions as values; map/filter/reduce; building your own map |
| 7 | [`this`, call, apply, bind](07-this-call-apply-bind.md) | The secret slot, the four binding rules, why arrows have no `this` |
| 8 | [Currying](08-currying.md) | f(a)(b)(c), partial application, and where it's REALLY used |
| 9 | [Events, Bubbling & Delegation](09-events-and-delegation.md) | The event object, the bubble journey, one listener for a thousand children |
| 10 | [Tooling: Docker & CI](10-docker-and-ci.md) | Images vs containers, Dockerfile vs compose, GitHub Actions |

## The connected map

These are not ten separate topics — they are one web:

```text
CLOSURES (🎒 backpack)
   ├─→ Garbage Collection   (the backpack keeps things ALIVE; GC frees the rest)
   ├─→ Memory Leaks         (backpacks pinned by forgotten listeners)
   ├─→ Debounce             (backpack holds timerId between keystrokes)
   ├─→ Higher-Order Fns     (factories RETURN functions carrying backpacks)
   ├─→ Currying             (backpacks stacking up, one argument at a time)
   ├─→ bind                 (a closure over `this`)
   └─→ Arrow functions      (`this` resolved like a closed-over variable)

EVENT LOOP
   ├─→ Debounce             (setTimeout/clearTimeout live in Web APIs land)
   └─→ Events & Delegation  (a click handler is a task from the queue)
```

Every note ends with a **"say it in one breath"** summary you can use in interviews.
