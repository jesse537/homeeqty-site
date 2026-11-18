// Mail test pages: tag the apply link when the visit came from a card's QR code,
// and run the simple equity estimate in the browser (nothing is saved or sent).
(function(){
  var link = document.getElementById('apply-link');
  if (link && /(^|[?&])src=qr(&|$)/.test(window.location.search)) {
    link.href = link.href + '&subId2=qr';
  }

  var value = document.getElementById('home-value');
  var owed = document.getElementById('owed');
  var out = document.getElementById('calc-result');
  if (!value || !owed || !out) return;

  function num(el){
    var n = parseFloat(String(el.value).replace(/[^0-9.]/g, ''));
    return isNaN(n) ? null : n;
  }
  function money(n){
    return '$' + Math.round(n).toLocaleString('en-US');
  }
  function update(){
    var v = num(value), o = num(owed);
    if (v === null || v <= 0) { out.textContent = 'Your estimated equity will show here.'; return; }
    if (o === null) o = 0;
    var eq = v - o;
    if (eq <= 0) {
      out.textContent = 'By these numbers you owe about as much as the home could sell for, so there may be little equity to use right now.';
      return;
    }
    var pct = Math.round((eq / v) * 100);
    out.textContent = 'Estimated equity: ' + money(eq) + ', about ' + pct + '% of your home’s value.';
  }
  value.addEventListener('input', update);
  owed.addEventListener('input', update);
})();
