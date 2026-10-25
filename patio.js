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
  var bird = '<svg viewBox="0 0 80 40" aria-hidden="true"><path class="birdBody" d="M35 23 Q39 17 44 21 L49 22 L44 24 L41 28 L32 31 L35 26 L30 24Z"/><path class="birdWing birdWingFar" d="M40 23 Q48 12 68 7 L76 7 L66 13 L59 14 L62 15 L52 19 L45 25Z"/><path class="birdWing birdWingNear" d="M40 23 Q28 10 9 7 L2 8 L13 12 L20 13 L17 15 L28 19 L36 26Z"/></svg>';
  atmosphere.innerHTML = '<span class="patioGlow patioGlowLeft"></span><span class="patioGlow patioGlowRight"></span><span class="patioGlow patioDawn"></span><span class="patioWater"><i></i><i></i><b></b><b></b></span><span class="patioHaze"></span>' + [0, 1, 2].map(function(index) { return '<span class="patioBirdFlight patioBirdFlight' + index + '">' + bird + '</span>'; }).join('');
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
