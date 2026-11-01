# Prompt for KPF agents: plan DevThings integration (PLAN ONLY)

You are an agent working in `rickgomez223/KPF`. Follow KPF's `AGENTS.md`, `.agents/governance/AGENTS_READING_ORDER.md` and `.agents/rules/*` first.

## Task
Review `rickgomez223/DevThings` (public; read `KPF-HANDOFF/SUMMARY.md` there first) and produce an **integration plan** for bringing selected DevThings modules into KPF. KPF uses **Supabase**, the owner's **domain**, and **Docker Desktop**.

## Constraints
- **Plan only. Do not modify KPF files, copy code, or open PRs** until the owner approves the plan.
- Do not copy Firebase keys/config, `deploy.sh`, `.replit`, `replit.nix` or `.firebaserc`. Flag any secrets you see as exposed.
- Respect KPF jurisdiction/folder-structure/security rules; cite the rule when it shapes a decision.
- Use env vars for all Supabase URLs/keys; no secrets in the repo.

## Deliverable (single markdown plan)
1. **Scope**: which modules from the SUMMARY table to adopt, defer, or reject, with reasons.
2. **Placement**: exact target paths in KPF per module, checked against KPF's folder rules.
3. **Firebase → Supabase mapping**: for `dt-fbc.js` list each function and its Supabase equivalent (Auth, Postgres/Realtime, Storage, Edge Functions); give the proposed new API.
4. **Data/security**: proposed tables, buckets, and RLS/storage policies translated from `firestore.rules`, `storage.rules`, `database.rules.json`.
5. **Docker/domain**: compose services (Supabase local stack, static server/proxy), ports, domain/TLS/header approach.
6. **Phases**: ordered steps, each small and independently reviewable, with test/verification for each.
7. **Risks and open questions** (include the SUMMARY's open questions you can't answer from the KPF repo).
8. **Approval checklist** the owner can tick off.

Stop after delivering the plan and wait for owner approval.
