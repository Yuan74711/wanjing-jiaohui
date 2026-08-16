/* ===== 箱庭式线索回灌：休眠门 + 跨页旗标 =====
 * 设计意图：某些页面"早就被玩家看过"，但当时解不开；
 *          直到玩家在别处拿到线索（写入 localStorage 旗标），回来输入才"豁然开朗"。
 * 用法：页面引入本文件后，在正文放 <div id="doorBox"></div>，
 *       再调用 Loops.mountDoor({...})。
 */
(function () {
  var KEY = 'wjLoops';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; }
  }
  function write(o) {
    try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {}
  }
  function set(name, val) {
    var o = read(); o[name] = (val === undefined ? '1' : val); write(o);
  }
  function has(name) { return !!read()[name]; }
  function get(name) { return read()[name]; }

  function norm(s) {
    return (s || '').trim().toLowerCase()
      .replace(/[\s，。、,.\!！?？;；:：'’"“”()（）\-_]/g, '');
  }

  /* 休眠门
   * opts: { box, inputId, btnId, msgId, required(), dormant, prompt,
   *         placeholder, accept:[], fail, reveal, setFlag }
   * - required() 返回 false 时只显示 dormant 提示（门没到开的时候）
   * - 返回 true 时显示输入框；答案命中 accept 则渲染 reveal 并置 setFlag
   */
  function mountDoor(opts) {
    var box = document.getElementById(opts.box);
    if (!box) return;

    function active() {
      try { return opts.required ? !!opts.required() : true; }
      catch (e) { return false; }
    }

    function render() {
      if (!active()) {
        box.innerHTML = '<p class="whisper">' + (opts.dormant ||
          '这扇门现在只是门。有些词，得等你准备好了才说得动它。') + '</p>';
        return;
      }
      var html =
        '<p class="hint">' + (opts.prompt || '对着它，说一个词：') + '</p>' +
        '<div class="puzzle-row">' +
          '<input id="' + opts.inputId + '" type="text" autocomplete="off" placeholder="' + (opts.placeholder || '…') + '">' +
          '<button id="' + opts.btnId + '" type="button">说</button>' +
        '</div>' +
        '<div id="' + opts.msgId + '" class="pz-msg"></div>';
      box.innerHTML = html;

      var input = document.getElementById(opts.inputId);
      var btn = document.getElementById(opts.btnId);
      var msg = document.getElementById(opts.msgId);

      function check() {
        var v = norm(input.value);
        if (!v) { msg.textContent = '门在等一个词。'; return; }
        var ok = (opts.accept || []).some(function (a) { return norm(a) === v; });
        if (ok) {
          if (opts.setFlag) set(opts.setFlag, '1');
          box.innerHTML = opts.reveal || '<p class="creed">门，开了。</p>';
        } else {
          msg.textContent = opts.fail || '门没有回应。你确定是说对了词吗？';
          input.value = '';
          try { input.focus(); } catch (e) {}
        }
      }
      if (btn) btn.addEventListener('click', check);
      if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
    }

    render();
    // 同页若后续脚本会置旗标，可手动 Loops.refresh() 重渲染
    window.Loops = window.Loops || {};
    window.Loops._renderers = window.Loops._renderers || [];
    window.Loops._renderers.push(render);
  }

  function refresh() {
    if (window.Loops && window.Loops._renderers) {
      window.Loops._renderers.forEach(function (fn) { try { fn(); } catch (e) {} });
    }
  }

  window.Loops = { set: set, has: has, get: get, read: read, mountDoor: mountDoor, refresh: refresh };
})();
