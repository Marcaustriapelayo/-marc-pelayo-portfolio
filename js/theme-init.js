// Runs in <head> before paint: sets the saved / system theme to avoid a flash,
// and decides whether the BIOS boot intro plays (home page only, first visit only).
(function(){
  var root = document.documentElement, t = null;
  try { t = localStorage.getItem('mp-theme'); } catch(e) {}
  if (!t) t = (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  root.setAttribute('data-theme', t);
  root.classList.add('js'); // enables JS-driven animations

  // Boot intro: only on pages with <html data-boot>, never with reduced motion.
  if (!root.hasAttribute('data-boot')) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (location.hash.length > 1) return; // deep links (e.g. #need-web shared by HR) open straight on that part
  var booted = false;
  try { booted = localStorage.getItem('mp-booted') === '1'; } catch(e) { booted = false; } // storage blocked: show once per load
  if (booted) return;
  root.classList.add('booting');
  // Safety net: if main.js never starts the intro, don't leave the page hidden.
  setTimeout(function(){
    if (!document.querySelector('#boot.on')) root.classList.remove('booting');
  }, 4000);
})();
