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
