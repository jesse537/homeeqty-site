/* Equity Check: home value minus mortgage balance, computed in the browser.
   Nothing is stored, logged or sent. No cookies, no storage, no network calls. */
(function () {
  var calc = document.getElementById('calc');
  if (!calc) return;
  var homeInput = document.getElementById('home-value');
  var owedInput = document.getElementById('mortgage-balance');
  var homeError = document.getElementById('home-value-error');
  var owedError = document.getElementById('mortgage-balance-error');
  var result = document.getElementById('calc-result');
  var answer = document.getElementById('calc-answer');
  var LIMIT = 100000000;

  function parse(raw) {
    var cleaned = String(raw).replace(/[$,\s]/g, '');
    if (cleaned === '') return { empty: true };
    if (!/^\d+(\.\d+)?$/.test(cleaned)) return { invalid: true };
    return { value: Number(cleaned) };
  }

  function check(parsed, isHome) {
    if (parsed.empty) {
      return isHome ? 'Please enter your estimated home value.'
                    : 'Please enter your mortgage balance, or 0 if your home is paid off.';
    }
    if (parsed.invalid) return 'Please enter a dollar amount using numbers only.';
    if (isHome && parsed.value <= 0) return 'Home value must be more than $0.';
    if (parsed.value >= LIMIT) return 'Please enter an amount under $100,000,000.';
    return '';
  }

  function show(input, box, message) {
    box.textContent = message;
    if (message) { input.setAttribute('aria-invalid', 'true'); }
    else { input.removeAttribute('aria-invalid'); }
  }

  document.getElementById('calc-run').addEventListener('click', function () {
    var home = parse(homeInput.value);
    var owed = parse(owedInput.value);
    var homeMsg = check(home, true);
    var owedMsg = check(owed, false);
    show(homeInput, homeError, homeMsg);
    show(owedInput, owedError, owedMsg);
    if (homeMsg || owedMsg) { result.hidden = true; return; }
    var equity = Math.round(home.value - owed.value);
    if (equity >= 0) {
      answer.textContent = 'Your estimated home equity is $' + equity.toLocaleString('en-US') + '.';
    } else {
      answer.textContent = 'Your mortgage balance is higher than your estimated home value, so your estimated equity is below zero.';
    }
    result.hidden = false;
  });

  document.getElementById('calc-reset').addEventListener('click', function () {
    homeInput.value = '';
    owedInput.value = '';
    show(homeInput, homeError, '');
    show(owedInput, owedError, '');
    answer.textContent = '';
    result.hidden = true;
    homeInput.focus();
  });

  var printButton = document.getElementById('print-checklist');
  if (printButton) printButton.addEventListener('click', function () { window.print(); });
})();
