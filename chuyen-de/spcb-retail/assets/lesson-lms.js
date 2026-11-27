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
        if (document.querySelector('.g-full') || document.querySelector('.help-modal:not([hidden])')) return;
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

  /* ---------- Float Button ? -> Modal Hướng dẫn 3 bước (KiCi, Section, Tương tác) ---------- */
  function buildHelpGuide() {
    var fab = document.createElement('button');
    fab.type = 'button';
    fab.id = 'help-fab';
    fab.className = 'help-fab';
    fab.innerHTML = '<span class="q"><i class="fa-solid fa-question"></i></span><span class="txt">Hướng dẫn học</span>';
    fab.title = 'Xem hướng dẫn cách học bài này cùng KiCi';
    document.body.appendChild(fab);

    var modal = null;
    var stepIdx = 0;

    function collectSections() {
      var arr = [];
      document.querySelectorAll('.lms-wrap > .lms-card').forEach(function (sec, i) {
        var tagEl = sec.querySelector('.lesson-eyebrow, .sec-tag');
        var titleEl = sec.querySelector('h1.lesson-title, .sec-head h2');
        var tag = tagEl ? tagEl.textContent.trim() : ('Phần ' + (i + 1));
        var title = titleEl ? titleEl.textContent.trim() : '';
        arr.push({ tag: tag, title: title });
      });
      return arr;
    }

    function collectFeatures() {
      var list = [];
      if (document.querySelector('.term')) {
        list.push({ ico: 'fa-underline', txt: '<b>Chữ gạch chân nét đứt màu xanh:</b> Bấm vào để xem nhanh giải thích thuật ngữ ngay bên dưới.' });
      }
      if (document.querySelector('.seg-btn, .tl-step, .lf-box')) {
        list.push({ ico: 'fa-hand-pointer', txt: '<b>Các nút chuyển tab &amp; Sơ đồ Logic vận hành:</b> Bấm từng bước hoặc nút <b>Bước tiếp</b> để xem luồng dữ liệu, giúp bạn đọc hiểu và nhớ quy trình dễ dàng.' });
      }
      if (document.querySelector('.flip')) {
        list.push({ ico: 'fa-clone', txt: '<b>Thẻ lật 3D:</b> Chạm trực tiếp vào từng thẻ để lật mặt sau xem Ý nghĩa và Ví dụ thực tế.' });
      }
      if (document.querySelector('#quiz-host')) {
        list.push({ ico: 'fa-clipboard-question', txt: '<b>Trắc nghiệm nhanh:</b> Chọn đáp án A, B hoặc C để KiCi chấm ngay và giải thích tại chỗ.' });
      }
      if (document.querySelector('#gallery-host')) {
        list.push({ ico: 'fa-images', txt: '<b>Gallery Giao diện ôn tập:</b> Bấm hai mũi tên nằm ngoài ảnh hoặc dùng phím <b>← →</b> để xem lại ảnh màn hình; chỉ bấm nút <b>Phóng to</b> khi cần xem cỡ lớn.' });
      }
      if (document.querySelector('#chk-host')) {
        list.push({ ico: 'fa-list-check', txt: '<b>Checklist tự kiểm:</b> Tích đánh dấu các ý đã hiểu và ghi nhớ trước khi sang bài tiếp theo trên LMS.' });
      }
      list.push({ ico: 'fa-lightbulb', txt: '<b>Lưu ý cách học:</b> Bài học tương tác dùng để đọc hiểu và tương tác cho nhớ; bạn không cần chia đôi màn hình làm song song vì cuối buổi đã có Bài tập Thực hành riêng.' });
      return list;
    }

    function ensureModal() {
      if (modal) return;
      modal = document.createElement('div');
      modal.className = 'help-modal';
      modal.hidden = true;
      modal.innerHTML =
        '<div class="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-dlg-title">' +
          '<div class="help-head">' +
            '<div class="kici-ava">' + KVL.kiciSvg('hello') + '</div>' +
            '<div class="help-head-meta">' +
              '<span class="help-k">Hướng dẫn sử dụng bài học</span>' +
              '<h4 id="help-dlg-title">KiCi đồng hành cùng bạn</h4>' +
            '</div>' +
            '<button type="button" class="help-x" aria-label="Đóng"><i class="fa-solid fa-xmark"></i></button>' +
          '</div>' +
          '<div class="help-tabs">' +
            '<button type="button" class="help-tab active" data-htab="0">1. KiCi là gì?</button>' +
            '<button type="button" class="help-tab" data-htab="1">2. Trình tự bài</button>' +
            '<button type="button" class="help-tab" data-htab="2">3. Chỗ cần bấm</button>' +
          '</div>' +
          '<div id="help-stage-host"></div>' +
          '<div class="help-foot">' +
            '<div class="help-dots"><i class="on"></i><i></i><i></i></div>' +
            '<div class="btn-row">' +
              '<button type="button" class="btn" data-hnav="-1" disabled><i class="fa-solid fa-arrow-left"></i> Trước</button>' +
              '<button type="button" class="btn btn-primary" data-hnav="1">Tiếp <i class="fa-solid fa-arrow-right"></i></button>' +
            '</div>' +
          '</div>' +
        '</div>';
      document.body.appendChild(modal);

      var secs = collectSections();
      var feats = collectFeatures();

      var p1 = '<ul class="help-list">' +
        '<li><span class="help-ico"><i class="fa-solid fa-robot"></i></span><span><b>KiCi — Người bạn đồng hành L&amp;D:</b> Luôn xuất hiện ở ngay đầu mỗi khung để chào bạn, tóm tắt mục tiêu và dẫn dắt ý chính trước khi bạn đọc chi tiết.</span></li>' +
        '<li><span class="help-ico"><i class="fa-solid fa-palette"></i></span><span><b>Khung màu xanh dương &amp; xanh lá xen kẽ:</b> Mỗi khung là một chặng học riêng giúp mắt bạn dễ nghỉ và phân tách nội dung gọn gàng trong khung LMS.</span></li>' +
        '<li><span class="help-ico"><i class="fa-solid fa-underline"></i></span><span><b>Thuật ngữ chạm xem nghĩa:</b> Những từ gạch chân nét đứt màu xanh đều bấm vào được để xem định nghĩa ngắn ngay bên dưới.</span></li>' +
      '</ul>';

      var p2 = '<ul class="help-list">' +
        secs.map(function (s, i) {
          return '<li><span class="help-num">' + (i + 1) + '</span><span><b>' + s.tag + ':</b> ' + s.title + '</span></li>';
        }).join('') +
      '</ul>';

      var p3 = '<ul class="help-list">' +
        feats.map(function (f) {
          return '<li><span class="help-ico"><i class="fa-solid ' + f.ico + '"></i></span><span>' + f.txt + '</span></li>';
        }).join('') +
      '</ul>';

      var tabsCtrl = KVL.tabs('help-stage-host', [p1, p2, p3], 0);
      var hTabs = Array.prototype.slice.call(modal.querySelectorAll('.help-tab'));
      var hDots = Array.prototype.slice.call(modal.querySelectorAll('.help-dots i'));
      var prevB = modal.querySelector('[data-hnav="-1"]');
      var nextB = modal.querySelector('[data-hnav="1"]');

      function goStep(n, play) {
        stepIdx = Math.max(0, Math.min(2, n));
        tabsCtrl.select(stepIdx, play);
        hTabs.forEach(function (t, i) { t.classList.toggle('active', i === stepIdx); });
        hDots.forEach(function (d, i) { d.classList.toggle('on', i === stepIdx); });
        prevB.disabled = stepIdx === 0;
        nextB.innerHTML = stepIdx === 2 ? 'Đã hiểu <i class="fa-solid fa-check"></i>' : 'Tiếp <i class="fa-solid fa-arrow-right"></i>';
      }

      modal.addEventListener('click', function (e) {
        if (e.target === modal || e.target.closest('.help-x')) { closeModal(); return; }
        var tb = e.target.closest('[data-htab]');
        if (tb) { goStep(+tb.getAttribute('data-htab'), true); return; }
        var nb = e.target.closest('[data-hnav]');
        if (nb && !nb.disabled) {
          var d = +nb.getAttribute('data-hnav');
          if (stepIdx + d >= 3) closeModal();
          else goStep(stepIdx + d, true);
        }
      });

      document.addEventListener('keydown', function (e) {
        if (modal.hidden) return;
        if (e.key === 'Escape') closeModal();
      });

      modal._reset = function () { goStep(0, false); };
    }

    function openModal() {
      ensureModal();
      modal._reset();
      modal.hidden = false;
      KVL.sound('click');
    }

    function closeModal() {
      if (modal) modal.hidden = true;
      KVL.sound('click');
    }

    fab.addEventListener('click', openModal);
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-tour]')) openModal();
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
