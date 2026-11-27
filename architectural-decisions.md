# Step 2: Major Architectural Decisions (consolidated record)

**Project:** Google Classroom-Linked AI Academic Deadline Planner
**Deliverable:** 3, Step 2
**Status:** Approved by the team on 15 November 2026 (approval reported by the submitting member, per-member sign-off in Section 11 of ASRs_and_Architectural_Drivers.md). The three items that were still open that morning (hosting provider, AI provider, language and frameworks) and three boundary gaps were decided later the same day. Remaining open conditions are listed in decision-log.md. Amended on 15 November 2026 to follow the validated PRD (DL-17): rows 9 and 11, the component and interface tables, and the data summary. The amendment awaits team re-approval.

## 1. Purpose

This file is the single index of the Step 2 decisions. It lists every major decision with the driver it answers, the alternatives considered, the trade-off accepted and the choice made. The reasoning in full is in `adr/ADR-001` to `adr/ADR-006`. Open items are in `decision-log.md`. `architecture.md` (Step 4) is written from this file and the ADRs.

Every decision here is in an ADR. Nothing in this file stands alone.

## 2. Decision register

The 19 decision points below sit inside six ADRs. ADR-001 and ADR-002 hold three each, ADR-003 holds five, ADR-004 holds two, and ADR-005 and ADR-006 hold three each.

| # | Decision | Drivers | Alternatives considered | Trade-off accepted | Selected decision | ADR |
|---|---|---|---|---|---|---|
| 1 | Overall style and client | ASR-01 to ASR-10, PC-01, T-01 | Native Android app plus web; local-first device databases; microservices | Needs hosting with public HTTPS and an always-on process. Phone notification quality depends on PWA behaviour. One backend instance only. | Server-authoritative modular monolith with one PWA client | 001 |
| 2 | Where authoritative data lives | ASR-03, 04, 05, 06, T-01 | Device-local databases with sync; hybrid with offline write queue; store without multi-record transactions | No offline editing. Saved data depends on the server being up. | One server-side relational database (PostgreSQL, DL-03) | 002 |
| 3 | Recalculation model | ASR-07, 08, 09, T-02 | Compute on read; event-driven asynchronous recalculation | Dependency rules between inputs and start-by dates must be written and tested carefully. | Recompute on write, stored, in the same transaction as the edit | 002 |
| 4 | Integration structure | ASR-01, 02, 09 | Feature modules call APIs directly; one generic gateway | More modules to write. | One adapter per external system behind internal interfaces | 003 |
| 5 | Synchronization strategy | ASR-01, 02, 03, OQ-24, OQ-25 | Push-first with polling fallback; polling only, push never | Freshness bounded by the polling interval. API quota use. Departs from Google's stated preference for push on Calendar. | Polling-first, push optional later and only as a trigger for the same sync path | 003 |
| 6 | AI estimation placement | ASR-09, T-02 | Synchronous call on display; call inside the edit transaction; estimate once at import | New assignments show "estimating" for a short time. | Asynchronous estimation, stored results, recalculation uses stored estimates only | 003 |
| 7 | Cross-system failure handling | ASR-04 | Distributed transaction; fail fast with no retry | Temporary divergence between database and external state, made visible through sync status. | Record intent, call, record outcome, idempotent retry, reconcile on next sync | 003 |
| 8 | Calendar placement and scope | ASR-02, 10 | Events in primary calendar with `calendar.events.owned`; full calendar scope | Blocks sit in a separate calendar the Student must keep visible. | Dedicated secondary calendar with `calendar.app.created` | 004 |
| 9 | Calendar conflict authority | ASR-02, 07, T-03 | One-way plan to Calendar; Calendar authoritative; three-way merge with a conflict screen | Last-edit-wins can discard an earlier Student edit. The log and a notice are the mitigation. A conflicting Calendar edit needs a Student action. | Student edit beats calculated value. A Calendar time change is accepted only if it fits the official deadline and available hours, otherwise it becomes a conflict the Student resolves (FR-12-E4). Of two valid Student edits the later wins and the loser is logged and shown. | 004 |
| 10 | Notification delivery channel | ASR-06, C-03 | Native app with FCM; client-side timers; email or SMS | Delivery timing depends on Chrome and Android power state. Every push must show a visible notification. Whether each repeat alerts is unproven (`renotify`). | Web Push (VAPID) from the server to a service worker on each device | 005 |
| 11 | Where repeat logic runs | ASR-06 | External queue or cron service; in-memory timers | Relies on the single-instance rule. Timing precision limited by the loop interval. | In-process loop over a database table of scheduled notifications, applying the daily repeat, the 48-hour "Got it" pause and the stop rules (FR-11) | 005 |
| 12 | Acknowledgment propagation | ASR-06, T-01 | Server-Sent Events or WebSocket; silent push to clear the other device | A tray entry on another device may linger. A hidden tab updates when it becomes visible. | One shared database record, repeats stop on commit, open clients poll every 30 seconds | 005 |
| 13 | Student identity | ASR-05, 10 | Own planner account with passwords; one combined Google grant | Identity tied to Google. | Google sign-in with identity scopes only, then an application session. Classroom and Calendar are separate later grants. | 006 |
| 14 | Where tokens are held | ASR-10 | Tokens in the client; online access only; external key vault | The server holds the encrypted tokens and the key. | Refresh tokens on the server, encrypted at rest, read only by the credential handling module | 006 |
| 15 | What goes to the AI service | ASR-09, 10, T-04 | Send the full record and profile; local rule-based estimator | Estimates may be less accurate. | Fixed allow-list of fields, enforced by the AI adapter | 006 |
| 16 | Technology stack and hosting | PC-01, ASR-04, ASR-10 | Python with FastAPI plus React; NestJS; Next.js full-stack; Spring Boot. Other hosts: any always-on VPS, a team laptop behind a tunnel. | The team skill check is not done. Azure for Students eligibility and credit life are unconfirmed. One VM is a single point of failure. | TypeScript on Node.js, Fastify, React with Vite as a PWA, `pg` with plain SQL, Vitest on a real PostgreSQL. One Azure VM running Docker Compose. | 001 |
| 17 | Module dependency directions | ASR-01 to ASR-10 (boundaries), PC-01 | Boundary rules as prose only; framework-enforced modules | The CI check and its configuration must be maintained. | One table of allowed dependencies, enforced by dependency-cruiser in CI | 001 |
| 18 | How derived outputs follow plan changes | ASR-02, 03, 06, 07 | Planning core calls the scheduler and sync engine directly; a change-event table | Calendar blocks and notification schedules lag the plan by up to one loop or sync interval. | Derived records store the plan version they were built from and are rebuilt when it differs | 002 |
| 19 | AI provider | ASR-09, 10, T-04 | Anthropic API; OpenAI API; Gemini free tier; local rule-based estimator; self-hosted model | Needs a billing account. Provider terms not yet read by the team. Other providers not compared on current terms. | Gemini API, paid tier, Flash-Lite class model. Free tier only for synthetic data. | 003 |

## 3. Components and responsibilities

| Component | Responsibility | Must not | Source |
|---|---|---|---|
| PWA client | Presentation on phone and laptop. Shows push notifications through its service worker. Caches only the static application shell. | Hold business rules. Talk to external services. Keep a persistent copy of academic data. | ADR-001, DL-11 |
| API layer | Only entry point for clients. Issues and validates application sessions. | Be bypassed by any client. | ADR-001, ADR-006 |
| Planning core | Student-entered data, overrides, recalculation of start-by dates, neglect warnings with explicit Unknown progress evidence. Subtasks, study sessions and study timer state (FR-15, FR-16). Checks a Calendar time change against the official deadline and available hours (FR-12-E4). Stores deadline-change notices (FR-01). | Know about Google or the AI service. Call any module except the data access layer. Change assignment status, effort or start-by dates because of subtasks or recorded study time. | ADR-001, ADR-002, DL-16 |
| Sync engine | Runs Classroom, Calendar and AI jobs from the database-backed job table. Imports batches, detects changes, keeps sync cursors and sync status. Rebuilds Calendar blocks whose plan version is out of date. | Call external systems except through adapters. | ADR-001, 002, 003, 004 |
| Classroom adapter | The only code that knows the Classroom API. Returns internal data models. | Leak Google types into other modules. Import the data access layer. | ADR-001, ADR-003 |
| Calendar adapter | The only code that knows the Calendar API. Creates and manages one dedicated calendar per Student and reads and writes events on it. The sync engine persists the block to event mapping. | Touch any calendar other than the dedicated one. Import the data access layer. | ADR-001, ADR-004 |
| AI adapter | The only code that calls the AI service. Enforces the payload allow-list. Returns estimates. | Send any field outside the allow-list. Log payloads. Import the data access layer. | ADR-001, ADR-003, ADR-006 |
| Notification scheduler | Owns notification schedules, daily repeats, push subscriptions, the acknowledgment update, the 48-hour pause after Got it and the stop rules (FR-11). Rebuilds schedule rows whose plan version is out of date. Sends Web Push through a push gateway interface. | Let any other module send notifications. Call push services inside a database transaction. | ADR-001, ADR-002, ADR-005 |
| Credential handling | Grants and scope checks, encrypted refresh tokens, access tokens handed to adapters, revocation detection and cleanup. Calls Google's OAuth endpoints through the OAuth client interface. | Let any other module read stored credentials. Log tokens or keys. | ADR-001, ADR-006 |
| Data access layer | The only code that touches the database. Owns transaction boundaries and versioned writes. | Be bypassed by any module. | ADR-001, ADR-002 |

## 4. Boundary rules

These are the eight rules of ADR-001. Rule 2 was extended on 15 November 2026 to cover credential handling's calls to Google's OAuth endpoints.

1. Clients communicate only with the API layer.
2. Only the adapters communicate with external systems. The notification scheduler sends Web Push through a push gateway interface, and credential handling calls Google's OAuth endpoints through an OAuth client interface. Both follow the same rule as an adapter.
3. Only the data access layer touches the database, and it owns transaction boundaries.
4. The planning core has no knowledge of Google or the AI service.
5. Only the credential handling module reads stored credentials. Adapters obtain short-lived access tokens from its interface.
6. Only the notification scheduler sends notifications.
7. Modules interact through defined interfaces and never use each other's internals. Each module is one directory with one public entry file, and a CI check enforces the dependency table in Section 5.
8. Scheduled work runs inside the backend process on a database-backed job table. No external queue, scheduler service or cache is added without a new ADR.

## 5. Interfaces and communication

All rows are decisions. The dependency table in ADR-001 is the source for the module-to-module rows.

| From | To | Nature | Basis |
|---|---|---|---|
| PWA client | API layer | HTTPS requests carrying the session cookie. Open clients also poll notification state every 30 seconds while visible. | ADR-001 rule 1, ADR-005 |
| API layer | Planning core | Plan reads and Student edits | ADR-001 dependency table |
| API layer | Notification scheduler | Acknowledgment and push subscription requests | ADR-001 dependency table, ADR-005 |
| API layer | Sync engine | Request for a refresh (at least 60 seconds apart per Student and source) | ADR-001 dependency table, ADR-003 |
| API layer | Credential handling | Sign-in callback, grant requests and disconnects | ADR-001 dependency table, ADR-006 |
| Planning core | Data access layer | Reads and writes inside transactions the data access layer owns | ADR-001 rule 3, ADR-002 |
| Sync engine | Classroom, Calendar and AI adapters | One internal interface per adapter | ADR-003 |
| Sync engine | Planning core | Apply an import batch, apply a returned estimate, apply a Calendar edit (stored as an override, or recorded as a conflict if it breaks the official deadline or available hours). Each is one transaction. | ADR-001 dependency table, ADR-002 rules 2, 7 and 9 |
| Notification scheduler | Planning core | Read-only: upcoming start-by items, their plan version and assignment status (Started, Finished, Submitted) | ADR-001 dependency table, ADR-002 rule 9 |
| Adapters | Credential handling | Request for a short-lived access token per Student and service | ADR-006 |
| Credential handling | Google OAuth endpoints | Code exchange, token refresh, revocation, through the OAuth client interface | ADR-001 rule 2 |
| Adapters | External systems | HTTPS calls, never inside a database transaction | ADR-001 rule 2, ADR-002 rule 6 |
| Notification scheduler | Push gateway interface, then browser push services | Web Push messages with an idempotency key per send | ADR-001 rule 2, ADR-005 |
| Sync engine, notification scheduler, credential handling | Data access layer | Persistence of schedules, sync state, tokens | ADR-001 rule 3 |

There is no call from the planning core to any other module. Changes flow outward by observation: derived records compare their stored plan version with the current one (ADR-002, rule 9).

## 6. External systems and their boundaries

| System | What the system uses it for | Boundary | ADR |
|---|---|---|---|
| Google sign-in and OAuth endpoints | Student identity (`openid`, `email`, `profile`), token exchange, refresh and revocation | Credential handling (OAuth client interface) and API layer only | 001, 006 |
| Google Classroom | Courses, coursework, submissions: `classroom.courses.readonly`, `classroom.coursework.me.readonly`, `classroom.student-submissions.me.readonly` | Classroom adapter only | 003, 006 |
| Google Calendar | Study blocks on one dedicated calendar: `calendar.app.created` | Calendar adapter only | 004, 006 |
| AI service | Effort estimation from the allow-listed fields. Gemini API, paid tier, Flash-Lite class model. | AI adapter only | 003, 006 |
| Browser push services | Delivery of Web Push messages to phone and laptop | Push gateway interface inside the notification scheduler | 005 |

## 7. Data ownership summary

The full ownership table is in ADR-002. The rules that matter most:

- One server-side database is the single source of truth, reached only through the data access layer.
- Student overrides, AI estimates and calculated start-by dates are stored in separate fields, so recalculation never overwrites an override.
- Progress evidence is Observed or Unknown. Unknown is never turned into "no activity", and a warning built on Unknown evidence carries an "uncertain" flag.
- Subtasks, study sessions and study timer state (FR-15, FR-16) are planning-core data in the same database. Timer state is a start time plus pause and resume events, and the duration is computed from them on the server, not from a client timer, because devices keep no academic data (DL-11, DL-16). None of them changes assignment status, effort or start-by dates (BR-20, BR-21).
- Notification and acknowledgment state live in the database. The first acknowledgment wins.
- Calendar blocks and notification schedules are derived records. Each carries the plan version it was built from.
- After Classroom revocation the Student chooses to keep or delete the imported assignments (FR-13). Until then they stay available, marked disconnected and stale. Subtasks, study sessions and other data attached to an assignment follow it.
- Refresh tokens are encrypted at rest. The client holds no academic data and no tokens.

## 8. Architectural constraints

- One backend instance in v1. More than one needs a new ADR.
- No new framework, database, external service, queue or cache without a new ADR and human approval. Swapping the AI provider needs a decision log entry and human approval, provided the adapter interface and the allow-list do not change.
- Hosting must provide public HTTPS, an always-on process, a persistent relational database with backups, and secrets kept outside the repository (ADR-001, D1 to D4). Only the reverse proxy is reachable from the internet. The database is never exposed.
- External calls never run inside a database transaction.
- Polling is the base synchronization mechanism. Push may only trigger the same sync path.
- The time of day for daily reminders and the sync intervals are configuration values, not constants in code.
- Real Student data goes only to the AI provider's paid tier. The free tier is for synthetic data.
- Module dependencies follow the table in ADR-001, and the CI check must pass.
- Transactions are ACID (C-05). "Local" is read as the system's own store (DL-01, awaiting TA confirmation).

## 9. Technology status

| Item | Status |
|---|---|
| Server-authoritative monolith, PWA client, Web Push (VAPID) | Decided (ADR-001, ADR-005) |
| TypeScript on Node.js, Fastify, React with Vite, `pg` with plain SQL, Vitest, dependency-cruiser | Decided 15 November 2026 (ADR-001, DL-14). Skill check and package versions still to be checked. |
| PostgreSQL | Decided (ADR-002, DL-03) |
| Hosting: one Azure VM, Docker Compose, reverse proxy with automatic certificates | Decided 15 November 2026 (ADR-001, DL-02). Azure for Students eligibility to be confirmed at sign-up. |
| Google sign-in, three Classroom scopes, `calendar.app.created` | Decided (ADR-004, ADR-006). Gate 2 still to be run. |
| AI service: Gemini API, paid tier, Flash-Lite class model | Decided 15 November 2026 (ADR-003, DL-13). Billing account to be created. |

## 10. Open conditions

All open conditions, with their owners, are in `decision-log.md`: DL-01 and DL-10 (TA confirmation), DL-05 to DL-09 (defaults awaiting PRD or TA answers), DL-17 (alignment to the PRD, awaiting team re-approval), the unchecked items inside DL-02, DL-13 and DL-14 (Azure sign-up, Google billing account, stack skill check), the eight unresolved Open Questions, and Gates 1 to 3. Hosting provider, AI provider and language are no longer open.
