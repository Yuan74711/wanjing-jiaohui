/* ===== 镜面谜题系统：填入谜底、记录已解节点、集齐才解锁后续 =====
 * 依赖：progress.js（Progress.setProgress / Progress.refresh）
 * 用法：在 post_mirror_XX.html 引入本文件，正文放 <div id="puzzleBox"></div>
 *       本脚本自动按文件名识别第几面镜子并渲染输入框。
 */
(function () {
  // 每面镜子的可接受答案（支持多个别名；比较时去空格/标点/大小写）
  var ANSWERS = {
    1:  ['乾', '西北', '乾位', 'qian'],
    2:  ['你已被登记'],
    3:  ['30', '三十', 'post_mirror_30', 'post_mirror_30.html'],
    4:  ['node', '节点'],
    5:  ['镜', '镜子', '你', 'mirror'],
    6:  ['你看见的每一面镜子，都是门', '你看见的每一面镜子都是门'],
    7:  ['十三', '13'],
    8:  ['你看见的每一面镜子，都是门', '你看见的每一面镜子都是门'],
    9:  ['镜', 'mirror'],
    10: ['1999', '一九九九'],
    11: ['电视塔', '塔', '东方明珠', '明珠塔'],
    12: ['13', '十三'],
    13: ['镜主', '万镜教会', 'mirror']
  };

  function norm(s) {
    return (s || '').trim().toLowerCase()
      .replace(/[\s，。、,.\!！?？;；:：'’"“”()（）\-_]/g, '');
  }

  // 站点根目录（兼容 GitHub Pages 子路径部署）
  function siteRoot() {
    var s = (document.currentScript && document.currentScript.src) || '';
    var m = s.match(/^(.*?)\/(?:js|css)\//);
    if (m) return m[1] + '/';
    var segs = location.pathname.split('/').filter(Boolean);
    return '../'.repeat(Math.max(0, segs.length - 1));
  }

  function getSolved() {
    try { return JSON.parse(localStorage.getItem('solvedMirrors') || '{}'); }
    catch (e) { return {}; }
  }
  function setSolved(n) {
    var s = getSolved();
    s[n] = true;
    localStorage.setItem('solvedMirrors', JSON.stringify(s));
    if (window.Progress) {
      Progress.setProgress(n);   // 点亮第 n 面镜子
      Progress.refresh();
    }
  }
  function isSolved(n) { return !!getSolved()[n]; }
  function countSolved() {
    var s = getSolved(), c = 0;
    for (var i = 1; i <= 13; i++) if (s[i]) c++;
    return c;
  }
  function allSolved() {
    var s = getSolved();
    for (var i = 1; i <= 13; i++) if (!s[i]) return false;
    return true;
  }

  // 未集齐则跳回论坛；用于门控现实章/后台
  function redirectIfLocked() {
    if (!allSolved()) location.href = siteRoot() + 'forum/index.html';
  }

  function mount() {
    if (window.__mirrorPuzzleMounted) return;
    window.__mirrorPuzzleMounted = true;

    var box = document.getElementById('puzzleBox');
    var gate = document.getElementById('nextGate');

    // 第 13 面镜子专属：集齐后才显示通往后台的入口
    if (gate) {
      if (allSolved()) {
        gate.innerHTML = '<a class="link" href="../backend/auditor.html">内容管理后台 ▸</a>';
      } else {
        gate.innerHTML = '<p class="whisper">镜子还没照齐。第十三面镜子的门，还关着。</p>';
      }
    }

    if (!box) return;
    var m = location.pathname.match(/post_mirror_(\d+)/);
    var n = m ? parseInt(m[1], 10) : null;
    if (!n || !ANSWERS[n]) return;

    if (isSolved(n)) {
      box.innerHTML = '<div class="puzzle-done">◈ 第 ' + n + ' 面镜子已经照见你了。</div>';
      return;
    }

    box.innerHTML =
      '<div class="puzzle">' +
      '<label>把谜底交还给镜子：</label>' +
      '<div class="puzzle-row">' +
      '<input id="pzInput" type="text" autocomplete="off" placeholder="你解开的那个字 / 词 / 数字">' +
      '<button id="pzBtn" type="button">照镜子</button>' +
      '</div>' +
      '<div id="pzMsg" class="pz-msg"></div>' +
      '</div>';

    var input = document.getElementById('pzInput');
    var btn = document.getElementById('pzBtn');
    var msg = document.getElementById('pzMsg');

    function check() {
      var v = norm(input.value);
      if (!v) { msg.textContent = '镜子在等一个答案。'; return; }
      var ok = ANSWERS[n].some(function (a) { return norm(a) === v; });
      if (ok) {
        setSolved(n);
        box.innerHTML = '<div class="puzzle-done">◈ 第 ' + n + ' 面镜子亮了。镜子记得你了。</div>';
        // 若本页含通往后台的闸门，刷新它
        if (gate) mount();
        if (window.Progress) Progress.refresh();
      } else {
        msg.textContent = '镜子没有回应。你确定这是答案吗？';
        input.value = '';
        input.focus();
      }
    }
    btn.addEventListener('click', check);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
  }

  window.MirrorPuzzle = {
    mount: mount,
    allSolved: allSolved,
    countSolved: countSolved,
    isSolved: isSolved,
    redirectIfLocked: redirectIfLocked,
    siteRoot: siteRoot
  };

  document.addEventListener('DOMContentLoaded', mount);
})();
