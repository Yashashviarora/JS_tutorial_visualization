/* =====================================================================
   CLOSURES IN DEVTOOLS — run each lesson from the Console, one by one.
   Open closures-devtools.html in Chrome, press F12, go to the Console
   tab, and type:  lesson1()   then  lesson2()  ... up to lesson5()

   IMPORTANT: keep DevTools OPEN — the `debugger;` lines only pause
   the browser when DevTools is open. When it pauses, look at the
   RIGHT SIDE panel called "Scope" → you will see a section literally
   named "Closure" — that IS the closure, shown by the browser itself.
   ===================================================================== */

console.log(
  "%c🎒 CLOSURE LAB LOADED",
  "font-size:20px; color:#7c9eff; font-weight:bold;"
);
console.log(
  "%cType these one by one and press Enter:\n\n" +
    "  lesson1()  → see the closure in the Scope panel (browser pauses!)\n" +
    "  lesson2()  → watch `count` survive between calls\n" +
    "  lesson3()  → expand [[Scopes]] with console.dir\n" +
    "  lesson4()  → two closures = two separate memories\n" +
    "  lesson5()  → debounce: watch timerId live in the closure\n",
  "font-size:13px; color:#4ade80;"
);

/* ---------------------------------------------------------------
   LESSON 1 — See the word "Closure" in the browser's own UI
   ---------------------------------------------------------------
   What to do:
   1. Type lesson1() in the Console. The browser will PAUSE.
   2. Look at the right side: Sources tab opens, and in the
      "Scope" panel you'll see:
          ▸ Local        (variables of the inner function)
          ▸ Closure (createGreeter)   ← THIS is the closure! 🎉
            name: "Vivek"
   3. Press F8 (or the blue ▶ resume button) to continue.
   --------------------------------------------------------------- */
function lesson1() {
  function createGreeter(name) {
    // `name` lives here. createGreeter will finish...
    return function greet() {
      // ...but greet() still uses `name`, so the browser keeps it.
      debugger; // ← browser pauses HERE. Look at Scope → Closure (createGreeter)!
      console.log("Hello, " + name + "! 👋  (name came from the closure)");
    };
  }

  const greet = createGreeter("Vivek");
  // createGreeter is DONE at this point. Its scope should be gone...
  greet(); // ...yet greet still knows `name`. The pause will prove it.
  console.log("✅ Lesson 1 done. You just SAW a closure in the Scope panel.");
}

/* ---------------------------------------------------------------
   LESSON 2 — Watch `count` update INSIDE the closure across calls
   ---------------------------------------------------------------
   What to do:
   1. Type lesson2(). The browser pauses 3 times (once per call).
   2. EACH time it pauses, look at Scope → Closure (makeCounter):
         1st pause: count: 0   (about to become 1)
         2nd pause: count: 1
         3rd pause: count: 2
      Same variable, same backpack, updated every call!
   3. Press F8 after each pause.
   --------------------------------------------------------------- */
function lesson2() {
  function makeCounter() {
    let count = 0;
    return function () {
      debugger; // ← check Scope → Closure: watch `count` grow each pause
      count++;
      console.log("count is now:", count);
    };
  }

  const counter = makeCounter();
  counter(); // pause #1 → count: 0 in the closure
  counter(); // pause #2 → count: 1  ← it REMEMBERED!
  counter(); // pause #3 → count: 2
  console.log("✅ Lesson 2 done. The closure kept `count` alive between calls.");
}

/* ---------------------------------------------------------------
   LESSON 3 — Inspect a closure WITHOUT pausing: console.dir
   ---------------------------------------------------------------
   What to do:
   1. Type lesson3().
   2. In the Console output, find the line "▸ ƒ inner()" and CLICK
      the little arrow ▸ to expand it.
   3. Scroll down inside it and expand:  [[Scopes]]
      You'll see:  Closure (outer)  →  { secret: "I am hidden data 🤫" }
      That's Chrome showing you the function's backpack directly.
   --------------------------------------------------------------- */
function lesson3() {
  function outer() {
    const secret = "I am hidden data 🤫";
    return function inner() {
      return secret;
    };
  }

  const fn = outer();
  console.log("👇 Expand this function, then expand [[Scopes]] inside it:");
  console.dir(fn); // console.dir shows the function as an object, with [[Scopes]]
  console.log("✅ Lesson 3 done. [[Scopes]] → Closure (outer) holds `secret`.");
}

/* ---------------------------------------------------------------
   LESSON 4 — Two closures, two separate backpacks
   ---------------------------------------------------------------
   What to do:
   1. Type lesson4(). Browser pauses twice.
   2. 1st pause = counterA running → Scope shows ITS count.
      2nd pause = counterB running → a DIFFERENT count (still 0)!
      Proof that every call to makeCounter() creates a fresh,
      independent closure.
   --------------------------------------------------------------- */
function lesson4() {
  function makeCounter(label) {
    let count = 0;
    return function () {
      count++;
      debugger; // ← compare `label` and `count` in Scope on each pause
      console.log(label, "count:", count);
    };
  }

  const counterA = makeCounter("🅰 counterA");
  const counterB = makeCounter("🅱 counterB");

  counterA(); // A: 1
  counterA(); // A: 2
  counterB(); // B: 1  ← B's backpack was never touched by A!
  console.log("✅ Lesson 4 done. A reached 2, B is at 1 — separate memories.");
}

/* ---------------------------------------------------------------
   LESSON 5 — DEBOUNCE: watch timerId live inside the closure
   ---------------------------------------------------------------
   What to do:
   1. Type lesson5(). It simulates 4 fast "keystrokes" then a pause.
   2. Watch the Console: every keystroke CANCELS the previous timer
      (you'll see the old and new timerId printed from the closure).
   3. Only the LAST timer survives → ONE "API call" fires after 600ms.
   4. Bonus: it also pauses once via debugger so you can see
      Scope → Closure (debounce) containing: fn, delay, timerId
   --------------------------------------------------------------- */
function lesson5() {
  function debounce(fn, delay) {
    let timerId = null; // 🎒 lives in the closure, shared across ALL calls below
    return function (...args) {
      if (timerId !== null) {
        console.log("   ✂ cancelling previous timer #" + timerId + " (found it in the closure!)");
      }
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        debugger; // ← final pause: Scope → Closure (debounce) shows fn, delay, timerId
        console.log("🌐 API CALLED with:", args[0], " ← only the LAST keystroke won!");
        timerId = null;
      }, delay);
      console.log("   ⏲ scheduled new timer #" + timerId + ' for "' + args[0] + '"');
    };
  }

  const search = debounce((q) => q, 600);

  console.log('⌨ simulating fast typing: "c", "cl", "clo", "closure" ...');
  search("c");
  setTimeout(() => search("cl"), 100);      // 100ms later — cancels timer for "c"
  setTimeout(() => search("clo"), 200);     // cancels timer for "cl"
  setTimeout(() => search("closure"), 300); // cancels timer for "clo"
  // then we stop "typing" → 600ms of silence → ONLY "closure" fires 🎯
  console.log("(now waiting... the last timer needs 600ms of silence to fire)");
}

/* ---------------------------------------------------------------
   Make lessons callable from the Console
   --------------------------------------------------------------- */
window.lesson1 = lesson1;
window.lesson2 = lesson2;
window.lesson3 = lesson3;
window.lesson4 = lesson4;
window.lesson5 = lesson5;
