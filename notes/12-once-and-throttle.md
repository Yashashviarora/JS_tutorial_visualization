# 12 · once() and throttle() — two more closure utilities

Interactive demo: [`once-throttle-visualizer.html`](../once-throttle-visualizer.html)

All four utilities in this family have the same shape: a higher-order function that takes your function and returns a guarded version, with **one remembered variable in the closure** deciding whether your function may run.

| Utility | Remembered variable 🎒 | Rule |
|---|---|---|
| counter factory | `count` | remember a number between calls |
| `once(fn)` | `called` (+ `result`) | run the first time only |
| `debounce(fn, ms)` | `timerId` | run only after `ms` of silence |
| `throttle(fn, ms)` | `lastRun` | run at most once every `ms` |

## once()

```js
function once(fn) {
  let called = false;          // 🎒 have I run already?
  let result;                  // 🎒 the first run's result
  return function (...args) {
    if (called) return result; // later calls: skip fn, return the saved result
    called = true;
    result = fn.apply(this, args);
    return result;
  };
}

const payOnce = once(() => chargeCard(499));
payOnce();   // charges, returns "txn_1"
payOnce();   // does nothing, returns "txn_1" again
```

Line by line:

- `called` and `result` are created **once**, when `once(fn)` runs, and shared by every later call (the same idea as `count` in the counter).
- `fn.apply(this, args)` passes along both the arguments and the `this` the wrapper was called with (see note 7), so it also works when used as a method.
- Setting `called = true` **before** calling `fn` means that even if `fn` somehow calls the wrapper again, it can't run twice.

**Where it's used:** pay/submit buttons (preventing double charges), one-time setup (initialising an SDK, loading a script, connecting to a database), lazy singletons ("create the expensive object on first use").

`addEventListener` has this built in: `button.addEventListener("click", handler, { once: true })` removes the listener after its first run.

## throttle()

```js
function throttle(fn, limit) {
  let lastRun = 0;                        // 🎒 when did fn last run?
  return function (...args) {
    const now = Date.now();
    if (now - lastRun < limit) return;    // too soon: ignore this call
    lastRun = now;
    fn.apply(this, args);
  };
}

window.addEventListener("scroll", throttle(updateStickyHeader, 200));
```

Trace, with `limit = 500` and events arriving every 100ms:

```text
t=0     now - lastRun = huge  → RUN,  lastRun = 0
t=100   100 < 500             → skip
t=200..400                    → skip
t=500   500 < 500? no         → RUN,  lastRun = 500
t=600..900                    → skip
t=1000                        → RUN
```

So while events keep coming, `fn` runs at a steady rate: at most once per `limit`.

**Edge case:** this simple version ignores the **last** event of a burst. If the user stops scrolling at t=950, the final position is never handled. Library versions (lodash `_.throttle`) add a **trailing** call to handle that, with `leading` / `trailing` options.

## Debounce vs throttle

```text
events:    ||||||||||||||||||||||||           (user keeps moving, then stops)
throttle:  X     X     X     X     X          (regularly, at most every N ms)
debounce:                              X      (once, N ms after it goes quiet)
```

| | debounce | throttle |
|---|---|---|
| While events keep firing | never runs | runs every N ms |
| After events stop | runs once | nothing more (unless trailing) |
| Question it answers | "has the user finished?" | "keep up, but not too often" |
| Typical uses | search box, autosave, validation, resize end | scroll position, infinite scroll check, mousemove/drag, game input, rate-limiting API calls |

A quick way to choose: if you only care about the **final** value, debounce. If you need **ongoing** updates while it's happening, throttle.

## Say it in one breath

> "once, debounce and throttle are higher-order functions that return a wrapper whose closure remembers one piece of state: once remembers whether it has run, debounce remembers the pending timer so each call can cancel it and only the last one fires after a quiet period, and throttle remembers when it last ran so calls within the limit are dropped, giving a steady maximum rate while events keep coming."
