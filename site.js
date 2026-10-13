const easeInOutQuint = progress => progress < 0.5 ? 16 * progress ** 5 : 1 - Math.pow(-2 * progress + 2, 5) / 2;
let scrollFrame = 0;

function cancelTopScroll() {
  cancelAnimationFrame(scrollFrame);
  scrollFrame = 0;
}

function finishTopScroll() {
  scrollFrame = 0;
  document.querySelector('header a')?.focus({ preventScroll: true });
}

function scrollToTop() {
  cancelTopScroll();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    scrollTo({ top: 0, behavior: 'auto' });
    finishTopScroll();
    return;
  }

  const start = scrollY;
  const duration = Math.min(1400, Math.max(600, start * 0.45));
  const startedAt = performance.now();

  function animate(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    scrollTo({ top: start * (1 - easeInOutQuint(progress)), behavior: 'auto' });
    if (progress < 1) scrollFrame = requestAnimationFrame(animate);
    else finishTopScroll();
  }

  scrollFrame = requestAnimationFrame(animate);
}

document.querySelectorAll('.back-to-top').forEach(link => {
  link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    scrollToTop();
  });
});

['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(type => {
  document.addEventListener(type, cancelTopScroll, { passive: true });
});



// Logo Hover Typewriter
const logo = document.getElementById('logo-text');
if (logo) {
  const prefix = "RAFAEL ";
  const baseText = "MAPA";
  let typingTimer;
  let prefixLen = 0; // Current typed length of the prefix

  function typeEffect(targetLen) {
    clearInterval(typingTimer);
    typingTimer = setInterval(() => {
      if (prefixLen !== targetLen) {
        if (prefixLen < targetLen) {
          prefixLen++;
        } else {
          prefixLen--;
        }
        logo.textContent = `[ ${prefix.slice(0, prefixLen)}${baseText} ]`;
      } else {
        clearInterval(typingTimer);
      }
    }, 40);
  }

  logo.addEventListener('mouseenter', () => typeEffect(prefix.length));
  logo.addEventListener('mouseleave', () => typeEffect(0));
}
// Copy email to clipboard
const copyEmailBtn = document.getElementById('copy-email-btn');
const emailTooltip = document.getElementById('email-tooltip');
if (copyEmailBtn && emailTooltip) {
  copyEmailBtn.addEventListener('click', (e) => {
    e.preventDefault();
    navigator.clipboard.writeText('rafaelmapa63@gmail.com').then(() => {
      emailTooltip.style.opacity = '1';
      setTimeout(() => {
        emailTooltip.style.opacity = '0';
      }, 2000);
    });
  });
}


// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', () => {
  const hamburgers = document.querySelectorAll('.hamburger');
  hamburgers.forEach(hamburger => {
    hamburger.addEventListener('click', () => {
      const open = document.body.classList.toggle('menu-open');
      hamburger.setAttribute('aria-expanded', String(open));
      hamburger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
  });
});


// Hover preview nos cards de cases (desktop, sem reduced motion)
(() => {
  const previews = document.querySelectorAll('.card-img .card-preview');
  if (!previews.length) return;

  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canHover || reducedMotion) return;

  previews.forEach(video => {
    const frame = video.closest('.card-img');
    const card = video.closest('.card') || frame;
    if (!frame || !card) return;

    let active = false;

    const start = () => {
      active = true;
      if (video.preload === 'none') video.preload = 'auto';
      const played = video.play();
      if (played && typeof played.then === 'function') {
        played.then(() => {
          if (active) frame.classList.add('is-previewing');
        }).catch(() => {});
      } else if (active) {
        frame.classList.add('is-previewing');
      }
    };

    const stop = () => {
      active = false;
      frame.classList.remove('is-previewing');
      video.pause();
      try {
        video.currentTime = 0;
      } catch (error) {
        // metadata ainda nao carregou; o proximo hover comeca do inicio
      }
    };

    card.addEventListener('mouseenter', start);
    card.addEventListener('focusin', start);
    card.addEventListener('mouseleave', stop);
    card.addEventListener('focusout', stop);
  });
})();


// Lightbox das imagens de conteudo dos cases
(() => {
  const scopes = document.querySelectorAll('.case-main, .case-body-wrapper');
  if (!scopes.length) return;

  const images = [];
  scopes.forEach(scope => {
    if (typeof scope.querySelectorAll !== 'function') return;
    scope.querySelectorAll('img').forEach(img => {
      if (!img.alt || !img.alt.trim()) return;
      if (img.closest('video, picture, .case-meta-logos, a, button, header, footer')) return;
      if (images.indexOf(img) === -1) images.push(img);
    });
  });
  if (!images.length) return;

  let overlay;
  let overlayImage;
  let closeButton;
  let origin = null;

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Imagem ampliada');
    overlay.hidden = true;

    const backdrop = document.createElement('div');
    backdrop.className = 'lightbox-backdrop';

    overlayImage = document.createElement('img');
    overlayImage.className = 'lightbox-image';
    overlayImage.alt = '';

    closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'lightbox-close';
    closeButton.setAttribute('aria-label', 'Fechar imagem ampliada');
    closeButton.textContent = '×';

    backdrop.appendChild(overlayImage);
    overlay.appendChild(backdrop);
    overlay.appendChild(closeButton);
    document.body.appendChild(overlay);

    backdrop.addEventListener('click', event => {
      if (event.target === backdrop) close();
    });
    closeButton.addEventListener('click', close);
    closeButton.addEventListener('keydown', event => {
      if (event.key === 'Tab') event.preventDefault();
    });
  }

  function open(img) {
    if (!overlay) build();
    origin = img;
    overlayImage.src = img.currentSrc || img.src;
    overlayImage.alt = img.alt;
    overlay.hidden = false;
    document.body.classList.add('lightbox-open');
    closeButton.focus();
  }

  function close() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    overlayImage.removeAttribute('src');
    overlayImage.alt = '';
    document.body.classList.remove('lightbox-open');
    if (origin) origin.focus({ preventScroll: true });
    origin = null;
  }

  images.forEach(img => {
    img.classList.add('lightbox-trigger');
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-haspopup', 'dialog');
    img.setAttribute('aria-label', `Ampliar imagem: ${img.alt}`);

    img.addEventListener('click', () => open(img));
    img.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault();
        open(img);
      }
    });
  });

  document.addEventListener('keydown', event => {
    if (!overlay || overlay.hidden) return;
    if (event.key === 'Escape') {
      close();
      return;
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      closeButton.focus();
    }
  });
})();
