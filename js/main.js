/* Rolf Royer — site behavior (vanilla JS, no dependencies) */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Header scroll state ---- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Mobile navigation ---- */
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (navToggle && mobileNav) {
    var closeNav = function () {
      navToggle.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('is-open');
      document.body.classList.remove('nav-open');
    };
    var openNav = function () {
      navToggle.setAttribute('aria-expanded', 'true');
      mobileNav.classList.add('is-open');
      document.body.classList.add('nav-open');
    };
    navToggle.addEventListener('click', function () {
      var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeNav() : openNav();
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ---- Active nav link ---- */
  var currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-primary a[href], .mobile-nav a[href]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      a.classList.add('is-active');
      a.setAttribute('aria-current', 'page');
    }
  });

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---- Chiffres qui défilent (compteur au scroll) ---- */
  var countEls = document.querySelectorAll('.stat-count[data-count-to]');
  if (countEls.length) {
    var runCount = function (el) {
      var target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
      if (reduceMotion) { el.textContent = target; return; }
      var duration = 1400;
      var start = null;
      var easeOutExpo = function (t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); };
      var step = function (ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        el.textContent = Math.round(easeOutExpo(progress) * target);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) {
      countEls.forEach(runCount);
    } else {
      var countIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCount(entry.target);
            countIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      countEls.forEach(function (el) { countIo.observe(el); });
    }
  }

  /* ---- FAQ / generic accordion ---- */
  document.querySelectorAll('.accordion-item').forEach(function (item) {
    var trigger = item.querySelector('.accordion-item__trigger');
    var panel = item.querySelector('.accordion-item__panel');
    if (!trigger || !panel) return;

    item.setAttribute('data-open', 'false');
    panel.style.maxHeight = '0px';

    trigger.addEventListener('click', function () {
      var isOpen = item.getAttribute('data-open') === 'true';

      if (!isOpen) {
        item.closest('.accordion').querySelectorAll('.accordion-item[data-open="true"]').forEach(function (openItem) {
          if (openItem !== item) {
            openItem.setAttribute('data-open', 'false');
            openItem.querySelector('.accordion-item__trigger').setAttribute('aria-expanded', 'false');
            openItem.querySelector('.accordion-item__panel').style.maxHeight = '0px';
          }
        });
      }

      item.setAttribute('data-open', String(!isOpen));
      trigger.setAttribute('aria-expanded', String(!isOpen));
      panel.style.maxHeight = !isOpen ? panel.scrollHeight + 'px' : '0px';
    });
  });

  /* ---- Contact form: mailto fallback ---- */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('form-status');
      var data = new FormData(contactForm);

      var required = ['prenom', 'nom', 'email', 'enjeu', 'rgpd'];
      var missing = required.filter(function (key) {
        var field = contactForm.elements[key];
        if (field && field.type === 'checkbox') return !field.checked;
        return !String(data.get(key) || '').trim();
      });

      if (missing.length) {
        if (status) {
          status.textContent = 'Merci de renseigner les champs obligatoires avant l’envoi.';
          status.setAttribute('data-state', 'error');
        }
        return;
      }

      var lines = [
        'Nom : ' + data.get('prenom') + ' ' + data.get('nom'),
        'Fonction : ' + (data.get('fonction') || '—'),
        'Entreprise : ' + (data.get('entreprise') || '—'),
        'Email : ' + data.get('email'),
        'Téléphone : ' + (data.get('telephone') || '—'),
        'Situation actuelle : ' + (data.get('situation') || '—'),
        'Échéance / urgence : ' + (data.get('echeance') || '—'),
        'Préférence : ' + (data.get('modalite') || '—'),
        '',
        'Enjeu principal :',
        data.get('enjeu')
      ];

      var subject = encodeURIComponent('Demande d’échange confidentiel — ' + data.get('prenom') + ' ' + data.get('nom'));
      var body = encodeURIComponent(lines.join('\n'));
      var mailto = 'mailto:rolf.royer@visconti.partners?subject=' + subject + '&body=' + body;

      if (status) {
        status.textContent = 'Votre messagerie va s’ouvrir pour finaliser l’envoi à rolf.royer@visconti.partners.';
        status.setAttribute('data-state', 'success');
      }

      window.location.href = mailto;
    });
  }

  /* ---- Set current year in footer ---- */
  document.querySelectorAll('[data-current-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- Character counter for the "enjeu" field ---- */
  var enjeuField = document.getElementById('enjeu');
  var enjeuCount = document.getElementById('enjeu-count');
  if (enjeuField && enjeuCount) {
    var updateCount = function () {
      enjeuCount.textContent = enjeuField.value.length + ' / 500';
    };
    updateCount();
    enjeuField.addEventListener('input', updateCount);
  }
})();
