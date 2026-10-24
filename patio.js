/* Entrada contemplativa. La elección se guarda sólo en este navegador. */
(function () {
  'use strict';
  var patio = document.querySelector('.courtyard');
  if (!patio) return;
  var toggle = patio.querySelector('.patioExplore');
  var portals = Array.from(patio.querySelectorAll('.portal'));
  if (!toggle || !portals.length) return;
  var key = 'derej.patio.exploring.v1';
  var exploring = false;
  try { exploring = localStorage.getItem(key) === 'true'; } catch (_) {}
  function render() {
    portals.forEach(function (portal) { portal.hidden = !exploring; });
    patio.classList.toggle('isExploring', exploring);
    toggle.setAttribute('aria-expanded', String(exploring));
    toggle.replaceChildren(document.createTextNode(exploring ? 'Contemplar el patio ' : 'Explorar el patio '));
    var symbol = document.createElement('span');
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = exploring ? '−' : '+';
    toggle.appendChild(symbol);
  }
  toggle.addEventListener('click', function () {
    exploring = !exploring;
    render();
    try { localStorage.setItem(key, String(exploring)); } catch (_) {}
  });
  document.addEventListener('click', function (event) {
    if (!event.target.closest('[data-route="biblioteca"]')) return;
    requestAnimationFrame(function () {
      document.getElementById('bibliotecaTitle')?.focus({preventScroll:true});
    });
  });
  render();
  toggle.hidden = false;
})();
