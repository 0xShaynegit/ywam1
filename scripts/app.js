/* ============================================================
   YWAM Chiang Mai homepage interactions. Vanilla JS, zero deps.
   Parallax hero, staggered reveals, track filter + sheet dialog,
   count-up stats, quote carousel, multi-step micro-application.
   ============================================================ */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Hero: staggered word reveal ---------- */

  function splitWords(el, baseDelay) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    words.forEach(function (word, i) {
      var span = document.createElement("span");
      span.className = "word";
      span.textContent = word;
      span.style.setProperty("--word-delay", (baseDelay + i * 0.07) + "s");
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
  }

  if (!reducedMotion) {
    var kicker = document.getElementById("heroKicker");
    var title = document.getElementById("heroTitle");
    if (kicker) splitWords(kicker, 0.1);
    if (title) splitWords(title, 0.35);
  }

  /* ---------- Scroll: journey progress + header + parallax ---------- */

  var journeyBar = document.getElementById("journeyBar");
  var header = document.getElementById("siteHeader");
  var parallaxLayers = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var y = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (journeyBar && docHeight > 0) {
        journeyBar.style.width = Math.min(100, (y / docHeight) * 100) + "%";
      }

      if (header) {
        header.classList.toggle("is-scrolled", y > 24);
      }

      if (!reducedMotion && y < window.innerHeight * 1.2) {
        parallaxLayers.forEach(function (layer) {
          var speed = parseFloat(layer.getAttribute("data-parallax"));
          layer.style.transform = "translateY(" + (y * speed) + "px)";
        });
      }

      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll-triggered reveals with sibling stagger ---------- */

  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if ("IntersectionObserver" in window && !reducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = el.parentElement
          ? Array.prototype.slice.call(el.parentElement.children).filter(function (c) {
              return c.classList && c.classList.contains("reveal");
            })
          : [el];
        var index = siblings.indexOf(el);
        el.style.setProperty("--reveal-delay", (Math.max(0, index) * 0.1) + "s");
        el.classList.add("is-visible");
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -40px 0px" });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Count-up stats ---------- */

  var countEls = Array.prototype.slice.call(document.querySelectorAll(".count-up"));

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (reducedMotion || !window.requestAnimationFrame) {
      el.textContent = target.toLocaleString("en-US");
      return;
    }
    var duration = 1400;
    var start = null;
    function tick(ts) {
      if (!start) start = ts;
      var progress = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-US");
      if (progress < 1) window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    countEls.forEach(function (el) { countObserver.observe(el); });
  } else {
    countEls.forEach(animateCount);
  }

  /* ---------- Track filters ---------- */

  var filterChips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
  var trackCards = Array.prototype.slice.call(document.querySelectorAll(".track-card"));

  filterChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var filter = chip.getAttribute("data-filter");
      filterChips.forEach(function (c) {
        var active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-pressed", String(active));
      });
      trackCards.forEach(function (card) {
        var show = filter === "all" || card.getAttribute("data-category") === filter;
        card.classList.toggle("is-filtered", !show);
      });
    });
  });

  /* ---------- Expanded project sheets ---------- */

  var SHEETS = {
    dts: {
      title: "Discipleship Training School",
      duration: "5 months, full-time residential",
      mediaClass: "track-media-dts",
      desc: "Three months of intensive teaching, mentoring and community on campus in Chiang Mai, then two months of field ministry across Thailand and Southeast Asia. No prior church, theology or missions background required. This is the entry door for everything else on this page.",
      skill: "Character formation, hearing from God, cross-cultural teamwork, public communication.",
      impact: [
        "2-month outreach placement in a live field location",
        "Weekly service rotations with 15+ local ministries",
        "One-on-one mentoring for the full 5 months",
        "Alumni network across 47+ nations"
      ]
    },
    sofm: {
      title: "Frontier Missions & Strategy School",
      duration: "6 months, full-time",
      mediaClass: "track-media-sofm",
      desc: "Known inside YWAM as the School of Frontier Missions. You research the least-reached people groups on earth, learn mapping and strategy tools, and finish with a viable field plan you could actually run.",
      skill: "Strategic research, people-group analysis, partnership building, field logistics.",
      impact: [
        "Original research contributed to live field projects",
        "Survey trips into frontier regions of Southeast Asia",
        "Direct mentoring from long-term field workers",
        "A completed strategy document you present to real teams"
      ]
    },
    belt: {
      title: "Bible Education & Leadership Track",
      duration: "Gap-year track, 9-10 months",
      mediaClass: "track-media-belt",
      desc: "Known inside YWAM as BELT. A deep, book-by-book journey through scripture paired with hands-on leadership reps: teaching sessions, small-group facilitation and project ownership from month one.",
      skill: "Biblical literacy, inductive study method, teaching, team leadership.",
      impact: [
        "Teach real sessions to real audiences by graduation",
        "Lead a community project end to end",
        "Structured leadership feedback every fortnight",
        "Pathway into staff and teaching roles across the movement"
      ]
    },
    bam: {
      title: "Business as Mission Incubator",
      duration: "1-3 years, flexible entry",
      mediaClass: "track-media-bam",
      desc: "Known inside YWAM as BAM. Build a real, revenue-earning venture in Northern Thailand: cafes, design studios, agri-projects, social enterprises. Profit funds long-term presence and dignified local employment.",
      skill: "Entrepreneurship, operations, ethical supply chains, cross-cultural management.",
      impact: [
        "Launch or join a venture trading within 12 months",
        "Local jobs created in communities that need them",
        "Coaching from operators running businesses in Asia now",
        "A model that sustains impact without donor fatigue"
      ]
    },
    hoj: {
      title: "Home of Joy: Children's Home & Family Care",
      duration: "3-12 months, rolling intake",
      mediaClass: "track-media-hoj",
      desc: "A long-running residential care ministry for at-risk children in Chiang Mai. You join the daily rhythm of the home: education support, play, mealtimes, and the slow, unglamorous work of stable love.",
      skill: "Child development, trauma-informed care, family support, Thai language basics.",
      impact: [
        "Daily direct care shifts alongside trained Thai staff",
        "Education and homework support for school-age kids",
        "Family reintegration casework exposure",
        "Safeguarding training recognised across the network"
      ]
    },
    pva: {
      title: "Project Video Asia: Documentary & Film Studio",
      duration: "6-12 months, portfolio entry",
      mediaClass: "track-media-pva",
      desc: "A working production house telling untold stories across Southeast Asia. You shoot, edit and ship real projects for real ministries: documentaries, testimony films and training media used across the region.",
      skill: "Cinematography, editing, sound, documentary storytelling, client workflow.",
      impact: [
        "Shipped films in your portfolio, not spec work",
        "Field shoots across Thailand and neighbouring nations",
        "Stories that unlock funding and awareness for local teams",
        "Mentoring from working filmmakers on staff"
      ]
    }
  };

  var trackSheet = document.getElementById("trackSheet");
  var sheetTitle = document.getElementById("sheetTitle");
  var sheetDuration = document.getElementById("sheetDuration");
  var sheetDesc = document.getElementById("sheetDesc");
  var sheetSkill = document.getElementById("sheetSkill");
  var sheetImpact = document.getElementById("sheetImpact");
  var sheetMedia = document.getElementById("sheetMedia");

  function openSheet(key) {
    var data = SHEETS[key];
    if (!data || !trackSheet) return;
    sheetTitle.textContent = data.title;
    sheetDuration.textContent = data.duration;
    sheetDesc.textContent = data.desc;
    sheetSkill.textContent = data.skill;
    sheetMedia.className = "sheet-media " + data.mediaClass;
    sheetImpact.innerHTML = "";
    data.impact.forEach(function (item) {
      var li = document.createElement("li");
      li.textContent = item;
      sheetImpact.appendChild(li);
    });
    trackSheet.showModal();
  }

  trackCards.forEach(function (card) {
    var cta = card.querySelector(".track-cta");
    if (!cta) return;
    cta.addEventListener("click", function () {
      openSheet(card.getAttribute("data-sheet"));
    });
  });

  var sheetClose = document.getElementById("sheetClose");
  if (sheetClose && trackSheet) {
    sheetClose.addEventListener("click", function () { trackSheet.close(); });
    trackSheet.addEventListener("click", function (e) {
      if (e.target === trackSheet) trackSheet.close();
    });
  }

  var sheetCta = document.getElementById("sheetCta");
  if (sheetCta && trackSheet) {
    sheetCta.addEventListener("click", function () { trackSheet.close(); });
  }

  /* ---------- Video lightbox ---------- */

  var lightbox = document.getElementById("videoLightbox");
  var storiesBtn = document.getElementById("storiesBtn");
  var lightboxClose = document.getElementById("lightboxClose");

  if (storiesBtn && lightbox) {
    storiesBtn.addEventListener("click", function () { lightbox.showModal(); });
  }
  if (lightboxClose && lightbox) {
    lightboxClose.addEventListener("click", function () { closeLightbox(); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    lightbox.addEventListener("close", stopLightboxVideo);
  }

  function closeLightbox() {
    lightbox.close();
  }

  function stopLightboxVideo() {
    var video = lightbox.querySelector("video");
    if (video) video.pause();
  }

  /* ---------- Quote carousel ---------- */

  var quoteSlides = Array.prototype.slice.call(document.querySelectorAll(".quote-slide"));
  var quoteDotsWrap = document.getElementById("quoteDots");
  var quoteIndex = 0;
  var quoteTimer = null;

  function showQuote(index) {
    quoteIndex = (index + quoteSlides.length) % quoteSlides.length;
    quoteSlides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === quoteIndex);
    });
    if (quoteDotsWrap) {
      Array.prototype.slice.call(quoteDotsWrap.children).forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === quoteIndex);
        dot.setAttribute("aria-selected", String(i === quoteIndex));
      });
    }
  }

  function restartQuoteTimer() {
    if (reducedMotion) return;
    if (quoteTimer) window.clearInterval(quoteTimer);
    quoteTimer = window.setInterval(function () { showQuote(quoteIndex + 1); }, 7000);
  }

  if (quoteSlides.length && quoteDotsWrap) {
    quoteSlides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Story " + (i + 1) + " of " + quoteSlides.length);
      dot.addEventListener("click", function () {
        showQuote(i);
        restartQuoteTimer();
      });
      quoteDotsWrap.appendChild(dot);
    });

    var quotePrev = document.getElementById("quotePrev");
    var quoteNext = document.getElementById("quoteNext");
    if (quotePrev) quotePrev.addEventListener("click", function () { showQuote(quoteIndex - 1); restartQuoteTimer(); });
    if (quoteNext) quoteNext.addEventListener("click", function () { showQuote(quoteIndex + 1); restartQuoteTimer(); });

    showQuote(0);
    restartQuoteTimer();
  }

  /* ---------- Multi-step micro-application ---------- */

  var form = document.getElementById("microForm");

  if (form) {
    var steps = Array.prototype.slice.call(form.querySelectorAll(".form-step"));
    var dots = Array.prototype.slice.call(form.querySelectorAll(".form-dot"));
    var success = document.getElementById("formSuccess");

    function goToStep(n) {
      steps.forEach(function (step) {
        step.classList.toggle("is-active", step.getAttribute("data-step") === String(n));
      });
      dots.forEach(function (dot) {
        dot.classList.toggle("is-active", parseInt(dot.getAttribute("data-step-dot"), 10) <= n);
      });
      var active = form.querySelector('.form-step[data-step="' + n + '"]');
      if (active) {
        var firstField = active.querySelector("input, select");
        if (firstField) firstField.focus();
      }
    }

    function setInvalid(input, errorEl, invalid) {
      input.classList.toggle("is-invalid", invalid);
      input.setAttribute("aria-invalid", String(invalid));
      errorEl.hidden = !invalid;
    }

    function validateStep(n) {
      var valid = true;
      if (n === 1) {
        var name = document.getElementById("fieldName");
        var email = document.getElementById("fieldEmail");
        var nameBad = name.value.trim().length < 2;
        var emailBad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
        setInvalid(name, document.getElementById("errName"), nameBad);
        setInvalid(email, document.getElementById("errEmail"), emailBad);
        valid = !nameBad && !emailBad;
        if (nameBad) name.focus();
        else if (emailBad) email.focus();
      } else if (n === 2) {
        var passion = document.getElementById("fieldPassion");
        var passionBad = !passion.value;
        setInvalid(passion, document.getElementById("errPassion"), passionBad);
        valid = !passionBad;
        if (passionBad) passion.focus();
      } else if (n === 3) {
        var avail = document.getElementById("fieldAvailability");
        var availBad = !avail.value;
        setInvalid(avail, document.getElementById("errAvailability"), availBad);
        valid = !availBad;
        if (availBad) avail.focus();
      }
      return valid;
    }

    form.addEventListener("click", function (e) {
      var next = e.target.closest(".form-next");
      var back = e.target.closest(".form-back");
      if (next) {
        var current = parseInt(next.getAttribute("data-next"), 10) - 1;
        if (validateStep(current)) goToStep(parseInt(next.getAttribute("data-next"), 10));
      } else if (back) {
        goToStep(parseInt(back.getAttribute("data-back"), 10));
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateStep(3)) return;

      var submitBtn = document.getElementById("formSubmit");
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      /* Swap this timeout for a fetch() POST to your form endpoint
         (Cloudflare Pages Function, Formspark, etc.) before ship. */
      window.setTimeout(function () {
        steps.forEach(function (step) { step.classList.remove("is-active"); });
        form.querySelector(".form-progress").hidden = true;
        success.hidden = false;
        success.focus();
      }, 900);
    });
  }
})();
