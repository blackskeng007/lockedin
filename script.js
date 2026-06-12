/* =============================================================
   LockedIn — script.js
   Vanilla JS: scroll progress, reveal, parallax, nav, form, demo
   ============================================================= */
   (function () {
    "use strict";
  
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  
    /* ---- Scroll progress bar ---- */
    const progress = document.getElementById("progress");
    const nav = document.getElementById("nav");
  
    function onScroll() {
      const h = document.documentElement;
      const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
      progress.style.width = (scrolled * 100) + "%";
      nav.classList.toggle("scrolled", h.scrollTop > 20);
    }
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  
    /* ---- Scroll reveal (IntersectionObserver) ---- */
    const revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && !reduceMotion) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-visible");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }
  
    /* ---- Parallax depth (requestAnimationFrame) ---- */
    const layers = Array.from(document.querySelectorAll("[data-parallax]"));
    let targetY = 0, currentY = 0, ticking = false;
  
    function updateParallax() {
      currentY += (targetY - currentY) * 0.08;
      layers.forEach((el) => {
        const depth = parseFloat(el.dataset.parallax) || 0;
        el.style.transform = "translate3d(0," + (currentY * depth * -1) + "px,0)";
      });
      if (Math.abs(targetY - currentY) > 0.4) {
        requestAnimationFrame(updateParallax);
      } else {
        ticking = false;
      }
    }
    if (layers.length && !reduceMotion) {
      document.addEventListener("scroll", () => {
        targetY = window.scrollY;
        if (!ticking) { ticking = true; requestAnimationFrame(updateParallax); }
      }, { passive: true });
    }
  
    /* ---- Pointer tilt on feature art ---- */
    if (!reduceMotion) {
      document.querySelectorAll("[data-tilt]").forEach((card) => {
        card.addEventListener("pointermove", (ev) => {
          const r = card.getBoundingClientRect();
          const px = (ev.clientX - r.left) / r.width - 0.5;
          const py = (ev.clientY - r.top) / r.height - 0.5;
          card.style.transform =
            "translateY(-6px) perspective(800px) rotateX(" + (-py * 5) + "deg) rotateY(" + (px * 6) + "deg)";
        });
        card.addEventListener("pointerleave", () => { card.style.transform = ""; });
      });
    }
  
    /* ---- Mobile nav ---- */
    const toggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
      navLinks.addEventListener("click", (e) => {
        if (e.target.tagName === "A") {
          nav.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }
  
    /* ---- Smooth scroll with nav offset ---- */
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
  
    /* ---- Hero StudyLock mini-demo (counts down, locks, resets) ---- */
    const timerEl = document.getElementById("heroTimer");
    const progEl = document.getElementById("heroProg");
    if (timerEl && progEl && !reduceMotion) {
      const TOTAL = 30 * 60;          // 30:00 goal
      let remaining = 17 * 60 + 42;   // start mid-session
      const C = 314;                  // circumference (2πr, r=50)
  
      function paint() {
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        timerEl.innerHTML =
          String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0") + "<span> left</span>";
        const done = (TOTAL - remaining) / TOTAL;
        progEl.style.strokeDashoffset = String(C - C * done);
      }
      paint();
      setInterval(() => {
        remaining -= 1;
        if (remaining < 0) remaining = 17 * 60 + 42; // loop the demo
        paint();
      }, 1000);
    }
  
    /* ---- Waitlist form ---- */
    const joinBtn = document.getElementById("joinBtn");
    const formView = document.getElementById("formView");
    const successView = document.getElementById("successView");
    if (joinBtn) {
      joinBtn.addEventListener("click", () => {
        const email = document.getElementById("email");
        const name = document.getElementById("name");
        const ok = (val) => val && val.value.trim().length > 0;
        const validEmail = email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value);
  
        [name, email].forEach((f) => { if (f) f.style.borderColor = ""; });
        if (!ok(name)) { name.style.borderColor = "#ff5d73"; name.focus(); return; }
        if (!validEmail) { email.style.borderColor = "#ff5d73"; email.focus(); return; }
  
        // In production: POST to your waitlist endpoint here.
        formView.style.display = "none";
        successView.classList.add("show");
      });
    }
  })();