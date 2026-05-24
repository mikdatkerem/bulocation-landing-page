# Bulocation Website

Bulocation website is the Vite + React + TypeScript project for the public landing page and the admin panel.

The admin panel manages organizations, sites, buildings, floors, published maps, cameras, users, and publish flows. It is also the operational UI that prepares the data consumed by mobile and mapsite.

## Runtime Model

- API source of truth: `bulocation_api`
- Local API target: `http://localhost:5011`
- Website/admin local port: `5173`
- Mapsite local port: `3000`
- Production website domain: `https://bulocation.com`
- Production API domain: `https://api.bulocation.com`

Admin API calls should normally stay same-origin through `/admin-api`. Map assets should normally stay same-origin through `/admin-map-assets`. This lets the local proxy add `x-app-secret` server-side and avoids exposing the admin secret in browser code.

## Environment

Create `.env.local` from `.env.example`:

```env
VITE_ADMIN_API_TARGET=http://localhost:5011
VITE_ADMIN_API_BASE_URL=/admin-api
VITE_ADMIN_MAP_ASSET_BASE_URL=/admin-map-assets
VITE_MAPSITE_BASE_URL=https://bulocation.com
ADMIN_APP_SECRET=
```

Notes:

- `VITE_ADMIN_API_TARGET` is used by the Vite dev proxy and the production local proxy server.
- `ADMIN_APP_SECRET` is intentionally not prefixed with `VITE_`; it must stay server-side.
- Do not put `ADMIN_APP_SECRET` into client-exposed variables.

## Development

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Open:

```text
http://localhost:5173
```

Vite dev mode uses the proxy in `vite.config.ts`, so `/admin-api`, `/admin-map-assets`, and `/storage/maps` can reach the backend with `x-app-secret` attached by the dev server.

## Production-Like Local Run

For the current Cloudflare Tunnel setup, use the custom production server:

```bash
npm run build
npm run serve:prod
```

`npm run serve:prod` serves `dist/` and proxies `/admin-api`, `/admin-map-assets`, and `/storage/maps` to the API. This is the safer command for admin usage behind Cloudflare because it keeps API calls same-origin and preserves the server-side app secret behavior.

`npm run preview:prod` only starts Vite's static preview server after a build. It is useful for quick UI smoke checks, but it should not be the default admin production path when proxy/app-secret behavior is required.

## Cloudflare Route Expectation

Keep route order specific-to-general:

```text
api.bulocation.com *      -> http://localhost:5011
bulocation.com /map*      -> http://localhost:3000
bulocation.com /admin-api* -> http://localhost:5173
bulocation.com *          -> http://localhost:5173
```

If `/map*` or API-like paths fall through to the website catch-all, users can see blank screens or failed admin requests.

## Quality Checks

Run before committing meaningful changes:

```bash
npm run build
npm run lint
```
