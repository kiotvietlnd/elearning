/* =========================================================
   KiCi Kit v1.0 - dùng chung cho học liệu Channel Manager
   - Thanh trên 42px, thanh chặng, zoom 6 nấc, âm thanh Web Audio
   - Nhân vật KiCi, màn mở bài (khung lời dẫn cố định chiều cao), chữ chạm xem nghĩa
   - Thẻ lật 3D (Từ khóa / Ý nghĩa / Ví dụ), lựa chọn phản xạ, lưu tiến độ theo điểm mốc
   Bài chuẩn tham chiếu: bai-1-1-ban-chat-channel-manager.html
   Tiến độ lưu chung khóa "kvcm_learner_tracker_v1", có các trường sec1..sec5 như bản cũ.
   ========================================================= */
(function () {
  'use strict';
  var KV = window.KV = {};
  var STORE = 'kvcm_learner_tracker_v1';
  var PREF = 'kvcm_prefs';
  var cfg = null, cur = 0, state = { done: {} }, celebrated = false;

  /* ---------- Lưu tùy chọn ---------- */
  function getPref(k, d) { try { var p = JSON.parse(localStorage.getItem(PREF) || '{}'); return k in p ? p[k] : d; } catch (e) { return d; } }
  function setPref(k, v) { try { var p = JSON.parse(localStorage.getItem(PREF) || '{}'); p[k] = v; localStorage.setItem(PREF, JSON.stringify(p)); } catch (e) {} }

  /* ---------- Âm thanh ---------- */
  var actx = null, soundOn = getPref('sound', true);
  function ac() {
    if (!actx) { var A = window.AudioContext || window.webkitAudioContext; if (A) actx = new A(); }
    if (actx && actx.state === 'suspended') actx.resume();
    return actx;
  }
  function osc(c, t, wave, f1, f2, dur, vol, start) {
    var o = c.createOscillator(), g = c.createGain();
    o.type = wave; o.frequency.setValueAtTime(f1, t + start);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + start + dur);
    g.gain.setValueAtTime(vol, t + start); g.gain.exponentialRampToValueAtTime(0.001, t + start + dur);
    o.connect(g); g.connect(c.destination); o.start(t + start); o.stop(t + start + dur + 0.02);
  }
  KV.sound = function (type) {
    if (!soundOn) return;
    try {
      var c = ac(); if (!c) return; var t = c.currentTime;
      if (type === 'click') osc(c, t, 'sine', 750, 0, 0.06, 0.1, 0);
      else if (type === 'whoosh') osc(c, t, 'sine', 280, 840, 0.18, 0.1, 0);
      else if (type === 'success') [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { osc(c, t, 'triangle', f, 0, 0.3, 0.13, i * 0.08); });
      else if (type === 'error') osc(c, t, 'sawtooth', 160, 110, 0.22, 0.08, 0);
    } catch (e) {}
  };

  /* ---------- Zoom 6 nấc ---------- */
  var Z = [70, 80, 90, 100, 120, 150], zi = 3;
  KV.stepZoom = function (d) {
    zi = Math.max(0, Math.min(Z.length - 1, zi + d));
    var p = document.getElementById('page'); if (p) p.style.zoom = Z[zi] / 100;
    var t = document.getElementById('zoom-text'); if (t) t.textContent = Z[zi] + '%';
    (KV.onShow || []).forEach(function (f) { f(); });
    KV.sound('click');
  };
  window.stepZoom = KV.stepZoom;

  /* ---------- KiCi ---------- */
  var FACE = {
    hello: '<circle cx="25" cy="30" r="3.4" fill="#5BE92A"/><circle cx="39" cy="30" r="3.4" fill="#5BE92A"/><path d="M26 36.5q6 5 12 0" stroke="#5BE92A" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    explain: '<rect x="21.5" y="27.5" width="7" height="5" rx="2.5" fill="#5BE92A"/><rect x="35.5" y="27.5" width="7" height="5" rx="2.5" fill="#5BE92A"/><path d="M27 37.5h10" stroke="#5BE92A" stroke-width="2.4" stroke-linecap="round"/>',
    hint: '<circle cx="25" cy="30" r="3.4" fill="#5BE92A"/><path d="M35.5 30.5h7" stroke="#5BE92A" stroke-width="2.6" stroke-linecap="round"/><path d="M26 36.5q6 4 12 0" stroke="#5BE92A" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    think: '<circle cx="25" cy="29" r="3" fill="#5BE92A"/><circle cx="39" cy="29" r="3" fill="#5BE92A"/><path d="M28 37.5q4-2.5 8 0" stroke="#5BE92A" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    done: '<path d="M21.5 31q3.5-4 7 0M35.5 31q3.5-4 7 0" stroke="#5BE92A" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M25 36q7 7 14 0" stroke="#5BE92A" stroke-width="2.6" fill="none" stroke-linecap="round"/>'
  };
  KV.kiciSvg = function (mood) {
    return '<svg viewBox="0 0 64 64" role="img" aria-label="KiCi">' +
      '<line x1="32" y1="5" x2="32" y2="13" stroke="#166def" stroke-width="2.5" stroke-linecap="round"/>' +
      '<circle cx="32" cy="5" r="3.5" fill="#00B63E"/>' +
      '<rect x="4" y="27" width="6" height="12" rx="3" fill="#166def"/><rect x="54" y="27" width="6" height="12" rx="3" fill="#166def"/>' +
      '<rect x="9" y="13" width="46" height="40" rx="14" fill="#002957"/>' +
      '<rect x="15" y="20" width="34" height="24" rx="9" fill="#0b3875"/>' +
      (FACE[mood] || FACE.explain) +
      '<rect x="24" y="53" width="16" height="5" rx="2.5" fill="#166def"/></svg>';
  };
  function mountKici(root) {
    (root || document).querySelectorAll('.kici:not([data-ready])').forEach(function (el) {
      var mood = el.getAttribute('data-mood') || 'explain';
      el.innerHTML = '<div class="kici-ava">' + KV.kiciSvg(mood) + '</div><div class="kici-bubble"><span class="kici-name">KiCi</span><div class="kici-text">' + el.innerHTML + '</div></div>';
      el.setAttribute('data-ready', '1');
    });
  }

  /* ---------- Chữ chạm xem nghĩa: {{Khóa|chữ hiển thị}} ---------- */
  function termify(html) {
    return html.replace(/\{\{([^}|]+)(?:\|([^}]+))?\}\}/g, function (_, k, label) {
      return '<button type="button" class="term" data-term="' + k.trim() + '" aria-expanded="false">' + (label || k).trim() + '</button>';
    });
  }
  KV.termify = termify;
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.term'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var key = b.getAttribute('data-term'), def = (window.KV_TERMS || {})[key]; if (!def) return;
    var host = b.closest('p,li,td,.kici-text,.guest,.ib,.c-box,.term-host') || b.parentElement;
    var inside = /^(TD|LI|TH)$/.test(host.tagName) || host.classList.contains('ib') || host.classList.contains('c-box');
    var ex = inside ? host.querySelector(':scope > .term-def') : (host.nextElementSibling && host.nextElementSibling.classList.contains('term-def') ? host.nextElementSibling : null);
    if (ex) { var same = ex.getAttribute('data-term') === key; ex.remove(); if (same) { b.setAttribute('aria-expanded', 'false'); return; } }
    var d = document.createElement('div');
    d.className = 'term-def'; d.setAttribute('data-term', key);
    d.innerHTML = '<b>' + key + ':</b> ' + def;
    if (inside) host.appendChild(d); else host.insertAdjacentElement('afterend', d);
    b.setAttribute('aria-expanded', 'true');
    KV.sound('click');
  });

  /* ---------- Khung trang ---------- */
  function buildChrome() {
    var top = document.createElement('header');
    top.className = 'topbar';
    top.innerHTML =
      '<div class="tb-left">' +
        '<img class="tb-logo" src="https://cdn-kvweb-website.kiotviet.vn/images/v2/giai-phap/logos/kiotviet-logo-horizontal.svg?v=4dc78976" alt="KiotViet">' +
        '<span class="tb-sep"></span><span class="tb-code">BÀI ' + cfg.code + '</span>' +
        '<div class="tb-title" title="' + cfg.title + '"><h1>' + cfg.shortTitle + '</h1><span class="tip">' + cfg.title + '</span></div>' +
      '</div>' +
      '<div class="tb-right">' +
        '<div class="tb-prog">Tiến độ: <b id="prog-text">0%</b><span class="bar"><i id="prog-bar"></i></span></div>' +
        '<div class="tb-zoom"><button type="button" onclick="stepZoom(-1)" title="Thu nhỏ" aria-label="Thu nhỏ"><i class="fa-solid fa-magnifying-glass-minus"></i></button><span id="zoom-text">100%</span><button type="button" onclick="stepZoom(1)" title="Phóng to" aria-label="Phóng to"><i class="fa-solid fa-magnifying-glass-plus"></i></button></div>' +
        '<button type="button" class="tb-btn" id="sound-toggle" title="Bật/Tắt âm thanh" aria-label="Bật hoặc tắt âm thanh"><i class="fa-solid fa-volume-high"></i></button>' +
        '<span class="tb-ind">Hotel</span>' +
      '</div>';
    var nav = document.createElement('nav');
    nav.className = 'subnav'; nav.setAttribute('aria-label', 'Các chặng của bài');
    nav.innerHTML = '<div class="pills">' + cfg.sections.map(function (s, i) {
      return '<button type="button" class="pill" data-go="' + i + '" title="' + (s.tip || s.label) + '">' +
        '<span class="no">' + (i === 0 ? '<i class="fa-solid fa-flag" style="font-size:9px"></i>' : i) + '</span>' +
        '<span class="lbl">' + s.label + '</span><i class="fa-solid fa-circle-check ok"></i></button>';
    }).join('') + '</div>';
    document.body.insertBefore(nav, document.body.firstChild);
    document.body.insertBefore(top, nav);
    nav.addEventListener('click', function (e) { var b = e.target.closest('[data-go]'); if (b) KV.go(+b.getAttribute('data-go')); });

    var st = document.getElementById('sound-toggle');
    function paintSound() { st.classList.toggle('off', !soundOn); st.innerHTML = soundOn ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>'; }
    st.addEventListener('click', function () { soundOn = !soundOn; setPref('sound', soundOn); paintSound(); KV.sound('click'); });
    paintSound();
  }

  function buildFooters() {
    var secs = document.querySelectorAll('.sec');
    secs.forEach(function (sec, i) {
      if (sec.hasAttribute('data-nofoot')) return;
      var f = document.createElement('div'); f.className = 'sec-foot';
      var prev = i > 0 ? '<button type="button" class="btn" data-go="' + (i - 1) + '"><i class="fa-solid fa-arrow-left"></i> ' + (i - 1 === 0 ? 'Mở bài' : 'Chặng ' + (i - 1)) + '</button>' : '<span></span>';
      var next = i < secs.length - 1 ? '<button type="button" class="btn btn-primary" data-go="' + (i + 1) + '">Tiếp: ' + cfg.sections[i + 1].label + ' <i class="fa-solid fa-arrow-right"></i></button>' : '';
      f.innerHTML = prev + next;
      sec.appendChild(f);
      f.addEventListener('click', function (e) { var b = e.target.closest('[data-go]'); if (b) KV.go(+b.getAttribute('data-go')); });
    });
  }

  KV.go = function (i) {
    var secs = document.querySelectorAll('.sec');
    if (i < 0 || i >= secs.length) return;
    cur = i;
    secs.forEach(function (s, k) { s.classList.toggle('active', k === i); });
    document.querySelectorAll('.pill').forEach(function (p) { p.classList.toggle('active', +p.getAttribute('data-go') === i); });
    (KV.onShow || []).forEach(function (f) { f(); });
    var m = document.getElementById('main'); if (m) m.scrollTop = 0;
    if (KV._ready) KV.sound('whoosh');
    var s = cfg.sections[i];
    if (s && s.cpOnView) KV.done(s.cpOnView);
    if (cfg.onEnter) cfg.onEnter(i);
  };

  /* ---------- Tiến độ theo điểm mốc ---------- */
  function load() { try { var all = JSON.parse(localStorage.getItem(STORE) || '{}'); var s = all[cfg.code]; if (s && s.done) state.done = s.done; } catch (e) {} }
  function secDone(i) {
    var s = cfg.sections[i];
    return !!(s && s.cp && [].concat(s.cp).every(function (c) { return state.done[c]; }));
  }
  function save(pct) {
    try {
      var all = JSON.parse(localStorage.getItem(STORE) || '{}');
      all[cfg.code] = { lessonCode: cfg.code, version: 'kici-v1', pct: pct,
        sec1: secDone(1), sec2: secDone(2), sec3: secDone(3), sec4: secDone(4), sec5: secDone(5),
        done: state.done, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORE, JSON.stringify(all));
    } catch (e) {}
  }
  function render() {
    var w = cfg.checkpoints, tot = 0, got = 0;
    Object.keys(w).forEach(function (k) { tot += w[k]; if (state.done[k]) got += w[k]; });
    var pct = tot ? Math.round(got / tot * 100) : 0;
    var t = document.getElementById('prog-text'), b = document.getElementById('prog-bar');
    if (t) t.textContent = pct + '%'; if (b) b.style.width = pct + '%';
    document.querySelectorAll('.pill').forEach(function (p) {
      var s = cfg.sections[+p.getAttribute('data-go')];
      var ok = s && s.cp && [].concat(s.cp).every(function (c) { return state.done[c]; });
      p.classList.toggle('done', !!ok);
    });
    document.querySelectorAll('[data-stop]').forEach(function (el) {
      var s = cfg.sections[+el.getAttribute('data-stop')];
      var ok = s && s.cp && [].concat(s.cp).every(function (c) { return state.done[c]; });
      el.classList.toggle('done', !!ok);
    });
    save(pct);
    if (pct === 100 && !celebrated) { celebrated = true; if (cfg.onComplete) cfg.onComplete(); }
  }
  KV.done = function (id) { if (state.done[id]) return; state.done[id] = true; render(); };
  KV.isDone = function (id) { return !!state.done[id]; };
  KV.reset = function () { state.done = {}; celebrated = false; render(); };

  /* ---------- Màn mở bài có KiCi ---------- */
  KV.intro = function (root, steps, onFinish) {
    var box = root.querySelector('.intro-box'), i = 0;
    box.innerHTML = '<div class="kici keep" style="margin:0"><div class="kici-ava big"></div><div class="kici-bubble">' +
      '<span class="kici-name"></span><div class="kici-text" aria-live="polite"></div>' +
      '<div class="intro-ctrl"><button type="button" class="btn" data-a="back"><i class="fa-solid fa-arrow-left"></i> Quay lại</button>' +
      '<button type="button" class="btn btn-primary" data-a="next">Tiếp</button><span class="dots">' + steps.map(function () { return '<i></i>'; }).join('') + '</span></div></div></div>';
    var ava = box.querySelector('.kici-ava'), name = box.querySelector('.kici-name'), text = box.querySelector('.kici-text');
    var back = box.querySelector('[data-a=back]'), next = box.querySelector('[data-a=next]'), dots = box.querySelectorAll('.dots i');
    function paint() {
      var s = steps[i];
      ava.innerHTML = KV.kiciSvg(s.mood); name.textContent = 'KiCi' + (s.label ? ' · ' + s.label : '');
      text.innerHTML = termify(s.text);
      back.disabled = i === 0;
      next.innerHTML = i === steps.length - 1 ? 'Bắt đầu Chặng 1 <i class="fa-solid fa-arrow-right"></i>' : 'Tiếp <i class="fa-solid fa-arrow-right"></i>';
      dots.forEach(function (d, k) { d.className = k <= i ? 'on' : ''; });
      root.querySelectorAll('[data-focus]').forEach(function (el) { el.classList.toggle('focus', (s.focus || []).indexOf(el.getAttribute('data-focus')) > -1); });
    }
    /* Khung lời dẫn cố định: đo câu dài nhất ở bề rộng hiện tại, đặt min-height để nội dung bên dưới không nhảy */
    function lockHeight() {
      var keep = text.innerHTML, max = 0;
      text.style.minHeight = '0px';
      steps.forEach(function (s) { text.innerHTML = termify(s.text); max = Math.max(max, text.offsetHeight); });
      text.innerHTML = keep;
      text.style.minHeight = max + 'px';
    }
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(lockHeight, 150); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(lockHeight);
    KV.onShow = KV.onShow || []; KV.onShow.push(lockHeight);
    back.addEventListener('click', function () { if (i > 0) { i--; paint(); KV.sound('click'); } });
    next.addEventListener('click', function () {
      if (i < steps.length - 1) { i++; paint(); KV.sound('click'); if (i === steps.length - 1) KV.done('intro'); }
      else { KV.done('intro'); if (onFinish) onFinish(); }
    });
    root.querySelectorAll('.road .stop').forEach(function (s) { s.addEventListener('click', function () { KV.go(+s.getAttribute('data-stop')); }); });
    paint();
    lockHeight();
  };

  /* ---------- Thẻ lật 3D ---------- */
  KV.flipcards = function (container, cp) {
    var cards = container.querySelectorAll('.flip'), seen = {}, counter = container.querySelector('.flip-count span');
    function update() {
      var n = Object.keys(seen).length;
      if (counter) counter.textContent = n + ' / ' + cards.length + ' thẻ đã lật';
      if (n === cards.length && cp) KV.done(cp);
    }
    cards.forEach(function (c, i) {
      c.setAttribute('tabindex', '0'); c.setAttribute('role', 'button');
      var back = c.querySelector('.back');
      /* Mặt sau luôn nhắc lại từ khóa ở mặt trước */
      if (back && !back.querySelector('.kw')) {
        var en = c.querySelector('.front .en'), vi = c.querySelector('.front .vi');
        back.insertAdjacentHTML('afterbegin', '<div class="kw"><small>Từ khóa</small><b>' + (en ? en.innerHTML : '') + '</b>' + (vi ? '<span>' + vi.innerHTML + '</span>' : '') + '</div>');
      }
      if (back && !back.querySelector('.badge')) back.insertAdjacentHTML('beforeend', '<span class="badge"><i class="fa-solid fa-circle-check"></i> Đã khám phá</span>');
      if (cp && KV.isDone(cp)) { seen[i] = 1; c.classList.add('seen'); }
      function flip(e) {
        if (e && e.target.closest('.term')) return;
        c.classList.toggle('flipped'); KV.sound('whoosh');
        if (c.classList.contains('flipped')) { seen[i] = 1; c.classList.add('seen'); update(); }
      }
      c.addEventListener('click', flip);
      c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
    });
    update();
  };

  /* ---------- Lựa chọn phản xạ ---------- */
  KV.choices = function (root, onCorrect) {
    (root || document).querySelectorAll('.choice').forEach(function (ch) {
      var ans = ch.getAttribute('data-answer'), id = ch.getAttribute('data-id');
      var fb = ch.querySelector('.fb-out'), store = ch.querySelector('.fb-store'), status = ch.querySelector('.status');
      if (KV.isDone(id) && status) { status.textContent = 'Đã trả lời đúng'; status.classList.add('ok'); }
      ch.querySelectorAll('.opt').forEach(function (o) {
        o.addEventListener('click', function () {
          var k = o.getAttribute('data-k'), ok = k === ans;
          ch.querySelectorAll('.opt').forEach(function (x) { x.classList.remove('sel'); x.setAttribute('aria-pressed', 'false'); });
          o.classList.add('sel'); o.setAttribute('aria-pressed', 'true');
          var msg = store.querySelector('[data-k="' + k + '"]');
          fb.className = 'fb fb-out ' + (ok ? 'ok' : 'no'); fb.hidden = false;
          fb.innerHTML = '<div class="kici-ava">' + KV.kiciSvg(ok ? 'done' : 'hint') + '</div><div>' +
            '<b>' + (ok ? 'Chính xác!' : 'Chưa đúng, thử lại nhé.') + '</b>' + termify(msg ? msg.innerHTML : '') + '</div>';
          KV.sound(ok ? 'success' : 'error');
          if (ok) { if (status) { status.textContent = 'Đã trả lời đúng'; status.classList.add('ok'); } KV.done(id); if (onCorrect) onCorrect(id); }
        });
      });
    });
  };

  /* ---------- Ảnh giao diện: .shots > figure.shot[data-sys] ----------
     data-sys: kv | hl | ota (kèm data-ota="Agoda") | leader. Nhiều ảnh trong 1 .shots thành bộ chuyển 1/N.
     Bấm ảnh để phóng to; trong khung phóng to dùng phím mũi tên, Esc để đóng. */
  var SYS = { kv: 'KiotViet', hl: 'Hotel Link', leader: 'Việc của Leader · Bạn chỉ cần biết', info: 'Minh họa' };
  var lb = null, lbList = [], lbIdx = 0;
  function lbPaint() {
    var f = lbList[lbIdx], img = f.querySelector('img'), cap = f.querySelector('figcaption');
    lb.querySelector('img').src = img.currentSrc || img.src;
    lb.querySelector('img').alt = img.alt;
    lb.querySelector('.lb-cap').innerHTML = (lbList.length > 1 ? '<b>' + (lbIdx + 1) + '/' + lbList.length + '</b>' : '') + (cap ? cap.textContent : '');
    lb.querySelector('.lb-p').hidden = lb.querySelector('.lb-n').hidden = lbList.length < 2;
  }
  function lbOpen(list, i) {
    if (!lb) {
      lb = document.createElement('div'); lb.className = 'lb'; lb.hidden = true;
      lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Ảnh phóng to');
      lb.innerHTML = '<button type="button" class="lb-x" aria-label="Đóng"><i class="fa-solid fa-xmark"></i></button>' +
        '<button type="button" class="lb-p" aria-label="Ảnh trước"><i class="fa-solid fa-chevron-left"></i></button>' +
        '<img alt=""><div class="lb-cap"></div>' +
        '<button type="button" class="lb-n" aria-label="Ảnh sau"><i class="fa-solid fa-chevron-right"></i></button>';
      document.body.appendChild(lb);
      lb.addEventListener('click', function (e) {
        if (e.target === lb || e.target.closest('.lb-x')) lbClose();
        else if (e.target.closest('.lb-p')) lbMove(-1);
        else if (e.target.closest('.lb-n')) lbMove(1);
      });
      document.addEventListener('keydown', function (e) {
        if (lb.hidden) return;
        if (e.key === 'Escape') lbClose(); else if (e.key === 'ArrowLeft') lbMove(-1); else if (e.key === 'ArrowRight') lbMove(1);
      });
    }
    lbList = list; lbIdx = i; lbPaint(); lb.hidden = false; lb.querySelector('.lb-x').focus(); KV.sound('click');
  }
  function lbMove(d) { if (lbList.length < 2) return; lbIdx = (lbIdx + d + lbList.length) % lbList.length; lbPaint(); KV.sound('click'); }
  function lbClose() { lb.hidden = true; var f = lbList[lbIdx]; if (f) { var b = f.querySelector('.frame'); if (b) b.focus(); } }
  KV.shots = function (root) {
    (root || document).querySelectorAll('figure.shot:not([data-ready])').forEach(function (f) {
      var img = f.querySelector('img'); if (!img) return;
      var sys = f.getAttribute('data-sys') || 'kv', label = sys === 'ota' ? (f.getAttribute('data-ota') || 'Sàn OTA') : (SYS[sys] || '');
      var frame = document.createElement('button');
      frame.type = 'button'; frame.className = 'frame'; frame.setAttribute('aria-label', 'Phóng to ảnh: ' + (img.alt || ''));
      img.parentNode.insertBefore(frame, img); frame.appendChild(img);
      frame.insertAdjacentHTML('beforeend', (label ? '<span class="sys">' + label + '</span>' : '') + '<span class="zoom"><i class="fa-solid fa-magnifying-glass-plus"></i> Bấm để phóng to</span>');
      var cap = f.querySelector('figcaption');
      if (cap && !cap.querySelector('i')) cap.insertAdjacentHTML('afterbegin', '<i class="fa-solid ' + (sys === 'leader' ? 'fa-user-shield' : sys === 'info' ? 'fa-image' : 'fa-display') + '"></i>');
      f.setAttribute('data-ready', '1');
    });
    (root || document).querySelectorAll('.shots:not([data-ready])').forEach(function (set) {
      var figs = [].slice.call(set.querySelectorAll('figure.shot')), i = 0;
      figs.forEach(function (f, k) { f.querySelector('.frame').addEventListener('click', function () { lbOpen(figs, k); }); });
      set.setAttribute('data-ready', '1');
      if (figs.length < 2) { if (figs[0]) figs[0].classList.add('cur'); return; }
      set.classList.add('multi');
      var nav = document.createElement('div'); nav.className = 'shot-nav';
      nav.innerHTML = '<span class="lbl"></span><span class="ctl"><button type="button" data-d="-1" aria-label="Màn hình trước"><i class="fa-solid fa-chevron-left"></i></button>' +
        '<span class="dt">' + figs.map(function () { return '<i></i>'; }).join('') + '</span>' +
        '<button type="button" data-d="1" aria-label="Màn hình sau"><i class="fa-solid fa-chevron-right"></i></button></span>';
      set.insertBefore(nav, set.firstChild);
      var dots = nav.querySelectorAll('.dt i'), prev = nav.querySelector('[data-d="-1"]'), next = nav.querySelector('[data-d="1"]');
      function show(k) {
        i = k; figs.forEach(function (f, j) { f.classList.toggle('cur', j === i); });
        dots.forEach(function (d, j) { d.classList.toggle('on', j === i); });
        nav.querySelector('.lbl').textContent = 'Màn hình ' + (i + 1) + ' / ' + figs.length;
        prev.disabled = i === 0; next.disabled = i === figs.length - 1;
      }
      nav.addEventListener('click', function (e) { var b = e.target.closest('[data-d]'); if (!b || b.disabled) return; show(i + +b.getAttribute('data-d')); KV.sound('click'); });
      show(0);
    });
    document.querySelectorAll('figure.shot').forEach(function (f) {
      if (!f.closest('.shots') && !f.hasAttribute('data-lb')) { f.setAttribute('data-lb', '1'); f.querySelector('.frame').addEventListener('click', function () { lbOpen([f], 0); }); }
    });
  };

  /* ---------- Pháo hoa (tùy chọn) ---------- */
  KV.confetti = function () {
    if (window.confetti) window.confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    KV.sound('success');
  };

  /* ---------- Khởi tạo ---------- */
  KV.init = function (c) {
    cfg = c;
    var page = document.getElementById('page');
    page.innerHTML = termify(page.innerHTML);
    load();
    buildChrome();
    buildFooters();
    mountKici(document);
    KV.shots(document);
    render();
    if (cfg.onReady) cfg.onReady();
    KV.go(0);
    KV._ready = true;
  };
})();
