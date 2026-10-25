/* Entrada contemplativa. La elección se guarda sólo en este navegador. */
(function () {
  'use strict';
  var patio = document.querySelector('.courtyard');
  if (!patio) return;
  var toggle = patio.querySelector('.patioExplore');
  var portals = Array.from(patio.querySelectorAll('.portal, .pozoLearn'));
  if (!toggle || !portals.length) return;
  var screen = patio.closest('[data-screen]');
  var inViewport = true;
  var atmosphere = document.createElement('div');
  atmosphere.className = 'patioAtmosphere';
  atmosphere.setAttribute('aria-hidden', 'true');
  atmosphere.innerHTML = '<span class="patioGlow patioGlowLeft"></span><span class="patioGlow patioGlowRight"></span><span class="patioGlow patioDawn"></span><span class="patioWater"><i></i><i></i><b></b><b></b></span><span class="patioHaze"></span>';
  patio.appendChild(atmosphere);
  function updateAtmosphere() {
    patio.classList.toggle('isContemplating', !exploring && !document.hidden && (!screen || !screen.hidden) && inViewport);
  }
  document.addEventListener('visibilitychange', updateAtmosphere);
  if (screen) new MutationObserver(updateAtmosphere).observe(screen, {attributes:true, attributeFilter:['hidden', 'class']});
  if (typeof IntersectionObserver === 'function') new IntersectionObserver(function(entries) {
    inViewport = entries[0].isIntersecting;
    updateAtmosphere();
  }).observe(patio);
  var key = 'derej.patio.exploring.v1';
  var exploring = false;
  try { exploring = localStorage.getItem(key) === 'true'; } catch (_) {}
  function render() {
    portals.forEach(function (portal) { portal.hidden = !exploring; });
    patio.classList.toggle('isExploring', exploring);
    updateAtmosphere();
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
