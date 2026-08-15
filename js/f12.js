/* ===== 源代码彩蛋：按 F12 / Ctrl+Shift+I 触发惩罚页 ===== */
(function () {
  function goPunish() {
    const segs = location.pathname.split('/').filter(Boolean);
    const up = '../'.repeat(Math.max(0, segs.length - 1));
    location.href = up + 'punishment.html';
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i'))) {
      e.preventDefault();
      goPunish();
    }
  });
})();
