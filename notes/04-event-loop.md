# 4 · The Event Loop — who runs what, when

Interactive demo: [`event-loop-visualizer.html`](../event-loop-visualizer.html) (step through 4 scenarios)

## The four zones

```text
📚 CALL STACK        what's running RIGHT NOW (one thing at a time — JS is single-threaded)
⏲ WEB APIs           the BROWSER's waiting room: timers counting, fetches in flight
⚡ MICROTASK QUEUE    the VIP line: promise callbacks (.then / await)
📥 TASK QUEUE        the normal line: timer callbacks, click/scroll events
        🔄 EVENT LOOP: "stack empty? → run ALL microtasks → then ONE task → repeat"
```

Who owns what (interview gold):

- **ECMAScript (the language):** functions, closures, promises-as-objects.
- **The host (browser/Node):** setTimeout, fetch, DOM events, the queues — `console` too!
- **The engine (V8):** just runs your functions when they're pushed on the stack.

## The Namaste JS example, traced

```js
console.log("Start");
setTimeout(function cbT() { console.log("CB SetTimeout"); }, 5000);
fetch("https://api.netflix.com").then(function cbF() { console.log("CB Netflix"); });
console.log("End");
```

```text
1. GEC (global execution context) pushed on the stack.
2. "Start" prints.
3. setTimeout hands cbT + 5000ms to Web APIs land. Returns INSTANTLY.
4. fetch hands cbF to Web APIs; network request flies off. Returns instantly.
5. "End" prints. GEC pops → stack EMPTY. Two things wait in browser land.
6. Netflix responds after ~50ms → cbF moves to the MICROTASK queue.
7. Event loop: stack empty + microtask waiting → push cbF → "CB Netflix".
   (≈5 seconds BEFORE the timer, though setTimeout was written first!)
8. At 5000ms the timer expires → cbT moves to the TASK queue.
9. Event loop pushes cbT → "CB SetTimeout".

Output: Start, End, CB Netflix, CB SetTimeout
```

## setTimeout(fn, 0) does NOT mean "now" — trust issues

A 0ms timer callback still waits for:

1. **ALL synchronous code** (the stack must be empty), and
2. **the ENTIRE microtask queue** — including microtasks created by microtasks!

```js
setTimeout(() => console.log("3 timeout"), 0);
Promise.resolve()
  .then(() => console.log("1 promise"))
  .then(() => console.log("2 chained — still beats the timer"));
for (let i = 0; i < 5e8; i++);          // heavy sync work, ~1 second
console.log("0 sync");
// Output: 0, 1, 2, 3 — the "0ms" timer ran last, over a second late.
```

⭐ `setTimeout(fn, t)` guarantees **at least** t ms, never exactly t ms. The delay is "when may I enter the queue", not "when will I run".

## Microtasks starve the task queue

Priority per cycle: **sync code → ALL microtasks → ONE task → repeat.** A promise chain that endlessly schedules more microtasks blocks timers forever — "starvation of the callback queue".

## clearTimeout: cancellation happens in the WAITING ROOM

`setTimeout` instantly returns a plain number (the ticket). The scheduled callback sits in Web APIs land — it was never on the stack. `clearTimeout(ticket)` deletes it from the waiting room: it never reaches any queue, never runs. Silent erasure. (This is the half of debounce the event loop provides.)

## Seeing the loop's footprints in DevTools

- **Performance tab**: record → the "Main" track shows each Task the loop dispatched; "Timer fired", "Event: scroll"; long tasks (>50 ms) get red-flagged — those block rendering.
- **Sources while paused in a callback**: the Call Stack panel shows `--- setTimeout ---` above your frames — the async boundary reconstructed.

## Say it in one breath

> "JavaScript runs one thing at a time on the call stack; the browser holds timers, network and events in Web APIs land; finished callbacks queue up — promise callbacks in the microtask queue, timers/events in the task queue — and the event loop, whenever the stack is empty, drains ALL microtasks then runs one task. Hence setTimeout(0) means 'at least 0 ms', promises beat timers, and a busy main thread delays everything."
