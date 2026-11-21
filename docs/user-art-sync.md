# User art publication

Approved art is stored in Redis under `ugc:v1:approved`. Gallery and settings request `GET /api/user-art`; public reads never contact GitHub. The old `/data/approved.json` URL is rewritten to this API for existing clients.

## Configuration and rollout

1. Keep the existing `KV_REDIS_URL` in Vercel.
2. Generate a long random secret and add it as `UGC_SYNC_SECRET` to the Vercel production environment and as a repository Actions secret with the same name in `pixreveal-ugc`. Do not use a VITE-prefixed environment variable.
3. Deploy PixReveal with the new API before running the updated UGC workflow.
4. Optionally set the UGC repository variable `PIXREVEAL_UGC_SYNC_URL` to the deployment's sync URL. The default is `https://www.pixreveal.com/api/user-art`.
5. Manually run **Cleanup ugc/pending** in the UGC repository once to publish the initial snapshot. Before this first sync, reads return HTTP 503 rather than fetching GitHub or pretending the gallery is empty.
6. Check the workflow's returned drawing count and open the gallery. Public CDN responses may take up to roughly two minutes to update (60 seconds shared cache plus 60 seconds stale-while-revalidate).

## Publication

The existing UGC workflow aggregates the approved files, commits the resulting collection in the UGC repository, then calls `POST /api/user-art` with the bearer secret and `{ "revision": "<40-character commit SHA>" }`. The sync endpoint fetches approved.json from that exact commit, validates the complete collection, and performs a single Redis SET without expiry. No commits or deployments are triggered in the PixReveal repository by publication.

The sync step is in the aggregation workflow itself: commits made with GITHUB_TOKEN and the existing [skip ci] message cannot be relied on to trigger another publication workflow. Concurrency serializes aggregation and publication, and checkout uses the current main branch to avoid publishing an outdated event checkout. The existing daily schedule and manual dispatch also allow retries if a webhook request fails.

Names, categories, palette indices, and 16x16 pixel matrices are checked before writing. The old Superheroes category is mapped to Movies & TV. An upstream/network/validation failure leaves the previous Redis snapshot intact. Redis persistence/backups remain the responsibility of the configured Redis service; losing the key requires another sync.

## Game settings

The shared settings panel offers Original only / Include user art. Enabling art waits for the collection and reports failures. Singleplayer and multiplayer host entry points wait before preparing rounds. Survival uses the same opt-in collection. Prepared rounds are independent of subsequent snapshot updates. Daily challenges retain their existing curated built-in collection.

## Local verification

Run `npm test` and `npm run build`. Use `vercel dev` with the required environment variables to run API handlers locally; plain Vite serves the frontend only. Tests use mocked Redis and upstream HTTP and never modify production data.
