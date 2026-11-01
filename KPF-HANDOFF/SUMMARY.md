# DevThings → KPF Integration Summary

Source: `rickgomez223/DevThings` (Firebase-based web tools, public repo).
Target: `rickgomez223/KPF` (Supabase + owner's domain + Docker Desktop).

## Candidate modules

| Priority | Path in DevThings | What it is | Integration approach |
|---|---|---|---|
| P1 | `CDN/debugTools/` (`consoleLog/`, `inspectTool.js`, `toolbox.js`) | Draggable console-log overlay, element inspector, toolbox | Copy near-verbatim. No backend dependency. |
| P1 | `CDN/debugTools/firebaseDatabase.js` | Firebase DB viewer | Rewrite as Supabase table/Realtime viewer. |
| P1 | `CDN/firebase/dt-fbc.js` | Firebase wrapper (auth, DB, storage, analytics, firestore) | Re-implement same API surface on `@supabase/supabase-js`. |
| P2 | `customLogin/index.html` | Login page | Wire to Supabase Auth (email + OAuth). |
| P2 | `FWA/U2LA/` | Upload form + storage browser PWA | Point at Supabase Storage buckets. |
| P2 | `FWA/src/` | PWA shell (settings, storage manager, soundboard, video player, service worker) | Reuse as PWA template. |
| P2 | `firestore.rules`, `storage.rules`, `database.rules.json` | Security rules | Translate to Postgres RLS + storage policies. |
| P3 | `functions/index.js` | Cloud Functions | Port to Supabase Edge Functions if still needed. |
| P3 | `headers`, `FWA/headers.js` | Security headers | Reuse in reverse proxy on the domain. |

## Do NOT bring over
- `.firebaserc`, `firebase.json`, Firebase configs, `FWA/server.js` Replit bits, `.replit`, `replit.nix`.
- `deploy.sh` (runs `git add .` + auto push + deploy; unsafe).
- Hardcoded Firebase `apiKey`/IDs in `dt-fbc.js` and `CDN/firebase/firebaseConfig.js`. DevThings is **public**: treat as exposed; never copy into KPF. Use env vars.

## Docker Desktop angle (not present in DevThings)
- Local dev: `supabase start` (Supabase CLI uses Docker).
- Static tools served by a small nginx/Caddy container behind the domain.

## Open questions for owner
1. Which KPF surface gets the tools first (mobile build, a web admin, network dashboard)?
2. Is Firebase to be fully dropped, or kept alongside Supabase during migration?
3. Domain/hosting target (container on Docker Desktop host, tunnel, or cloud)?
4. Do the KPF `.agents/rules` (folder structure, admin centralization, security) restrict where these files may live?
