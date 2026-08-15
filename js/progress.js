/* ===== 进度系统：localStorage 记录镜面仪式进度 ===== */
const Progress = (function () {
  const KEY_P = 'progress';      // 已点亮的镜面节点数 0-13
  const KEY_C = 'currentChapter';
  const KEY_ID = 'playerId';     // 玩家工号（随机生成）

  function ensure() {
    if (!localStorage.getItem(KEY_ID)) {
      localStorage.setItem(KEY_ID, 'AUD-' + Math.floor(1000 + Math.random() * 9000));
    }
    if (!localStorage.getItem(KEY_P)) localStorage.setItem(KEY_P, '0');
    if (!localStorage.getItem(KEY_C)) localStorage.setItem(KEY_C, '1');
  }
  function getProgress() { return parseInt(localStorage.getItem(KEY_P) || '0', 10); }
  function setProgress(n) {
    const cur = getProgress();
    if (n > cur) localStorage.setItem(KEY_P, String(n));
  }
  function getChapter() { return localStorage.getItem(KEY_C) || '1'; }
  function setChapter(c) { localStorage.setItem(KEY_C, String(c)); }
  function getId() { return localStorage.getItem(KEY_ID) || 'AUD-0000'; }

  // 已解开的镜面节点集合（由 puzzle.js 维护）
  function getSolvedSet() {
    try { return JSON.parse(localStorage.getItem('solvedMirrors') || '{}'); }
    catch (e) { return {}; }
  }

  // 在 #progress 容器内渲染 13 面镜子
  function renderIndicator(container, highlight) {
    if (!container) return;
    const p = getProgress();
    const solved = getSolvedSet();
    let html = '<div class="mirror-row" title="镜面节点 ' + p + '/13">';
    for (let i = 1; i <= 13; i++) {
      const lit = (i <= p || solved[i]) ? ' lit' : '';
      const mark = (i === highlight && i > p && !solved[i]) ? '◇' : ((i <= p || solved[i]) ? '◈' : '◇');
      html += '<span class="mirror-node' + lit + '">' + mark + '</span>';
    }
    html += '</div>';
    container.innerHTML = html;
  }

  function refresh() {
    const box = document.getElementById('progress');
    if (box) renderIndicator(box);
  }

  document.addEventListener('DOMContentLoaded', function () {
    ensure();
    const box = document.getElementById('progress');
    if (box) renderIndicator(box);
  });

  return { ensure, getProgress, setProgress, getChapter, setChapter, getId, renderIndicator, refresh, getSolvedSet };
})();
