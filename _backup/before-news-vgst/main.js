/* ============================================================
   DEAR Lab — Site behaviour
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initMenu();
  initReveal();
  initLightbox();
  initModal();
  initLogoFallback();
});

/* --- Nav: solid once scrolled, or immediately on inner pages --- */
function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const hero = document.querySelector('.hero');
  if (!hero) { nav.classList.add('nav--onpaper'); return; }

  const sync = () => nav.classList.toggle('nav--onpaper', window.scrollY > window.innerHeight * 0.75);
  window.addEventListener('scroll', sync, { passive: true });
  sync();
}

/* --- Mobile menu --- */
function initMenu() {
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.querySelector('.nav__menu');
  const scrim = document.querySelector('.nav__scrim');
  if (!toggle || !menu) return;

  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    scrim && scrim.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    if (open) { close(); return; }
    toggle.setAttribute('aria-expanded', 'true');
    menu.classList.add('is-open');
    scrim && scrim.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });

  scrim && scrim.addEventListener('click', close);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* --- Scroll reveal --- */
function initReveal() {
  const items = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!items.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

  items.forEach(el => io.observe(el));
}

/* --- Lightbox for figures and gallery tiles --- */
function initLightbox() {
  const box = document.querySelector('.lightbox');
  if (!box) return;

  const img = box.querySelector('img');
  const close = box.querySelector('.lightbox__close');
  const triggers = document.querySelectorAll('[data-lightbox]');
  if (!triggers.length || !img) return;

  const shut = () => {
    box.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  triggers.forEach(t => {
    const open = () => {
      const source = t.querySelector('img');
      if (!source) return;
      img.src = source.currentSrc || source.src;
      img.alt = source.alt || '';
      box.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      close && close.focus();
    };
    t.addEventListener('click', open);
    t.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });

  close && close.addEventListener('click', shut);
  box.addEventListener('click', e => { if (e.target === box) shut(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && box.classList.contains('is-open')) shut();
  });
}

/* --- Team member profile modal --- */
function initModal() {
  const modal = document.querySelector('.modal');
  const cards = document.querySelectorAll('[data-member]');
  if (!modal || !cards.length) return;

  const panel = modal.querySelector('.modal__panel');
  const photo = modal.querySelector('[data-modal-photo]');
  const name  = modal.querySelector('[data-modal-name]');
  const role  = modal.querySelector('[data-modal-role]');
  const bio   = modal.querySelector('[data-modal-bio]');
  const close = modal.querySelector('.modal__close');
  let last = null;

  const shut = () => {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    last && last.focus();
  };

  cards.forEach(card => {
    const open = () => {
      last = card;
      if (name) name.textContent = card.dataset.name || '';
      if (role) role.textContent = card.dataset.role || '';
      if (bio) {
        const paras = (card.dataset.bio || '').split(/\n\s*\n/).filter(s => s.trim());
        bio.replaceChildren(...paras.map(s => {
          const p = document.createElement('p');
          s = s.trim();
          if (s.startsWith('> ')) { p.className = 'modal__quote'; s = s.slice(2); }
          p.textContent = s;
          return p;
        }));
      }
      const affil = modal.querySelector('[data-modal-affil]');
      if (affil) { affil.textContent = card.dataset.affil || ''; affil.hidden = !card.dataset.affil; }
      const links = modal.querySelector('[data-modal-links]');
      if (links) {
        const items = (card.dataset.links || '').split(';;').filter(Boolean).map((pair, i) => {
          const [label, href] = pair.split('|');
          const a = document.createElement('a');
          a.href = href; a.textContent = label; a.target = '_blank'; a.rel = 'noopener noreferrer';
          a.className = 'btn btn--sm ' + (i === 0 ? 'btn--primary' : 'btn--outline');
          return a;
        });
        links.replaceChildren(...items); links.hidden = !items.length;
      }
      if (panel) panel.scrollTop = 0;
      if (photo) {
        const src = card.dataset.photo;
        if (src) { photo.src = src; photo.alt = card.dataset.name || ''; photo.hidden = false; }
        else { photo.hidden = true; }
      }
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      close && close.focus();
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });

  close && close.addEventListener('click', shut);
  modal.addEventListener('click', e => { if (panel && !panel.contains(e.target)) shut(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) shut();
  });
}

/* --- Logo wall: swap to the name plate when no logo file is present --- */
function initLogoFallback() {
  document.querySelectorAll('.logo-wall__cell img').forEach(img => {
    const cell = img.closest('.logo-wall__cell');
    const fail = () => {
      const plate = cell && cell.querySelector('.logo-wall__plate');
      if (plate) plate.hidden = false;
      img.remove();
    };
    const ok = () => img.classList.add('is-loaded');
    if (img.complete) { img.naturalWidth === 0 ? fail() : ok(); }
    img.addEventListener('error', fail);
    img.addEventListener('load', ok);
  });
}
