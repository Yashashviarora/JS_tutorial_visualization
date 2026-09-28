# 9 · Events, Bubbling & Delegation — one doorbell for the whole house

## The event object — the browser's incident report

When you click, the browser builds an object describing everything, and passes it to handlers:

```js
el.addEventListener("click", (event) => {
  event.type            // "click"
  event.target          // the element the event ORIGINATED on (deepest under cursor)
  event.currentTarget   // the element THIS handler is attached to
  event.target.value    // for inputs: the text (debounce used e.target.value!)
  event.preventDefault()   // cancel the browser's default action (link nav, form submit)
  event.stopPropagation()  // stop the upward journey (see bubbling)
});
```

None of this is JavaScript-the-language — events, addEventListener, dispatch are **DOM spec (host/browser)** territory. V8 just runs your handler when called (as a task from the event loop).

## Bubbling — one click "hits" many elements

HTML is nested, so a click on a button is also a click inside its `<li>`, `<ul>`, `<div>`... Who's told? **Everyone, inside-out:**

```text
CAPTURE (↓ rarely used)        BUBBLE (↑ where everything happens)
document ─┐                              ┌─▶ document
  ul ─────┤ down          up ────────────┤ ul      ← delegation listens HERE
    li ───┤                              ├─ li
      button ┴──── TARGET ───────────────┴ button  ← event born here
```

The full journey: capture down → target → **bubble up**. Normal `addEventListener` fires in the bubble phase (opt into capture with `{capture: true}` — rare).

- `event.target` — stamped ONCE at dispatch, never changes: the birth certificate.
- `event.currentTarget` — changes at each stop: "whose handler is running now".
- `stopPropagation()` pops the bubble mid-flight: ancestors never hear it.

Classic use: a row opens the item on click, its Delete button must NOT also open it → the delete handler calls `event.stopPropagation()`.

## Event delegation — the pattern

> **Attach ONE listener to a common ancestor; use `event.target` during bubbling to identify which descendant the event came from.**

NOT outside-inward! The *listener* sits outside; the *event* still travels inside-out — you park a catcher high and bubbles rise to it. 🧤

### Why

1. **Memory:** 1 listener instead of 1,000 (each listener is a closure pinning memory — see note 3).
2. **Future elements work free:** rows added later are already covered — the listener sits above them.
3. **Zero cleanup:** removing a row leaves no listener residue.

### The three tools, working as a team

```js
list.addEventListener("click", (event) => {
  const btn = event.target.closest("button.delete");
  //          └────┬─────┘ └─────────┬────────────┘
  //         LANDING SPOT      CLIMB UP from there to the element you meant
  if (!btn) return;               // click elsewhere in the list → ignore
  deleteItem(btn.dataset.id);     // READ THE POCKET: data-id="8" → "8"
});
```

- **`event.target`** — a property: WHERE the event was born. May be too precise: click a 🗑 icon inside the button → target is the `<span>`, not the button!
- **`closest(selector)`** — a method on every element: walks from the element **itself, then upward**, returns the first match or `null`. Fixes the icon problem — THE must-use of delegation.
- **`data-*` / `dataset`** — pockets sewn onto elements: `<button data-id="8">` → `btn.dataset.id` → `"8"` (always a **string!**). Delegation has one shared function, so per-item data can't live in closures — it lives ON the elements.

### 🎒 Backpack vs 👖 Pocket — where does per-item data live?

| | Closure (curried React handler) | Delegation (`data-*`) |
|---|---|---|
| Data lives | in JS memory, on a FUNCTION | in the DOM, on an ELEMENT |
| Functions | one per item | one total |
| Can hold | anything (objects!) | strings only |
| Cleanup | remove listener or leak | delete element, done |

Same question — "which item?" — answered by *memory* vs *geography*.

### Production pattern: behavior declared in HTML

```html
<li data-id="42">
  Buy milk
  <button data-action="toggle">✓</button>
  <button data-action="delete">🗑</button>
</li>
```

```js
list.addEventListener("click", (e) => {
  const actionEl = e.target.closest("[data-action]");   // WHAT to do (button's pocket)
  if (!actionEl) return;
  const id = actionEl.closest("li[data-id]").dataset.id; // WHICH item (row's pocket)
  ({ delete: deleteTodo, edit: openEditor, toggle: toggleDone })[actionEl.dataset.action](id);
});
```

The row knows its identity, the button knows its intent, ONE dispatcher decodes both. New rows need zero wiring.

### Edge cases

- Only works for **bubbling** events. `focus`/`blur` don't bubble → use `focusin`/`focusout`; `mouseenter`→`mouseover`.
- Any `stopPropagation()` between child and ancestor silently breaks delegation.
- Disabled buttons fire no click at all (looks like a delegation bug, isn't).
- Debug with: `getEventListeners(el)`, `monitorEvents(el, "click")` (Console-only helpers), and the Elements → Event Listeners panel.

## Say it in one breath

> "Events are dispatched down (capture) then bubble up through every ancestor; delegation parks one listener on an ancestor and identifies the origin via event.target — robustly with closest(), since clicks land on nested elements — reading per-item data from data-* attributes. One function serves a thousand children, born or unborn; caveats: bubbling events only, and stopPropagation below you breaks it."
