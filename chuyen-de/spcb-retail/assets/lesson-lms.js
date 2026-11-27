/* ==========================================================================
   KiotViet LMS Lesson Kit v1.0 - SPCB Retail (Buổi 1 Edition)
   - Nhân vật KiCi (chỉ svg + mount .kici-ava / .kici-box / .kici-lead)
   - Chữ chạm xem nghĩa {{Khóa|Hiển thị}}
   - Video YouTube 16:9 nhúng trực tiếp
   - Step-by-Step Highlight khung cam + Tự bấm thử + Phóng to (từ Demo Nhật Vi)
   - Spotlight Tour hướng dẫn cách học (.tour + #help-fab)
   - Thẻ lật 3D, Quiz nhanh, Checklist tự kiểm cuối bài
   - KHÔNG vẽ thanh điều hướng liên bài, KHÔNG nút hoàn thành học phần LMS
   ========================================================================== */
(function () {
  'use strict';
  var KVL = window.KVL = {};
  var STORE_GUIDE = 'kv_spcb_lms_guide_v1';
  var STORE_TOUR = 'kv_spcb_lms_tour_seen';
  var actx = null;

  /* ---------- Âm thanh Web Audio ---------- */
  KVL.sound = function (type) {
    try {
      var A = window.AudioContext || window.webkitAudioContext;
      if (!A) return;
      if (!actx) actx = new A();
      if (actx.state === 'suspended') actx.resume();
      var t = actx.currentTime;
      var o = actx.createOscillator();
      var g = actx.createGain();
      o.connect(g);
      g.connect(actx.destination);
      if (type === 'success') {
        o.type = 'triangle';
        o.frequency.setValueAtTime(587.33, t);
        o.frequency.exponentialRampToValueAtTime(880, t + 0.16);
        g.gain.setValueAtTime(0.08, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        o.start(t); o.stop(t + 0.24);
      } else if (type === 'error') {
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(160, t);
        o.frequency.exponentialRampToValueAtTime(115, t + 0.16);
        g.gain.setValueAtTime(0.05, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        o.start(t); o.stop(t + 0.2);
      } else {
        o.type = 'sine';
        o.frequency.setValueAtTime(740, t);
        g.gain.setValueAtTime(0.05, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        o.start(t); o.stop(t + 0.08);
      }
    } catch (e) {}
  };

  /* ---------- KiCi SVG & Mount ---------- */
  var FACES = {
    hello: '<circle cx="25" cy="30" r="3.4" fill="#5BE92A"/><circle cx="39" cy="30" r="3.4" fill="#5BE92A"/><path d="M26 36.5q6 5 12 0" stroke="#5BE92A" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    explain: '<rect x="21.5" y="27.5" width="7" height="5" rx="2.5" fill="#5BE92A"/><rect x="35.5" y="27.5" width="7" height="5" rx="2.5" fill="#5BE92A"/><path d="M27 37.5h10" stroke="#5BE92A" stroke-width="2.4" stroke-linecap="round"/>',
    hint: '<circle cx="25" cy="30" r="3.4" fill="#5BE92A"/><path d="M35.5 30.5h7" stroke="#5BE92A" stroke-width="2.6" stroke-linecap="round"/><path d="M26 36.5q6 4 12 0" stroke="#5BE92A" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    done: '<path d="M21.5 31q3.5-4 7 0M35.5 31q3.5-4 7 0" stroke="#5BE92A" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M25 36q7 7 14 0" stroke="#5BE92A" stroke-width="2.6" fill="none" stroke-linecap="round"/>'
  };

  KVL.kiciSvg = function (mood) {
    return '<svg viewBox="0 0 64 64" role="img" aria-label="KiCi">' +
      '<line x1="32" y1="5" x2="32" y2="13" stroke="#166def" stroke-width="2.5" stroke-linecap="round"/>' +
      '<circle cx="32" cy="5" r="3.5" fill="#00B63E"/>' +
      '<rect x="4" y="27" width="6" height="12" rx="3" fill="#166def"/>' +
      '<rect x="54" y="27" width="6" height="12" rx="3" fill="#166def"/>' +
      '<rect x="9" y="13" width="46" height="40" rx="14" fill="#002957"/>' +
      '<rect x="15" y="20" width="34" height="24" rx="9" fill="#0b3875"/>' +
      (FACES[mood] || FACES.explain) +
      '<rect x="24" y="53" width="16" height="5" rx="2.5" fill="#166def"/></svg>';
  };

  KVL.termify = function (html) {
    return String(html || '').replace(/\{\{([^}|]+)(?:\|([^}]+))?\}\}/g, function (_, k, label) {
      return '<button type="button" class="term" data-term="' + k.trim() + '" aria-expanded="false">' + (label || k).trim() + '</button>';
    });
  };

  function mountKici() {
    document.querySelectorAll('.kici-box:not([data-ready]), .kici-lead:not([data-ready])').forEach(function (el) {
      var mood = el.getAttribute('data-mood') || 'explain';
      var title = el.getAttribute('data-title') || 'KiCi · Người bạn đồng hành L&D';
      var isLead = el.classList.contains('kici-lead');
      var txt = KVL.termify(el.innerHTML);
      el.innerHTML =
        '<div class="kici-ava">' + KVL.kiciSvg(mood) + '</div>' +
        '<div class="kici-body">' +
          (isLead ? '' : '<div class="kici-name"><i class="fa-solid fa-sparkles"></i> ' + title + '</div>') +
          '<div class="kici-text">' + (isLead ? '<b>KiCi:</b> ' : '') + txt + '</div>' +
        '</div>';
      el.setAttribute('data-ready', '1');
    });
  }

  function wireTerms() {
    document.querySelectorAll('.termify').forEach(function (el) {
      if (!el.getAttribute('data-termified')) {
        el.innerHTML = KVL.termify(el.innerHTML);
        el.setAttribute('data-termified', '1');
      }
    });
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.term');
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      var key = b.getAttribute('data-term');
      var def = (window.KV_TERMS || {})[key];
      if (!def) return;
      var host = b.closest('p, li, td, .kici-text, .g-col, .tl-panel') || b.parentElement;
      var ex = host.nextElementSibling && host.nextElementSibling.classList.contains('term-def')
        ? host.nextElementSibling
        : host.querySelector(':scope > .term-def');
      if (ex) {
        var same = ex.getAttribute('data-term') === key;
        ex.remove();
        if (same) { b.setAttribute('aria-expanded', 'false'); return; }
      }
      var box = document.createElement('div');
      box.className = 'term-def';
      box.setAttribute('data-term', key);
      box.innerHTML = '<b>' + key + ':</b> ' + def;
      if (/^(TD|LI)$/.test(host.tagName)) host.appendChild(box);
      else host.insertAdjacentElement('afterend', box);
      b.setAttribute('aria-expanded', 'true');
      KVL.sound('click');
    });
  }

  /* ---------- Video YouTube 16:9 ---------- */
  function mountVideos() {
    document.querySelectorAll('[data-yt]').forEach(function (host) {
      var id = host.getAttribute('data-yt');
      var title = host.getAttribute('data-title') || 'Video hướng dẫn KiotViet';
      if (!id) return;
      host.innerHTML =
        '<div class="video-box">' +
          '<iframe src="https://www.youtube.com/embed/' + id + '?rel=0" title="' + title + '" ' +
          'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>' +
        '</div>' +
        '<div class="video-foot">' +
          '<span><i class="fa-brands fa-youtube" style="color:#dc2626"></i> Video chính thức KiotViet · ' + title + '</span>' +
          '<a href="https://www.youtube.com/watch?v=' + id + '" target="_blank" rel="noopener noreferrer">' +
            '<i class="fa-solid fa-arrow-up-right-from-square"></i> Mở YouTube nếu bị chặn khung' +
          '</a>' +
        '</div>';
    });
  }

  /* ---------- Trình xem ảnh tĩnh (cho Bài 1.1, 1.2) ---------- */
  KVL.shotViewer = function (hostId, shots) {
    var host = document.getElementById(hostId);
    if (!host || !shots || !shots.length) return;
    var idx = 0;
    function render() {
      var s = shots[idx];
      host.innerHTML =
        '<div class="shot-viewer">' +
          '<div class="shot-stage" title="Bấm để phóng to ảnh"><img src="' + s.img + '" alt="' + s.alt + '"></div>' +
          '<div class="shot-cap"><b><i class="fa-solid fa-desktop" style="color:var(--kv-blue)"></i> Màn hình ' + (idx + 1) + '/' + shots.length + ':</b> ' + s.cap + '</div>' +
          (shots.length > 1
            ? '<div class="shot-nav">' +
                '<div class="btn-row">' +
                  '<button type="button" class="btn" data-sv="-1"' + (idx === 0 ? ' disabled' : '') + '><i class="fa-solid fa-arrow-left"></i> Ảnh trước</button>' +
                  '<button type="button" class="btn btn-primary" data-sv="1"' + (idx === shots.length - 1 ? ' disabled' : '') + '>Ảnh tiếp <i class="fa-solid fa-arrow-right"></i></button>' +
                '</div>' +
                '<button type="button" class="btn" data-sv-zoom="1"><i class="fa-solid fa-expand"></i> Phóng to</button>' +
              '</div>'
            : '<div class="shot-nav"><span></span><button type="button" class="btn" data-sv-zoom="1"><i class="fa-solid fa-expand"></i> Phóng to</button></div>') +
        '</div>';
    }
    host.addEventListener('click', function (e) {
      var nb = e.target.closest('[data-sv]');
      if (nb && !nb.disabled) {
        idx = Math.max(0, Math.min(shots.length - 1, idx + (+nb.getAttribute('data-sv'))));
        KVL.sound('click');
        render();
        return;
      }
      if (e.target.closest('[data-sv-zoom]') || e.target.closest('.shot-stage')) {
        var s = shots[idx];
        var dlg = document.createElement('div');
        dlg.className = 'g-full';
        dlg.setAttribute('role', 'dialog');
        dlg.innerHTML =
          '<button type="button" class="g-full-x" aria-label="Đóng"><i class="fa-solid fa-xmark"></i></button>' +
          '<div class="g-stage"><div class="g-imgbox"><img src="' + s.img + '" alt="' + s.alt + '"></div></div>' +
          '<div class="g-full-bar"><div class="g-full-cap"><b>' + s.alt + '</b><small>' + s.cap + ' · Bấm Esc để đóng</small></div></div>';
        document.body.appendChild(dlg);
        function closeDlg() { dlg.remove(); document.removeEventListener('keydown', onK); }
        function onK(ev) { if (ev.key === 'Escape') closeDlg(); }
        dlg.addEventListener('click', function (ev) { if (ev.target === dlg || ev.target.closest('.g-full-x')) closeDlg(); });
        document.addEventListener('keydown', onK);
        KVL.sound('click');
      }
    });
    render();
  };

  /* ---------- Step-by-Step Guide (tích hợp từ Demo Nhật Vi) ---------- */
  function readGuideStore() {
    try { return JSON.parse(localStorage.getItem(STORE_GUIDE) || '{}'); } catch (e) { return {}; }
  }
  function saveGuideStore(lessonId, fn) {
    try {
      var all = readGuideStore();
      var s = all[lessonId] || {};
      fn(s);
      all[lessonId] = s;
      localStorage.setItem(STORE_GUIDE, JSON.stringify(all));
    } catch (e) {}
  }

  function positionCallout(boxHost, ring, call, box) {
    ring.hidden = false;
    ring.style.left = box[0] + '%';
    ring.style.top = box[1] + '%';
    ring.style.width = box[2] + '%';
    ring.style.height = box[3] + '%';
    var sw = boxHost.clientWidth, sh = boxHost.clientHeight;
    if (!sw || !sh) return;
    var cx = (box[0] + box[2] / 2) / 100 * sw;
    var topPx = box[1] / 100 * sh;
    var botPx = (box[1] + box[3]) / 100 * sh;
    var cw = call.offsetWidth || 120, ch = call.offsetHeight || 28;
    var placeAbove = botPx + ch + 14 > sh;
    call.classList.toggle('above', placeAbove);
    call.classList.toggle('below', !placeAbove);
    var callTop = placeAbove ? Math.max(6, topPx - ch - 12) : Math.min(sh - ch - 6, botPx + 12);
    var callLeft = Math.max(8, Math.min(sw - cw - 8, cx - cw / 2));
    call.style.top = (callTop / sh * 100) + '%';
    call.style.left = (callLeft / sw * 100) + '%';
    var arrowPx = Math.max(16, Math.min(cw - 16, cx - callLeft));
    call.style.setProperty('--ax', arrowPx + 'px');
  }

  function measureStepBox(st, boxHost) {
    if (st.box) return st.box;
    if (st.mock && st.t) {
      var el = boxHost.querySelector('[data-mk="' + st.t + '"]');
      if (!el) return null;
      var sr = boxHost.getBoundingClientRect(), er = el.getBoundingClientRect();
      if (!sr.width || !sr.height) return null;
      var pad = 4;
      return [
        Math.max(0, (er.left - sr.left - pad) / sr.width * 100),
        Math.max(0, (er.top - sr.top - pad) / sr.height * 100),
        Math.min(100, (er.width + pad * 2) / sr.width * 100),
        Math.min(100, (er.height + pad * 2) / sr.height * 100)
      ];
    }
    return null;
  }

  function openFullGuide(ctrl, mocks) {
    var o = document.createElement('div');
    o.className = 'g-full'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true');
    o.innerHTML =
      '<button type="button" class="g-full-x" aria-label="Đóng"><i class="fa-solid fa-xmark"></i></button>' +
      '<div class="g-quiz" style="width:min(94vw,1100px);border-radius:10px" hidden></div>' +
      '<div class="g-stage"><div class="g-imgbox"><img alt=""><div class="mk" hidden></div><div class="g-ring" hidden title="Bấm để sang thao tác tiếp"></div><div class="g-call"><span class="n"></span><span class="lbl"></span></div></div></div>' +
      '<div class="g-full-bar"><div class="g-full-cap"></div>' +
      '<div class="g-full-ctl">' +
        '<button type="button" class="btn" data-fmode="1"></button>' +
        '<button type="button" class="btn" data-fnav="-1"><i class="fa-solid fa-arrow-left"></i> Trước</button>' +
        '<button type="button" class="btn btn-primary" data-fnav="1">Tiếp <i class="fa-solid fa-arrow-right"></i></button>' +
      '</div></div>';
    document.body.appendChild(o);
    var fquiz = o.querySelector('.g-quiz'), fstage = o.querySelector('.g-stage'), fbox = o.querySelector('.g-imgbox');
    var fimg = fbox.querySelector('img'), fmk = fbox.querySelector('.mk'), fr = fbox.querySelector('.g-ring'), fc = fbox.querySelector('.g-call');
    var fcap = o.querySelector('.g-full-cap'), fmode = o.querySelector('[data-fmode]'), fprev = o.querySelector('[data-fnav="-1"]'), fnext = o.querySelector('[data-fnav="1"]');
    var fMiss = 0, fHint = false;

    function paintFQuiz(cls, msg) {
      var q = ctrl.getQuiz();
      fquiz.hidden = !q;
      fquiz.className = 'g-quiz' + (cls ? ' ' + cls : '');
      fmode.innerHTML = q ? '<i class="fa-solid fa-eye"></i> Hiện khung gợi ý' : '<i class="fa-solid fa-crosshairs"></i> Tự bấm thử';
      fstage.style.cursor = q ? 'crosshair' : 'default';
      if (q) fquiz.innerHTML = '<span><i class="fa-solid fa-crosshairs"></i> ' + (msg || ('Thử thách: Hãy bấm đúng vị trí trên ảnh để thực hiện — <b>' + ctrl.info().step.title + '</b>')) + '</span>';
    }
    function syncBox() {
      var s = ctrl.info().step, b = measureStepBox(s, fbox);
      fr.classList.remove('hit');
      if (ctrl.getQuiz() && !fHint) { fr.hidden = true; fc.hidden = true; return; }
      if (b) { fc.hidden = false; positionCallout(fbox, fr, fc, b); } else { fr.hidden = true; fc.hidden = true; }
    }
    function sync() {
      var info = ctrl.info(), s = info.step;
      fMiss = 0; fHint = false;
      fbox.classList.toggle('is-mock', !!s.mock);
      if (s.mock) { fimg.hidden = true; fmk.hidden = false; fmk.innerHTML = (mocks && mocks[s.mock]) || ''; }
      else { fmk.hidden = true; fimg.hidden = false; fimg.onload = syncBox; fimg.src = s.img; fimg.alt = s.title; }
      fc.querySelector('.n').textContent = info.m + 1;
      fc.querySelector('.lbl').textContent = s.label || s.title;
      fcap.innerHTML = '<b>Bước ' + (info.p + 1) + ' · Thao tác ' + (info.m + 1) + '/' + info.len + ':</b> ' + s.title +
        '<small>Dùng phím ← / → hoặc Enter để chuyển thao tác · Esc để đóng</small>';
      fprev.disabled = info.isFirst;
      fnext.innerHTML = info.isLast ? 'Hoàn tất <i class="fa-solid fa-check"></i>' : 'Tiếp <i class="fa-solid fa-arrow-right"></i>';
      paintFQuiz();
      requestAnimationFrame(syncBox);
    }
    function stepBy(d) {
      if (d > 0 && ctrl.info().isLast) { close(); return; }
      if (ctrl.step(d)) sync();
    }
    function close() { o.remove(); document.removeEventListener('keydown', key); window.removeEventListener('resize', syncBox); }
    function key(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
      else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); stepBy(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); stepBy(-1); }
    }
    o.addEventListener('click', function (e) {
      if (e.target === o || e.target.closest('.g-full-x')) { close(); return; }
      if (e.target.closest('[data-fmode]')) { ctrl.toggleQuiz(); fMiss = 0; fHint = false; paintFQuiz(); syncBox(); return; }
      var b = e.target.closest('[data-fnav]'); if (b && !b.disabled) { stepBy(+b.getAttribute('data-fnav')); return; }
      if (e.target.closest('.g-imgbox')) {
        if (ctrl.getQuiz()) {
          var s = ctrl.info().step, bx = measureStepBox(s, fbox);
          if (!bx) return;
          var r = fbox.getBoundingClientRect();
          if (!r.width || !r.height) return;
          var px = (e.clientX - r.left) / r.width * 100, py = (e.clientY - r.top) / r.height * 100, tol = 2.5;
          if (px >= bx[0] - tol && px <= bx[0] + bx[2] + tol && py >= bx[1] - tol && py <= bx[1] + bx[3] + tol) {
            positionCallout(fbox, fr, fc, bx); fr.classList.add('hit'); fc.hidden = false;
            paintFQuiz('ok', '<b>Chính xác!</b> Đang chuyển sang thao tác tiếp theo...');
            KVL.sound('success');
            setTimeout(function () { stepBy(1); }, 650);
          } else {
            fMiss++;
            var dot = document.createElement('span'); dot.className = 'g-miss';
            dot.style.left = px + '%'; dot.style.top = py + '%';
            fbox.appendChild(dot); setTimeout(function () { dot.remove(); }, 750);
            KVL.sound('error');
            if (fMiss >= 2) { fHint = true; syncBox(); paintFQuiz('err', 'Chưa đúng vị trí — khung cam gợi ý đã hiện ra, bạn bấm vào đúng khung cam nhé!'); }
            else paintFQuiz('err', 'Chưa đúng vị trí, bạn thử bấm lại nhé! (Sai thêm 1 lần sẽ hiện khung gợi ý)');
          }
          return;
        }
        if (e.target.closest('.g-ring')) stepBy(1);
      }
    });
    document.addEventListener('keydown', key);
    window.addEventListener('resize', syncBox);
    sync();
    o.setAttribute('tabindex', '-1'); o.focus();
    KVL.sound('click');
  }

  KVL.guide = function (opts) {
    var wrap = document.getElementById(opts.wrapId);
    if (!wrap) return;
    var phases = opts.phases || [];
    var mocks = opts.mocks || {};
    var lessonId = opts.lessonId || 'spcb';
    var guideKey = opts.guideId || opts.wrapId;
    var tlSteps = wrap.querySelectorAll('.tl-step');
    var panels = wrap.querySelectorAll('.tl-panel');
    var host = wrap.querySelector('[data-guide]');
    if (!host || !phases.length) return;

    var allSaved = (readGuideStore()[lessonId]) || {};
    var seen = (allSaved.seen && allSaved.seen[guideKey]) || {};
    var practiced = (allSaved.practiced && allSaved.practiced[guideKey]) || {};
    var p = 0, m = 0, quizMode = false, misses = 0, hintShown = false;

    host.innerHTML =
      '<div class="g-head"><div class="g-chips"></div><div class="meta-prog" style="font-size:12.5px;color:var(--ink-muted);font-weight:700"></div></div>' +
      '<div class="g-screen">' +
        '<div class="g-bar"><span class="lights"><i></i><i></i><i></i></span><span class="path"></span>' +
        '<button type="button" class="g-mode" title="Ẩn khung cam để tự bấm thử tìm đúng vị trí"><i class="fa-solid fa-crosshairs"></i> Tự bấm thử</button>' +
        '<button type="button" class="g-zoom" title="Phóng to màn hình"><i class="fa-solid fa-expand"></i> Phóng to</button></div>' +
        '<div class="g-quiz" hidden></div>' +
        '<div class="g-stage"><div class="g-imgbox"><img alt=""><div class="mk" hidden></div><div class="g-ring" hidden></div><div class="g-call"><span class="n"></span><span class="lbl"></span></div></div></div>' +
      '</div>' +
      '<div class="g-detail"></div>';

    var chipsEl = host.querySelector('.g-chips');
    var metaProg = host.querySelector('.meta-prog');
    var modeBtn = host.querySelector('.g-mode');
    var quizEl = host.querySelector('.g-quiz');
    var stage = host.querySelector('.g-stage');
    var imgBox = stage.querySelector('.g-imgbox');
    var img = imgBox.querySelector('img');
    var mkEl = imgBox.querySelector('.mk');
    var ring = imgBox.querySelector('.g-ring');
    var call = imgBox.querySelector('.g-call');
    var pathEl = host.querySelector('.path');
    var detailEl = host.querySelector('.g-detail');

    phases.forEach(function (ph) {
      ph.steps.forEach(function (s) {
        if (s.img) { var im = new Image(); im.src = s.img; }
      });
    });

    function persist() {
      saveGuideStore(lessonId, function (s) {
        s.seen = s.seen || {};
        s.practiced = s.practiced || {};
        s.seen[guideKey] = seen;
        s.practiced[guideKey] = practiced;
      });
    }
    function col(cls, icon, label, html) {
      return '<div class="g-col ' + cls + '"><small><i class="fa-solid ' + icon + '"></i> ' + label + '</small><div>' + KVL.termify(html || '') + '</div></div>';
    }
    function extra(cls, icon, label, html) {
      return html ? '<div class="g-x ' + cls + '"><i class="fa-solid ' + icon + '"></i><div><b>' + label + ':</b> ' + KVL.termify(html) + '</div></div>' : '';
    }
    function syncOverlay() {
      var s = phases[p].steps[m], b = measureStepBox(s, imgBox);
      ring.classList.remove('hit');
      if (quizMode && !hintShown) { ring.hidden = true; call.hidden = true; return; }
      if (b) { call.hidden = false; positionCallout(imgBox, ring, call, b); }
      else { ring.hidden = true; call.hidden = true; }
    }
    function paintQuiz(cls, msg) {
      quizEl.hidden = !quizMode;
      quizEl.className = 'g-quiz' + (cls ? ' ' + cls : '');
      if (quizMode) {
        quizEl.innerHTML = '<span><i class="fa-solid fa-crosshairs"></i> ' + (msg || ('Thử thách: Bạn hãy bấm đúng vị trí trên ảnh để thực hiện — <b>' + phases[p].steps[m].title + '</b>')) + '</span>';
      }
    }

    function render() {
      var ph = phases[p], s = ph.steps[m], key = p + '-' + m;
      seen[key] = 1;
      persist();

      tlSteps.forEach(function (b, k) {
        b.classList.toggle('on', k === p);
        var all = phases[k].steps.every(function (_, j) { return seen[k + '-' + j]; });
        b.classList.toggle('seen', all || k === p);
      });
      panels.forEach(function (el) { el.hidden = +el.getAttribute('data-i') !== p; });

      chipsEl.innerHTML = ph.steps.map(function (st, j) {
        var k2 = p + '-' + j;
        var cls = 'g-chip' + (j === m ? ' on' : '') + (seen[k2] ? ' seen' : '') + (practiced[k2] ? ' practiced' : '');
        return '<button type="button" class="' + cls + '" data-j="' + j + '"><span class="no">' + (practiced[k2] ? '<i class="fa-solid fa-check"></i>' : (j + 1)) + '</span><span>' + st.title + '</span></button>';
      }).join('');

      imgBox.classList.toggle('is-mock', !!s.mock);
      if (s.mock) {
        img.hidden = true; mkEl.hidden = false;
        if (mkEl.getAttribute('data-k') !== s.mock) {
          mkEl.innerHTML = mocks[s.mock] || '';
          mkEl.setAttribute('data-k', s.mock);
        }
      } else {
        mkEl.hidden = true; img.hidden = false;
        if (img.getAttribute('src') !== s.img) {
          img.style.opacity = 0;
          img.onload = function () { img.style.opacity = 1; syncOverlay(); };
          img.src = s.img;
        } else {
          img.style.opacity = 1;
        }
        img.alt = s.title;
      }

      pathEl.innerHTML = (s.path || []).map(function (t, k, a) { return k === a.length - 1 ? '<b>' + t + '</b>' : t; }).join(' <i class="fa-solid fa-chevron-right"></i> ');
      call.querySelector('.n').textContent = m + 1;
      call.querySelector('.lbl').textContent = s.label || s.title;
      misses = 0; hintShown = false;
      paintQuiz();
      stage.style.cursor = quizMode ? 'crosshair' : 'zoom-in';
      requestAnimationFrame(syncOverlay);

      var totalSteps = phases.reduce(function (n, x) { return n + x.steps.length; }, 0);
      var nPr = Object.keys(practiced).filter(function (k) { return practiced[k]; }).length;
      metaProg.textContent = 'Đã tick: ' + nPr + '/' + totalSteps;

      var lastM = m === ph.steps.length - 1, lastP = p === phases.length - 1;
      var nextLabel = !lastM
        ? 'Thao tác tiếp <i class="fa-solid fa-arrow-right"></i>'
        : (!lastP
            ? 'Sang bước ' + (p + 2) + ' <i class="fa-solid fa-arrow-right"></i>'
            : '<i class="fa-solid fa-check"></i> Đã hết thao tác');

      detailEl.innerHTML =
        '<div class="g-dh"><span class="no">' + (m + 1) + '</span><h5>' + s.title + '</h5><span class="meta">Thao tác ' + (m + 1) + ' / ' + ph.steps.length + '</span></div>' +
        '<div class="g-cols">' + col('where', 'fa-location-dot', 'Ở đâu', s.where) + col('do', 'fa-computer-mouse', 'Làm gì', s.act) + col('see', 'fa-eye', 'Kết quả đúng', s.see) + '</div>' +
        extra('warn', 'fa-triangle-exclamation', 'Lỗi hay gặp', s.warn) +
        extra('tipr', 'fa-lightbulb', 'Mẹo cho bạn', s.tip) +
        '<div class="g-foot">' +
          '<label class="gs-chk"><input type="checkbox" data-pr="' + key + '"' + (practiced[key] ? ' checked' : '') + '> Tôi đã làm xong thao tác này trên KiotViet</label>' +
          '<div class="g-nav">' +
            '<button type="button" class="btn" data-nav="-1"' + (p === 0 && m === 0 ? ' disabled' : '') + '><i class="fa-solid fa-arrow-left"></i> Trước</button>' +
            '<button type="button" class="btn btn-primary" data-nav="1"' + (lastM && lastP ? ' disabled' : '') + '>' + nextLabel + '</button>' +
          '</div>' +
        '</div>';
    }

    function go(np, nm) { p = np; m = nm; render(); KVL.sound('click'); }
    function step(d) {
      if (d < 0) {
        if (m > 0) { go(p, m - 1); return true; }
        if (p > 0) { go(p - 1, phases[p - 1].steps.length - 1); return true; }
        return false;
      } else {
        if (m < phases[p].steps.length - 1) { go(p, m + 1); return true; }
        if (p < phases.length - 1) { go(p + 1, 0); return true; }
        return false;
      }
    }

    tlSteps.forEach(function (b) { b.addEventListener('click', function () { go(+b.getAttribute('data-i'), 0); }); });
    chipsEl.addEventListener('click', function (e) { var c = e.target.closest('.g-chip'); if (c) go(p, +c.getAttribute('data-j')); });
    detailEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-nav]');
      if (b && !b.disabled) step(+b.getAttribute('data-nav'));
    });
    detailEl.addEventListener('change', function (e) {
      var c = e.target.closest('[data-pr]');
      if (!c) return;
      practiced[c.getAttribute('data-pr')] = c.checked ? 1 : 0;
      persist();
      KVL.sound(c.checked ? 'success' : 'click');
      if (c.checked && m < phases[p].steps.length - 1) setTimeout(function () { go(p, m + 1); }, 380);
      else render();
    });

    function toggleQuiz() {
      quizMode = !quizMode; misses = 0; hintShown = false;
      modeBtn.classList.toggle('on', quizMode);
      modeBtn.innerHTML = quizMode ? '<i class="fa-solid fa-eye"></i> Hiện khung gợi ý' : '<i class="fa-solid fa-crosshairs"></i> Tự bấm thử';
      stage.style.cursor = quizMode ? 'crosshair' : 'zoom-in';
      paintQuiz(); syncOverlay(); KVL.sound('click');
    }
    function zoomNow() {
      openFullGuide({
        info: function () {
          var ph = phases[p];
          return { p: p, m: m, len: ph.steps.length, step: ph.steps[m], isFirst: p === 0 && m === 0, isLast: p === phases.length - 1 && m === ph.steps.length - 1 };
        },
        step: step,
        getQuiz: function () { return quizMode; },
        toggleQuiz: toggleQuiz
      }, mocks);
    }
    modeBtn.addEventListener('click', toggleQuiz);
    host.querySelector('.g-zoom').addEventListener('click', zoomNow);
    ring.setAttribute('title', 'Bấm vào khung cam để sang thao tác tiếp');
    stage.addEventListener('click', function (e) {
      if (quizMode) {
        var s = phases[p].steps[m], b = measureStepBox(s, imgBox);
        if (!b) return;
        var r = imgBox.getBoundingClientRect();
        if (!r.width || !r.height) return;
        var px = (e.clientX - r.left) / r.width * 100, py = (e.clientY - r.top) / r.height * 100;
        var tol = 2.5;
        var hit = px >= b[0] - tol && px <= b[0] + b[2] + tol && py >= b[1] - tol && py <= b[1] + b[3] + tol;
        if (hit) {
          positionCallout(imgBox, ring, call, b);
          ring.classList.add('hit'); call.hidden = false;
          paintQuiz('ok', '<b>Chính xác!</b> Đang chuyển sang thao tác tiếp theo...');
          KVL.sound('success');
          setTimeout(function () { step(1); }, 650);
        } else {
          misses++;
          var dot = document.createElement('span'); dot.className = 'g-miss';
          dot.style.left = px + '%'; dot.style.top = py + '%';
          imgBox.appendChild(dot); setTimeout(function () { dot.remove(); }, 750);
          KVL.sound('error');
          if (misses >= 2) {
            hintShown = true; syncOverlay();
            paintQuiz('err', 'Chưa đúng vị trí — khung cam gợi ý đã hiện ra, bạn bấm vào đúng khung cam nhé!');
          } else {
            paintQuiz('err', 'Chưa đúng vị trí, bạn thử bấm lại nhé! (Sai thêm 1 lần sẽ hiện khung gợi ý)');
          }
        }
        return;
      }
      if (e.target.closest('.g-ring')) { step(1); return; }
      zoomNow();
    });
    window.addEventListener('resize', syncOverlay);
    render();
  };

  /* ---------- Spotlight Tour Hướng dẫn Cách học (từ Demo Nhật Vi) ---------- */
  function buildTour() {
    var hasGuide = !!document.querySelector('.guide');
    var hasVideo = !!document.querySelector('[data-yt]');
    var hasQuiz = !!document.querySelector('.quiz-list');

    var fab = document.createElement('button');
    fab.type = 'button'; fab.id = 'help-fab'; fab.className = 'help-fab';
    fab.innerHTML = '<span class="q"><i class="fa-solid fa-question"></i></span><span class="txt">Hướng dẫn học</span>';
    fab.title = 'Xem hướng dẫn cách học bài này cùng KiCi';
    document.body.appendChild(fab);

    var root, hole, card, steps = [], k = 0;
    function ensureDom() {
      if (root) return;
      root = document.createElement('div');
      root.className = 'tour'; root.hidden = true;
      root.innerHTML =
        '<div class="tour-hole"></div>' +
        '<div class="tour-card" role="dialog" aria-modal="true" aria-live="polite">' +
          '<div class="tour-top"><div class="kici-ava"></div><div><span class="tour-k"></span><h5></h5></div></div>' +
          '<p></p><div class="tour-dots"></div>' +
          '<div class="tour-ctl">' +
            '<button type="button" class="tour-skip">Bỏ qua</button><span class="sp"></span>' +
            '<button type="button" class="btn" data-t="-1"><i class="fa-solid fa-arrow-left"></i></button>' +
            '<button type="button" class="btn btn-primary" data-t="1"></button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(root);
      hole = root.querySelector('.tour-hole');
      card = root.querySelector('.tour-card');
      root.querySelector('.tour-skip').addEventListener('click', end);
      root.addEventListener('click', function (e) { var b = e.target.closest('[data-t]'); if (b) move(+b.getAttribute('data-t')); });
      document.addEventListener('keydown', function (e) {
        if (root.hidden) return;
        if (e.key === 'Escape') end();
        else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); move(1); }
        else if (e.key === 'ArrowLeft') move(-1);
      });
      window.addEventListener('resize', function () { if (!root.hidden) place(); });
      window.addEventListener('scroll', function () { if (!root.hidden) place(); }, { passive: true });
    }

    function targetEl() {
      var el = document.querySelector(steps[k].sel);
      return el && el.getClientRects().length ? el : null;
    }

    function place() {
      var el = targetEl();
      if (!el) return;
      var r = el.getBoundingClientRect(), pad = 6, vw = window.innerWidth, vh = window.innerHeight;
      var top = Math.max(4, r.top - pad), left = Math.max(4, r.left - pad);
      var h = Math.min(vh - top - 4, r.bottom + pad - top), w = Math.min(vw - left - 4, r.right + pad - left);
      hole.style.top = top + 'px'; hole.style.left = left + 'px';
      hole.style.width = Math.max(20, w) + 'px'; hole.style.height = Math.max(20, h) + 'px';
      var cw = card.offsetWidth, ch = card.offsetHeight;
      var ct = r.bottom + 14;
      if (ct + ch > vh - 10) ct = r.top - ch - 14;
      if (ct < 10) ct = Math.max(10, Math.min(vh - ch - 10, r.top + 16));
      card.style.top = ct + 'px';
      card.style.left = Math.max(10, Math.min(vw - cw - 10, r.left + r.width / 2 - cw / 2)) + 'px';
    }

    function paint() {
      var s = steps[k];
      card.querySelector('.kici-ava').innerHTML = KVL.kiciSvg(k === steps.length - 1 ? 'done' : (k === 0 ? 'hello' : 'hint'));
      card.querySelector('.tour-k').textContent = 'KiCi hướng dẫn · ' + (k + 1) + '/' + steps.length;
      card.querySelector('h5').textContent = s.title;
      card.querySelector('p').innerHTML = s.text;
      card.querySelector('.tour-dots').innerHTML = steps.map(function (_, j) { return '<i class="' + (j <= k ? 'on' : '') + '"></i>'; }).join('');
      card.querySelector('[data-t="-1"]').disabled = k === 0;
      card.querySelector('[data-t="1"]').innerHTML = k === steps.length - 1 ? 'Đã hiểu <i class="fa-solid fa-check"></i>' : 'Tiếp <i class="fa-solid fa-arrow-right"></i>';
      var el = targetEl();
      if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      place();
      setTimeout(place, 380);
    }

    function move(d) {
      var n = k + d;
      if (n >= steps.length) { end(); return; }
      if (n < 0) return;
      k = n; paint(); KVL.sound('click');
    }

    function start() {
      var raw = [];
      if (hasVideo) raw.push({ sel: '[data-yt]', title: '1. Xem Video trước khi làm', text: 'Bạn xem video hướng dẫn ngắn của KiotViet để nắm bối cảnh và các thao tác chính.' });
      if (hasGuide) {
        raw.push({ sel: '.g-screen', title: '2. Nhìn khung cam & Tự bấm thử', text: 'Khung cam khoanh đúng nút cần bấm. Bạn có thể bấm nút <b>Tự bấm thử</b> để tự tìm vị trí nút trên ảnh, hoặc bấm <b>Phóng to</b> để xem rõ hơn.' });
        raw.push({ sel: '.g-detail', title: '3. Đọc Ở đâu · Làm gì · Kết quả', text: 'Ngay dưới ảnh ghi rõ bạn bấm ở đâu, làm gì, thấy kết quả nào và các lỗi hay gặp để tránh nhầm.' });
      }
      if (hasQuiz) raw.push({ sel: '.quiz-list', title: '4. Thử sức & Tích Checklist', text: 'Cuối bài có 2–3 câu trắc nghiệm nhanh và checklist ngắn để bạn tự kiểm trước khi bấm <b>Bài tiếp</b> trên LMS.' });
      raw.push({ sel: '#help-fab', title: 'Mở lại hướng dẫn bất cứ lúc nào', text: 'Khi nào cần xem lại cách học, bạn chỉ cần bấm vào nút dấu <b>?</b> ở góc dưới bên phải nhé.' });
      steps = raw.filter(function (s) { return !!document.querySelector(s.sel); });
      if (!steps.length) return;
      ensureDom();
      k = 0; root.hidden = false;
      paint();
      try { localStorage.setItem(STORE_TOUR, '1'); } catch (e) {}
    }

    function end() {
      if (root) root.hidden = true;
      KVL.sound('click');
    }

    fab.addEventListener('click', start);
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-tour]')) start();
    });
    try {
      if (!localStorage.getItem(STORE_TOUR) && (hasGuide || hasVideo)) {
        setTimeout(start, 700);
      }
    } catch (e) {}
  }

  /* ---------- Thẻ lật 3D ---------- */
  function wireFlips() {
    document.querySelectorAll('.flip').forEach(function (card) {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      function toggle(e) {
        if (e && e.target.closest('.term')) return;
        card.classList.toggle('flipped');
        KVL.sound('click');
      }
      card.addEventListener('click', toggle);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  }

  /* ---------- Quiz nhanh cuối bài ---------- */
  KVL.quiz = function (hostId, questions) {
    var host = document.getElementById(hostId);
    if (!host || !questions || !questions.length) return;
    var letters = ['A', 'B', 'C', 'D'];
    host.className = 'quiz-list';
    host.innerHTML = questions.map(function (q, qi) {
      var guestHtml = q.guest
        ? '<div class="guest-say"><small><i class="fa-solid fa-comment-dots"></i> ' + q.guest + '</small>' + q.quote + '</div>'
        : '';
      var optsHtml = q.options.map(function (op, oi) {
        return '<button type="button" class="opt" data-qi="' + qi + '" data-oi="' + oi + '"><span class="k">' + letters[oi] + '.</span><span>' + op + '</span></button>';
      }).join('');
      return '<div class="quiz-item" data-qwrap="' + qi + '">' +
        '<div class="quiz-q">' + (qi + 1) + '. ' + q.question + '</div>' +
        guestHtml +
        '<div class="opts">' + optsHtml + '</div>' +
        '<div class="fb-box" hidden></div>' +
      '</div>';
    }).join('');

    host.addEventListener('click', function (e) {
      var btn = e.target.closest('.opt');
      if (!btn) return;
      var qi = +btn.getAttribute('data-qi');
      var oi = +btn.getAttribute('data-oi');
      var q = questions[qi];
      var wrap = host.querySelector('[data-qwrap="' + qi + '"]');
      wrap.querySelectorAll('.opt').forEach(function (o) { o.classList.remove('sel'); });
      btn.classList.add('sel');
      var ok = oi === q.correct;
      var fb = wrap.querySelector('.fb-box');
      fb.hidden = false;
      fb.className = 'fb-box ' + (ok ? 'ok' : 'no');
      fb.innerHTML =
        '<div class="kici-ava">' + KVL.kiciSvg(ok ? 'done' : 'hint') + '</div>' +
        '<div><b>' + (ok ? 'Chính xác, bạn nắm bài rất tốt!' : 'Chưa đúng lắm, bạn thử chọn lại nhé!') + '</b>' +
        KVL.termify(q.explanation) + '</div>';
      KVL.sound(ok ? 'success' : 'error');
    });
  };

  /* ---------- Checklist tự kiểm ngắn cuối bài ---------- */
  KVL.checklist = function (hostId, items) {
    var host = document.getElementById(hostId);
    if (!host || !items || !items.length) return;
    host.className = 'chk-list';
    host.innerHTML = items.map(function (txt, i) {
      return '<label class="chk-row"><input type="checkbox" data-ci="' + i + '"><span>' + txt + '</span></label>';
    }).join('');
    host.addEventListener('change', function (e) {
      var cb = e.target;
      if (cb && cb.type === 'checkbox') {
        cb.closest('.chk-row').classList.toggle('checked', cb.checked);
        KVL.sound(cb.checked ? 'success' : 'click');
      }
    });
  };

  /* ---------- Tự khởi tạo khi tải trang ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    wireTerms();
    mountKici();
    mountVideos();
    wireFlips();
    buildTour();
  });
})();
