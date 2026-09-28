console.log("%c🎯 THE SECRET SLOT LAB — run exp1() … exp5(), keep DevTools open!",
  "font-size:16px;color:#7c9eff;font-weight:bold");

/* ═══ EXP 1 — the SAME function, slot filled 3 ways ═══
   It pauses 3 times. AT EACH PAUSE look at Scope panel → Local → `this`:
   pause 1: this = Window        (plain call — slot got the fallback)
   pause 2: this = {name:'cat'}  (the dot filled it with cat)
   pause 3: this = "🍕"          (call() — you filled it by hand)
   Press F8 between pauses. Also type `this` in the Console while paused! */
function whoAmI() {
  debugger;                     // ← LOOK AT: Scope → Local → this
  console.log("this is:", this);
}
function exp1() {
  whoAmI();                             // plain call
  const cat = { name: "cat", speak: whoAmI };
  cat.speak();                          // same function, through the dot
  whoAmI.call("🍕");                    // same function, hand-filled
  console.log("✅ ONE function, THREE different `this` — only the call style changed");
}

/* ═══ EXP 2 — implicit binding LOST when the dot is lost ═══ */
function exp2() {
  const vivek = {
    name: "Vivek",
    intro() { debugger; console.log("I am", this?.name); }  // ← check `this` each pause
  };
  vivek.intro();          // pause 1: this = vivek  (dot present at call site)
  const f = vivek.intro;  // copying the function — the dot is NOT copied!
  f();                    // pause 2: this = Window — SAME function, dot gone → slot empty
  setTimeout(vivek.intro, 500);  // pause 3 (after 500ms): setTimeout calls it plainly → lost again
  console.log("✅ the dot must exist AT THE CALL, not at the definition");
}

/* ═══ EXP 3 — explicit binding: call vs bind (locked) ═══ */
function exp3() {
  function intro() { debugger; console.log("I am", this?.name); }
  const a = { name: "A" }, b = { name: "B" };
  intro.call(a);            // pause 1: this = {name:'A'}
  intro.call(b);            // pause 2: this = {name:'B'} — per call, your choice
  const locked = intro.bind(a);
  locked();                 // pause 3: this = A  (locked in the backpack)
  locked.call(b);           // pause 4: this = STILL A! bind's lock beats call 🔒
  console.log("✅ call fills the slot per call; bind welds it shut");
}

/* ═══ EXP 4 — `new` fills the slot with a BRAND NEW object ═══
   At the pause: Scope → this = Person {} (empty!). Press F8 slowly:
   watch `p` come out with name filled — you saw the object being built. */
function exp4() {
  function Person(name) {
    debugger;               // ← this = a fresh empty Person {} — not window, not any obj!
    this.name = name;       // step over (F10) and watch `this` gain the property live
  }
  const p = new Person("Vivek");
  console.log("✅ new created:", p, "— the slot held the newborn object");
}

/* ═══ EXP 5 — arrow has NO slot: compare two pauses side by side ═══
   pause 1 (regular inner fn): Scope → Local → this = Window  ← own slot, filled with nothing
   pause 2 (arrow): Scope → Local has NO `this` row at all!   ← no slot exists!
     but type `this` in the Console while paused → {name:'Timer'} — found by OUTWARD LOOKUP 🎒 */
function exp5() {
  const timer = {
    name: "Timer",
    start() {                        // regular method → slot filled with `timer` by the dot
      const regular = function () { debugger; console.log("regular sees:", this?.name); };
      const arrow   = ()       => { debugger; console.log("arrow sees:  ", this?.name); };
      regular();   // its OWN empty slot SHADOWS the outer one → undefined 💥
      arrow();     // no slot → the word `this` looked up outside → start's this → "Timer" ✓
    }
  };
  timer.start();
}
