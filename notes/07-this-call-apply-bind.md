# 7 · `this`, call, apply, bind — the secret slot

Interactive demo: [`this-visualizer.html`](../this-visualizer.html)

## The mental model: `this` is a hidden parameter

Every **regular** function secretly has one extra parameter. You never type it; **the CALL fills it**:

```js
// what you write:            // what the engine effectively has:
function intro() {            function intro(THIS) {
  console.log(this.name);       console.log(THIS.name);
}                             }

intro()             // engine: intro(undefined)       ← nobody passed it
vivek.intro()       // engine: intro(vivek)           ← the dot passes vivek
intro.call(akshay)  // engine: intro(akshay)          ← YOU pass it by hand
new Intro()         // engine: intro(brandNewObject)  ← new passes a fresh {}
```

⭐ So never ask "what is `this`?" — ask **"HOW was the function called?"** Look at the CALL SITE, not where the function was written.

## The four binding rules (= the four call shapes)

| # | Rule | Call site looks like | `this` becomes |
|---|------|----------------------|----------------|
| 1 | **Default** | `fn()` | `undefined` (strict) / `window` (sloppy) |
| 2 | **Implicit** | `obj.fn()` | the object left of the LAST dot |
| 3 | **Explicit** | `fn.call(x)` / `apply` / `bind` | `x`, your choice |
| 4 | **new** | `new Fn()` | a freshly created object |

Precedence when they collide: **new > explicit > implicit > default.**

### Rule 2's famous failure: implicit LOSS

```js
const vivek = { name: "Vivek", intro() { console.log(this.name); } };
vivek.intro();          // "Vivek" — dot present at the call
const f = vivek.intro;  // copying the FUNCTION — the dot is not copied!
f();                    // undefined 💥 — rule 1 (plain call)
setTimeout(vivek.intro, 100);  // same loss — setTimeout calls it plainly
```

The dot must exist **at the moment of the call**. Passing a method anywhere strips it — the #1 `this` bug in real code.

## call · apply · bind (rule 3's three tools)

| | Runs when? | Args | Mnemonic |
|---|---|---|---|
| `fn.call(obj, a, b)` | NOW | commas | **C**all = **C**ommas |
| `fn.apply(obj, [a,b])` | NOW | array | **A**pply = **A**rray |
| `fn.bind(obj, a?)` | LATER — returns a NEW function 🔒 | optionally pre-filled | **B**ind for later |

`bind` is a **closure + HOF** — you can build it yourself:

```js
function myBind(fn, obj) {
  return (...args) => fn.apply(obj, args);   // obj lives in the 🎒 backpack
}
```

Hard binding: once bound, even `bound.call(someoneElse)` is ignored. Only `new` outranks it.

## Arrow functions have NO `this` — the real reason

### The historical bug (why arrows exist)

```js
const user = {
  name: "Vivek",
  sayHiLater() {                      // this = user (rule 2) ✓
    setTimeout(function () {
      console.log("Hi " + this.name); // 💥 undefined!
    }, 1000);
  }
};
```

The callback is a regular function → it has its OWN slot → setTimeout fills it with nothing → the callback's empty `this` **stands in front of** (shadows) the good one. For 20 years the fix was manual: `const self = this;` — copying `this` into a normal variable so closure lookup could reach it.

### Arrows = that fix built into the language

> **An arrow function is built WITHOUT the secret slot.** So the word `this` inside it isn't its own — the engine resolves it by **ordinary outward scope lookup**, exactly like `count` in a closure. 🎒

```js
sayHiLater() {
  setTimeout(() => console.log("Hi " + this.name), 1000);  // ✓ "Hi Vivek"
  // arrow has no slot → nothing shadows → sees sayHiLater's this straight through
}
```

Arrows didn't gain a feature — they **removed** one, and the removal is the fix. Consequences (all follow logically):

- `arrowFn.call(obj)` can't change its `this` — no slot to fill; argument silently ignored.
- `new (() => {})` throws — no slot to hand the new object into.
- **Arrow as an object method fails:**

```js
const obj = { name: "X", bad: () => console.log(this.name) };
obj.bad();   // undefined 💥 — an object literal { } is NOT a scope!
             // outward lookup from where the arrow was WRITTEN → file top level
```

## Variables vs properties — the trap behind that last bug

JS has TWO separate storage worlds that never mix:

```js
const name = "VARIABLE";                 // world 1: variables → found by scope lookup
const obj = { name: "PROPERTY",          // world 2: properties → only via something.name
  arrow: () => console.log(name) };
obj.arrow();  // "VARIABLE" — the property RIGHT THERE was invisible to scope lookup!
```

A bare word searches scopes only; `x.y` reads a property only. **`this` is the bridge** from code into an object's properties — which is why filling the slot correctly matters.

## Rule of thumb

- **Regular function** = main actor: methods, constructors — things needing their own identity.
- **Arrow** = helper inside: callbacks — things that should borrow the enclosing method's identity.

## Say it in one breath

> "`this` is a hidden parameter filled at the call site by four rules — default, implicit (last dot), explicit (call/apply/bind), and new, in rising precedence. Arrow functions simply lack that parameter, so `this` inside them resolves by outward scope lookup like any closed-over variable — which is why bind can't change it, new throws, and arrows make perfect callbacks but terrible methods."
