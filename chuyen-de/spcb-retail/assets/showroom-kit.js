/* ==========================================================================
   KiotViet Showroom Narrative Kit v1.0 - SPCB KiotViet Retail
   - Lưu tiến độ chung khóa học theo từng Buổi & từng Học phần vào localStorage:
     khóa 'kv_spcb_retail_showroom_v1'
   - Nhân vật KiCi SVG dẫn dắt xuyên suốt, Sticky Rail 5 Học phần, Lightbox ảnh,
     Quiz 6 tình huống, Checklist 8 mục và Xuất báo cáo .txt bằng Blob thuần JS
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'kv_spcb_retail_showroom_v1';
  var KVShowroom = window.KVShowroom = {};
  var cfg = null;
  var state = null;
  var actx = null;
  var shotGroups = {};
  var lbState = { group: null, idx: 0 };

  var FACES = {
    hello: '<circle cx="25" cy="30" r="3.4" fill="#5BE92A"/><circle cx="39" cy="30" r="3.4" fill="#5BE92A"/><path d="M26 36.5q6 5 12 0" stroke="#5BE92A" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    explain: '<rect x="21.5" y="27.5" width="7" height="5" rx="2.5" fill="#5BE92A"/><rect x="35.5" y="27.5" width="7" height="5" rx="2.5" fill="#5BE92A"/><path d="M27 37.5h10" stroke="#5BE92A" stroke-width="2.4" stroke-linecap="round"/>',
    hint: '<circle cx="25" cy="30" r="3.4" fill="#5BE92A"/><path d="M35.5 30.5h7" stroke="#5BE92A" stroke-width="2.6" stroke-linecap="round"/><path d="M26 36.5q6 4 12 0" stroke="#5BE92A" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    think: '<circle cx="25" cy="29" r="3" fill="#5BE92A"/><circle cx="39" cy="29" r="3" fill="#5BE92A"/><path d="M28 37.5q4-2.5 8 0" stroke="#5BE92A" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    done: '<path d="M21.5 31q3.5-4 7 0M35.5 31q3.5-4 7 0" stroke="#5BE92A" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M25 36q7 7 14 0" stroke="#5BE92A" stroke-width="2.6" fill="none" stroke-linecap="round"/>'
  };

  KVShowroom.kiciSvg = function (mood) {
    return '<svg viewBox="0 0 64 64" role="img" aria-label="KiCi">' +
      '<line x1="32" y1="5" x2="32" y2="13" stroke="#166def" stroke-width="2.5" stroke-linecap="round"/>' +
      '<circle cx="32" cy="5" r="3.5" fill="#00B63E"/>' +
      '<rect x="4" y="27" width="6" height="12" rx="3" fill="#166def"/>' +
      '<rect x="54" y="27" width="6" height="12" rx="3" fill="#166def"/>' +
      '<rect x="9" y="13" width="46" height="40" rx="14" fill="#002957"/>' +
      '<rect x="15" y="20" width="34" height="24" rx="9" fill="#0b3875"/>' +
      (FACES[mood] || FACES.explain) +
      '<rect x="24" y="53" width="16" height="5" rx="2.5" fill="#166def"/>' +
      '</svg>';
  };

  KVShowroom.sound = function (type) {
    try {
      var A = window.AudioContext || window.webkitAudioContext;
      if (!A) return;
      if (!actx) actx = new A();
      if (actx.state === 'suspended') return;
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
        o.start(t);
        o.stop(t + 0.24);
      } else if (type === 'error') {
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(170, t);
        o.frequency.exponentialRampToValueAtTime(120, t + 0.16);
        g.gain.setValueAtTime(0.05, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        o.start(t);
        o.stop(t + 0.2);
      } else {
        o.type = 'sine';
        o.frequency.setValueAtTime(720, t);
        g.gain.setValueAtTime(0.05, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        o.start(t);
        o.stop(t + 0.08);
      }
    } catch (e) {}
  };

  KVShowroom.formatVND = function (num) {
    return (Number(num) || 0).toLocaleString('vi-VN') + ' đ';
  };

  function readAllStore() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function writeAllStore(all) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (e) {}
  }

  function loadSessionState() {
    var all = readAllStore();
    var saved = all[cfg.sessionId] || {};
    state = {
      sectionsDone: saved.sectionsDone && typeof saved.sectionsDone === 'object' ? saved.sectionsDone : {},
      quizAnswers: saved.quizAnswers && typeof saved.quizAnswers === 'object' ? saved.quizAnswers : {},
      checkedIds: Array.isArray(saved.checkedIds) ? saved.checkedIds : [],
      notes: typeof saved.notes === 'string' ? saved.notes : ''
    };
  }

  function computeMetrics() {
    var totalSecs = cfg.sections.length || 5;
    var doneSecs = cfg.sections.filter(function (s) { return !!state.sectionsDone[s.id]; }).length;
    var totalQuiz = (cfg.quiz || []).length || 6;
    var answeredQuiz = Object.keys(state.quizAnswers).length;
    var correctQuiz = 0;
    (cfg.quiz || []).forEach(function (q) {
      if (state.quizAnswers[q.id] === q.correct) correctQuiz++;
    });
    var totalCheck = (cfg.checklist || []).length || 8;
    var checkedCount = state.checkedIds.length;
    var pct = Math.min(100, Math.round(
      (doneSecs / totalSecs) * 40 +
      (answeredQuiz / totalQuiz) * 30 +
      (checkedCount / totalCheck) * 30
    ));
    return {
      totalSecs: totalSecs,
      doneSecs: doneSecs,
      totalQuiz: totalQuiz,
      answeredQuiz: answeredQuiz,
      correctQuiz: correctQuiz,
      totalCheck: totalCheck,
      checkedCount: checkedCount,
      pct: pct
    };
  }

  function saveSessionState() {
    var m = computeMetrics();
    var all = readAllStore();
    all[cfg.sessionId] = {
      sessionId: cfg.sessionId,
      sessionLabel: cfg.sessionLabel,
      sectionsDone: state.sectionsDone,
      sectionLabels: cfg.sections.map(function (s) { return { id: s.id, short: s.short, title: s.title }; }),
      quizAnswers: state.quizAnswers,
      quizCorrect: m.correctQuiz,
      quizTotal: m.totalQuiz,
      checkedIds: state.checkedIds,
      checklistTotal: m.totalCheck,
      notes: state.notes,
      pct: m.pct,
      updatedAt: new Date().toISOString()
    };
    writeAllStore(all);
  }

  function updateProgressUI() {
    var m = computeMetrics();
    var heroText = document.getElementById('hero-progress-text');
    if (heroText) {
      heroText.textContent = 'Tiến độ ' + m.pct + '% · ' + m.doneSecs + '/' + m.totalSecs + ' học phần · ' + m.answeredQuiz + '/' + m.totalQuiz + ' tình huống · ' + m.checkedCount + '/' + m.totalCheck + ' checklist';
    }
    var railPct = document.getElementById('rail-progress-text');
    if (railPct) railPct.textContent = m.doneSecs + '/' + m.totalSecs + ' học phần (' + m.pct + '%)';

    document.querySelectorAll('.rail-pill[data-sec]').forEach(function (el) {
      var sid = el.getAttribute('data-sec');
      el.classList.toggle('done', !!state.sectionsDone[sid]);
    });
    document.querySelectorAll('.nav-pill[data-sec]').forEach(function (el) {
      var sid = el.getAttribute('data-sec');
      el.classList.toggle('done', !!state.sectionsDone[sid]);
    });
    document.querySelectorAll('.btn-sec-done[data-sec]').forEach(function (btn) {
      var sid = btn.getAttribute('data-sec');
      var isDone = !!state.sectionsDone[sid];
      btn.classList.toggle('is-done', isDone);
      btn.innerHTML = isDone
        ? '✓ Đã hoàn thành học phần này'
        : 'Đánh dấu hoàn thành học phần';
    });
  }

  KVShowroom.markSectionDone = function (secId) {
    if (!state || state.sectionsDone[secId]) return;
    state.sectionsDone[secId] = true;
    saveSessionState();
    updateProgressUI();
  };

  KVShowroom.toggleSectionDone = function (secId) {
    if (!state) return;
    state.sectionsDone[secId] = !state.sectionsDone[secId];
    KVShowroom.sound(state.sectionsDone[secId] ? 'success' : 'click');
    saveSessionState();
    updateProgressUI();
  };

  function mountKici() {
    document.querySelectorAll('.kici-hero-ava:not([data-ready])').forEach(function (el) {
      el.innerHTML = KVShowroom.kiciSvg(el.getAttribute('data-mood') || 'hello');
      el.setAttribute('data-ready', '1');
    });
    document.querySelectorAll('.kici-mentor:not([data-ready])').forEach(function (el) {
      var mood = el.getAttribute('data-mood') || 'explain';
      var role = el.getAttribute('data-role') || 'KiCi · Chuyên viên L&D đồng hành';
      var content = KVShowroom.termifyString(el.innerHTML);
      el.innerHTML =
        '<div class="kici-ava">' + KVShowroom.kiciSvg(mood) + '</div>' +
        '<div class="kici-bubble">' +
          '<span class="kici-name">' + role + '</span>' +
          '<div class="kici-text">' + content + '</div>' +
        '</div>';
      el.setAttribute('data-ready', '1');
    });
  }

  KVShowroom.termifyString = function (html) {
    return String(html || '').replace(/\{\{([^}|]+)(?:\|([^}]+))?\}\}/g, function (_, k, label) {
      return '<button type="button" class="term" data-term="' + k.trim() + '" aria-expanded="false">' + (label || k).trim() + '</button>';
    });
  };

  function wireTerms() {
    document.querySelectorAll('.termify').forEach(function (el) {
      if (el.getAttribute('data-termified')) return;
      el.innerHTML = KVShowroom.termifyString(el.innerHTML);
      el.setAttribute('data-termified', '1');
    });

    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.term');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      var key = btn.getAttribute('data-term');
      var def = (window.KV_TERMS || {})[key];
      if (!def) return;
      var host = btn.closest('p, li, td, .kici-text, .callout, .tile') || btn.parentElement;
      var inside = /^(TD|LI|TH)$/.test(host.tagName) || host.classList.contains('callout');
      var existing = inside
        ? host.querySelector(':scope > .term-def')
        : (host.nextElementSibling && host.nextElementSibling.classList.contains('term-def') ? host.nextElementSibling : null);
      if (existing) {
        var same = existing.getAttribute('data-term') === key;
        existing.remove();
        if (same) { btn.setAttribute('aria-expanded', 'false'); return; }
      }
      var box = document.createElement('div');
      box.className = 'term-def';
      box.setAttribute('data-term', key);
      box.innerHTML = '<b>' + key + ':</b> ' + def;
      if (inside) host.appendChild(box);
      else host.insertAdjacentElement('afterend', box);
      btn.setAttribute('aria-expanded', 'true');
      KVShowroom.sound('click');
    });
  }

  function buildStickyRailAndSectionFooters() {
    if (!document.querySelector('.sticky-rail')) {
      var rail = document.createElement('div');
      rail.className = 'sticky-rail';
      rail.setAttribute('role', 'navigation');
      rail.setAttribute('aria-label', 'Thanh tiến độ các học phần');
      var pillsHtml = cfg.sections.map(function (s, idx) {
        return '<a href="#' + s.id + '" class="rail-pill" data-sec="' + s.id + '">' +
          '<span>' + (idx + 1) + '.</span>' +
          '<span class="rail-txt">' + s.short + '</span>' +
          '<span class="rail-check" aria-hidden="true">✓</span>' +
          '</a>';
      }).join('');
      rail.innerHTML =
        '<div class="sticky-rail-inner">' +
          '<div class="rail-brand"><span class="rail-badge">' + cfg.sessionLabel + '</span><span>SPCB Retail</span></div>' +
          '<div class="rail-pills">' + pillsHtml + '</div>' +
          '<div class="rail-pct"><span class="progress-dot" aria-hidden="true"></span><span id="rail-progress-text">0/' + cfg.sections.length + ' học phần</span></div>' +
        '</div>';
      document.body.insertBefore(rail, document.body.firstChild);

      var hero = document.querySelector('.site-hero');
      if (hero && 'IntersectionObserver' in window) {
        var heroObs = new IntersectionObserver(function (entries) {
          rail.classList.toggle('visible', !entries[0].isIntersecting);
        }, { threshold: 0.05 });
        heroObs.observe(hero);
      }

      if ('IntersectionObserver' in window) {
        var secObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (ent) {
            if (ent.isIntersecting) {
              var id = ent.target.id;
              document.querySelectorAll('.rail-pill[data-sec]').forEach(function (p) {
                p.classList.toggle('active', p.getAttribute('data-sec') === id);
              });
            }
          });
        }, { rootMargin: '-25% 0px -60% 0px', threshold: 0 });
        cfg.sections.forEach(function (s) {
          var secEl = document.getElementById(s.id);
          if (secEl) secObs.observe(secEl);
        });
      }
    }

    document.querySelectorAll('[data-sec-complete]').forEach(function (host) {
      var sid = host.getAttribute('data-sec-complete');
      host.className = 'sec-complete-bar';
      host.innerHTML =
        '<span class="sec-complete-note">Bấm xác nhận sau khi bạn đã xem kỹ và thử thao tác ở học phần này (tự lưu tiến độ).</span>' +
        '<button type="button" class="btn btn-sec-done" data-sec="' + sid + '" onclick="KVShowroom.toggleSectionDone(\'' + sid + '\')">Đánh dấu hoàn thành học phần</button>';
    });
  }

  /* ================= QUIZ, CHECKLIST & REPORT ================= */
  KVShowroom.renderQuiz = function () {
    var container = document.getElementById('quiz-questions-container');
    var badge = document.getElementById('quiz-score-badge');
    if (!container || !cfg.quiz) return;
    var m = computeMetrics();
    if (badge) badge.textContent = 'Điểm: ' + m.correctQuiz + '/' + m.totalQuiz;

    container.innerHTML = cfg.quiz.map(function (q) {
      var picked = state.quizAnswers[q.id];
      var answered = picked !== undefined && picked !== null;
      var ok = picked === q.correct;
      var optsHtml = q.options.map(function (opt, idx) {
        var cls = 'quiz-option';
        if (answered) {
          if (idx === q.correct) cls += ' correct';
          else if (idx === picked) cls += ' incorrect';
        }
        var letter = ['A', 'B', 'C', 'D'][idx];
        return '<button type="button" class="' + cls + '" onclick="KVShowroom.answerQuiz(\'' + q.id + '\', ' + idx + ')">' +
          '<strong style="flex-shrink:0;">' + letter + '.</strong><span>' + opt + '</span></button>';
      }).join('');

      var fbHtml = answered
        ? '<div class="callout ' + (ok ? 'success' : 'danger') + '" style="margin-top:10px;">' +
            '<div class="callout-title">' + (ok ? 'Chính xác' : 'Chưa đúng — Xem giải thích từ KiCi') + '</div>' +
            '<p>' + q.explanation + '</p>' +
          '</div>'
        : '';

      return '<div class="tile">' +
        '<div style="font-weight:700;margin-bottom:10px;color:var(--kv-navy);">' + q.question + '</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px;">' + optsHtml + '</div>' +
        fbHtml +
      '</div>';
    }).join('');
  };

  KVShowroom.answerQuiz = function (qId, idx) {
    var q = (cfg.quiz || []).find(function (x) { return x.id === qId; });
    state.quizAnswers[qId] = idx;
    if (q) KVShowroom.sound(idx === q.correct ? 'success' : 'error');
    var lastSec = cfg.sections[cfg.sections.length - 1];
    if (lastSec && Object.keys(state.quizAnswers).length >= Math.ceil((cfg.quiz || []).length / 2)) {
      state.sectionsDone[lastSec.id] = true;
    }
    saveSessionState();
    KVShowroom.renderQuiz();
    updateProgressUI();
  };

  KVShowroom.renderChecklist = function () {
    var listEl = document.getElementById('trainer-checklist-list');
    var badgeEl = document.getElementById('checklist-count-badge');
    var barEl = document.getElementById('checklist-progress-bar');
    var notesEl = document.getElementById('trainer-notes');
    if (!listEl || !cfg.checklist) return;

    var done = state.checkedIds.length;
    var total = cfg.checklist.length;
    var pct = total ? Math.round((done / total) * 100) : 0;
    if (badgeEl) badgeEl.textContent = done + '/' + total + ' mục';
    if (barEl) barEl.style.width = pct + '%';
    if (notesEl && notesEl.value !== state.notes) notesEl.value = state.notes;

    listEl.innerHTML = cfg.checklist.map(function (item) {
      var checked = state.checkedIds.indexOf(item.id) !== -1;
      return '<label class="checklist-item ' + (checked ? 'checked' : '') + '">' +
        '<input type="checkbox" ' + (checked ? 'checked' : '') + ' onchange="KVShowroom.toggleChecklist(\'' + item.id + '\')">' +
        '<span style="font-size:0.9rem;">' + item.text + '</span>' +
      '</label>';
    }).join('');
  };

  KVShowroom.toggleChecklist = function (itemId) {
    var idx = state.checkedIds.indexOf(itemId);
    if (idx === -1) state.checkedIds.push(itemId);
    else state.checkedIds.splice(idx, 1);
    KVShowroom.sound('click');
    if (state.checkedIds.length === (cfg.checklist || []).length && cfg.sections.length) {
      state.sectionsDone[cfg.sections[cfg.sections.length - 1].id] = true;
    }
    saveSessionState();
    KVShowroom.renderChecklist();
    updateProgressUI();
  };

  KVShowroom.saveNotes = function () {
    var notesEl = document.getElementById('trainer-notes');
    if (!notesEl) return;
    state.notes = notesEl.value;
    saveSessionState();
  };

  KVShowroom.exportReport = function () {
    var m = computeMetrics();
    var lines = [
      'BÁO CÁO HỌC TẬP & THỰC HÀNH · SPCB KIOTVIET RETAIL',
      cfg.sessionLabel + ': ' + (cfg.reportSubtitle || ''),
      'Thời gian xuất: ' + new Date().toLocaleString('vi-VN'),
      '--------------------------------------------------',
      '1. Tiến độ tổng thể: ' + m.pct + '% (' + m.doneSecs + '/' + m.totalSecs + ' học phần)',
      '2. Kết quả tình huống: ' + m.correctQuiz + '/' + m.totalQuiz + ' câu đúng',
      '3. Checklist thực hành: ' + m.checkedCount + '/' + m.totalCheck + ' mục đã hoàn thành',
      '',
      'Chi tiết các học phần:'
    ];
    cfg.sections.forEach(function (s, idx) {
      lines.push((state.sectionsDone[s.id] ? '[x] ' : '[ ] ') + 'Học phần ' + (idx + 1) + ': ' + s.title);
    });
    lines.push('', 'Chi tiết checklist:');
    (cfg.checklist || []).forEach(function (item) {
      lines.push((state.checkedIds.indexOf(item.id) !== -1 ? '[x] ' : '[ ] ') + item.text);
    });
    lines.push('', 'Ghi chú cá nhân / giảng viên:', state.notes || '(Không có ghi chú thêm)');

    var blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'bao_cao_' + cfg.sessionId + '_spcb_retail.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);

    var msgEl = document.getElementById('export-status-msg');
    if (msgEl) msgEl.textContent = 'Đã tải xuống tệp bao_cao_' + cfg.sessionId + '_spcb_retail.txt.';
    KVShowroom.sound('success');
  };

  KVShowroom.resetProgress = function (btn) {
    if (btn && btn.dataset.armed !== 'true') {
      btn.dataset.armed = 'true';
      btn.textContent = 'Bấm lần nữa để xác nhận đặt lại';
      return;
    }
    if (btn) {
      btn.dataset.armed = 'false';
      btn.textContent = 'Đặt lại tiến độ buổi này';
    }
    state = { sectionsDone: {}, quizAnswers: {}, checkedIds: [], notes: '' };
    var notesEl = document.getElementById('trainer-notes');
    if (notesEl) notesEl.value = '';
    saveSessionState();
    KVShowroom.renderQuiz();
    KVShowroom.renderChecklist();
    updateProgressUI();
    var msgEl = document.getElementById('export-status-msg');
    if (msgEl) msgEl.textContent = 'Đã đặt lại toàn bộ tiến độ ' + cfg.sessionLabel + '.';
  };

  /* ================= LIGHTBOX ẢNH GIAO DIỆN THẬT ================= */
  function ensureLightbox() {
    if (document.getElementById('shotLightbox')) return;
    var lb = document.createElement('div');
    lb.id = 'shotLightbox';
    lb.className = 'shot-lightbox';
    lb.hidden = true;
    lb.innerHTML =
      '<div class="shot-lb-dialog" role="dialog" aria-modal="true" aria-labelledby="shotLbTitle">' +
        '<div class="shot-lb-head">' +
          '<span class="shot-lb-title" id="shotLbTitle">Ảnh giao diện KiotViet</span>' +
          '<button type="button" class="shot-lb-close" id="shotLbClose" aria-label="Đóng ảnh">&times;</button>' +
        '</div>' +
        '<div class="shot-lb-body"><img id="shotLbImg" src="" alt=""></div>' +
        '<div class="shot-lb-foot">' +
          '<span class="shot-lb-cap" id="shotLbCap"></span>' +
          '<div style="display:flex;gap:8px;">' +
            '<button type="button" class="btn btn-secondary" id="shotLbPrev">← Ảnh trước</button>' +
            '<button type="button" class="btn btn-primary" id="shotLbNext">Ảnh sau →</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(lb);

    lb.addEventListener('click', function (e) { if (e.target === lb) KVShowroom.closeLightbox(); });
    document.getElementById('shotLbClose').addEventListener('click', KVShowroom.closeLightbox);
    document.getElementById('shotLbPrev').addEventListener('click', function () { KVShowroom.stepLightbox(-1); });
    document.getElementById('shotLbNext').addEventListener('click', function () { KVShowroom.stepLightbox(1); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') KVShowroom.closeLightbox();
      else if (e.key === 'ArrowLeft') KVShowroom.stepLightbox(-1);
      else if (e.key === 'ArrowRight') KVShowroom.stepLightbox(1);
    });
  }

  function paintLightbox() {
    var list = shotGroups[lbState.group] || [];
    var item = list[lbState.idx];
    if (!item) return;
    document.getElementById('shotLbTitle').textContent = (item.title || 'Ảnh minh họa') + ' (' + (lbState.idx + 1) + '/' + list.length + ')';
    var img = document.getElementById('shotLbImg');
    img.src = item.src;
    img.alt = item.alt;
    document.getElementById('shotLbCap').textContent = item.caption;
    document.getElementById('shotLbPrev').disabled = list.length <= 1;
    document.getElementById('shotLbNext').disabled = list.length <= 1;
  }

  KVShowroom.openLightbox = function (group, idx) {
    ensureLightbox();
    lbState.group = group;
    lbState.idx = idx;
    paintLightbox();
    document.getElementById('shotLightbox').hidden = false;
  };

  KVShowroom.closeLightbox = function () {
    var lb = document.getElementById('shotLightbox');
    if (lb) lb.hidden = true;
  };

  KVShowroom.stepLightbox = function (delta) {
    var list = shotGroups[lbState.group] || [];
    if (!list.length) return;
    lbState.idx = (lbState.idx + delta + list.length) % list.length;
    paintLightbox();
  };

  KVShowroom.bindShots = function () {
    shotGroups = {};
    document.querySelectorAll('.shot-strip').forEach(function (strip, gIdx) {
      var groupKey = strip.getAttribute('data-shot-group') || ('grp-' + gIdx);
      var items = [];
      strip.querySelectorAll('.shot-card').forEach(function (card, cIdx) {
        var img = card.querySelector('img');
        var capB = card.querySelector('.shot-cap b');
        var capEl = card.querySelector('.shot-cap');
        items.push({
          src: img ? img.getAttribute('src') : '',
          alt: img ? (img.getAttribute('alt') || '') : '',
          title: capB ? capB.textContent.trim() : 'Ảnh giao diện KiotViet',
          caption: capEl ? capEl.textContent.trim() : ''
        });
        card.onclick = function () { KVShowroom.openLightbox(groupKey, cIdx); };
      });
      shotGroups[groupKey] = items;
    });
  };

  KVShowroom.init = function (userCfg) {
    cfg = userCfg || {};
    loadSessionState();
    mountKici();
    wireTerms();
    buildStickyRailAndSectionFooters();
    KVShowroom.bindShots();
    KVShowroom.renderQuiz();
    KVShowroom.renderChecklist();
    updateProgressUI();
    saveSessionState();
    if (typeof cfg.onReady === 'function') cfg.onReady();
  };
})();
