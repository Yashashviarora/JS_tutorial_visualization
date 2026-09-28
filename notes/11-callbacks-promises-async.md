# 11 · Callbacks → Promises → async/await

Interactive demo: [`async-visualizer.html`](../async-visualizer.html) (watch the heartbeat clock)

## The misconception to fix first

> "JavaScript is asynchronous, so why do we need callbacks?"

**JavaScript itself is synchronous and single-threaded**: one call stack, one line at a time. Proof:

```js
const end = Date.now() + 3000;
while (Date.now() < end) {}   // the whole tab freezes for 3s: no clicks, no scrolling, no repaint
```

The asynchronous parts come from the **host** (browser / Node): timers, network, events. `setTimeout`, `fetch`, `addEventListener` are not part of the JavaScript language; they're browser features JavaScript can use.

## Why callbacks exist

JavaScript hands slow work to the browser and **moves on immediately**. When the result is ready, JavaScript isn't waiting at that line anymore, so there's nowhere to "return" it to. The only way back in is a function you left in advance: **the callback** ("call me at this number when it's done").

The alternative, waiting, would freeze the page, because there's only one thread. (Synchronous XMLHttpRequest did exactly this, and browsers deprecated it.)

```text
waiter (JS engine, one at a time)  → takes order, hands it to the kitchen, serves other tables
kitchen (browser Web APIs)         → cooks many dishes in parallel
"table 5"  (callback)              → what to do when the dish is ready
bell (event loop)                  → brings the callback to the stack when the waiter is free
```

## The same task, three ways

```js
// ① callbacks: nested, and an error check at every level
getUser(7, (err, user) => {
  if (err) return fail(err);
  getOrders(user, (err, orders) => {
    if (err) return fail(err);
    getInvoice(orders[0], (err, inv) => {
      if (err) return fail(err);
      done(inv);
    });
  });
});

// ② promises: a flat chain and ONE .catch
getUser(7)
  .then(user => getOrders(user))
  .then(orders => getInvoice(orders[0]))
  .then(inv => done(inv))
  .catch(err => fail(err));

// ③ async/await: reads top to bottom, still never blocks
async function run() {
  try {
    const user   = await getUser(7);
    const orders = await getOrders(user);
    const inv    = await getInvoice(orders[0]);
    done(inv);
  } catch (err) { fail(err); }
}
```

All three take the same time and behave the same way. In all three, the first call **returns instantly** and JavaScript moves on.

## They're the same mechanism underneath

Promises wrap callbacks. This helper turns any Node-style callback function into a promise function:

```js
const promisify = (fn) => (...args) =>
  new Promise((resolve, reject) => {
    fn(...args, (err, data) => (err ? reject(err) : resolve(data)));
  });
```

`await` is built on promises: the rest of the async function after each `await` is resumed through the **microtask queue** once the promise settles. It pauses *that function* only, never the page.

```text
callback  →  wrapped in a promise  →  consumed with .then  →  or with await
```

## Promise executor is sync, .then is async

```js
console.log("A");
const p = new Promise((resolve) => {
  console.log("B");   // the executor runs IMMEDIATELY (synchronously)
  resolve("C");       // ALSO synchronous: flips the state to fulfilled, prints nothing
});
p.then((v) => console.log(v));   // callback QUEUED as a microtask, even though p is already fulfilled
console.log("D");
// A B D C
```

`resolve` isn't async; it just changes the promise's state. The `.then` callback is always async so the order is predictable: code after `.then(...)` always runs before the callback.

## Say it in one breath

> "JavaScript is single-threaded and synchronous; the browser does the actual waiting. Since JavaScript moves on instead of waiting, results come back through callbacks. Promises package those callbacks into an object with guarantees (flat chains, one catch, settle once), and async/await is syntax over promises that pauses only the current function, resuming via the microtask queue."
