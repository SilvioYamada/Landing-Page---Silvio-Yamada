// Clean, minimal JS: error catcher, menu, slider, observers, i18n (basic)
// Temporary error catcher (visible overlay)
window.addEventListener('error', function (e) {
  console.error('Captured error:', e.message, e.filename + ':' + e.lineno + ':' + e.colno);
  try {
    const existing = document.getElementById('js-error-capture');
    if (existing) existing.remove();
    const pre = document.createElement('pre');
    pre.id = 'js-error-capture';
    pre.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99999;background:#fff;color:#000;padding:10px;max-width:96%;max-height:40vh;overflow:auto;border-radius:6px;font-size:12px;box-shadow:0 6px 20px rgba(0,0,0,0.4);';
    pre.textContent = 'Error: ' + e.message + '\nFile: ' + e.filename + ':' + e.lineno + ':' + e.colno + '\n' + (e.error && e.error.stack ? e.error.stack : '');
    if (document.body) document.body.appendChild(pre);
  } catch (err) {}
});

window.addEventListener('unhandledrejection', function (ev) {
  console.error('Unhandled promise rejection', ev.reason);
  try {
    const existing = document.getElementById('js-error-capture');
    if (existing) existing.remove();
    const pre = document.createElement('pre');
    pre.id = 'js-error-capture';
    pre.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99999;background:#fff;color:#000;padding:10px;max-width:96%;max-height:40vh;overflow:auto;border-radius:6px;font-size:12px;box-shadow:0 6px 20px rgba(0,0,0,0.4);';
    pre.textContent = 'UnhandledRejection: ' + String(ev.reason);
    if (document.body) document.body.appendChild(pre);
  } catch (err) {}
});

document.addEventListener('DOMContentLoaded', function () {
  initPortfolioSlider();
  initScrollAnimations();
  initNavScrollSpy();
  initMenu();
  initLangButtons();
});

function initPortfolioSlider() {
  const sliderContainer = document.getElementById("portfolioSlider");
  if (!sliderContainer) return;

  const track = sliderContainer.querySelector(".slider-track");
  const slides = sliderContainer.querySelectorAll(".slider-slide");
  const prevBtn = sliderContainer.querySelector(".prev-btn");
  const nextBtn = sliderContainer.querySelector(".next-btn");
  const indicatorsContainer =
    sliderContainer.querySelector(".slider-indicators");
  const view = sliderContainer.querySelector(".slider-main-view");

  let currentSlideIndex = 0;
  const totalSlides = slides.length;
  let slideWidth = 0;

  // Aplicar background blur apenas no slide de mídia social
  const midiaSocialSlide = sliderContainer.querySelector(
    ".midia-social-slide"
  );
  if (midiaSocialSlide) {
    const img = midiaSocialSlide.querySelector("img");
    if (img) {
      const imgSrc = img.getAttribute("src");
      midiaSocialSlide.style.setProperty(
        "--bg-image",
        `url('${imgSrc}')`
      );
    }
  }

  function adjustDimensions() {
    slideWidth = view.clientWidth;
    slides.forEach((slide) => {
      slide.style.width = `${slideWidth}px`;
    });
    track.style.width = `${slideWidth * totalSlides}px`;
    updateSliderPosition(false);
  }

  function updateSliderPosition(animate = true) {
    const offset = -currentSlideIndex * slideWidth;
    track.style.transform = `translateX(${offset}px)`;
    track.style.transition = animate
      ? "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)"
      : "none";
    updateIndicators();
  }

  function goToNextSlide() {
    currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
    updateSliderPosition();
  }

  function goToPrevSlide() {
    currentSlideIndex =
      (currentSlideIndex - 1 + totalSlides) % totalSlides;
    updateSliderPosition();
  }

  function createIndicators() {
    indicatorsContainer.innerHTML = "";
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement("span");
      dot.classList.add("indicator-dot");
      dot.setAttribute("data-index", i);
      dot.addEventListener("click", () => {
        currentSlideIndex = i;
        updateSliderPosition();
      });
      indicatorsContainer.appendChild(dot);
    }
  }

  function updateIndicators() {
    indicatorsContainer
      .querySelectorAll(".indicator-dot")
      .forEach((dot, index) => {
        dot.classList.toggle("active", index === currentSlideIndex);
      });
  }

  createIndicators();
  adjustDimensions();

  prevBtn.addEventListener("click", goToPrevSlide);
  nextBtn.addEventListener("click", goToNextSlide);

  window.addEventListener("resize", () => {
    adjustDimensions();
  });

  let startX = 0;
  view.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  view.addEventListener("touchend", (e) => {
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX;

    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        goToPrevSlide();
      } else {
        goToNextSlide();
      }
    }
  });
}

function initScrollAnimations() {
  const sections = document.querySelectorAll(".fade-in-section");

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    observer.observe(section);
  });
}

function initNavScrollSpy() {
  const sections = document.querySelectorAll("main section");
  const navLinks = document.querySelectorAll("nav ul li a");

  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -50% 0px",
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    observer.observe(section);
  });
}

// --- Menu Hamburger ---
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("nav");
const menuOverlay = document.querySelector(".menu-overlay");
const navLinks = document.querySelectorAll("nav ul li a");

// Accessibility / focus trap variables
let previousActiveElement = null;
let focusableElements = [];
let firstFocusable = null;
let lastFocusable = null;
let focusTrapHandler = null;

function openMenu() {
  previousActiveElement = document.activeElement;
  menuToggle.classList.add("active");
  nav.classList.add("active");
  menuOverlay.classList.add("active");
  menuToggle.setAttribute("aria-expanded", "true");
  nav.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  // setup focusable elements inside nav
  focusableElements = Array.from(
    nav.querySelectorAll(
      'a, button, input, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hasAttribute("disabled"));
  firstFocusable = focusableElements[0] || nav;
  lastFocusable = focusableElements[focusableElements.length - 1] || nav;

  // focus first
  (firstFocusable || nav).focus();

  // trap focus
  focusTrapHandler = function (e) {
    if (e.key === "Tab") {
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    } else if (e.key === "Escape") {
      closeMenu();
    }
  };

  document.addEventListener("keydown", focusTrapHandler);
}

function closeMenu() {
  menuToggle.classList.remove("active");
  nav.classList.remove("active");
  menuOverlay.classList.remove("active");
  menuToggle.setAttribute("aria-expanded", "false");
  nav.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  try {
    document.removeEventListener("keydown", focusTrapHandler);
  } catch (e) {}

  focusTrapHandler = null;

  // restore focus
  if (previousActiveElement && typeof previousActiveElement.focus === "function") {
    previousActiveElement.focus();
  }
}

// toggle opens/closes (guarded)
if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    if (nav.classList.contains("active")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close the menu when clicking a nav link (attach defensively)
  if (navLinks && navLinks.length) {
    navLinks.forEach((link) => {
      try { link.addEventListener("click", closeMenu); } catch (e) {}
    });
  }

  // Close the menu when clicking the overlay
  if (menuOverlay) {
    menuOverlay.addEventListener("click", closeMenu);
  }
} else {
  // Defensive fallback: if elements missing, no-op
  console.warn("Menu elements not found: menuToggle or nav missing.");
}

// (nav-close removed) close handled via overlay and links

// --- Tradução (i18n) ---
const TRANSLATIONS = {
  pt: {
    "nav.home": "Inicial",
    "nav.about": "Sobre",
    "nav.portfolio": "Portfólio",
    "nav.experience": "Experiência",
    "nav.contact": "Contato",
    "hero.title": "Olá, eu sou Silvio. <br />Eu transformo complexidade em experiências digitais que geram resultados.",
    "hero.subtitle": "Com 17 anos de experiência, meu foco é criar soluções que unem as necessidades dos usuários aos objetivos do seu negócio.",
    "section.what": "O que eu trago para a mesa",
    "portfolio.title": "Portfólio Seletivo",
    "experience.title": "Experiência Comprovada",
    "btn.view": "Ver Site",
    "contact.title": "Vamos Transformar Seus Desafios em Sucesso?"
  },
  en: {
    "nav.home": "Home",
    "nav.about": "About",
    "nav.portfolio": "Portfolio",
    "nav.experience": "Experience",
    "nav.contact": "Contact",
    "hero.title": "Hi, I'm Silvio.",
    "hero.subtitle": "Designer & Full-Stack Developer",
    "portfolio.title": "Selected Portfolio",
    "experience.title": "Proven Experience",
    "btn.view": "View Site",
    "contact.title": "Ready to Turn Your Challenges into Success?"
  }
};

function applyTranslations(lang) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.pt;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    const val = dict[key];
    if (typeof val !== 'undefined') el.innerHTML = val;
  });
  document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
    const key = el.getAttribute('data-i18n-alt');
    if (!key) return;
    const val = dict[key];
    if (typeof val !== 'undefined') el.setAttribute('alt', val);
  });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (!key) return;
    const val = dict[key];
    if (typeof val !== 'undefined') el.setAttribute('title', val);
  });
  document.documentElement.lang = (lang === 'pt' ? 'pt-br' : 'en');
  try { localStorage.setItem('site_lang', lang); } catch (e) {}
}

function initLangButtons() {
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      const lang = btn.getAttribute('data-lang') || 'pt';
      applyTranslations(lang);
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-lang') === lang));
    });
  });
  const saved = (function () { try { return localStorage.getItem('site_lang'); } catch (e) { return null; } })();
  applyTranslations(saved || (navigator.language && navigator.language.startsWith('en') ? 'en' : 'pt'));
}