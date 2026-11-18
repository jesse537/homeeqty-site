// Header scroll state and mobile menu, shared by every page
(function(){
  var header = document.getElementById('site-header');
  var toggle = document.getElementById('nav-toggle');
  var panel  = document.getElementById('nav-panel');
  if(!header || !toggle || !panel) return;

  function onScroll(){
    if(window.scrollY > 12){ header.classList.add('scrolled'); }
    else { header.classList.remove('scrolled'); }
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  function closePanel(){
    panel.classList.remove('open');
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label','Open menu');
  }

  toggle.addEventListener('click', function(){
    var open = panel.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  panel.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', closePanel);
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && panel.classList.contains('open')){
      closePanel();
      toggle.focus();
    }
  });
})();

// Sortable data tables: <table data-sortable>, one <button> per column heading.
// The total row stays on top; the page works the same without this script.
(function(){
  document.querySelectorAll('table[data-sortable]').forEach(function(table){
    var heads = table.querySelectorAll('thead th');
    var body = table.tBodies[0];
    heads.forEach(function(th, col){
      var btn = th.querySelector('button');
      if(!btn) return;
      btn.addEventListener('click', function(){
        var current = th.getAttribute('aria-sort');
        var isNum = th.getAttribute('data-type') === 'num';
        var isRank = /rank/i.test(btn.textContent);
        // first click: ranks and names ascending, values descending (largest first)
        var dir = current ? (current === 'ascending' ? 'descending' : 'ascending') : ((isRank || !isNum) ? 'ascending' : 'descending');
        heads.forEach(function(h){ h.removeAttribute('aria-sort'); });
        th.setAttribute('aria-sort', dir);
        var rows = Array.prototype.slice.call(body.rows);
        var pinned = rows.filter(function(r){ return r.classList.contains('total-row'); });
        var rest = rows.filter(function(r){ return !r.classList.contains('total-row'); });
        rest.sort(function(a, b){
          var x = a.cells[col].getAttribute('data-sort'), y = b.cells[col].getAttribute('data-sort');
          var c = isNum ? (parseFloat(x) - parseFloat(y)) : x.localeCompare(y);
          return dir === 'ascending' ? c : -c;
        });
        pinned.concat(rest).forEach(function(r){ body.appendChild(r); });
      });
    });
  });
})();
