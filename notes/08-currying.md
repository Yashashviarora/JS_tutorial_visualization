# 8 · Currying — closures as an argument-collecting machine

Interactive demo: [`currying-visualizer.html`](../currying-visualizer.html)

## Definition

> **Currying turns f(a, b, c) into f(a)(b)(c)** — a chain of one-argument functions. Each call collects one argument into a closure 🎒 and returns a function waiting for the next.

```js
function sum(a) {
  return function (b) {
    return function (c) {
      return a + b + c;      // a and b arrive via the closures
    };
  };
}
sum(1)      // → returns fn, backpack {a:1}. NOTHING computed!
sum(1)(2)   // → returns fn, backpack {a:1, b:2}. Still nothing!
sum(1)(2)(3)// → all collected → 6
```

Two ways to build it:

1. **Nested closures** (above; arrow style: `const sum = a => b => c => a+b+c`)
2. **bind with preset args**: `const double = multiply.bind(null, 2)` — bind pre-fills arguments, not just `this`.

## The REAL power: partial application (stop halfway, reuse)

```js
const multiply = (a) => (b) => a * b;
const double = multiply(2);    // a=2 locked 🎒
const triple = multiply(3);    // separate backpack
double(5);  // 10
triple(5);  // 15
```

(Strictly: *currying* = the transformation; *partial application* = presetting some args. Casually mixed; knowing the difference earns interview points.)

## Where it's ACTUALLY used (honest senior answer)

You'll rarely write `sum(1)(2)(3)` at work. The production shape is: **arguments known at different TIMES get split into separate calls** — usually exactly two levels: `(config) => (lateData) => result`.

**1. React handlers with parameters (#1 daily use):**

```jsx
const handleDelete = (id) => (event) => {   // id at RENDER time, event at CLICK time
  event.stopPropagation();
  deleteItem(id);
};
{items.map(item => <button onClick={handleDelete(item.id)}>Delete</button>)}
// handleDelete(item.id) runs during render → returns the real handler, id in the 🎒
// Classic bug it prevents: onClick={deleteItem(item.id)} would delete during render!
```

**2. Express middleware factories:** `app.use(cors({origin}))` — `cors(options)` runs once at startup, returns `(req,res,next)=>{}` that runs per request with options in the closure.

**3. Redux middleware — literally curried:** `const logger = store => next => action => {...}` — three arguments arriving at three different moments of the app's life.

**4. Validators:** `const minLength = (min) => (value) => value.length >= min;` — build rules once, run per keystroke.

**5. Pre-configured clients/loggers:** `const logError = createLogger("payments")("ERROR");` — push repeated args to one place.

**6. lodash/fp & Ramda pipelines:** everything curried + data-last so functions compose: `pipe(filter(f), map(g), take(5))(users)`.

## The interview classic: infinite currying

```js
function sum(a) {
  return function (b) {
    if (b === undefined) return a;  // empty call () = stop → return total
    return sum(a + b);              // else fold it in, return a new collector
  };
}
sum(1)(2)(3)(4)();  // 10
```

Each call closes over the accumulated total and returns a fresh collector.

## When NOT to curry

Arguments arriving together, from one place? Plain function. `sum(a, b, c)` should stay `sum(a, b, c)` — currying it in a PR is showing off.

## Say it in one breath

> "Currying converts f(a,b,c) into f(a)(b)(c), each call capturing one argument in a closure. Its practical value is partial application — locking in arguments you know early (config, ids, tokens) and returning a function awaiting what arrives late (events, requests, data). That's the shape of React's curried handlers, Express middleware factories, Redux middleware, and lodash/fp pipelines."
