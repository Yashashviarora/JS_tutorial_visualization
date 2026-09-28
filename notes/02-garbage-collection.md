# 2 · Garbage Collection — memory freed by unreachability

Interactive demo: [`closure-gc.html`](../closure-gc.html) (the Namaste 🙏 JavaScript example)

## The one rule

You never call the garbage collector — it runs on its own. Its single question for every value:

> **"Can this still be REACHED?"**

Starting from the roots (globals, currently running functions), the GC follows every reference like ropes. Reachable = alive. Unreachable = freed.

```js
let user = { name: "Vivek" };  // reachable via `user` → alive
user = null;                   // rope cut → unreachable → freed 🗑️
```

`user = null` doesn't delete the object — it cuts the rope; the GC notices later.

## Closures + GC: the smart part

```js
function a() {
  var x = 0,
      z = 10;
  return function b() {
    debugger;
    console.log(x);   // b uses x... but NEVER uses z
  };
}
var y = a();
y();
```

What survives when `a()` finishes?

- **`x` → KEPT.** `b` references it → reachable through the closure.
- **`z` → GARBAGE COLLECTED.** Nobody references it → V8 frees it immediately.

**Proof in DevTools:** run it, and while paused at `debugger`:
- Scope panel shows `Closure (a) → x: 0` — and **no `z` anywhere**.
- Type `z` in the Console → `ReferenceError: z is not defined`. Not "undefined" — *gone*.

Now add `console.log(z);` inside `b` and run again → the Scope panel shows **both** `x` and `z`. One reference is all it takes to be rescued.

⭐ **The closure keeps ONLY the variables the inner function actually references. Everything else is freed.** (This is V8's smart optimization; the spec allows keeping more.)

## How YOU "use" GC (you enable it, you can't invoke it)

1. Cut ropes when done: `bigArray = null`, clear caches.
2. Remove long-lived references: `removeEventListener`, `clearInterval`, `clearTimeout`.
3. Prefer local variables — they're self-cleaning (unless a closure captures them).
4. Use `WeakMap`/`WeakSet` for caches — weak ropes don't prevent GC.

## Watch it happen

DevTools → **Memory** tab → the 🗑️ trash icon forces a collection (debugging only).

```js
let big = new Array(5_000_000).fill("x");  // take heap snapshot → big
big = null;                                // click 🗑️ → snapshot → freed
```

Performance recordings show orange "Minor GC"/"Major GC" blocks — the collector pausing your code for milliseconds to sweep.

## Say it in one breath

> "JavaScript memory is managed by reachability-based garbage collection — you can't invoke it, you enable it by not holding references you no longer need. Closures keep only the variables their inner functions reference; the rest is freed immediately. Leaks are never 'GC failed' — they're 'something still holds a rope you forgot about.'"
