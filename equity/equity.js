// Equity Check: home value minus mortgage balance, computed only in the browser.
// Nothing is stored, logged or sent. No cookies, no storage, no network calls.
(function(){
  var form   = document.getElementById('equity-form');
  var hv     = document.getElementById('home-value');
  var mb     = document.getElementById('mortgage-balance');
  var hvErr  = document.getElementById('home-value-error');
  var mbErr  = document.getElementById('mortgage-balance-error');
  var result = document.getElementById('equity-result');
  var amount = document.getElementById('equity-amount');
  var reset  = document.getElementById('equity-reset');
  if(!form) return;

  var MAX = 100000000;
  var fmt = new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', maximumFractionDigits:0 });

  // Returns a number, or a string error code.
  function parse(raw){
    var s = String(raw || '').replace(/[$,\s]/g, '');
    if(s === '') return 'empty';
    if(!/^\d+(\.\d{1,2})?$/.test(s)) return 'nan';
    var n = Number(s);
    if(n >= MAX) return 'big';
    return n;
  }

  function setError(input, el, msg){
    el.textContent = msg || '';
    if(msg){ input.setAttribute('aria-invalid', 'true'); }
    else { input.removeAttribute('aria-invalid'); }
  }

  var MSG = {
    nan: 'Please enter a dollar amount using numbers only.',
    big: 'Please enter an amount under $100,000,000.'
  };

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var v = parse(hv.value), b = parse(mb.value), first = null;

    if(v === 'empty'){ setError(hv, hvErr, 'Please enter your estimated home value.'); first = hv; }
    else if(typeof v === 'string'){ setError(hv, hvErr, MSG[v]); first = hv; }
    else if(v <= 0){ setError(hv, hvErr, 'Home value must be more than $0.'); first = hv; }
    else { setError(hv, hvErr, ''); }

    if(b === 'empty'){ setError(mb, mbErr, 'Please enter your mortgage balance, or 0 if your home is paid off.'); first = first || mb; }
    else if(typeof b === 'string'){ setError(mb, mbErr, MSG[b]); first = first || mb; }
    else { setError(mb, mbErr, ''); }

    if(first){ result.hidden = true; first.focus(); return; }

    var equity = Math.round(v - b);
    if(equity >= 0){
      amount.textContent = 'Your estimated home equity is ' + fmt.format(equity) + '.';
    } else {
      amount.textContent = 'Your mortgage balance is higher than your estimated home value by ' +
        fmt.format(Math.abs(equity)) + ', so your estimated equity is below zero.';
    }
    result.hidden = false;
  });

  reset.addEventListener('click', function(){
    form.reset();
    setError(hv, hvErr, ''); setError(mb, mbErr, '');
    amount.textContent = '';
    result.hidden = true;
    hv.focus();
  });
})();
