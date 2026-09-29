document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Nav: solid background after scroll, mobile toggle
const nav = document.querySelector(".nav");
const burger = document.querySelector(".nav__burger");
const fab = document.querySelector(".fab");
const hero = document.querySelector(".hero");

const onScroll = () => {
  nav.classList.toggle("is-scrolled", window.scrollY > 20);
  fab.classList.toggle("is-visible", window.scrollY > hero.offsetHeight * 0.6);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

burger.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  burger.setAttribute("aria-expanded", open);
});
document.querySelectorAll(".nav__links a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  })
);

// Menu tabs
const tabs = document.querySelectorAll('[role="tab"]');
const panels = document.querySelectorAll(".menu__panel");
tabs.forEach((tab) =>
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.setAttribute("aria-selected", t === tab));
    panels.forEach((p) => {
      const active = p.dataset.panel === tab.dataset.tab;
      p.hidden = !active;
      p.classList.toggle("is-active", active);
    });
  })
);

// Reveal on scroll
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    }),
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 70}ms`;
  io.observe(el);
});

// Catering form — no backend yet: validate, then open the visitor's mail client
// Empty during the preview: the form validates but sends nothing. Set the real address at launch.
const CONTACT_EMAIL = "";
const form = document.getElementById("catering-form");
const status = form.querySelector(".form__status");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  let ok = true;
  form.querySelectorAll("[required]").forEach((input) => {
    const bad = !input.value.trim();
    input.classList.toggle("is-invalid", bad);
    if (bad) ok = false;
  });
  if (!ok) {
    status.className = "form__status";
    status.textContent = "Completează numele și telefonul, te rugăm.";
    return;
  }
  if (!CONTACT_EMAIL) {
    status.className = "form__status";
    status.textContent = "Formularul se activează odată cu lansarea site-ului.";
    return;
  }
  const d = Object.fromEntries(new FormData(form));
  const body = `Nume: ${d.nume}\nTelefon: ${d.telefon}\nData: ${d.data || "-"}\nInvitați: ${d.invitati || "-"}\n\n${d.detalii || ""}`;
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Cerere ofertă catering")}&body=${encodeURIComponent(body)}`;
  status.className = "form__status is-ok";
  status.textContent = "Mulțumim! Revenim cu o ofertă în 24 de ore.";
  form.reset();
});
form.addEventListener("input", (e) => e.target.classList.remove("is-invalid"));

document.getElementById("year").textContent = new Date().getFullYear();

// Hero embers — sparks rising off the grill
(() => {
  if (reduceMotion) return;
  const canvas = document.querySelector(".hero__embers");
  const ctx = canvas.getContext("2d");
  let w, h, dpr, sparks = [], running = true;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.offsetWidth; h = canvas.offsetHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const spawn = () => ({
    x: w * (0.45 + Math.random() * 0.55),
    y: h + 10,
    r: 0.8 + Math.random() * 2.2,
    vy: 0.5 + Math.random() * 1.4,
    vx: (Math.random() - 0.5) * 0.4,
    life: 0,
    max: 220 + Math.random() * 260,
    hue: 18 + Math.random() * 25,
    wob: Math.random() * Math.PI * 2,
  });

  const tick = () => {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    if (sparks.length < (w < 700 ? 40 : 90)) sparks.push(spawn());
    sparks = sparks.filter((s) => s.life < s.max && s.y > -20);
    for (const s of sparks) {
      s.life++;
      s.wob += 0.03;
      s.x += s.vx + Math.sin(s.wob) * 0.35;
      s.y -= s.vy;
      const a = Math.sin((s.life / s.max) * Math.PI);
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
      g.addColorStop(0, `hsla(${s.hue + 20}, 100%, 75%, ${a})`);
      g.addColorStop(0.4, `hsla(${s.hue}, 100%, 55%, ${a * 0.6})`);
      g.addColorStop(1, `hsla(${s.hue}, 100%, 50%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(tick);
  };

  resize();
  window.addEventListener("resize", resize);
  new IntersectionObserver(([e]) => {
    const was = running;
    running = e.isIntersecting;
    if (running && !was) tick();
  }).observe(canvas);
  tick();
})();
