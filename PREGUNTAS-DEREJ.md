# Pregúntale a Dérej

Entry: Biblioteca, Pozo and public study screens. Direct route: `?puerta=preguntas`.

The browser calls the same-origin Node function `/api/preguntas`. It retrieves passages from the current curated sources using lexical search with weighted titles and document frequency, then requests a JSON synthesis through Vercel AI Gateway. This is retrieval over a bounded collection, not an independently trained model or general web search. Returned source IDs must belong to the recovered passages; unknown IDs are discarded. An answer without a valid source is replaced with a no-evidence response. Factual accuracy still requires editorial review.

Run `node scripts/build-derej-knowledge.cjs` whenever a curated source changes. The committed `api/_lib/knowledge.json` is the deployed snapshot. It indexes the active Camino JSON, the 150 Psalm entries and guides, body atlas and timing limits, meditation, self-esteem, Voices, genealogical studies, Names and Tree. It does not index private journals, metrics or unpublished files. Body correspondences and practices remain editorial/spiritual, not medical recommendations.

## Runtime

- Vercel OIDC (`VERCEL_OIDC_TOKEN`) is preferred; `AI_GATEWAY_API_KEY` is an optional alternative. Neither is sent to the browser.
- The model defaults to `openai/gpt-6-luna`, verified against the live Gateway model list on 2026-10-30. `AI_GATEWAY_MODEL` can override it.
- `DEREJ_AI_ENABLED=0` disables generation while retaining the UI. Credentials, Gateway access, verification and credits must work before claiming the assistant is active. Do not buy credits or change billing automatically.
- Requests are bounded to 1,200 question characters, six recent messages, five passages, 1,100 output tokens and a 25-second provider timeout. Burst protection is five requests per minute per hashed network address **per warm instance**; it is not a durable global quota or guaranteed spend cap. Configure a project-level Gateway budget and distributed edge rate limits before broad promotion. No hard monetary budget is claimed by this implementation.
- Non-success provider responses fail closed with a clear unavailable message. No generated answer is replaced by a simulated AI conversation.

## Privacy

Explicit consent precedes each session's first submission. Question and recent messages are sent to the AI service along with public recovered passages. The application uses only tab memory for the conversation, does not write questions to localStorage/sessionStorage, and does not send them to analytics or log them in its handler. Hosting and Gateway/provider logs follow their own policies. The UI states this limitation. Clearing the conversation clears tab memory only. Source navigation reuses the existing router so it does not reload the music player.

## Checks

`node tests/preguntas-api.test.cjs`

`NODE_PATH=<jsdom-install>/node_modules node tests/preguntas-ui.test.cjs`

Also run the existing library catalog checks. Verify at least one live question after deployment; local mocked tests do not prove Gateway activation.
