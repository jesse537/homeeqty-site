// Print button for the readiness checklist
(function(){
  var b = document.getElementById('print-checklist');
  if(b){ b.addEventListener('click', function(){ window.print(); }); }
})();
