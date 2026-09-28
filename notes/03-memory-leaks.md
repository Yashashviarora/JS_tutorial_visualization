# 3 · Memory Leaks — the dark side of closures

Interactive demo: [`leak-demo.html`](../leak-demo.html) (leaky app vs fixed app, side by side)

## The superpower IS the problem

Closures keep variables alive. Great when you want it (counter, debounce) — a **leak** when you don't:

```js
function heavy() {
  const bigData = new Array(1_000_000).fill("💾");  // megabytes
  return function () { console.log(bigData.length); };
}
const fn = heavy();
// bigData CANNOT be freed while fn exists — the closure pins it.
// Done with it? fn = null → now GC can reclaim everything.
```

## The classic real-world leak: stacked event listeners

Key fact #1: **`addEventListener` APPENDS — it never replaces.**
Key fact #2: in an SPA, **the page never reloads** — `window`/long-lived elements keep their listeners forever.

```js
function openChatView() {                     // runs on EVERY visit to the view
  const messages = loadAllMessages();         // say 4 MB
  box.addEventListener("scroll", function onScroll() {
    console.log(messages.length);             // closure pins THIS visit's 4 MB
  });
}
```

User opens the chat view 50 times in an afternoon (normal!):

```text
visit 1 → listener #1 added (4 MB pinned)
visit 2 → listener #2 added ON TOP (8 MB)     ← old one was never removed!
...
visit 50 → 50 listeners, 200 MB pinned, and ONE scroll runs 50 handlers
```

Two ways this kills the tab:

1. **Work multiplies** — JS is single-threaded; one scroll gesture × 50 handlers × dozens of events/sec = the main thread never gets a gap to repaint → stutter → freeze.
2. **Memory strangles** — the GC is not ALLOWED to free the 50 pinned copies (each listener might still run). Eventually: "Aw, Snap! Out of memory."

Note: 50 visits = 50 **separate** closures, each pinning its own copy of `messages` (like counterA/counterB — separate backpacks, just 4 MB each).

## The fix: every add gets a remove (3 lines)

```js
let currentCleanup = null;                    // 🎒 shared — remembers the undo

function openChatView() {
  if (currentCleanup) currentCleanup();       // ✂ 1. undo the PREVIOUS visit first

  const messages = loadAllMessages();
  function onScroll() { console.log(messages.length); }
  box.addEventListener("scroll", onScroll);   // 2. add fresh (named, so removable!)

  currentCleanup = () => {                    // 3. remember how to undo THIS visit
    box.removeEventListener("scroll", onScroll);
    currentCleanup = null;
  };
}
```

Beautiful irony: the leak was caused by closures, and the fix IS a closure — `currentCleanup` remembers exactly which `onScroll` to detach. Once removed, nothing references the old closure → GC frees its 4 MB.

⚠️ `removeEventListener` needs the **same function object** you added — anonymous inline handlers can never be removed. Name them first.

This is precisely React's pattern:

```js
useEffect(() => {
  window.addEventListener("scroll", onScroll);
  return () => window.removeEventListener("scroll", onScroll);  // the cleanup
});
```

## Debugging leaks

- Console: `getEventListeners(element)` lists every listener attached (DevTools-only helper).
- Memory tab: heap snapshots before/after; watch for growth that never comes back.
- Performance tab: record while scrolling → long red-flagged tasks = handlers hogging the thread.

## Say it in one breath

> "Listeners don't freeze tabs — FORGOTTEN listeners do: addEventListener stacks, SPAs never reload, so re-visiting a view re-adds handlers whose closures pin memory forever, multiplying work per event and starving the GC. Fix: keep a cleanup closure that removes the previous listener before adding a new one — every add gets a remove."
