/* =====================================================================
   DEBOUNCE — EXPLAINED LINE BY LINE, IN SLOW MOTION
   =====================================================================
   Paste this whole file into the browser Console (F12 → Console)
   and it will simulate typing "c", "cl", "clo" fast, then a pause.
   Read the comments top to bottom — they follow the exact order
   things happen in real life.
   ===================================================================== */


/* ---------------------------------------------------------------------
   STEP 0: Understand the two "phases" first. This is the key!

   PHASE 1 (happens ONCE, at page load):
        debounce(searchAPI, 500) runs ONE time.
        Its job: build and return a NEW function (the "wrapper").
        After this, debounce itself never runs again.

   PHASE 2 (happens on EVERY keystroke):
        The wrapper function runs again and again.
        But it still has access to `timerId` from Phase 1 — the closure!
   --------------------------------------------------------------------- */


/* ---------------------------------------------------------------------
   The function we WANT to protect. Imagine this is an expensive
   network request like fetch("/api/search?q=" + q).
   We do NOT want this to run on every keystroke.
   --------------------------------------------------------------------- */
function searchAPI(query) {
  console.log("🌐 API CALL happened with query:", query);
}


/* ---------------------------------------------------------------------
   THE DEBOUNCE FACTORY
   --------------------------------------------------------------------- */
function debounce(fn, delay) {
  // ────────────────────────────────────────────────────────────────
  // PHASE 1 — this body runs exactly ONCE, when you call debounce().
  //
  // At that moment:
  //   fn    = searchAPI        (the function we're protecting)
  //   delay = 500              (how long to wait after the LAST keystroke)
  // ────────────────────────────────────────────────────────────────

  let timerId = null;
  // ^ This line also runs ONCE. One single box named `timerId` is created.
  //   It starts as null, meaning "no timer is scheduled right now".
  //
  //   ⭐ THE WHOLE TRICK: this box is created once and NEVER re-created.
  //   Every future keystroke reads and writes this SAME box.
  //   That is the closure. Without it, debounce cannot work.

  return function wrapper(...args) {
    // ──────────────────────────────────────────────────────────────
    // PHASE 2 — this body runs on EVERY keystroke.
    //
    // `...args` just means "collect whatever arguments the caller
    // passed into an array called args". If the input calls
    // wrapper("clo"), then args = ["clo"].
    //
    // Even though debounce() finished long ago, this wrapper can
    // still see `fn`, `delay`, and `timerId` — its closure/backpack.
    // ──────────────────────────────────────────────────────────────

    console.log("⌨ keystroke! wrapper called with:", args[0]);

    clearTimeout(timerId);
    // ^ Step A: KILL the previous plan.
    //   Last keystroke scheduled a timer and saved its id in `timerId`.
    //   clearTimeout(thatId) cancels it BEFORE it ever fires.
    //   So the previous keystroke's API call never happens. ✂
    //
    //   First keystroke ever? timerId is null, and clearTimeout(null)
    //   simply does nothing — safe, no error.
    if (timerId !== null) {
      console.log("   ✂ cancelled previous timer #" + timerId);
    }

    timerId = setTimeout(() => {
      // ^ Step B: MAKE a new plan.
      //   setTimeout says: "run this arrow function after `delay` ms".
      //   It does NOT run it now! It only schedules it, and instantly
      //   returns a number (the timer's id), which we store in the
      //   SAME shared `timerId` box — so the NEXT keystroke can
      //   cancel it if it comes too soon.

      // ── if we ever reach this line, it means 500ms passed with
      //    ZERO new keystrokes. The user has stopped typing. NOW
      //    we finally do the real work:
      console.log("   ⏰ 500ms of silence passed — nobody cancelled me!");
      fn(...args);
      // ^ fn is searchAPI (remembered from Phase 1, via the closure).
      //   args is this keystroke's text. So this line means:
      //   searchAPI("clo")  →  the ONE real API call. 🎯
    }, delay);

    console.log("   ⏲ scheduled new timer #" + timerId + " (fires in " + delay + "ms unless cancelled)");
  };
}


/* ---------------------------------------------------------------------
   WIRING IT UP (this part runs once, at page load)
   --------------------------------------------------------------------- */

const debouncedSearch = debounce(searchAPI, 500);
// ^ PHASE 1 happens HERE, exactly once:
//     1. debounce runs, creates the `timerId` box (= null)
//     2. debounce returns the wrapper function
//     3. we name that wrapper "debouncedSearch"
//   From now on, debouncedSearch IS the wrapper, carrying its 🎒
//   backpack: { fn: searchAPI, delay: 500, timerId: null }

// In a real page you would now do:
//   input.addEventListener("input", (e) => debouncedSearch(e.target.value));
// meaning: every time the text changes, call the wrapper with the new text.
// (We simulate that below instead, so this file runs anywhere.)


/* ---------------------------------------------------------------------
   SIMULATION: user types "c", "cl", "clo" quickly (150ms apart),
   then stops typing. Watch the console output!
   --------------------------------------------------------------------- */
console.log("=== simulating fast typing... ===");
debouncedSearch("c");                       // keystroke 1 at   0ms
setTimeout(() => debouncedSearch("cl"), 150);  // keystroke 2 at 150ms
setTimeout(() => debouncedSearch("clo"), 300); // keystroke 3 at 300ms
// ...then silence. At 300 + 500 = 800ms, the LAST timer fires:
// → searchAPI("clo") runs ONCE. Keystrokes 1 and 2 were cancelled. ✅
