/* ==========================================================================
   KiotViet LMS Lesson Kit v2.0 - SPCB Retail (Buổi 1 Edition)
   - Nhân vật KiCi (mount .kici-ava / .kici-box / .kici-lead)
   - Chữ chạm xem nghĩa {{Khóa|Hiển thị}} trên toàn bài
   - Tab cố định chiều cao (CSS Grid stacking .tab-stage)
   - Sơ đồ Logic vận hành tương tác (KVL.logicFlow)
   - Gallery Giao diện ôn tập: mũi tên ngoài ảnh, phím ← / →, nút Phóng to riêng
   - Float Button ? -> Modal Hướng dẫn 3 bước (KiCi, trình tự Section, chức năng bấm)
   ========================================================================== */
(function () {
  'use strict';
  var KVL = window.KVL = {};
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

  function termifyWalk(root) {
    if (!root || !document.createTreeWalker) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || node.nodeValue.indexOf('{{') === -1) return NodeFilter.FILTER_REJECT;
        var p = node.parentNode;
        if (!p || p.closest('script, style, code, pre, textarea, input, button.term, svg')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    var cur;
    while ((cur = walker.nextNode())) nodes.push(cur);
    nodes.forEach(function (tn) {
      var text = tn.nodeValue;
      var re = /\{\{([^}|]+)(?:\|([^}]+))?\}\}/g;
      var m, last = 0;
      var frag = document.createDocumentFragment();
      while ((m = re.exec(text)) !== null) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        var key = m[1].trim();
        var label = (m[2] || m[1]).trim();
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'term';
        btn.setAttribute('data-term', key);
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = label;
        frag.appendChild(btn);
        last = re.lastIndex;
      }
      if (last === 0) return;
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      tn.parentNode.replaceChild(frag, tn);
    });
  }

  function wireTerms() {
    termifyWalk(document.querySelector('.lms-wrap') || document.body);
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.term');
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      var key = b.getAttribute('data-term');
      var def = (window.KV_TERMS || {})[key];
      if (!def) return;
      var host = b.closest('p, li, td, .kici-text, .tl-panel, .cmp-card, .val-item, .step-detail, .callout, .lf-card') || b.parentElement;
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

  /* ---------- Tab cố định chiều cao (CSS Grid stacking .tab-stage) ---------- */
  KVL.tabs = function (hostId, panesHtml, initialIdx) {
    var host = typeof hostId === 'string' ? document.getElementById(hostId) : hostId;
    if (!host || !panesHtml || !panesHtml.length) return null;
    var activeIdx = Math.max(0, Math.min(panesHtml.length - 1, initialIdx || 0));
    host.innerHTML =
      '<div class="tab-stage">' +
        panesHtml.map(function (html, i) {
          return '<div class="tab-pane' + (i === activeIdx ? ' active' : '') + '" data-tidx="' + i + '">' + KVL.termify(html) + '</div>';
        }).join('') +
      '</div>';

    var panes = Array.prototype.slice.call(host.querySelectorAll(':scope > .tab-stage > .tab-pane'));
    return {
      select: function (idx, playSound) {
        if (idx < 0 || idx >= panes.length) return;
        activeIdx = idx;
        panes.forEach(function (p, i) {
          p.classList.toggle('active', i === idx);
        });
        if (playSound) KVL.sound('click');
      },
      getIndex: function () { return activeIdx; }
    };
  };

  /* ---------- Sơ đồ Logic vận hành tương tác (trực quan, không nhảy khung) ---------- */
  KVL.logicFlow = function (hostId, steps) {
    var host = document.getElementById(hostId);
    if (!host || !steps || !steps.length) return;
    var idx = 0;
    var seen = { 0: true };

    var chainHtml = steps.map(function (st, i) {
      return (i > 0 ? '<i class="fa-solid fa-arrow-right lf-sep" aria-hidden="true"></i>' : '') +
        '<button type="button" class="lf-node' + (i === 0 ? ' active seen' : '') + '" data-lf="' + i + '">' +
          '<span class="lf-num">' + (i + 1) + '</span>' +
          '<span>' + st.label + '</span>' +
        '</button>';
    }).join('');

    host.innerHTML =
      '<div class="lf-box">' +
        '<div class="lf-chain" role="tablist" aria-label="Các bước logic vận hành">' + chainHtml + '</div>' +
        '<div id="' + hostId + '-stage"></div>' +
        '<div class="lf-foot">' +
          '<span class="lf-prog">Bước 1 / ' + steps.length + '</span>' +
          '<div class="btn-row">' +
            '<button type="button" class="btn" data-lfnav="-1" disabled><i class="fa-solid fa-arrow-left"></i> Bước trước</button>' +
            '<button type="button" class="btn btn-primary" data-lfnav="1">Bước tiếp <i class="fa-solid fa-arrow-right"></i></button>' +
          '</div>' +
        '</div>' +
      '</div>';

    var panesHtml = steps.map(function (st, i) {
      return '<div class="lf-pane-box">' +
        '<div class="lf-step-head">' +
          '<span class="lf-badge"><i class="fa-solid ' + (st.icon || 'fa-diagram-project') + '"></i> Bước ' + (i + 1) + ' / ' + steps.length + '</span>' +
          '<h4>' + st.title + '</h4>' +
        '</div>' +
        '<div class="lf-cards">' +
          '<div class="lf-card"><small><i class="fa-solid fa-hand-pointer"></i> Đầu vào / Thao tác</small><p>' + st.input + '</p></div>' +
          '<div class="lf-down" aria-hidden="true"><i class="fa-solid fa-arrow-down"></i></div>' +
          '<div class="lf-card proc"><small><i class="fa-solid fa-gears"></i> Hệ thống xử lý</small><p>' + st.process + '</p></div>' +
          '<div class="lf-down" aria-hidden="true"><i class="fa-solid fa-arrow-down"></i></div>' +
          '<div class="lf-card out"><small><i class="fa-solid fa-circle-check"></i> Kết quả ghi nhận</small><p>' + st.result + '</p></div>' +
        '</div>' +
      '</div>';
    });

    var ctrl = KVL.tabs(hostId + '-stage', panesHtml, 0);
    var nodes = Array.prototype.slice.call(host.querySelectorAll('.lf-node'));
    var progEl = host.querySelector('.lf-prog');
    var prevBtn = host.querySelector('[data-lfnav="-1"]');
    var nextBtn = host.querySelector('[data-lfnav="1"]');

    function sync(n, sound) {
      idx = Math.max(0, Math.min(steps.length - 1, n));
      seen[idx] = true;
      ctrl.select(idx, sound);
      nodes.forEach(function (b, k) {
        b.classList.toggle('active', k === idx);
        b.classList.toggle('seen', !!seen[k]);
      });
      progEl.textContent = 'Bước ' + (idx + 1) + ' / ' + steps.length;
      prevBtn.disabled = idx === 0;
      nextBtn.disabled = idx === steps.length - 1;
    }

    host.addEventListener('click', function (e) {
      var nb = e.target.closest('[data-lf]');
      if (nb) { sync(+nb.getAttribute('data-lf'), true); return; }
      var nav = e.target.closest('[data-lfnav]');
      if (nav && !nav.disabled) sync(idx + (+nav.getAttribute('data-lfnav')), true);
    });
  };

  /* ---------- Gallery Giao diện Ôn tập (mũi tên ngoài ảnh, hỗ trợ phím mũi tên, phóng to riêng) ---------- */
  KVL.gallery = function (hostId, imgs) {
    var host = document.getElementById(hostId);
    if (!host || !imgs || !imgs.length) return;
    var list = imgs.map(function (item, i) {
      return typeof item === 'string'
        ? { src: item, alt: 'Ảnh giao diện KiotViet ' + (i + 1) }
        : { src: item.src || item.img, alt: item.alt || ('Ảnh giao diện KiotViet ' + (i + 1)) };
    });
    var idx = 0;
    var touchX = 0;
    var multi = list.length > 1;

    host.innerHTML =
      '<div class="gallery-box">' +
        '<div class="gallery-top">' +
          '<span class="gallery-count"><i class="fa-regular fa-images"></i> Ảnh 1 / ' + list.length + '</span>' +
          '<button type="button" class="gallery-zoom-btn" data-gzoom="1"><i class="fa-solid fa-expand"></i> Phóng to</button>' +
        '</div>' +
        '<div class="gallery-frame">' +
          '<button type="button" class="gallery-arrow prev" data-gnav="-1" aria-label="Ảnh trước" disabled' + (multi ? '' : ' hidden') + '><i class="fa-solid fa-chevron-left"></i></button>' +
          '<div class="gallery-stage"><img src="' + list[0].src + '" alt="' + list[0].alt + '"></div>' +
          '<button type="button" class="gallery-arrow next" data-gnav="1" aria-label="Ảnh tiếp theo"' + (multi ? '' : ' hidden') + '><i class="fa-solid fa-chevron-right"></i></button>' +
        '</div>' +
        (multi
          ? '<div class="gallery-nav">' +
              '<div class="gallery-dots">' +
                list.map(function (_, i) {
                  return '<button type="button" class="gallery-dot' + (i === 0 ? ' on' : '') + '" data-gidx="' + i + '" aria-label="Xem ảnh ' + (i + 1) + '"></button>';
                }).join('') +
              '</div>' +
              '<p class="gallery-hint"><i class="fa-regular fa-keyboard"></i> Bấm mũi tên hai bên hoặc phím ← / → để chuyển ảnh</p>' +
            '</div>'
          : '') +
      '</div>';

    var countEl = host.querySelector('.gallery-count');
    var imgEl = host.querySelector('.gallery-stage img');
    var prevBtn = host.querySelector('.gallery-arrow.prev');
    var nextBtn = host.querySelector('.gallery-arrow.next');
    var dots = Array.prototype.slice.call(host.querySelectorAll('.gallery-dot'));

    function sync(n, playSound) {
      idx = Math.max(0, Math.min(list.length - 1, n));
      var cur = list[idx];
      imgEl.src = cur.src;
      imgEl.alt = cur.alt;
      countEl.innerHTML = '<i class="fa-regular fa-images"></i> Ảnh ' + (idx + 1) + ' / ' + list.length;
      if (prevBtn) prevBtn.disabled = idx === 0;
      if (nextBtn) nextBtn.disabled = idx === list.length - 1;
      dots.forEach(function (d, i) { d.classList.toggle('on', i === idx); });
      if (playSound) KVL.sound('click');
    }

    function openZoom() {
      var dlg = document.createElement('div');
      dlg.className = 'g-full';
      dlg.setAttribute('role', 'dialog');
      function paintDlg() {
        var cur = list[idx];
        dlg.innerHTML =
          '<button type="button" class="g-full-x" aria-label="Đóng"><i class="fa-solid fa-xmark"></i></button>' +
          '<div class="g-stage"><div class="g-imgbox"><img src="' + cur.src + '" alt="' + cur.alt + '"></div></div>' +
          '<div class="g-full-bar">' +
            '<div class="g-full-cap"><b>Ảnh ' + (idx + 1) + ' / ' + list.length + '</b><small>Dùng phím ← / → để chuyển ảnh · Esc để đóng</small></div>' +
            (multi
              ? '<div class="btn-row">' +
                  '<button type="button" class="btn" data-fnav="-1"' + (idx === 0 ? ' disabled' : '') + '><i class="fa-solid fa-arrow-left"></i> Trước</button>' +
                  '<button type="button" class="btn btn-primary" data-fnav="1"' + (idx === list.length - 1 ? ' disabled' : '') + '>Tiếp <i class="fa-solid fa-arrow-right"></i></button>' +
                '</div>'
              : '') +
          '</div>';
      }
      function closeDlg() { dlg.remove(); document.removeEventListener('keydown', onK); }
      function onK(ev) {
        if (ev.key === 'Escape') closeDlg();
        else if (ev.key === 'ArrowLeft' && idx > 0) { sync(idx - 1, true); paintDlg(); }
        else if (ev.key === 'ArrowRight' && idx < list.length - 1) { sync(idx + 1, true); paintDlg(); }
      }
      dlg.addEventListener('click', function (ev) {
        var fnav = ev.target.closest('[data-fnav]');
        if (fnav && !fnav.disabled) {
          sync(idx + (+fnav.getAttribute('data-fnav')), true);
          paintDlg();
          return;
        }
        if (ev.target === dlg || ev.target.closest('.g-full-x')) closeDlg();
      });
      paintDlg();
      document.body.appendChild(dlg);
      document.addEventListener('keydown', onK);
      KVL.sound('click');
    }

    host.addEventListener('click', function (e) {
      var nb = e.target.closest('[data-gnav]');
      if (nb && !nb.disabled) { sync(idx + (+nb.getAttribute('data-gnav')), true); return; }
      var db = e.target.closest('[data-gidx]');
      if (db) { sync(+db.getAttribute('data-gidx'), true); return; }
      if (e.target.closest('[data-gzoom]')) openZoom();
    });
    host.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches[0]) touchX = e.touches[0].clientX;
    }, { passive: true });
    host.addEventListener('touchend', function (e) {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 42) {
        var next = dx < 0 ? Math.min(list.length - 1, idx + 1) : Math.max(0, idx - 1);
        if (next !== idx) sync(next, true);
      }
    }, { passive: true });

    if (multi) {
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        if (document.querySelector('.g-full') || document.querySelector('.tour-pop:not([hidden])')) return;
        var ae = document.activeElement;
        if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) return;
        var next = e.key === 'ArrowRight' ? idx + 1 : idx - 1;
        if (next >= 0 && next < list.length) {
          e.preventDefault();
          sync(next, true);
        }
      });
    }
  };

  /* ---------- Float Button ? -> Hướng dẫn học tập tương tác từ đầu đến cuối ---------- */
  function buildHelpGuide() {
    var fab = document.createElement('button');
    fab.type = 'button';
    fab.id = 'help-fab';
    fab.className = 'help-fab';
    fab.innerHTML = '<span class="q"><i class="fa-solid fa-question"></i></span><span class="txt">Hướng dẫn học</span>';
    fab.title = 'Mở hướng dẫn học tập từng phần cùng KiCi';
    document.body.appendChild(fab);

    var backdrop = null;
    var spot = null;
    var pop = null;
    var steps = [];
    var curIdx = 0;
    var rafId = 0;

    function buildSectionRoadmapHtml() {
      var arr = [];
      document.querySelectorAll('.lms-wrap > .lms-card').forEach(function (sec, i) {
        var tagEl = sec.querySelector('.sec-tag, .lesson-eyebrow');
        var tag = tagEl ? tagEl.textContent.trim() : ('Mục ' + (i + 1));
        if (i === 0) tag = 'Mở bài & Mục tiêu';
        arr.push('<li><b>' + (i + 1) + '.</b> ' + tag + '</li>');
      });
      return '<ol class="tour-roadmap">' + arr.join('') + '</ol>';
    }

    function collectTourSteps() {
      var list = [];
      var kiciTop = document.querySelector('.lms-wrap > .lms-card:first-of-type .kici-box');
      if (kiciTop) {
        var hasTerm = !!document.querySelector('.term');
        list.push({
          el: kiciTop,
          mood: 'hello',
          title: 'KiCi là gì? — Người bạn đồng hành của bạn',
          body: '<p>KiCi luôn đứng ngay đầu mỗi khung màu để chào bạn, tóm tắt mục tiêu và nhắc mẹo cần nhớ trước khi bạn đọc chi tiết.</p>' +
            (hasTerm ? '<p><b>Chỗ cần bấm:</b> Các chữ gạch chân nét đứt màu xanh trong bài đều chạm vào được để mở nhanh giải thích thuật ngữ.</p>' : '')
        });
      }

      var goalEl = document.querySelector('.goal-list') || document.querySelector('.lms-wrap > .lms-card:first-of-type .lesson-title');
      if (goalEl) {
        list.push({
          el: goalEl,
          mood: 'hint',
          title: 'Trình tự bài học gồm các phần từ trên xuống',
          body: '<p>Bài này được chia thành từng chặng ngắn dễ theo dõi:</p>' + buildSectionRoadmapHtml()
        });
      }

      var ytEl = document.querySelector('.video-box');
      if (ytEl) {
        list.push({
          el: ytEl,
          mood: 'explain',
          title: 'Phần Video — Bấm phát để xem trọn tình huống mẫu',
          body: '<p><b>Chỗ cần bấm:</b> Bấm vào nút Play trên khung video YouTube để xem thao tác thực tế trước khi đọc diễn giải chi tiết bên dưới.</p>'
        });
      }

      var lfEl = document.querySelector('.lf-box');
      if (lfEl) {
        list.push({
          el: lfEl,
          mood: 'hint',
          title: 'Sơ đồ quy trình — Bấm từng bước để xem luồng xử lý',
          body: '<p><b>Chỗ cần bấm:</b> Bấm từng nút số thứ tự phía trên hoặc nút <b>Bước tiếp</b> ở góc dưới để xem trọn mạch Đầu vào → Hệ thống xử lý → Kết quả.</p>'
        });
      }

      var segEl = document.querySelector('.seg-group, .tl');
      if (segEl) {
        list.push({
          el: segEl,
          mood: 'explain',
          title: 'Thẻ so sánh — Bấm chuyển qua lại để phân biệt nhanh',
          body: '<p><b>Chỗ cần bấm:</b> Bấm từng nút trong thanh tab này để so sánh rõ sự khác nhau giữa các trường hợp; khung nội dung tự giữ nguyên chiều cao.</p>'
        });
      } else {
        var cmp2El = document.querySelector('.cmp-grid-2');
        if (cmp2El) {
          list.push({
            el: cmp2El,
            mood: 'explain',
            title: 'Khung so sánh song song — Đặt 2 trường hợp cạnh nhau để đối chiếu',
            body: '<p>Hai hộp được xếp song song giúp bạn nhìn thẳng và phân biệt nhanh hai trường hợp mà không phải bấm chuyển qua lại.</p>'
          });
        }
      }

      var flipEl = document.querySelector('.flip-grid');
      if (flipEl) {
        list.push({
          el: flipEl,
          mood: 'explain',
          title: 'Thẻ lật 3D — Chạm trực tiếp vào thẻ để xem mặt sau',
          body: '<p><b>Chỗ cần bấm:</b> Chạm vào từng thẻ xanh đậm để lật xem phần <b>Ý nghĩa</b> và <b>Ví dụ</b> thực tế.</p>'
        });
      }

      var docsLink = !ytEl ? document.querySelector('a[href*="docs.google.com/document"]') : null;
      var docBtnsEl = docsLink ? docsLink.closest('.btn-row') : null;
      if (docBtnsEl) {
        list.push({
          el: docBtnsEl,
          mood: 'hint',
          title: 'Mở Google Docs mẫu & Chọn Tệp › Tạo bản sao',
          body: '<p><b>Chỗ cần bấm:</b> Bấm nút <b>Mở Google Docs mẫu</b> để lưu bản sao riêng vào Drive của bạn trước khi chụp ảnh dán vào khung nét đứt.</p>'
        });
      }

      var practiceGridEl = docsLink ? document.querySelector('.lms-card:nth-of-type(3) .val-grid') : null;
      if (practiceGridEl) {
        list.push({
          el: practiceGridEl,
          mood: 'explain',
          title: 'Danh sách khung ảnh minh chứng cần chụp',
          body: '<p>Thực hành tuần tự từng nhiệm vụ trên gian hàng mã <b>3670</b>, chụp màn hình kết quả dán vào đúng từng khung ảnh rồi xuất file PDF nộp bài.</p>'
        });
      }

      var quizEl = document.querySelector('#quiz-host .quiz-item') || document.querySelector('#quiz-host');
      if (quizEl) {
        list.push({
          el: quizEl,
          mood: 'hint',
          title: 'Trắc nghiệm nhanh — Chọn A, B hoặc C để tự kiểm tra',
          body: '<p><b>Chỗ cần bấm:</b> Bấm chọn 1 phương án trong mỗi câu hỏi. Hệ thống sẽ chấm ngay tại chỗ và hiện giải thích chi tiết lý do đúng hay sai.</p>'
        });
      }

      var galEl = document.querySelector('.gallery-box');
      if (galEl) {
        list.push({
          el: galEl,
          mood: 'done',
          title: 'Gallery Giao diện ôn tập — Dùng mũi tên ngoài ảnh hoặc ← →',
          body: '<p><b>Chỗ cần bấm:</b> Bấm 2 nút mũi tên <b>‹ ›</b> bên ngoài ảnh (hoặc phím <b>← →</b>) để lướt xem lại ảnh màn hình; khi cần xem to mới bấm nút <b>Phóng to</b> ở góc trên phải.</p>'
        });
      }

      var chkEl = document.querySelector('#chk-host');
      if (chkEl) {
        list.push({
          el: chkEl,
          mood: 'done',
          title: 'Checklist tự kiểm — Đánh dấu trước khi sang bài tiếp theo',
          body: '<p><b>Chỗ cần bấm:</b> Tích vào từng ô vuông khi bạn chắc chắn đã hiểu và ghi nhớ trọn nội dung trước khi chuyển sang bài học tiếp theo.</p>'
        });
      }

      return list.filter(function (s) {
        if (!s.el) return false;
        var r = s.el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
    }

    function ensureOverlay() {
      if (backdrop) return;
      backdrop = document.createElement('div');
      backdrop.className = 'tour-backdrop';
      backdrop.hidden = true;

      spot = document.createElement('div');
      spot.className = 'tour-spot';
      spot.hidden = true;

      pop = document.createElement('div');
      pop.className = 'tour-pop';
      pop.setAttribute('role', 'dialog');
      pop.setAttribute('aria-modal', 'true');
      pop.hidden = true;

      document.body.appendChild(backdrop);
      document.body.appendChild(spot);
      document.body.appendChild(pop);

      backdrop.addEventListener('click', closeTour);
      pop.addEventListener('click', function (e) {
        if (e.target.closest('.tour-x')) { closeTour(); return; }
        var nb = e.target.closest('[data-tnav]');
        if (nb && !nb.disabled) {
          var next = curIdx + (+nb.getAttribute('data-tnav'));
          if (next >= steps.length) closeTour();
          else showStep(next, true);
        }
      });

      document.addEventListener('keydown', function (e) {
        if (!pop || pop.hidden) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          closeTour();
        } else if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          e.stopPropagation();
          if (curIdx + 1 < steps.length) showStep(curIdx + 1, true);
          else closeTour();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          e.stopPropagation();
          if (curIdx > 0) showStep(curIdx - 1, true);
        }
      });

      function onReposition() {
        if (!pop || pop.hidden) return;
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(positionCurrent);
      }
      window.addEventListener('resize', onReposition, { passive: true });
      window.addEventListener('scroll', onReposition, { passive: true });
    }

    function positionCurrent() {
      if (!pop || pop.hidden || !steps[curIdx]) return;
      var el = steps[curIdx].el;
      var raw = el.getBoundingClientRect();
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      var pad = 6;

      // Clamp spotlight vertical frame so there is always room for the popover inside short LMS viewports (e.g. 680x520)
      var sLeft = Math.max(8, raw.left - pad);
      var sRight = Math.min(vw - 8, raw.right + pad);
      var sWidth = Math.max(80, sRight - sLeft);
      var sTop = Math.max(8, raw.top - pad);
      var maxSpotH = Math.max(110, vh - 210);
      var sHeight = Math.min(Math.max(44, raw.height + pad * 2), maxSpotH);
      if (sTop + sHeight > vh - 12) sTop = Math.max(8, vh - 12 - sHeight);

      spot.style.left = sLeft + 'px';
      spot.style.top = sTop + 'px';
      spot.style.width = sWidth + 'px';
      spot.style.height = sHeight + 'px';

      // Measure popover and place cleanly below or above spotlight, always clamped inside viewport
      var pRect = pop.getBoundingClientRect();
      var pW = pRect.width || Math.min(370, vw - 24);
      var pH = pRect.height || 185;
      var gap = 10;

      var pLeft = Math.max(12, Math.min(sLeft, vw - pW - 12));
      var spaceBelow = vh - (sTop + sHeight) - 12;
      var spaceAbove = sTop - 12;
      var pTop;

      if (spaceBelow >= pH + gap) {
        pTop = sTop + sHeight + gap;
      } else if (spaceAbove >= pH + gap) {
        pTop = sTop - pH - gap;
      } else {
        pTop = vh - pH - 12;
      }
      pTop = Math.max(12, Math.min(pTop, vh - pH - 12));

      pop.style.left = pLeft + 'px';
      pop.style.top = pTop + 'px';
    }

    function renderPopContent(idx) {
      var st = steps[idx];
      var dots = steps.map(function (_, i) {
        return '<i class="' + (i === idx ? 'on' : '') + '"></i>';
      }).join('');
      pop.innerHTML =
        '<div class="tour-head">' +
          '<div class="kici-ava">' + KVL.kiciSvg(st.mood || 'hello') + '</div>' +
          '<div class="tour-head-meta">' +
            '<span class="tour-step">Hướng dẫn học tập · Bước ' + (idx + 1) + ' / ' + steps.length + '</span>' +
            '<h4 class="tour-title">' + st.title + '</h4>' +
          '</div>' +
          '<button type="button" class="tour-x" aria-label="Đóng hướng dẫn"><i class="fa-solid fa-xmark"></i></button>' +
        '</div>' +
        '<div class="tour-body">' + st.body + '</div>' +
        '<div class="tour-foot">' +
          '<div class="tour-dots">' + dots + '</div>' +
          '<div class="tour-actions">' +
            '<button type="button" class="btn" data-tnav="-1"' + (idx === 0 ? ' disabled' : '') + '><i class="fa-solid fa-arrow-left"></i> Trước</button>' +
            '<button type="button" class="btn btn-primary" data-tnav="1">' + (idx === steps.length - 1 ? 'Hoàn tất <i class="fa-solid fa-check"></i>' : 'Tiếp <i class="fa-solid fa-arrow-right"></i>') + '</button>' +
          '</div>' +
        '</div>';
    }

    function showStep(idx, play) {
      curIdx = Math.max(0, Math.min(steps.length - 1, idx));
      renderPopContent(curIdx);
      var targetEl = steps[curIdx].el;
      var rect = targetEl.getBoundingClientRect();
      var vh = window.innerHeight;
      // Bring target cleanly toward upper area so spotlight + popover both fit inside viewport
      var desiredTop = Math.max(16, Math.round(vh * 0.14));
      var targetScroll = Math.max(0, window.scrollY + rect.top - desiredTop);
      window.scrollTo({ top: targetScroll, behavior: 'auto' });
      requestAnimationFrame(function () {
        positionCurrent();
      });
      if (play) KVL.sound('click');
    }

    function openTour() {
      steps = collectTourSteps();
      if (!steps.length) return;
      if (fab && fab.blur) fab.blur();
      ensureOverlay();
      backdrop.hidden = false;
      spot.hidden = false;
      pop.hidden = false;
      showStep(0, true);
    }

    function closeTour() {
      if (backdrop) backdrop.hidden = true;
      if (spot) spot.hidden = true;
      if (pop) pop.hidden = true;
      KVL.sound('click');
    }

    fab.addEventListener('click', openTour);
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-tour]')) openTour();
    });
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
    buildHelpGuide();
  });
})();
