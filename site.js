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
