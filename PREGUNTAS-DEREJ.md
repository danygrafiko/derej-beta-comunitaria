# Pregúntale a Dérej

Entry: Biblioteca, Pozo and public study screens. Direct route: `?puerta=preguntas`.

The browser calls the same-origin Node function `/api/preguntas`. It retrieves passages from the current curated sources using lexical search with weighted titles and document frequency, then requests a JSON synthesis through Vercel AI Gateway. This is retrieval over a bounded collection, not an independently trained model or general web search. Returned source IDs must belong to the recovered passages; unknown IDs are discarded. An answer without a valid source is replaced with a no-evidence response. Factual accuracy still requires editorial review.

Run `node scripts/build-derej-knowledge.cjs` whenever a curated source changes. The committed `api/_lib/knowledge.json` is the deployed snapshot. It indexes the active Camino JSON, the 150 Psalm entries and guides, body atlas and timing limits, meditation, self-esteem, Voices, genealogical studies, Names and Tree. It does not index private journals, metrics or unpublished files. Body correspondences and practices remain editorial/spiritual, not medical recommendations.

## Runtime

- Vercel OIDC (`VERCEL_OIDC_TOKEN`) is preferred; `AI_GATEWAY_API_KEY` is an optional alternative. Neither is sent to the browser.
- The model defaults to `openai/gpt-6-luna`, verified against the live Gateway model list on 2026-10-30. `AI_GATEWAY_MODEL` can override it.
- Generation is disabled by default. Set `DEREJ_AI_ENABLED=1` only after Gateway account verification, project spend controls and credits are confirmed; `0` disables it while retaining the UI. The UI explicitly displays pending activation and disables submission while inactive. Do not buy credits or change billing automatically.
- Requests are bounded to 1,200 question characters, six recent messages, five passages, 1,100 output tokens and a 25-second provider timeout. Burst protection is five requests per minute per hashed network address **per warm instance**; it is not a durable global quota or guaranteed spend cap. Configure a project-level Gateway budget and distributed edge rate limits before broad promotion. No hard monetary budget is claimed by this implementation.
- Non-success provider responses fail closed with a clear unavailable message. No generated answer is replaced by a simulated AI conversation.

## Privacy

Explicit consent precedes each session's first submission. Question and recent messages are sent to the AI service along with public recovered passages. The application uses only tab memory for the conversation, does not write questions to localStorage/sessionStorage, and does not send them to analytics or log them in its handler. Hosting and Gateway/provider logs follow their own policies. The UI states this limitation. Clearing the conversation clears tab memory only. Source navigation reuses the existing router so it does not reload the music player.

## Checks

`node tests/preguntas-api.test.cjs`

`NODE_PATH=<jsdom-install>/node_modules node tests/preguntas-ui.test.cjs`

Also run the existing library catalog checks. Verify at least one live question after deployment; local mocked tests do not prove Gateway activation.

Deployment verification on 2026-10-30: the preview API received platform OIDC, but the real generation request returned HTTP 403 `customer_verification_required`. Vercel requires the account's Gateway customer/payment-method verification. The deployed assistant is therefore deliberately left inactive. The owner must complete verification and choose a project budget; then set `DEREJ_AI_ENABLED=1`, redeploy and run one real question before announcing activation. No billing settings or credits were changed.
