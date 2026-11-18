// Figure link tags, shared by every page.
// subId1 = channel (site, email, social, mail_a ...), subId2 = exact source,
// subId3 = the page the click came from. A visit's channel and source are kept
// in sessionStorage for that tab only, so a visitor who arrives from a mailer
// or an email still counts as that channel on every later page. No personal
// information is read or stored.
(function(){
  var KEY = 'hel_tag';
  var HOST = 'figure-home-equity.pxf.io';

  function clean(v){
    return String(v || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60);
  }
  function rawParam(name){
    var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.search);
    if(!m) return '';
    try { return decodeURIComponent(m[1].replace(/\+/g, ' ')); } catch(e){ return m[1]; }
  }
  function param(name){ return clean(rawParam(name)); }
  function read(){
    try { var t = JSON.parse(window.sessionStorage.getItem(KEY) || 'null'); return (t && t.c) ? t : null; } catch(e){ return null; }
  }
  function save(t){
    try { window.sessionStorage.setItem(KEY, JSON.stringify(t)); } catch(e){}
  }
  // Name the site that sent the visitor, by host only (never the full address).
  function sourceName(host){
    host = String(host || '').toLowerCase().replace(/^www\./, '');
    if(!host) return 'direct';
    var known = [
      [/(^|\.)gemini\.google\.com$/, 'gemini'], [/(^|\.)google\./, 'google'], [/(^|\.)bing\.com$/, 'bing'],
      [/(^|\.)(chatgpt\.com|openai\.com)$/, 'chatgpt'], [/(^|\.)perplexity\.ai$/, 'perplexity'],
      [/(^|\.)duckduckgo\.com$/, 'duckduckgo'], [/(^|\.)yahoo\./, 'yahoo'],
      [/(^|\.)(claude\.ai|anthropic\.com)$/, 'claude'],
      [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, 'facebook'], [/(^|\.)instagram\.com$/, 'instagram'],
      [/(^|\.)(linkedin\.com|lnkd\.in)$/, 'linkedin'], [/(^|\.)(x\.com|twitter\.com|t\.co)$/, 'x'],
      [/(^|\.)(nextdoor\.com)$/, 'nextdoor'], [/(^|\.)reddit\.com$/, 'reddit'], [/(^|\.)youtube\.com$/, 'youtube']
    ];
    for(var i = 0; i < known.length; i++){ if(known[i][0].test(host)) return known[i][1]; }
    return clean(host);
  }
  function pageName(){
    var p = clean(window.location.pathname);
    return p || 'home';
  }

  var src = param('src'), sd = param('sd');
  var pageChannel = clean(document.body && document.body.getAttribute('data-channel'));
  var tag = null;

  if(pageChannel){
    // Mailer landing page: the page itself sets the channel. The card's QR code
    // adds ?src=qr; anyone who typed the address gets "typed".
    tag = { c: pageChannel, s: src === 'qr' ? (sd ? 'qr_' + sd : 'qr') : (sd || 'typed') };
    save(tag);
  } else if(src){
    // Tagged link from an email, a social post, a go link and so on.
    tag = { c: src, s: sd || 'none' };
    save(tag);
  } else {
    tag = read();
    if(!tag){
      var utm = rawParam('utm_source').slice(0, 100);
      var refHost = '';
      try { refHost = document.referrer ? new URL(document.referrer).hostname : ''; } catch(e){}
      var own = refHost && refHost.toLowerCase() === window.location.hostname.toLowerCase();
      tag = { c: 'site', s: utm ? sourceName(utm) : (own ? 'internal' : sourceName(refHost)) };
      save(tag);
    }
  }

  var page = pageName();
  document.querySelectorAll('a[href*="' + HOST + '"]').forEach(function(a){
    try {
      var u = new URL(a.href);
      if(u.hostname !== HOST) return;
      u.searchParams.set('subId1', tag.c);
      u.searchParams.set('subId2', tag.s);
      u.searchParams.set('subId3', page);
      a.href = u.toString();
    } catch(e){}
  });
})();

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
