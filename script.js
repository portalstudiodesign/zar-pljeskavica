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

// Mobile menu: opens with the burger; closes on a link, a tap anywhere outside it, or Escape.
const backdrop = document.querySelector(".nav-backdrop");
const setMenu = (open) => {
  nav.classList.toggle("is-open", open);
  backdrop.classList.toggle("is-visible", open);
  burger.setAttribute("aria-expanded", open);
};
burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
backdrop.addEventListener("click", () => setMenu(false));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("is-open")) {
    setMenu(false);
    burger.focus();
  }
});
document.querySelectorAll(".nav__links a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
// the menu only exists below 860px; don't leave the page dimmed after rotating / resizing
matchMedia("(min-width: 861px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

// Menu categories — sticky tab bar with a sliding pill, item counts, a "next
// category" card at the end of each panel, swipe on touch, and a one-time sweep
// across all tabs so visitors notice there is more than one category.
(() => {
  const tablist = document.querySelector(".tabs");
  const menuNav = document.querySelector(".menu__nav");
  const menu = document.querySelector(".menu");
  const pill = tablist.querySelector(".tabs__pill");
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls")));
  const names = tabs.map((t) => t.textContent.trim());
  const counts = panels.map((p) => p.querySelectorAll(".dish").length);
  let current = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
  let sweeping = null;

  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  tabs.forEach((t, i) => {
    t.insertAdjacentHTML("beforeend", `<span class="tabs__count" aria-hidden="true">${counts[i]}</span>`);
    t.setAttribute("aria-label", `${names[i]}, ${counts[i]} produse`);
  });

  panels.forEach((p, i) => {
    const n = (i + 1) % panels.length;
    const last = n === 0;
    const firstImg = panels[n].querySelector(".dish__img");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "menu__next";
    btn.innerHTML = `
      ${firstImg ? `<img class="menu__next-bg" src="${firstImg.getAttribute("src")}" alt="" loading="lazy">` : ""}
      <span class="menu__next-text">
        <span class="menu__next-label">${last ? "Ai văzut tot meniul · înapoi la" : "Urmează"}</span>
        <span class="menu__next-title">${names[n]}</span>
        <span class="menu__next-meta">${counts[n]} preparate</span>
      </span>
      <span class="menu__next-arrow" aria-hidden="true">${arrow}</span>`;
    btn.setAttribute("aria-label", `${last ? "Înapoi la" : "Următoarea categorie:"} ${names[n]}`);
    // move focus to the new tab only for keyboard users; a tap shouldn't leave a focus ring behind
    btn.addEventListener("click", () => select(n, { dir: last ? -1 : 1, focus: btn.matches(":focus-visible") }));
    p.append(btn);
  });

  const placePill = (i) => {
    const b = tabs[i];
    pill.style.width = `${b.offsetWidth}px`;
    pill.style.transform = `translateX(${b.offsetLeft}px)`;
  };

  const stickyTop = () => parseFloat(getComputedStyle(menuNav).top) || 0;

  // When the visitor is already deep in a long panel, jump back to the top of
  // the menu so the new category starts at its first card.
  const scrollToMenuStart = () => {
    const target = menu.getBoundingClientRect().top + window.scrollY - stickyTop() - menuNav.offsetHeight - 16;
    if (window.scrollY > target + 4) window.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" });
  };

  // Tapping a card selects it: it turns dark and reveals ingredients,
  // quantity and allergens. One card open at a time.
  let openDish = null;
  const setOpen = (d, open) => {
    d.classList.toggle("is-open", open);
    d.querySelector(".dish__more").setAttribute("aria-expanded", open);
    openDish = open ? d : openDish === d ? null : openDish;
  };
  panels.forEach((p) => p.querySelectorAll(".dish").forEach((d) => d.addEventListener("click", (e) => {
    // let people select text inside the open details without closing the card
    if (d.classList.contains("is-open") && e.target.closest(".dish__details")) return;
    const open = !d.classList.contains("is-open");
    if (openDish && openDish !== d) setOpen(openDish, false);
    setOpen(d, open);
    if (!open) return;
    // once it has grown, make sure the whole card is on screen
    setTimeout(() => {
      const r = d.getBoundingClientRect();
      // keep clear of the floating "Comandă" button on phones
      const fabEl = document.querySelector(".fab.is-visible");
      const reserved = fabEl && getComputedStyle(fabEl).display !== "none" ? window.innerHeight - fabEl.getBoundingClientRect().top + 12 : 16;
      const below = r.bottom - (window.innerHeight - reserved);
      // details matter more than the photo: the photo may slide under the bar, the title row may not
      const room = d.querySelector("h3").getBoundingClientRect().top - menuNav.getBoundingClientRect().bottom - 12;
      if (below > 0 && room > 0) window.scrollBy({ top: Math.min(below, room), behavior: reduceMotion ? "auto" : "smooth" });
    }, reduceMotion ? 0 : 470);
  })));

  function select(i, { dir = Math.sign(i - current) || 1, focus = false } = {}) {
    stopSweep();
    if (i === current) return;
    if (openDish) setOpen(openDish, false);
    tabs.forEach((t, k) => {
      const on = k === i;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p, k) => {
      p.hidden = k !== i;
      p.classList.toggle("is-active", k === i);
      p.classList.remove("is-entering");
    });
    const panel = panels[i];
    if (!reduceMotion) {
      panel.style.setProperty("--from", `${dir * 56}px`);
      [...panel.children].forEach((c, k) => c.style.setProperty("--i", Math.min(k, 8)));
      void panel.offsetWidth; // restart the animation
      panel.classList.add("is-entering");
    }
    current = i;
    placePill(i);
    scrollToMenuStart();
    if (focus) tabs[i].focus({ preventScroll: true });
  }

  tabs.forEach((t, i) => t.addEventListener("click", () => select(i)));
  panels.forEach((p) => p.addEventListener("animationend", (e) => { if (e.target.parentElement === p) p.classList.remove("is-entering"); }));

  // Arrow keys move between tabs (standard tablist behaviour).
  tablist.addEventListener("keydown", (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (e.key === "Home" || e.key === "End" || step) {
      e.preventDefault();
      const n = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (current + step + tabs.length) % tabs.length;
      select(n, { dir: step || (n > current ? 1 : -1), focus: true });
    }
  });

  // Swipe left / right on the cards to change category.
  let sx = 0, sy = 0, swiping = false;
  menu.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; swiping = true; }, { passive: true });
  menu.addEventListener("touchend", (e) => {
    if (!swiping) return;
    swiping = false;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
    const dir = dx < 0 ? 1 : -1;
    select((current + dir + tabs.length) % tabs.length, { dir });
  }, { passive: true });

  // Shadow under the bar once it is pinned.
  const onMenuScroll = () => menuNav.classList.toggle("is-stuck", menuNav.getBoundingClientRect().top <= stickyTop() + 0.5 && menu.getBoundingClientRect().bottom > stickyTop() + menuNav.offsetHeight);
  window.addEventListener("scroll", onMenuScroll, { passive: true });

  // One-time sweep: the pill visits every category, then comes back.
  function stopSweep() {
    if (!sweeping) return;
    sweeping.forEach(clearTimeout);
    sweeping = null;
    tablist.classList.remove("is-sweeping");
    tabs.forEach((t) => t.classList.remove("is-peek"));
    placePill(current);
  }
  const sweep = () => {
    if (reduceMotion) return;
    const order = [...tabs.keys()].filter((k) => k !== current).concat(current);
    sweeping = order.map((k, step) => setTimeout(() => {
      tablist.classList.toggle("is-sweeping", k !== current);
      tabs.forEach((t, j) => t.classList.toggle("is-peek", j === k && k !== current));
      placePill(k);
      if (step === order.length - 1) sweeping = null;
    }, 350 + step * 420));
  };
  const seen = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    seen.disconnect();
    sweep();
  }, { threshold: 1, rootMargin: "0px 0px -15% 0px" });

  const init = () => {
    placePill(current);
    requestAnimationFrame(() => tablist.classList.add("is-ready"));
    seen.observe(tablist);
  };
  window.addEventListener("resize", () => placePill(current));
  (document.fonts?.ready ?? Promise.resolve()).then(init);
})();

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
  let missingFields = false;
  form.querySelectorAll("[required]:not([type=checkbox])").forEach((input) => {
    const bad = !input.value.trim();
    input.classList.toggle("is-invalid", bad);
    if (bad) missingFields = true;
  });
  const consent = form.elements.acord;
  consent.closest(".form__consent").classList.toggle("is-invalid", !consent.checked);
  if (missingFields || !consent.checked) {
    status.className = "form__status";
    status.textContent = missingFields && !consent.checked
      ? "Completează numele și telefonul și bifează căsuța de acord de sub formular."
      : missingFields
        ? "Completează numele și telefonul, te rugăm."
        : "Bifează căsuța de acord: Termenii și condițiile și Politica de confidențialitate.";
    (form.querySelector(".is-invalid:not(label)") || consent).focus();
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
form.addEventListener("input", (e) => {
  e.target.classList.remove("is-invalid");
  if (e.target.type === "checkbox" && e.target.checked) e.target.closest(".form__consent").classList.remove("is-invalid");
});

document.getElementById("year").textContent = new Date().getFullYear();

// Marquee — the words are written once in the HTML; repeat the group until it
// covers the screen plus one extra period, then slide by exactly one group so
// the loop is seamless at any width (no empty red tail on wide monitors).
(() => {
  const track = document.querySelector(".marquee__track");
  if (!track) return;
  const group = track.querySelector(".marquee__group");
  const SPEED = 40; // px per second, the same on every screen size

  const build = () => {
    track.classList.remove("is-running");
    track.querySelectorAll(".marquee__group.is-clone").forEach((c) => c.remove());
    const period = group.getBoundingClientRect().width;
    if (!period) return;
    const copies = Math.ceil(track.parentElement.clientWidth / period) + 1;
    for (let i = 0; i < copies; i++) {
      const c = group.cloneNode(true);
      c.classList.add("is-clone");
      track.append(c);
    }
    track.style.setProperty("--marquee-shift", `${period}px`);
    track.style.setProperty("--marquee-dur", `${period / SPEED}s`);
    if (!reduceMotion) track.classList.add("is-running");
  };

  let lastW = 0, t;
  const onResize = () => {
    if (window.innerWidth === lastW) return; // ignore mobile address-bar height changes
    lastW = window.innerWidth;
    clearTimeout(t);
    t = setTimeout(build, 150);
  };
  (document.fonts?.ready ?? Promise.resolve()).then(() => { lastW = window.innerWidth; build(); });
  window.addEventListener("resize", onResize);
})();

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
