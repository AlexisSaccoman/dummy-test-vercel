/**
 * SWIM & RUN CLERMONT-FERRAND — OFFICIAL SCRIPT
 * Clermont Triathlon (Auvergne, France)
 * 
 * Vanilla JavaScript (ES6+)
 * Modules:
 * 1. Navigation & Mobile Drawer
 * 2. Active Section Spy & Header Scroll Effect
 * 3. FAQ Accordion (Accessible & Animated)
 * 4. IntersectionObserver Scroll Reveal
 * 5. Animated Number Counters
 * 6. Countdown Timer
 * 7. Registration Simulation Modal
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initHeaderAndNav();
  initFaqAccordion();
  initScrollReveal();
  initStatsCounter();
  initCountdown();
  initRegistrationModal();
  initLegalTriggers();
});

/* ==========================================================================
   1. NAVIGATION & MOBILE DRAWER
   ========================================================================== */
function initHeaderAndNav() {
  const header = document.getElementById('site-header');
  const toggleBtn = document.getElementById('mobile-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const desktopLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Scroll effect for sticky header
  function handleScroll() {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active Section Spy
    const scrollPosition = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPosition >= top && scrollPosition < top + height) {
        desktopLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial run

  // Toggle Mobile Menu
  function toggleMobileMenu(isOpen) {
    const shouldOpen = typeof isOpen === 'boolean' ? isOpen : !mobileNav.classList.contains('open');
    if (shouldOpen) {
      mobileNav.classList.add('open');
      toggleBtn.classList.add('is-active');
      toggleBtn.setAttribute('aria-expanded', 'true');
      mobileNav.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; // Lock background scroll
    } else {
      mobileNav.classList.remove('open');
      toggleBtn.classList.remove('is-active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if (toggleBtn && mobileNav) {
    toggleBtn.addEventListener('click', () => toggleMobileMenu());

    // Close mobile menu when clicking any link
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => toggleMobileMenu(false));
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        toggleMobileMenu(false);
      }
    });
  }
}

/* ==========================================================================
   2. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const button = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!button || !answer) return;

    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';

      // Close all items
      faqItems.forEach(otherItem => {
        const otherBtn = otherItem.querySelector('.faq-question');
        const otherAns = otherItem.querySelector('.faq-answer');
        if (otherBtn && otherAns) {
          otherItem.classList.remove('active');
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAns.style.maxHeight = null;
        }
      });

      // Toggle current item
      if (!isExpanded) {
        item.classList.add('active');
        button.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ==========================================================================
   3. INTERSECTION OBSERVER SCROLL REVEAL
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('[data-reveal]');

  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    revealElements.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.12
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target); // Animate once
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   4. ANIMATED STATS COUNTERS
   ========================================================================== */
function initStatsCounter() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  let hasAnimated = false;

  function runCounters() {
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      if (isNaN(target)) return;

      const duration = 1600; // ms
      const startTime = performance.now();

      function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing: easeOutExpo
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = Math.floor(ease * target);

        counter.textContent = currentVal.toLocaleString('fr-FR');

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          counter.textContent = target.toLocaleString('fr-FR');
        }
      }

      requestAnimationFrame(updateNumber);
    });
  }

  if ('IntersectionObserver' in window) {
    const statsSection = document.querySelector('.stats-strip');
    if (!statsSection) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasAnimated) {
        hasAnimated = true;
        runCounters();
        observer.disconnect();
      }
    }, { threshold: 0.25 });

    observer.observe(statsSection);
  } else {
    runCounters();
  }
}

/* ==========================================================================
   5. COUNTDOWN TIMER (DAYS, HOURS, MINUTES, SECONDS)
   ========================================================================== */
function initCountdown() {
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  // Target date: 45 days from current simulated reference
  // Keep it dynamic so it always ticks realistically
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 45);
  targetDate.setHours(targetDate.getHours() + 12);
  targetDate.setMinutes(targetDate.getMinutes() + 30);

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = days.toString().padStart(2, '0');
    hoursEl.textContent = hours.toString().padStart(2, '0');
    minutesEl.textContent = minutes.toString().padStart(2, '0');
    secondsEl.textContent = seconds.toString().padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================================================
   6. REGISTRATION SIMULATION MODAL
   ========================================================================== */
function initRegistrationModal() {
  const modal = document.getElementById('register-modal');
  const openBtn = document.getElementById('open-register-modal-btn');
  const closeBtn = document.getElementById('close-register-modal-btn');
  const formatSelect = document.getElementById('form-format');
  const regForm = document.getElementById('register-form');
  const feedback = document.getElementById('form-feedback');
  const formatButtons = document.querySelectorAll('.format-btn');

  if (!modal) return;

  function openModal(selectedFormat) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Auto-select format if provided from card
    if (selectedFormat && formatSelect) {
      const cleanVal = selectedFormat.toLowerCase();
      if (cleanVal.includes('découverte') || cleanVal.includes('decouverte')) {
        formatSelect.value = 'decouverte';
      } else if (cleanVal.includes('sprint')) {
        formatSelect.value = 'sprint';
      } else if (cleanVal.includes('longue')) {
        formatSelect.value = 'longue';
      }
    }

    // Reset feedback
    if (feedback) {
      feedback.style.display = 'none';
      feedback.className = 'form-feedback';
    }
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (openBtn) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }

  // Also bind "Sélectionner ce format" buttons on format cards
  formatButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const formatName = btn.getAttribute('data-format');
      openModal(formatName);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Handle Form Submission
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const firstNameInput = document.getElementById('form-firstname');
      const formatName = formatSelect.options[formatSelect.selectedIndex].text;
      const firstName = firstNameInput ? firstNameInput.value.trim() : 'Athlète';

      if (feedback) {
        feedback.className = 'form-feedback success';
        feedback.textContent = `Félicitations ${firstName} ! Votre demande pour le ${formatName} a été enregistrée avec succès (Simulation officielle). Vous recevrez le dossier complet par email.`;
        feedback.style.display = 'block';

        // Auto-close after 3 seconds
        setTimeout(() => {
          closeModal();
          regForm.reset();
        }, 3200);
      }
    });
  }
}

/* ==========================================================================
   7. LEGAL & INFORMATIONAL MODALS
   ========================================================================== */
function initLegalTriggers() {
  const triggers = [
    {
      id: 'legal-modal-trigger',
      title: 'Mentions Légales',
      msg: 'Clermont Triathlon — Association loi 1901 affiliée à la Fédération Française de Triathlon (FFTRI n° 0463).\nSiège social : Maison des Sports, 63000 Clermont-Ferrand, France.\nDirecteur de publication : Président du Clermont Triathlon.\nHébergement : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723.\nSite web réalisé à titre de démonstration technique officielle.'
    },
    {
      id: 'privacy-trigger',
      title: 'Politique de Confidentialité',
      msg: 'Conformément au RGPD et à la loi Informatique et Libertés :\nAucune donnée personnelle n\'est collectée à des fins commerciales ni revendue à des tiers. Les formulaires de cette démonstration sont exécutés strictement en mémoire locale dans votre navigateur.'
    },
    {
      id: 'rules-trigger',
      title: 'Règlement de Course FFTRI',
      msg: 'Règles essentielles du Swim & Run :\n1. Tout le matériel emporté au départ doit être conservé jusqu\'à la ligne d\'arrivée (pas d\'abandon d\'équipement en cours de route).\n2. En binôme Duo, l\'écart maximal autorisé est de 10m en nage et 5m en course.\n3. Port du bonnet officiel et sifflet obligatoire.\n4. Zéro déchet : élimination immédiate en cas de jet de détritus sur les sentiers des Volcans.'
    }
  ];

  triggers.forEach(t => {
    const el = document.getElementById(t.id);
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        alert(`[${t.title}]\n\n${t.msg}`);
      });
    }
  });
}
