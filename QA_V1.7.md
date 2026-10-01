# DÉREJ v1.7 · QA técnico

## Validaciones estáticas
- PASS · `app.js` sintácticamente válido.
- PASS · JSON raíz y `content/*.json` parsean.
- PASS · IDs HTML únicos.
- PASS · todas las rutas `data-route` tienen una pantalla destino.
- PASS · ruta `#guia` presente.
- PASS · `welcomeDialog`, `helpBtn` y onboarding v1.7 presentes.
- PASS · los tres apartados HTML están incluidos en el Master.
- PASS · Service Worker `derej-master-v1.7-20260930-01`.
- PASS · shortcut PWA “Cómo usar Dérej”.
- PASS · títulos semanales normalizados.
- PASS · no hay `service_role` en configuración pública.

## Limitación de QA local
El entorno de navegador automatizado bloquea navegación a localhost/file por política administrativa, por lo que la prueba visual final debe hacerse en el iPhone real después del despliegue. Las validaciones estructurales y de sintaxis sí se completaron.
