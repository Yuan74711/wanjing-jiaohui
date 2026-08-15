/* ===== 统一搜索路由：search.html?q=关键词 → 跳转 ===== */
(function () {
  // 关键词 → 目标页面（均相对站点根目录）
  const ROUTES = {
    '万镜教会': 'forum/index.html',
    '镜面论坛': 'forum/index.html',
    '镜主':     'forum/index.html',
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
    '老槐树':   'index.html'
  };

  // 从当前页回到站点根所需的上层级数前缀
  function rootPrefix() {
    const segs = location.pathname.split('/').filter(Boolean);
    return '../'.repeat(Math.max(0, segs.length - 1));
  }
  function relSearch() {
    return rootPrefix() + 'search.html';
  }
  function route(q) {
    const key = (q || '').trim().toLowerCase();
    if (!key) return null;
    if (ROUTES[key]) return ROUTES[key];
    for (const k in ROUTES) { if (key.indexOf(k) >= 0) return ROUTES[k]; }
    return null;
  }
  window.MirrorSearch = { relSearch: relSearch, route: route, rootPrefix: rootPrefix, ROUTES: ROUTES };

  document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
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
        // 目标路径相对于站点根，必须补齐当前目录的上层前缀
        if (dest) location.href = rootPrefix() + dest;
        else if (msg) msg.textContent = '“' + v + '” 在镜中没有任何倒影。再想想？';
      });
    }
    // 若被带 ?q= 直达，则直接路由（同样需补齐根前缀）
    if (q) { const dest = route(q); if (dest) location.href = rootPrefix() + dest; }
  });
})();
