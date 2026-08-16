/* ===== 统一搜索路由：search.html?q=关键词 → 跳转（含历史记录） ===== */
(function () {
  // 关键词 → 目标页面（均相对站点根目录）
  const ROUTES = {
    '万镜教会': 'forum/index.html',
    '镜主':     'forum/index.html',
    '镜面论坛': 'forum/index.html',
    '镜子':     'forum/post_mirror_01.html',
    '节点':     'forum/post_mirror_01.html',
    '坐标':     'realworld/coordinates.html',
    '塔':       'realworld/tower.html',
    '电视塔':   'realworld/tower.html',
    '街':       'realworld/street.html',
    '街景':     'realworld/street.html',
    '监视':     'realworld/surveillance.html',
    '后台':     'backend/auditor.html',
    '审计':     'backend/auditor.html',
    '拒绝':     'endings/reject.html',
    '接受':     'endings/accept.html',
    'mirror_exit': 'endings/mirror_exit.html',
    'mirror exit':  'endings/mirror_exit.html',
    '1999':     'hidden/1999.html',
    '失踪':     'hidden/1999.html',
    '证据':     'realworld/evidence.html',
    '红房间':   'hidden/redroom.html',
    'redroom':  'hidden/redroom.html',
    '转录':     'hidden/transcript.html',
    '最后一面镜子': 'hidden/mirror.html',
    '饺子':     'index.html',
    '老槐树':   'index.html',
    // 剧情扩展页
    '审核员':   'hidden/moderator_log.html',
    '手记':     'hidden/moderator_log.html',
    '日志':     'hidden/moderator_log.html',
    '创立':     'hidden/founding.html',
    '起源':     'hidden/founding.html',
    '始末':     'hidden/founding.html',
    '老板娘':   'realworld/dumpling.html',
    '城南':     'realworld/dumpling.html',
    '城南老街': 'realworld/dumpling.html',
    '之后':     'hidden/aftermath.html',
    '继承':     'hidden/aftermath.html',
    '第十三面之后': 'hidden/aftermath.html',
    // 教会背景页
    '信条':     'hidden/creed.html',
    '每一面镜子': 'hidden/creed.html',
    '门':       'hidden/creed.html',
    '万镜夜话': 'hidden/prehistory.html',
    '节目':     'hidden/prehistory.html',
    '停播':     'hidden/prehistory.html',
    '前身':     'hidden/prehistory.html'
  };

  // 后期关键词：需玩家推进到一定程度（点亮≥10面镜子，即走过引入1999的节点10）才解锁
  const LATE_KEYS = ['1999','失踪','审核员','手记','日志','创立','起源','始末','老板娘','城南','城南老街','之后','继承','第十三面之后','转录','最后一面镜子','红房间','redroom','证据','信条','每一面镜子','万镜夜话','节目','停播','前身'];
  function gateOpen(matchKey) {
    const late = LATE_KEYS.some(function (k) { return matchKey === k || matchKey.toLowerCase().indexOf(k) >= 0; });
    if (!late) return true;
    var lit = 0;
    try { lit = (window.Progress && Progress.getProgress) ? Progress.getProgress() : parseInt(localStorage.getItem('progress') || '0', 10); } catch (e) {}
    return lit >= 10;
  }

  const KEY_H = 'searchHistory';

  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(KEY_H) || '[]'); } catch (e) { return []; }
  }
  function saveHistory(arr) {
    try { localStorage.setItem(KEY_H, JSON.stringify(arr)); } catch (e) {}
  }
  function pushHistory(term) {
    term = (term || '').trim();
    if (!term) return;
    var h = loadHistory();
    // 去重（忽略大小写），新词置顶
    h = h.filter(function (x) { return x.toLowerCase() !== term.toLowerCase(); });
    h.unshift(term);
    if (h.length > 12) h = h.slice(0, 12);
    saveHistory(h);
  }
  function clearHistory() {
    try { localStorage.removeItem(KEY_H); } catch (e) {}
  }

  // 站点根目录（兼容 GitHub Pages 子路径 / 本地 file:// 两种部署）
  function siteBase() {
    const here = (document.currentScript && document.currentScript.src) || location.href;
    const m = here.match(/^(.*?)\/(?:js|css)\//);
    if (m) return m[1] + '/';
    const segs = location.pathname.split('/').filter(Boolean);
    segs.pop();
    return location.origin + '/' + segs.join('/') + '/';
  }
  function rootPrefix() { return siteBase(); }
  function relSearch() { return siteBase() + 'search.html'; }
  function route(q) {
    const key = (q || '').trim().toLowerCase();
    if (!key) return null;
    if (ROUTES[key]) {
      if (!gateOpen(key)) return '__LOCKED__';
      return ROUTES[key];
    }
    for (const k in ROUTES) {
      if (key.indexOf(k) >= 0) {
        if (!gateOpen(k)) return '__LOCKED__';
        return ROUTES[k];
      }
    }
    return null;
  }

  window.MirrorSearch = {
    relSearch: relSearch, route: route, rootPrefix: rootPrefix, siteBase: siteBase,
    ROUTES: ROUTES, pushHistory: pushHistory, clearHistory: clearHistory, loadHistory: loadHistory
  };

  document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');

    function esc(s) {
      return (s || '').replace(/[<>&"]/g, function (c) {
        return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c];
      });
    }
    function renderHistory(box, form, input) {
      const h = loadHistory();
      if (!h.length) { box.innerHTML = ''; return; }
      let html = '<div class="sh-title">你照过的镜子：</div><div class="sh-chips">';
      h.forEach(function (term) {
        html += '<button type="button" class="sh-chip" data-term="' + esc(term) + '">' + esc(term) + '</button>';
      });
      html += '</div><button type="button" class="sh-clear">清除历史</button>';
      box.innerHTML = html;
      box.querySelectorAll('.sh-chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
          if (input) input.value = chip.getAttribute('data-term');
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        });
      });
      const clr = box.querySelector('.sh-clear');
      if (clr) clr.addEventListener('click', function () { clearHistory(); renderHistory(box, form, input); });
    }

    // 自动给每个搜索框挂上历史记录
    const forms = document.querySelectorAll('form#searchForm');
    forms.forEach(function (form) {
      const input = form.querySelector('#searchInput') || form.querySelector('input');
      let box = form.parentNode.querySelector('.search-history');
      if (!box) {
        box = document.createElement('div');
        box.className = 'search-history';
        if (form.nextSibling) form.parentNode.insertBefore(box, form.nextSibling);
        else form.parentNode.appendChild(box);
      }
      renderHistory(box, form, input);
      form.addEventListener('submit', function () {
        setTimeout(function () { renderHistory(box, form, input); }, 0);
      });
    });

    const form = document.getElementById('searchForm');
    const input = document.getElementById('searchInput');
    const msg = document.getElementById('searchMsg');
    if (form) {
      form.action = relSearch();
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const v = input.value;
        localStorage.setItem('lastQuery', v);
        const dest = route(v);
        if (dest === '__LOCKED__') {
          if (msg) msg.textContent = '“' + v + '” 在镜中还没有倒影……也许你还没走到那一夜。先去照照前面的镜子。';
        } else if (dest) { pushHistory(v); location.href = siteBase() + dest; }
        else if (msg) msg.textContent = '“' + v + '” 在镜中没有任何倒影。再想想？';
      });
    }
    // 若被带 ?q= 直达，则直接路由（同样用站点根拼接）
    if (q) {
      localStorage.setItem('lastQuery', q);
      const dest = route(q);
      if (dest === '__LOCKED__') {
        if (msg) msg.textContent = '“' + q + '” 在镜中还没有倒影……也许你还没走到那一夜。';
      } else if (dest) { pushHistory(q); location.href = siteBase() + dest; }
    }
  });
})();
