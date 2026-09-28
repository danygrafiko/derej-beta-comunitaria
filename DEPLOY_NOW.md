# DÉREJ v1.4 — Deploy checklist

Target: `danygrafiko/derej-beta-comunitaria` → `main` → GitHub Pages.

## Required deploy files
Upload/replace the complete contents of this folder, preserving `content/`. Existing historical `beta-*.html` files may remain in the repository.

## Post-deploy checks
1. Open the GitHub Pages URL.
2. Confirm the header/badge shows v1.4.
3. Open Comunidad and start an action requiring an anonymous identity.
4. Turnstile must render before the first anonymous session is created.
5. Complete the challenge, register the mission, submit one testimony, then moderate it with the permanent admin account.
6. Confirm published testimony is visible publicly and pending/hidden testimony is not.
7. Confirm Radio and Camino still work.

## Security invariants
- `communityCaptchaEnabled` must be `true`.
- Site Key is public and may exist in `config.js`.
- No Cloudflare Secret Key may exist in this package.
- No Supabase service-role/secret key may exist in browser files.
- The first-admin bootstrap page is intentionally absent.
