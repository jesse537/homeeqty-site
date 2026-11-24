// Mail pages: run the simple equity estimate in the browser (nothing is saved or sent).
// The apply link's Sub Ids (mail channel, qr or typed, page) are set by /site.js
// from the page's data-channel.
(function(){
  var value = document.getElementById('home-value');
  var owed = document.getElementById('owed');
  var out = document.getElementById('calc-result');
  var detail = document.getElementById('calc-detail');
  var room = document.getElementById('calc-room');
  if (!value || !owed || !out) return;

  function num(el){
    var n = parseFloat(String(el.value).replace(/[^0-9.]/g, ''));
    return isNaN(n) ? null : n;
  }
  function money(n){
    return '$' + (Math.round(n / 1000) * 1000).toLocaleString('en-US');
  }
  function show(el, text){
    if (!el) return;
    if (text) { el.textContent = text; el.hidden = false; } else { el.hidden = true; }
  }
  function update(){
    var v = num(value), o = num(owed);
    if (v === null || v <= 0) { out.textContent = 'Your estimated equity will show here.'; show(detail); show(room); return; }
    if (o === null) o = 0;
    var eq = v - o;
    if (eq <= 0) {
      out.textContent = 'You may have little equity right now.';
      show(detail, 'By these numbers you owe about as much as the home could sell for.');
      show(room);
      return;
    }
    var pct = Math.round((eq / v) * 100);
    out.textContent = 'About ' + money(eq) + ' in equity';
    show(detail, 'That is about ' + pct + '% of your home’s value.');
    if (!room) return;
    var avail = v * 0.8 - o;
    if (avail > 0) {
      show(room, 'Many lenders keep all loans on a home at or below about 80% of its value. At 80%, about ' + money(avail) + ' of your equity could be available to borrow. Each lender sets its own limit.');
    } else {
      show(room, 'Many lenders keep all loans on a home at or below about 80% of its value, so by these numbers there may be little room to borrow right now.');
    }
  }
  value.addEventListener('input', update);
  owed.addEventListener('input', update);
})();

// "Not ready yet?" email form (Netlify Forms). Only the email address is sent.
(function(){
  var form = document.getElementById('later-form');
  if (!form) return;
  var btn = form.querySelector('button');
  var status = form.querySelector('.form-status');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var body = new URLSearchParams(new FormData(form)).toString();
    btn.disabled = true;
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
      .then(function(r){
        if (!r.ok) throw new Error('bad');
        status.textContent = 'Thanks. We will email you the checklist.';
        status.hidden = false; form.reset();
      })
      .catch(function(){
        btn.disabled = false;
        status.textContent = 'Something went wrong. You can read the checklist now with the link below.';
        status.hidden = false;
      });
  });
})();
