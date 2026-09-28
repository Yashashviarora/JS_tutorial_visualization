// fetch in DevTools — set your own breakpoints in the Sources tab
// (click a line number; a blue marker appears)

const GITHUB_API = "https://api.github.com/users/akshaymarch7";
const $ = (id) => document.getElementById(id);

/* STEP 1: the promise is pending when logged, fulfilled when expanded later */
$("step1").onclick = () => {
  console.log("%c── Step 1 ──", "color:#7c9eff;font-weight:bold");
  const user = fetch(GITHUB_API);
  console.log(user);
  console.log("↑ expand the arrow on that promise now");
  setTimeout(() => {
    console.log("1.5s later, the same promise:", user);
  }, 1500);
};

/* STEP 2: same fetch, meant to be watched in the Network tab */
$("step2").onclick = () => {
  console.log("%c── Step 2 ──", "color:#7c9eff;font-weight:bold");
  console.log("sending request… (look at the Network tab)");
  fetch(GITHUB_API).then((response) => {
    console.log("response arrived with status", response.status);
  });
  console.log("this line ran BEFORE the response arrived");
};

/* STEP 3: put YOUR breakpoints here */
$("step3").onclick = () => {
  console.log("%c── Step 3 ──", "color:#7c9eff;font-weight:bold");
  const user = fetch(GITHUB_API);                          // breakpoint A: before the request
  user.then(function (data) {
    console.log(data);                                     // breakpoint B: inside .then
  });
  console.log("button handler finished; .then will run later");   // breakpoint C
};

/* STEP 4: two promises (response, then body) */
$("step4").onclick = () => {
  console.log("%c── Step 4 ──", "color:#7c9eff;font-weight:bold");
  fetch(GITHUB_API)
    .then((response) => response.json())
    .then((data) => {
      console.log(data.name, "has", data.followers, "followers");
      console.log(data);
      $("avatar").src = data.avatar_url;
      $("name").textContent = data.name;
      $("meta").textContent = `@${data.login} · ${data.public_repos} public repos · ${data.followers} followers`;
      $("card").style.display = "flex";
    })
    .catch((err) => console.error("failed:", err));
};

/* STEP 5: 404 resolves, offline rejects */
$("step5a").onclick = () => {
  console.log("%c── Step 5: 404 ──", "color:#f87171;font-weight:bold");
  const p = fetch("https://api.github.com/users/this-user-should-not-exist-9x7q2");
  p.then((res) => console.log("FULFILLED, not rejected. ok =", res.ok, "status =", res.status))
   .catch((err) => console.log("rejected:", err));
};
$("step5b").onclick = () => {
  console.log("%c── Step 5: offline ──", "color:#f87171;font-weight:bold");
  fetch(GITHUB_API)
    .then((res) => console.log("fulfilled with status", res.status, "(did you set the Network tab to Offline?)"))
    .catch((err) => console.log("REJECTED →", err.name + ": " + err.message));
};
