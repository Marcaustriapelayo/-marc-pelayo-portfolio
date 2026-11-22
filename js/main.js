/* Marc Adrian Pelayo — portfolio interactions & animations
   Shared by index.html, techworld.html and scms.html.
   Editable settings (links, contact form, testimonials, learning) live in js/config.js. */
(function(){
  'use strict';
  var CONFIG = window.SITE_CONFIG || {};
  var root = document.documentElement;
  var mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  var mqDesktop = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 601px)');
  function reduced(){ return mqReduce.matches; }
  // mouse-driven effects (parallax, magnetic) only on desktop, never with reduced motion
  function desktopFx(){ return mqDesktop.matches && !mqReduce.matches; }
  // read a time token from :root (e.g. "85ms" or ".8s") in milliseconds
  function cssMs(name, fallback){
    var v = getComputedStyle(root).getPropertyValue(name).trim();
    if (!v) return fallback;
    var n = parseFloat(v);
    return /ms$/.test(v) ? n : (/s$/.test(v) ? n * 1000 : n);
  }
  // run a handler at most once per animation frame
  function rafThrottle(fn){
    var queued = false, arg;
    return function(e){ arg = e; if (queued) return; queued = true; requestAnimationFrame(function(){ queued = false; fn(arg); }); };
  }
  function clamp(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }
  function $(id){ return document.getElementById(id); }
  function isUrl(s){ return typeof s === 'string' && /^https?:\/\/\S+$/i.test(s.trim()); }
  // run fn now, or after the boot intro finishes
  function whenBooted(fn){
    if (!root.classList.contains('booting')) fn();
    else document.addEventListener('mp:booted', function(){ fn(); }, { once: true });
  }

  /* ---------- BIOS boot intro (first visit; Skip / Esc / Enter / click skips) ---------- */
  function initBoot(){
    var boot = $('boot'), rebootBtn = $('rebootBtn');
    if (!boot) return;
    var lines = [].slice.call(boot.querySelectorAll('.bl'));
    var LINE_MS = 235;            // time between lines (8 lines ≈ 1.9s)
    var HOLD_MS = 380;            // pause on "Booting portfolio" before power-on
    var OFF_MS = 520;             // power-on flash + fade
    lines.forEach(function(l, i){
      l.style.setProperty('--n', l.textContent.length);
      l.style.setProperty('--t', (i * LINE_MS) + 'ms');
    });
    boot.style.setProperty('--total', (lines.length * LINE_MS) + 'ms');
    var running = false, timer = null;

    function finish(){
      if (!running) return;
      running = false;
      clearTimeout(timer);
      try { localStorage.setItem('mp-booted', '1'); } catch(e) {}
      boot.classList.add('off');                 // quick scale + flash
      root.classList.remove('booting');          // hero entrance animation starts now
      document.dispatchEvent(new CustomEvent('mp:booted'));
      setTimeout(function(){ if (!running) boot.classList.remove('on', 'run', 'off'); }, OFF_MS);
    }
    function start(){
      running = true;
      boot.classList.remove('off', 'run');
      void boot.offsetWidth;                     // restart the CSS animations
      boot.classList.add('on', 'run');
      timer = setTimeout(finish, lines.length * LINE_MS + HOLD_MS);
    }
    document.addEventListener('keydown', function(e){
      if (!running || e.ctrlKey || e.altKey || e.metaKey || e.key === 'Shift') return;
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') e.preventDefault();
      finish();
    });
    boot.addEventListener('click', finish);

    if (root.classList.contains('booting')) start();

    if (rebootBtn) rebootBtn.addEventListener('click', function(){
      if (reduced()) return;
      try { localStorage.removeItem('mp-booted'); } catch(e) {}
      scrollTo({ top: 0, behavior: 'instant' });
      root.classList.add('hero-reset', 'booting');  // restart hero animations, paused until boot ends
      void root.offsetWidth;
      root.classList.remove('hero-reset');
      start();
    });
  }

  /* ---------- Theme toggle (circular reveal via View Transitions) ---------- */
  function initTheme(){
    var btn = $('themeBtn'), lbl = $('themeLbl');
    if (!btn) return;
    function sync(){ if (lbl) lbl.textContent = root.getAttribute('data-theme') === 'dark' ? 'Light mode' : 'Dark mode'; }
    function apply(next){
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('mp-theme', next); } catch(e) {}
      sync();
    }
    sync();
    btn.addEventListener('click', function(){
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      if (!document.startViewTransition || reduced()) { apply(next); return; } // fallback: normal color fade
      var r = btn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      var rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      root.classList.add('vt-running');
      var vt = document.startViewTransition(function(){ apply(next); });
      vt.ready.then(function(){
        root.animate(
          { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + rad + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: cssMs('--theme-speed', 700), easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(function(){});
      function done(){ root.classList.remove('vt-running'); }
      vt.finished.then(done, done);
    });
  }

  /* ---------- Sidebar menu ---------- */
  function initSidebar(){
    var btn = $('menuBtn'), side = $('sidebar'), scrim = $('scrim'), closeBtn = $('sideClose');
    if (!btn || !side) return;
    function isOpen(){ return root.classList.contains('menu-open'); }
    function set(open, returnFocus){
      root.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', open);
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      side.inert = !open;
      if (open) {
        setTimeout(function(){
          var a = side.querySelector('.side-links a.active') || side.querySelector('.side-links a');
          if (a) a.focus({ preventScroll: true });
        }, 60);
      } else if (returnFocus) {
        btn.focus({ preventScroll: true });
      }
    }
    side.inert = true;
    btn.addEventListener('click', function(){ set(!isOpen(), false); });
    closeBtn.addEventListener('click', function(){ set(false, true); });
    scrim.addEventListener('click', function(){ set(false, true); });
    side.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ set(false, false); }); });
    document.addEventListener('keydown', function(e){
      if (!isOpen()) return;
      if (e.key === 'Escape') { set(false, true); return; }
      if (e.key === 'Tab') { // keep focus inside the open sidebar
        var f = [].filter.call(side.querySelectorAll('a, button'), function(el){ return el.offsetParent !== null; });
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Sidebar numbers: keep 00, 01, 02… in order when optional sections are hidden ---------- */
  function renumber(){
    var n = 0;
    document.querySelectorAll('.side-links li').forEach(function(li){
      if (li.hidden) return;
      var num = (n < 10 ? '0' : '') + n; n++;
      var a = li.querySelector('a'), m = a.querySelector('.mono');
      if (m) m.textContent = num;
      var h = a.getAttribute('href');
      if (h.charAt(0) === '#' && h.length > 1) {
        var sec = document.querySelector(h), s = sec && sec.querySelector('.sec-num');
        if (s) s.textContent = num;
      }
    });
  }

  /* ---------- Scroll effects: progress bar, active link, timeline draw, stack parallax ---------- */
  function initScrollFx(){
    var bar = $('progressBar');
    // only same-page links (#id) take part in the active-section highlight
    var links = [].filter.call(document.querySelectorAll('.side-links a'), function(a){ return /^#./.test(a.getAttribute('href')); });
    var targets = links.map(function(a){ return document.querySelector(a.getAttribute('href')); });
    var timelines = [].slice.call(document.querySelectorAll('.timeline'));
    var s1 = document.querySelector('.stack .s1'), s2 = document.querySelector('.stack .s2'), ph = document.querySelector('.stack .portrait');
    var active = -1;
    function visible(t){ return t && !t.hidden; }
    function update(){
      var y = scrollY, vh = innerHeight, max = root.scrollHeight - vh;
      if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max) : 0).toFixed(4) + ')';

      if (links.length) {
        var cur = 0;
        targets.forEach(function(t, i){ if (visible(t) && i > 0 && t.getBoundingClientRect().top <= vh * .35) cur = i; });
        if (max > 0 && y >= max - 2) { for (var k = targets.length - 1; k >= 0; k--) if (visible(targets[k])) { cur = k; break; } }
        if (cur !== active) {
          links.forEach(function(a, i){
            a.classList.toggle('active', i === cur);
            if (i === cur) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
          });
          active = cur;
        }
      }

      timelines.forEach(function(tl){
        var r = tl.getBoundingClientRect();
        tl.style.setProperty('--p', reduced() ? 1 : clamp((vh * .82 - r.top) / r.height).toFixed(3));
      });

      // back card (s1) moves slower than the front card (s2)
      if (s1 && s2 && !reduced() && y < vh * 1.5) {
        s1.style.translate = '0 ' + (y * -0.04).toFixed(1) + 'px';
        s2.style.translate = '0 ' + (y * -0.09).toFixed(1) + 'px';
        if (ph) ph.style.translate = '0 ' + (y * -0.15).toFixed(1) + 'px'; // portrait is the front layer
      }
    }
    var onScroll = rafThrottle(update);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* ---------- Animated background: signals, mouse parallax, pause when hidden ---------- */
  function initBackground(){
    var fx = document.querySelector('.bg-fx');
    if (!fx) return;
    document.addEventListener('visibilitychange', function(){ root.classList.toggle('fx-paused', document.hidden); });

    // each signal jumps to a new random grid line every time it restarts
    var cell = parseFloat(getComputedStyle(root).getPropertyValue('--grid')) || 48;
    fx.querySelectorAll('.signal').forEach(function(s){
      var vertical = s.classList.contains('v');
      function place(){
        var n = Math.max(1, Math.floor((vertical ? innerWidth : innerHeight) / cell));
        var k = 2 + Math.floor(Math.random() * n); // +2: grid starts 2 cells off-screen
        s.style.setProperty(vertical ? '--x' : '--y', (k * cell) + 'px');
      }
      place();
      s.addEventListener('animationiteration', place);
    });

    // blobs drift a few px toward the cursor (desktop only)
    var blobs = fx.querySelector('.bg-blobs');
    var strength = parseFloat(getComputedStyle(root).getPropertyValue('--parallax-px')) || 14;
    var tx = 0, ty = 0, cx = 0, cy = 0, running = false;
    function tick(){
      cx += (tx - cx) * .06; cy += (ty - cy) * .06;
      blobs.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0)';
      if (Math.abs(tx - cx) > .05 || Math.abs(ty - cy) > .05) requestAnimationFrame(tick); else running = false;
    }
    addEventListener('mousemove', rafThrottle(function(e){
      if (!desktopFx() || document.hidden) return;
      tx = (e.clientX / innerWidth - .5) * 2 * strength;
      ty = (e.clientY / innerHeight - .5) * 2 * strength;
      if (!running) { running = true; requestAnimationFrame(tick); }
    }), { passive: true });
  }

  /* ---------- Typing line ---------- */
  function initTyper(){
    var el = $('typerText');
    if (!el) return;
    var roles = ['PC Building', 'PHP & MySQL', 'LAN Setup', 'OS Installation']; // skills (the role line under the name says the job titles)
    el.textContent = roles[0];
    if (reduced()) return; // static first role
    var typeMs = cssMs('--type-speed', 85), delMs = cssMs('--delete-speed', 45), hold = cssMs('--type-hold', 1600);
    var i = 0, n = roles[0].length, deleting = true;
    function step(){
      if (document.hidden) { setTimeout(step, 500); return; }
      var w = roles[i];
      if (!deleting) {
        if (n < w.length) { el.textContent = w.slice(0, ++n); setTimeout(step, typeMs + Math.random() * 40); }
        else { deleting = true; setTimeout(step, hold); }
      } else {
        if (n > 0) { el.textContent = w.slice(0, --n); setTimeout(step, delMs); }
        else { deleting = false; i = (i + 1) % roles.length; setTimeout(step, 350); }
      }
    }
    whenBooted(function(){ setTimeout(step, hold + 1200); });
  }

  /* ---------- Stats count-up ---------- */
  function initCountUp(){
    var strip = document.querySelector('.stats');
    if (!strip || reduced() || !('IntersectionObserver' in window)) return; // final numbers stay as written
    var dur = cssMs('--count-speed', 1600);
    var items = [].map.call(strip.querySelectorAll('.stat b'), function(b){
      var end = parseInt(b.textContent, 10);
      var start = end >= 1000 ? Math.floor(end / 1000) * 1000 : 0; // 2023 counts from 2000
      b.textContent = start;
      return { b: b, end: end, start: start };
    });
    var io = new IntersectionObserver(function(es){
      if (!es.some(function(e){ return e.isIntersecting; })) return;
      io.disconnect();
      whenBooted(function(){
        var t0 = performance.now();
        requestAnimationFrame(function frame(t){
          var allDone = true;
          items.forEach(function(it, i){
            var p = clamp((t - t0 - i * 120) / dur), e = 1 - Math.pow(1 - p, 3);
            it.b.textContent = Math.round(it.start + (it.end - it.start) * e);
            if (p < 1) allDone = false;
          });
          if (!allDone) requestAnimationFrame(frame);
        });
      });
    }, { threshold: .4 });
    io.observe(strip);
  }

  /* ---------- Section headings: split lines for the mask reveal ---------- */
  function splitHeadings(){
    document.querySelectorAll('.sec-head h2, .contact h2').forEach(function(h){
      h.innerHTML = h.innerHTML.split(/<br\s*\/?>/i).map(function(part, i){
        return '<span class="h-line" style="--l:' + i + '"><span>' + part.trim() + '</span></span>';
      }).join('');
    });
  }

  /* ---------- Reveal on scroll (with stagger) + timeline dots ---------- */
  function initReveal(){
    [['.certs .cert', 120], ['.two > .reveal', 140], ['.quotes .quote', 120], ['.jobs .job', 110], ['.cs-gallery .reveal', 100]].forEach(function(g){
      document.querySelectorAll(g[0]).forEach(function(el, i){ el.style.setProperty('--d', (i * g[1]) + 'ms'); });
    });
    var els = document.querySelectorAll('.reveal'), dots = document.querySelectorAll('.timeline li');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function(el){ el.classList.add('in', 'done'); });
      dots.forEach(function(li){ li.classList.add('in'); });
      return;
    }
    var revMs = cssMs('--reveal-speed', 800);
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (!e.isIntersecting) return;
        var el = e.target, d = parseFloat(el.style.getPropertyValue('--d')) || 0;
        el.classList.add('in');
        io.unobserve(el);
        setTimeout(function(){ el.classList.add('done'); }, d + revMs + 50); // drop the stagger delay for hover
      });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function(el){ io.observe(el); });
    var io2 = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); io2.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -18% 0px' });
    dots.forEach(function(li){ io2.observe(li); });
  }

  /* ---------- Lightbox: images and demo videos ---------- */
  var lb = $('lightbox'), lbImg = $('lbImg'), lbVid = $('lbVid'), lbCap = $('lbCap'), lbClose = $('lbClose'), lbReturn = null;
  function lbIsOpen(){ return lb && lb.classList.contains('open'); }
  function stopVideo(){
    if (!lbVid || lbVid.hidden) return;
    lbVid.pause(); lbVid.removeAttribute('src'); lbVid.load();
  }
  function openLb(src, cap, isVideo){
    if (!lb) return;
    lbReturn = document.activeElement;
    stopVideo();
    lb.classList.toggle('is-video', !!isVideo);
    if (isVideo) {
      lbImg.hidden = true; lbImg.removeAttribute('src');
      lbVid.hidden = false; lbVid.src = src;
      var p = lbVid.play(); if (p && p.catch) p.catch(function(){});
    } else {
      lbVid.hidden = true;
      lbImg.hidden = false; lbImg.src = src; lbImg.alt = cap || '';
    }
    lbCap.textContent = cap || '';
    lb.classList.add('open');
    if (lbClose) lbClose.focus({ preventScroll: true });
  }
  function closeLb(){
    if (!lbIsOpen()) return;
    stopVideo();
    lb.classList.remove('open', 'is-video');
    if (lbReturn && lbReturn.focus) lbReturn.focus({ preventScroll: true });
  }
  // make a click-only element usable with the keyboard
  function asButton(el, label, fn){
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    if (label) el.setAttribute('aria-label', label);
    el.addEventListener('click', fn);
    el.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
  }
  function initLightbox(){
    if (!lb) return;
    // video: only the backdrop / close button closes (so the controls stay usable); image: any click closes
    lb.addEventListener('click', function(e){
      if (lb.classList.contains('is-video') && e.target.closest('video')) return;
      closeLb();
    });
    document.addEventListener('keydown', function(e){
      if (!lbIsOpen()) return;
      if (e.key === 'Escape') { closeLb(); return; }
      if (e.key === 'Tab') { // keep focus in the dialog
        var f = [lbClose].concat(lbVid.hidden ? [] : [lbVid]);
        var i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
    document.querySelectorAll('[data-zoom]').forEach(function(i){
      asButton(i, 'Open full size: ' + (i.dataset.cap || i.alt), function(){ openLb(i.currentSrc || i.src, i.dataset.cap); });
    });
  }

  /* ---------- Project galleries: crossfade between screenshots ---------- */
  function initGalleries(){
    document.querySelectorAll('[data-gallery]').forEach(function(p){
      var box = p.querySelector('.main'), main = box.querySelector('img'), cap = p.querySelector('.caption');
      var btns = p.querySelectorAll('.thumbs button'), token = 0;
      btns.forEach(function(b){
        b.addEventListener('click', function(){
          btns.forEach(function(x){ x.removeAttribute('aria-current'); });
          b.setAttribute('aria-current', 'true');
          cap.textContent = b.dataset.cap;
          var my = ++token, old = box.querySelector('.xfade');
          if (old) old.remove();
          if (main.getAttribute('src') === b.dataset.src) return;
          var next = new Image();
          next.className = 'xfade'; next.alt = ''; next.src = b.dataset.src;
          (next.decode ? next.decode() : Promise.resolve()).catch(function(){}).then(function(){
            if (my !== token) return;
            box.appendChild(next);
            requestAnimationFrame(function(){ requestAnimationFrame(function(){ next.classList.add('show'); }); });
            setTimeout(function(){
              if (my !== token) return;
              main.src = b.dataset.src; main.alt = b.dataset.cap;
              (main.decode ? main.decode() : Promise.resolve()).catch(function(){}).then(function(){ if (my === token) next.remove(); });
            }, 480);
          });
        });
      });
      asButton(box, 'Open screenshot full size', function(){ openLb(main.src, cap.textContent); });
    });
  }

  /* ---------- Project buttons: demo video (only if the file exists), live demo, GitHub ---------- */
  function initProjectLinks(){
    var cfg = CONFIG.PROJECT_LINKS || {};
    document.querySelectorAll('[data-plink]').forEach(function(a){
      var k = a.dataset.plink.split('.'), url = (cfg[k[0]] || {})[k[1]];
      if (isUrl(url)) { a.href = url.trim(); a.hidden = false; }
    });
    document.querySelectorAll('[data-demo]').forEach(function(btn){
      var src = ((cfg[btn.dataset.demo] || {}).demo || '').trim();
      if (!src) return;
      var probe = document.createElement('video');
      probe.preload = 'metadata'; probe.muted = true;
      probe.addEventListener('loadedmetadata', function(){ btn.hidden = false; }, { once: true });
      probe.src = src; // missing file → "error" event → button stays hidden
      btn.addEventListener('click', function(){ openLb(src, btn.dataset.cap, true); });
    });
  }

  /* ---------- Profile links (GitHub, Facebook, LinkedIn) from config ---------- */
  function initSocialLinks(){
    var map = CONFIG.SOCIAL_LINKS || {};
    // footer icons: show only when a URL is set
    document.querySelectorAll('[data-social]').forEach(function(a){
      var url = map[a.dataset.social];
      if (isUrl(url)) { a.href = url.trim(); a.hidden = false; }
      else a.hidden = true;
    });
    // contact rows: <a> rows take the config URL; <div> rows become links once a URL is set
    document.querySelectorAll('[data-link]').forEach(function(row){
      var url = map[row.dataset.link];
      if (!isUrl(url)) return;
      if (row.tagName === 'A') { row.href = url.trim(); return; }
      var a = document.createElement('a');
      a.href = url.trim(); a.target = '_blank'; a.rel = 'noopener';
      a.dataset.link = row.dataset.link;
      while (row.firstChild) a.appendChild(row.firstChild);
      var label = a.querySelector('.mono');
      if (label) { var arr = document.createElement('span'); arr.className = 'arr'; arr.setAttribute('aria-hidden', 'true'); arr.textContent = ' ↗'; label.appendChild(arr); }
      row.replaceWith(a);
    });
  }

  /* ---------- Drafts: "[TODO …]" text shows (dashed) or hides, set by SHOW_DRAFT_JOBS ---------- */
  var SHOW_DRAFTS = CONFIG.SHOW_DRAFT_JOBS !== false;
  function hasTodo(x){ return JSON.stringify(x).indexOf('[TODO') !== -1; }
  function mk(tag, cls, text){ var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  // write text into el, wrapping every "[TODO …]" part in a dashed span
  function fillTodo(el, str){
    String(str || '').split(/(\[TODO[^\]]*\])/).forEach(function(part, i){
      if (!part) return;
      if (i % 2) el.appendChild(mk('span', 'todo', part));
      else el.appendChild(document.createTextNode(part));
    });
  }
  function svgIcon(paths, cls){
    return '<svg' + (cls ? ' class="' + cls + '"' : '') + ' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  }
  function initDrafts(){
    document.querySelectorAll('[data-draft]').forEach(function(e){ e.hidden = !SHOW_DRAFTS; });
  }

  /* ---------- Availability box (rows from AVAILABILITY in config) ---------- */
  var AVAIL_ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
    pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z"/>'
  };
  function initAvailability(){
    var box = $('availRows');
    if (!box) return;
    (CONFIG.AVAILABILITY || []).forEach(function(r){
      if (!r || !r.label) return;
      var val = String(r.value || '');
      if (!SHOW_DRAFTS) { val = val.replace(/\s*\[TODO[^\]]*\]/g, '').trim(); if (!val) return; } // live: drop unfinished parts
      var row = mk('div', 'avail-row' + (val.indexOf('[TODO') !== -1 ? ' has-todo' : ''));
      var dt = mk('dt');
      dt.innerHTML = svgIcon(AVAIL_ICONS[r.icon] || AVAIL_ICONS.search, 'avail-ico');
      dt.appendChild(document.createTextNode(r.label));
      var dd = mk('dd'); fillTodo(dd, val);
      row.appendChild(dt); row.appendChild(dd);
      box.appendChild(row);
    });
  }

  /* ---------- Hands-on IT work: repair-ticket cards from IT_JOBS, with filters ---------- */
  var JOB_CATS = {
    build:   { label: 'PC Builds', icon: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>' },
    repair:  { label: 'Repairs & Upgrades', icon: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>' },
    network: { label: 'Networking', icon: '<rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="6" height="5" rx="1"/><rect x="16" y="17" width="6" height="5" rx="1"/><path d="M12 7v5M5 17v-5h14v5"/>' }
  };
  function jobPlaceholder(cat){
    var d = mk('div', 'job-ph');
    d.innerHTML = '<span class="ico">' + svgIcon(cat.icon) + '</span>';
    return d;
  }
  function jobMedia(j, cat){
    var photos = (j.photos || []).filter(function(p){ return typeof p === 'string' && p.trim(); });
    var cap = 'JOB #' + j.id + ' — ' + String(j.title || '').replace(/\[TODO[^\]]*\]/g, '').trim();
    if (!photos.length) return jobPlaceholder(cat);
    var wrap;
    function broken(){ if (wrap.parentNode) wrap.replaceWith(jobPlaceholder(cat)); } // never show a broken image
    if (photos.length === 1) {
      wrap = mk('button', 'job-photo'); wrap.type = 'button'; wrap.setAttribute('aria-label', 'Open photo full size');
      var img = mk('img'); img.src = photos[0]; img.alt = ''; img.loading = 'lazy'; img.onerror = broken;
      wrap.appendChild(img);
      wrap.addEventListener('click', function(){ openLb(photos[0], cap); });
      return wrap;
    }
    // before / after slider
    wrap = mk('div', 'ba'); wrap.style.setProperty('--pos', '50%');
    var before = mk('img', 'ba-img'); before.src = photos[0]; before.alt = 'Before'; before.loading = 'lazy'; before.onerror = broken;
    var after = mk('img', 'ba-img ba-after'); after.src = photos[1]; after.alt = 'After'; after.loading = 'lazy'; after.onerror = broken;
    var range = mk('input', 'ba-range'); range.type = 'range'; range.min = 0; range.max = 100; range.value = 50;
    range.setAttribute('aria-label', 'Compare before and after');
    range.addEventListener('input', function(){ wrap.style.setProperty('--pos', range.value + '%'); });
    var zoom = mk('button', 'ba-zoom'); zoom.type = 'button'; zoom.setAttribute('aria-label', 'Open after photo full size');
    zoom.innerHTML = svgIcon('<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>');
    zoom.addEventListener('click', function(){ openLb(photos[1], cap + ' (after)'); });
    [before, after, mk('span', 'ba-tag ba-tag-b', 'Before'), mk('span', 'ba-tag ba-tag-a', 'After'), range, zoom].forEach(function(n){ wrap.appendChild(n); });
    return wrap;
  }
  function jobCard(j){
    var cat = JOB_CATS[j.category];
    var art = mk('article', 'job reveal' + (hasTodo(j) ? ' is-draft' : ''));
    art.dataset.cat = j.category;
    var top = mk('div', 'job-top');
    top.appendChild(mk('span', 'mono job-id', 'JOB #' + (j.id || '')));
    top.appendChild(mk('span', 'chip job-cat', cat.label));
    var date = mk('span', 'mono job-date'); fillTodo(date, j.date); top.appendChild(date);
    art.appendChild(top);
    art.appendChild(jobMedia(j, cat));
    var h = mk('h3', 'job-title'); fillTodo(h, j.title); art.appendChild(h);
    var dl = mk('dl', 'job-rows');
    [['Problem', j.problem], ['What I did', j.action], ['Result', j.result]].forEach(function(r){
      var row = mk('div', 'job-row');
      row.appendChild(mk('dt', 'mono', r[0]));
      var dd = mk('dd'); fillTodo(dd, r[1]); row.appendChild(dd);
      dl.appendChild(row);
    });
    art.appendChild(dl);
    var tools = (j.tools || []).filter(Boolean);
    if (tools.length) {
      var ul = mk('ul', 'chips job-tools'); ul.setAttribute('aria-label', 'Tools and parts used');
      tools.forEach(function(t){ var li = mk('li', 'chip'); fillTodo(li, t); ul.appendChild(li); });
      art.appendChild(ul);
    }
    return art;
  }
  function initJobs(){
    var jobs = (CONFIG.IT_JOBS || []).filter(function(j){ return j && JOB_CATS[j.category] && (SHOW_DRAFTS || !hasTodo(j)); });
    var link = document.querySelector('.side-links a[href$="#handson"]');
    if (link) link.parentNode.hidden = !jobs.length;
    var sec = $('handson'), box = $('jobs');
    if (!sec || !box) return;
    sec.hidden = !jobs.length;
    if (!jobs.length) return;
    $('jobsDraft').hidden = !jobs.some(hasTodo);
    var cards = jobs.map(function(j){ var c = jobCard(j); box.appendChild(c); return c; });
    var filters = [].slice.call(sec.querySelectorAll('.filter')), empty = $('jobsEmpty');
    function apply(f){
      var shown = 0;
      filters.forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.filter === f ? 'true' : 'false'); });
      cards.forEach(function(card){
        var on = f === 'all' || card.dataset.cat === f;
        if (on) shown++;
        if (reduced()) { card.hidden = !on; card.classList.remove('is-out'); return; }
        if (on) {
          if (card.hidden) {
            card.hidden = false; card.classList.add('is-out');
            requestAnimationFrame(function(){ requestAnimationFrame(function(){ card.classList.remove('is-out'); }); });
          } else card.classList.remove('is-out');
        } else if (!card.hidden) {
          card.classList.add('is-out');
          setTimeout(function(){ if (card.classList.contains('is-out')) card.hidden = true; }, 230);
        }
      });
      empty.hidden = shown > 0;
    }
    filters.forEach(function(b){ b.addEventListener('click', function(){ apply(b.dataset.filter); }); });
  }

  /* ---------- Testimonials from config (section + menu link hidden while empty) ---------- */
  function initTestimonials(){
    var list = (CONFIG.TESTIMONIALS || []).filter(function(t){ return t && t.quote && t.name; });
    if (!list.length) return;
    var link = document.querySelector('.side-links a[href$="#testimonials"]');
    if (link) link.parentNode.hidden = false;
    var sec = $('testimonials'), box = $('quotes');
    if (!sec || !box) return;
    list.forEach(function(t){
      var fig = document.createElement('figure'); fig.className = 'quote reveal';
      var q = document.createElement('blockquote'); q.textContent = t.quote;
      var cap = document.createElement('figcaption');
      var av = document.createElement('span'); av.className = 'avatar'; av.setAttribute('aria-hidden', 'true');
      av.textContent = t.name.trim().split(/\s+/).map(function(w){ return w.charAt(0); }).filter(function(c){ return /\p{L}/u.test(c); }).slice(0, 2).join('').toUpperCase();
      var who = document.createElement('span'); who.className = 'who';
      var b = document.createElement('b'); b.textContent = t.name;
      who.appendChild(b);
      if (t.role) { var r = document.createElement('small'); r.textContent = t.role; who.appendChild(r); }
      cap.appendChild(av); cap.appendChild(who);
      fig.appendChild(q); fig.appendChild(cap);
      box.appendChild(fig);
    });
    sec.hidden = false;
  }

  /* ---------- "Currently learning" marquee from config ---------- */
  function initLearning(){
    var items = (CONFIG.LEARNING || []).filter(function(s){ return typeof s === 'string' && s.trim(); });
    var box = $('learning'), track = $('learningTrack');
    if (!box || !track || !items.length) return;
    function group(hidden){
      var ul = document.createElement('ul'); ul.className = 'marquee-group';
      if (hidden) ul.setAttribute('aria-hidden', 'true');
      items.forEach(function(t){ var li = document.createElement('li'); li.textContent = t.trim(); ul.appendChild(li); });
      return ul;
    }
    box.hidden = false;
    var lastW = 0;
    function build(){
      var W = box.clientWidth;
      if (W === lastW) return;
      lastW = W;
      track.textContent = '';
      track.appendChild(group(false));
      if (reduced()) { box.classList.add('static'); return; }
      // repeat the list so one half of the track is wider than the strip, then copy that half (seamless loop)
      var w = track.firstChild.getBoundingClientRect().width || 1, k = Math.max(1, Math.ceil(W / w));
      for (var i = 1; i < k * 2; i++) track.appendChild(group(true));
      box.style.setProperty('--marquee-dur', Math.max(12, (k * w) / 38).toFixed(1) + 's');
    }
    build();
    var t; addEventListener('resize', function(){ clearTimeout(t); t = setTimeout(build, 200); }, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ lastW = 0; build(); });
  }

  /* ---------- "Build my PC" skills ---------- */
  function initPC(){
    var pc = $('pc');
    if (!pc) return;
    var parts = [].slice.call(pc.querySelectorAll('.pc-part'));
    var items = [].slice.call(pc.querySelectorAll('.pc-item'));
    var status = $('pcStatus'), power = $('pcPower');
    var names = { cpu: 'CPU', ram: 'RAM', nic: 'NIC', psu: 'PSU' };
    pc.classList.add('pc-js'); // one info card at a time (without JS all four stay visible)

    function select(name){
      parts.forEach(function(p){
        var on = p.dataset.part === name;
        p.classList.toggle('sel', on);
        p.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      items.forEach(function(it){ it.hidden = it.dataset.part !== name; });
    }
    parts.forEach(function(p){
      p.addEventListener('click', function(){ select(p.dataset.part); });
      p.addEventListener('keydown', function(e){
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(p.dataset.part); }
      });
      p.addEventListener('pointerenter', function(e){ if (e.pointerType === 'mouse') select(p.dataset.part); });
    });
    select('cpu');

    var STEP = 280, DROP = 600, timers = [];
    function say(t){ if (status) status.textContent = t; }
    function run(){
      timers.forEach(clearTimeout); timers = [];
      pc.classList.remove('installed', 'powered');
      if (reduced()) { pc.classList.add('installed', 'powered'); say('POST · 4/4 parts detected · system OK'); return; }
      void pc.offsetWidth; // restart the install animation
      pc.classList.add('installed');
      parts.forEach(function(p, i){
        timers.push(setTimeout(function(){ say('Installing ' + names[p.dataset.part] + ' … ' + (i + 1) + '/4'); }, i * STEP));
      });
      timers.push(setTimeout(function(){
        pc.classList.add('powered');
        say('POST · 4/4 parts detected · fans on');
      }, (parts.length - 1) * STEP + DROP + 100));
    }
    if (power) power.addEventListener('click', run);

    if (reduced() || !('IntersectionObserver' in window)) { run(); return; }
    say('Standby · waiting for power');
    var io = new IntersectionObserver(function(es){
      if (!es.some(function(e){ return e.isIntersecting; })) return;
      io.disconnect();
      whenBooted(run);
    }, { threshold: .35 });
    io.observe(pc.querySelector('.pc-stage'));
  }

  /* ---------- "Email me" links: Gmail in the browser on computers, mail app on phones ---------- */
  function initMailLinks(){
    if (CONFIG.EMAIL_OPEN_GMAIL_ON_DESKTOP === false) return;
    var phone = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
                (window.matchMedia && matchMedia('(pointer: coarse)').matches && !matchMedia('(pointer: fine)').matches);
    if (phone) return; // phones: keep mailto (opens Gmail / Mail app)
    document.addEventListener('click', function(e){
      var a = e.target.closest && e.target.closest('a[href^="mailto:"]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) return;
      var raw = a.getAttribute('href').slice(7), q = '', i = raw.indexOf('?');
      if (i !== -1) { q = raw.slice(i + 1); raw = raw.slice(0, i); }
      // mailto uses %20 for spaces; a "+" stays a real plus sign
      var p = {}; q.split('&').forEach(function(kv){ if (!kv) return; var s = kv.split('='); try { p[s[0].toLowerCase()] = decodeURIComponent(s.slice(1).join('=')); } catch(err) {} });
      try { raw = decodeURIComponent(raw); } catch(err) {}
      var url = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(raw) +
                (p.subject ? '&su=' + encodeURIComponent(p.subject) : '') + (p.body ? '&body=' + encodeURIComponent(p.body) : '');
      e.preventDefault();
      var w = window.open(url, '_blank');
      if (w) { try { w.opener = null; } catch(err) {} }
      else location.href = a.getAttribute('href'); // pop-up blocked → fall back to mailto
    });
  }

  /* ---------- Contact form (FormSubmit, Formspree or PHP, set in js/config.js) ---------- */
  function initContactForm(){
    var form = $('contactForm');
    if (!form) return;
    var mode = String(CONFIG.CONTACT_MODE || 'formspree').toLowerCase();
    var fsId = String(CONFIG.FORMSPREE_ID || '').trim();
    var btn = form.querySelector('.f-send'), label = form.querySelector('.f-label'), status = $('formStatus');
    var EMAIL = 'marcaustriapelayo@gmail.com';
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var f = form.elements, fields = [f.name, f.email, f.subject, f.message], busy = false;

    function check(el){
      var v = el.value.trim();
      if (el === f.name) return !v ? 'Please enter your name.' : v.length < 2 ? 'Your name looks too short.' : '';
      if (el === f.email) return !v ? 'Please enter your email.' : !EMAIL_RE.test(v) ? 'Please enter a valid email, like name@example.com.' : '';
      if (el === f.subject) return !v ? 'Please choose a subject.' : '';
      if (el === f.message) return !v ? 'Please write a message.' : v.length < 10 ? 'Please write at least 10 characters.' : '';
      return '';
    }
    function validate(el){
      var msg = check(el);
      $(el.getAttribute('aria-describedby')).textContent = msg;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      el.closest('.field').classList.toggle('bad', !!msg);
      return !msg;
    }
    fields.forEach(function(el){
      el.addEventListener('blur', function(){ if (el.value.trim() || el.closest('.field').classList.contains('bad')) validate(el); });
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', function(){ if (el.closest('.field').classList.contains('bad')) validate(el); });
    });
    function show(kind, text){
      status.className = 'f-status' + (kind ? ' ' + kind : '');
      status.textContent = text || '';
    }
    function setBusy(on){
      busy = on;
      btn.disabled = on;
      btn.classList.toggle('loading', on);
      form.setAttribute('aria-busy', on ? 'true' : 'false');
      label.textContent = on ? 'Sending…' : 'Send message';
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();
      if (busy) return;
      var first = null;
      fields.forEach(function(el){ if (!validate(el) && !first) first = el; });
      if (first) { show('err', 'Please fix the fields marked above.'); first.focus(); return; }

      // honeypot: a bot filled the hidden field → pretend it worked, send nothing
      if (f._gotcha && f._gotcha.value) { form.reset(); show('ok', 'Thank you! Your message was sent.'); return; }

      var url, body, headers = { Accept: 'application/json' };
      var to = String(CONFIG.CONTACT_EMAIL || EMAIL).trim();
      if (mode === 'php') {
        url = form.getAttribute('action') || 'contact.php';
        body = new FormData(form);
      } else if (mode === 'formspree') {
        if (!fsId || fsId === 'YOUR_FORM_ID') { show('err', 'The form is not connected yet. Please email ' + EMAIL + ' directly.'); return; }
        url = 'https://formspree.io/f/' + encodeURIComponent(fsId);
        body = new FormData(form);
      } else { // formsubmit (default) → straight to Gmail
        if (location.protocol === 'file:') {
          show('err', 'The form only works when the site is opened from a web address (Live Server or the live site), not from a file on your computer.');
          return;
        }
        url = 'https://formsubmit.co/ajax/' + encodeURIComponent(to);
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          name: f.name.value.trim(),
          email: f.email.value.trim(),
          subject: f.subject.value,
          message: f.message.value.trim(),
          _subject: 'Portfolio message: ' + f.subject.value + ' — from ' + f.name.value.trim(),
          _replyto: f.email.value.trim(),
          _template: 'table',
          _captcha: 'false'
        });
      }

      setBusy(true); show('', '');
      var ctrl = 'AbortController' in window ? new AbortController() : null;
      var kill = setTimeout(function(){ if (ctrl) ctrl.abort(); }, 20000);
      fetch(url, { method: 'POST', body: body, headers: headers, signal: ctrl ? ctrl.signal : undefined })
        .then(function(r){
          return r.json().catch(function(){ return {}; }).then(function(j){ return { ok: r.ok, j: j || {} }; });
        })
        .then(function(res){
          // only say "sent" when the service clearly answered OK
          var sent = res.ok && (res.j.ok === true || res.j.success === true || res.j.success === 'true');
          if (sent) {
            form.reset();
            fields.forEach(function(el){ el.removeAttribute('aria-invalid'); el.closest('.field').classList.remove('bad'); $(el.getAttribute('aria-describedby')).textContent = ''; });
            show('ok', 'Thank you! Your message was sent. Marc will reply by email soon.');
            status.focus({ preventScroll: true });
          } else {
            var msg = res.j.message || res.j.error || (res.j.errors && res.j.errors.map(function(x){ return x.message; }).join(' ')) || 'Sorry, the message could not be sent.';
            if (/activat/i.test(msg)) msg = 'Almost ready: the form needs a one-time activation. Check the ' + to + ' inbox (or Spam) for the FormSubmit "Activate Form" email.';
            show('err', msg + ' You can also email ' + EMAIL + '.');
          }
        })
        .catch(function(){ show('err', 'Could not reach the server. Check your connection, or email ' + EMAIL + '.'); })
        .then(function(){ clearTimeout(kill); setBusy(false); });
    });
  }

  /* ---------- Case study: system flow diagram (arrows draw on scroll, data dot moves) ---------- */
  function initFlow(){
    document.querySelectorAll('.flow').forEach(function(fl){
      if (reduced() || !('IntersectionObserver' in window)) { fl.classList.add('in', 'static'); return; }
      var io = new IntersectionObserver(function(es){
        if (!es.some(function(e){ return e.isIntersecting; })) return;
        io.disconnect();
        fl.classList.add('in');
        setTimeout(function(){
          fl.classList.add('flowing');
          fl.querySelectorAll('animateMotion').forEach(function(a){ try { a.beginElement(); } catch(err) {} });
        }, 3300);
      }, { threshold: .2 });
      io.observe(fl);
    });
  }

  /* ---------- "What does your team need?" decision tree ---------- */
  var MAIL = 'marcaustriapelayo@gmail.com';
  var NEEDS = {
    it: {
      hash: 'need-it', title: 'IT Support / Helpdesk',
      brings: ['BIOS/UEFI Setup & Troubleshooting', 'OS Installation', 'System Cleaning'],
      proof: 'Hands-on hardware repair and PC upgrades (RAM, CPU, GPU, SSD).',
      next: { label: 'Email about an IT Support role', note: 'Opens your email app with the subject filled in.', subject: 'IT Support role – from portfolio' }
    },
    web: {
      hash: 'need-web', title: 'Web Developer',
      brings: ['PHP', 'MySQL', 'JavaScript', 'HTML/CSS', 'Tailwind CSS'],
      proof: 'Built two web systems: TechWorld (ETPCP-AI) and the Student Concern Management System.',
      shots: [{ src: 'assets/techworld-landing.jpg', cap: 'TechWorld — customer landing page' }, { src: 'assets/scms-dashboard.jpg', cap: 'Student Concern Management System — admin dashboard' }],
      next: { label: 'View projects', note: 'Screenshots and details of both systems.', href: '#projects' }
    },
    analyst: {
      hash: 'need-analyst', title: 'Systems Analyst',
      brings: ['System Flow', 'Business Rules', 'DFDs'],
      proof: 'Planned TechWorld before coding; tested by 37 people, including 5 IT experts.',
      shots: [{ src: 'assets/techworld-manager.jpg', cap: 'TechWorld — manager dashboard' }],
      next: { label: 'Read the case study', note: 'TechWorld, from problem to result.', href: 'techworld.html' }
    },
    network: {
      hash: 'need-network', title: 'Network / Hardware Tech',
      brings: ['LAN Setup', 'Routers', 'Cabling', 'Custom PC Building', 'Upgrades (RAM, CPU, GPU, SSD)'],
      proof: 'Hands-on hardware repair, custom PC builds and upgrades.',
      next: { label: 'Download CV', note: 'PDF with the full list of skills.', href: 'Marc-Adrian-Pelayo-CV.pdf', download: true }
    },
    ojt: {
      hash: 'need-ojt', title: 'Intern / OJT',
      brings: ['Programming', 'IT Support', 'Networking', 'Hardware', 'Working student — reliable & on time'],
      proof: 'Cisco Python Essentials 1 & 2 · Best Capstone nominee (Oct 2026).',
      shots: [{ src: 'assets/python-essentials-1.png', cap: 'Python Essentials 1 — Cisco Networking Academy' }],
      next: { label: 'Email about OJT / Internship', note: 'Opens your email app with the subject filled in.', subject: 'OJT / Internship – from portfolio' }
    }
  };
  function initNeeds(){
    var sec = $('needs');
    if (!sec) return;
    var btns = [].slice.call(sec.querySelectorAll('.branch'));
    var flow = sec.querySelector('.tree-flow'), result = $('needResult'), path = sec.querySelector('.tree-path');
    var current = 'ojt', seen = false;
    function el(tag, cls, text){ var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
    function card(i, step){ var c = el('article', 'need-card'); c.style.setProperty('--c', i); c.appendChild(el('span', 'mono need-step', step)); return c; }

    function render(key){
      var d = NEEDS[key];
      result.textContent = '';
      // 1. What Marc brings
      var c1 = card(0, '01 · What Marc brings');
      c1.appendChild(el('h3', null, d.title));
      var ul = el('ul', 'chips'); ul.setAttribute('aria-label', 'Skills');
      d.brings.forEach(function(b){ ul.appendChild(el('li', 'chip', b)); });
      c1.appendChild(ul);
      // 2. Proof
      var c2 = card(1, '02 · Proof');
      c2.appendChild(el('p', null, d.proof));
      if (d.shots) {
        var g = el('div', 'need-shots' + (d.shots.length > 1 ? ' two' : ''));
        d.shots.forEach(function(s){
          var b = el('button', 'need-shot'); b.type = 'button'; b.setAttribute('aria-label', 'Open full size: ' + s.cap);
          var img = el('img'); img.src = s.src; img.alt = ''; img.loading = 'lazy';
          b.appendChild(img);
          b.addEventListener('click', function(){ openLb(s.src, s.cap); });
          g.appendChild(b);
        });
        c2.appendChild(g);
      }
      // 3. Next step
      var c3 = card(2, '03 · Next step');
      c3.appendChild(el('p', null, d.next.note));
      var a = el('a', 'btn btn-primary btn-sm', d.next.label);
      a.href = d.next.subject ? 'mailto:' + MAIL + '?subject=' + encodeURIComponent(d.next.subject) : d.next.href;
      if (d.next.download) { a.setAttribute('download', ''); a.target = '_blank'; a.rel = 'noopener'; }
      c3.appendChild(a);
      result.appendChild(c1); result.appendChild(c2); result.appendChild(c3);
    }

    // line from the chosen branch down to the first card
    function wire(animate){
      var btn = sec.querySelector('.branch[aria-pressed="true"]'), first = result.firstElementChild;
      if (!btn || !first) return;
      var f = flow.getBoundingClientRect(), b = btn.getBoundingClientRect(), c = first.getBoundingClientRect();
      var box = sec.querySelector('.tree-branches').getBoundingClientRect(); // start under the chip group (chips may wrap)
      var x0 = b.left + b.width / 2 - f.left, y0 = box.bottom - f.top, x1 = c.left + c.width / 2 - f.left, y1 = c.top - f.top;
      var mid = Math.round((y0 + y1) / 2);
      path.setAttribute('d', 'M' + x0.toFixed(1) + ' ' + y0.toFixed(1) + 'V' + mid + 'H' + x1.toFixed(1) + 'V' + y1.toFixed(1));
      if (!animate || reduced()) { path.style.transition = 'none'; path.style.strokeDashoffset = '0'; return; }
      path.style.transition = 'none'; path.style.strokeDashoffset = '1';
      void path.getBoundingClientRect();
      path.style.transition = 'stroke-dashoffset .45s ease-out'; path.style.strokeDashoffset = '0';
    }
    function show(animate){
      result.classList.remove('show');
      if (animate && !reduced()) void result.offsetWidth;
      result.classList.add('show');
      wire(animate);
    }
    function select(key, opts){
      if (!NEEDS[key]) return;
      opts = opts || {};
      current = key;
      btns.forEach(function(x){ x.setAttribute('aria-pressed', x.dataset.need === key ? 'true' : 'false'); });
      render(key);
      if (opts.updateHash) { try { history.replaceState(null, '', '#' + NEEDS[key].hash); } catch(e) {} }
      if (seen) show(true);
    }
    function keyFromHash(){
      var h = location.hash.slice(1);
      for (var k in NEEDS) if (NEEDS[k].hash === h) return k;
      return null;
    }
    btns.forEach(function(x){ x.addEventListener('click', function(){ select(x.dataset.need, { updateHash: true }); }); });

    var fromHash = keyFromHash();
    select(fromHash || 'ojt');
    if (fromHash) sec.scrollIntoView();                     // shared link like #need-web opens on this section
    addEventListener('hashchange', function(){ var k = keyFromHash(); if (k && k !== current) { select(k); sec.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' }); } });
    addEventListener('resize', rafThrottle(function(){ if (seen) wire(false); }), { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ if (seen) wire(false); });

    // first reveal plays when the section scrolls into view
    if (reduced() || !('IntersectionObserver' in window)) { seen = true; show(false); return; }
    var io = new IntersectionObserver(function(es){
      if (!es.some(function(e){ return e.isIntersecting; })) return;
      io.disconnect();
      whenBooted(function(){ seen = true; show(true); });
    }, { threshold: .25 });
    io.observe(flow);
  }

  /* ---------- Case study: highlight the current step in the sticky step bar ---------- */
  function initCaseSteps(){
    var links = [].slice.call(document.querySelectorAll('.cs-steps a'));
    if (!links.length) return;
    var secs = links.map(function(a){ return document.querySelector(a.getAttribute('href')); });
    function update(){
      var cur = -1;
      secs.forEach(function(s, i){ if (s && s.getBoundingClientRect().top <= innerHeight * .4) cur = i; });
      links.forEach(function(a, i){
        a.classList.toggle('active', i === cur);
        if (i === cur) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
      });
    }
    addEventListener('scroll', rafThrottle(update), { passive: true });
    update();
  }

  /* ---------- Magnetic buttons (desktop only) ---------- */
  function initMagnetic(){
    var pull = 8;
    document.querySelectorAll('.btn').forEach(function(b){
      var r = null;
      b.addEventListener('mouseenter', function(){ if (desktopFx()) r = b.getBoundingClientRect(); });
      b.addEventListener('mousemove', rafThrottle(function(e){
        if (!r) return;
        var dx = (e.clientX - (r.left + r.width / 2)) * .2, dy = (e.clientY - (r.top + r.height / 2)) * .3;
        dx = Math.max(-pull, Math.min(pull, dx)); dy = Math.max(-pull, Math.min(pull, dy));
        b.style.translate = dx.toFixed(1) + 'px ' + dy.toFixed(1) + 'px';
      }));
      b.addEventListener('mouseleave', function(){ r = null; b.style.translate = ''; });
    });
  }

  initBoot();
  initTheme();
  initSidebar();
  initDrafts();
  initAvailability();
  initJobs();           // before renumber / reveal so new cards are included
  initTestimonials();
  renumber();
  initSocialLinks();
  initProjectLinks();
  initLearning();
  splitHeadings();
  initReveal();
  initScrollFx();
  initBackground();
  initTyper();
  initCountUp();
  initLightbox();
  initGalleries();
  initPC();
  initContactForm();
  initMailLinks();
  initFlow();
  initNeeds();
  initCaseSteps();
  initMagnetic();
})();
