# AGENTS.md
## AI Academic Deadline Planner: Coding Agent Instructions

You implement the team's recorded architecture. You do not redesign it.

**Critical rule:** The backend has a strictly closed inventory of exactly eleven modules/interfaces. You must preserve their names, responsibilities, boundaries and allowed dependencies. Do not invent, rename, merge, omit or replace modules.

When something is unclear, stop and ask the team (Section 10).

---

## 1. Project intent

The AI Academic Deadline Planner is a Google Classroom-linked academic deadline planner for students. It imports assignments, estimates effort through an external AI service, calculates personalized start-by dates, sends phone and laptop notifications, and synchronizes study-plan blocks with Google Calendar.

The architecture is a server-authoritative modular monolith with one PWA client. The server-side PostgreSQL database is the single source of truth.

The coding agent must implement the recorded architecture, not introduce an alternative architecture.

---

## 2. Source documents and precedence

Read before any work:

- `PRD.md`
- `architecture.md`
- All `ADR-xxx.md` files
- `ASRs_and_Architectural_Drivers.md`
- `decision-log.md`

Precedence on architectural questions:

**ADRs > architecture.md > decision-log.md > PRD.md**

**D4 exception (decision-log.md DL-54):** for D4, the decision-log entries listed in §12 take precedence over the specific ADR, architecture.md and AGENTS.md wording named there.

The PRD defines product behaviour and requirement IDs. It does not authorize architectural changes.

Rules:

1. Never replace an ADR decision with a technical preference.
2. Never resolve contradictions between documents yourself. Report them under Section 10.
3. Do not treat open decisions or awaiting-confirmation items as approved.
4. Do not introduce architecture based on assumptions, convenience or common software-development conventions.
5. Every architectural change requires the appropriate human approval and recorded decision.

---

## 3. Module boundaries — CLOSED INVENTORY

### 3.1 Mandatory closed-module rule

**The backend module inventory is strictly closed to EXACTLY the following eleven modules/interfaces.**

No twelfth backend module is permitted without a new ADR and explicit human approval.

You MUST implement and preserve these exact module identities:

1. API Layer
2. Planning Core
3. Sync Engine
4. Classroom Adapter
5. Calendar Adapter
6. AI Adapter
7. Notification Scheduler
8. Credential Handling
9. Data Access Layer
10. Push Gateway Interface
11. OAuth Client Interface

Do NOT:

- Invent new backend modules.
- Rename any listed module.
- Merge two listed modules.
- Omit or replace Planning Core or Data Access Layer.
- Create generic `shared/`, `common/`, `identity/`, `gateway/`, `repositories/`, `services/` or utility-kernel modules.
- Move responsibilities into an unauthorized module.
- Introduce a shared business-logic package or additional backend layer.
- Create a new backend module merely to simplify imports or dependency management.

The PWA Client is the client application, not a twelfth backend module.

A directory or file inside an existing module does not automatically become a new module. However, it must not create an independent architectural responsibility or bypass the module's public interface.

### 3.2 Responsibilities and boundaries

| Module | Owns | Must NOT |
|---|---|---|
| PWA Client | Presentation, API calls, static app-shell cache, displaying push notifications | Hold business rules; call external services; persist academic data on the device |
| API Layer | Request entry, routing, application sessions | Own planning rules; be imported by any module |
| Planning Core | Student-entered data, overrides, start-by calculation, progress interpretation and neglect warnings, subtasks, study sessions, timer state, deadline-change notices, Calendar-edit check against deadline and available hours | Reference Google or AI services; call anything except DAL; change Started/Finished/Submitted status because of subtasks or study time |
| Sync Engine | Integration jobs, imports, Calendar block mapping, sync cursors and status; persists adapter results; applies imports, estimates and accepted Calendar edits through Planning Core | Call external systems except through adapters; let an adapter persist |
| Classroom Adapter | Google Classroom integration and returning external results | Access the database; leak Google types to other modules |
| Calendar Adapter | Google Calendar integration and returning external results | Access the database; leak Google types to other modules |
| AI Adapter | Gemini integration and AI payload allow-list enforcement | Access the database; send fields outside the approved allow-list; log AI payloads |
| Notification Scheduler | Schedules, daily repeats, 48-hour pause and stop rules, push subscriptions, acknowledgment state and all notification sending | Let another module send notifications; call a Planning Core write operation; send push inside a database transaction |
| Credential Handling | Grants, scopes, encrypted refresh tokens, short-lived access tokens, revocation detection and cleanup | Let other modules read stored credentials; log tokens or keys |
| Data Access Layer | Exclusive database access, database connections, SQL transactions, version-checked writes and SQL migrations | Contain planning or integration logic; permit other modules to access PostgreSQL |
| Push Gateway Interface | The single boundary for sending Web Push through `web-push` | Become a scheduling or general notification module |
| OAuth Client Interface | The single boundary for Google OAuth calls: code exchange, refresh and revocation | Be used by any module except Credential Handling |

Sources: [ADR-001 boundary rules 1–7; ADR-002 data ownership; ADR-004 Calendar check; ADR-005; ADR-006; architecture.md §5]

### 3.3 No unauthorized module substitution

The following substitutions are prohibited:

| Prohibited proposal | Required existing module |
|---|---|
| `identity/` | Credential Handling |
| `gateway/` for notifications | Push Gateway Interface |
| `shared/` or `common/` | Keep responsibility in its existing owning module |
| `calendar/` as a combined planning and integration module | Calendar Adapter and Planning Core, according to their separate responsibilities |
| `notifications/` | Notification Scheduler |
| `database/` or root-level migrations module | Data Access Layer |
| `sync/` replacing planning responsibilities | Sync Engine and Planning Core, according to their separate responsibilities |

These examples do not authorize creating the prohibited directories.

---

## 4. Dependency rules

A module may import only the backend modules listed in its row.

**The allowed-dependency list is exhaustive. Anything not explicitly listed is forbidden.**

### 4.1 Allowed-dependency table

| Module | Allowed imported backend modules |
|---|---|
| API Layer | Planning Core, Notification Scheduler, Sync Engine, Credential Handling, Data Access Layer (application sessions only) |
| Planning Core | Data Access Layer only |
| Sync Engine | Classroom Adapter, Calendar Adapter, AI Adapter, Planning Core, Data Access Layer |
| Classroom Adapter | Credential Handling |
| Calendar Adapter | Credential Handling |
| AI Adapter | Credential Handling |
| Notification Scheduler | Planning Core (read-only interface), Data Access Layer, Push Gateway Interface |
| Credential Handling | Data Access Layer, OAuth Client Interface |
| Data Access Layer | No other backend module; PostgreSQL access only |
| Push Gateway Interface | No other backend module |
| OAuth Client Interface | No other backend module |

External systems are not backend modules. Their access is restricted to the corresponding adapter or interface boundary:

- Classroom Adapter → Google Classroom.
- Calendar Adapter → Google Calendar.
- AI Adapter → Gemini API.
- Push Gateway Interface → Browser Push services.
- OAuth Client Interface → Google OAuth endpoints.
- Data Access Layer → PostgreSQL.

### 4.2 Mandatory dependency enforcement

1. **Closed allow-list:** Configure dependency-cruiser in CI using an explicit allowed-dependency list derived from Section 4.1.
2. **Default deny:** Every cross-module import not present in the allowed list MUST fail the CI build.
3. **Intra-module exemption:** Imports between files belonging to the same module directory are permitted. The allow-list applies to cross-module imports, not legitimate internal imports.
4. **Public entry file:** Every backend module has exactly one public entry file named `index.ts`. Other modules import only that file, never internal module files.
5. **No API Layer dependencies:** No backend module may import the API Layer.
6. **Planning Core restriction:** Planning Core never imports or calls Sync Engine, Calendar Adapter or Notification Scheduler.
7. **Derived-record rebuilding:** Calendar blocks and notification schedules store the plan version from which they were built. Their respective owners compare it with the current plan version and rebuild outdated records.
8. **Changes flowing back:** Imported batches, returned AI estimates and accepted Calendar edits reach Planning Core through its public interface, each as one transaction.
9. **Adapter persistence prohibition:** Adapters return data. Sync Engine persists adapter results. Never Adapter → Data Access Layer.
10. **API Layer → Data Access Layer:** Permitted only for application-session operations: issue, validate and expire sessions.
11. **Notification Scheduler → Planning Core:** Permitted only through read-only operations returning upcoming start-by items, their plan versions and assignment status. No planning writes are permitted.

Sources: [ADR-001 module structure and allowed dependencies; ADR-002 rule 9; ADR-005; ADR-006]

### 4.3 API Layer → Data Access Layer: sessions only

The only permitted direct API Layer dependency on DAL is application-session management.

Permitted operations:

- Issue application sessions.
- Validate application sessions.
- Expire application sessions.

Forbidden through this dependency:

- Assignment reads or writes.
- Planning reads or writes.
- Notification data access.
- Direct access to integration records.

The dependency-cruiser import rule can establish that API Layer imports DAL, but cannot prove that every call is session-related.

Keep the session-related DAL usage clearly isolated. Any other API-to-DAL usage requires human review and must be rejected unless explicitly approved.

### 4.4 Notification Scheduler → Planning Core: read-only

Notification Scheduler may retrieve only:

- Upcoming start-by items.
- Their plan versions.
- Assignment status.

It must not invoke any Planning Core operation that changes planning data.

A dependency-cruiser import rule cannot prove that a called operation is read-only. The exposed interface and its operation semantics must be reviewed separately.

Do not invent additional modules or public entry files to solve this restriction.

### 4.5 Dependency-cruiser CI requirements

The CI dependency check MUST:

- Use an explicit allow-list derived from Section 4.1.
- Apply rules to cross-module imports.
- Permit legitimate intra-module imports.
- Permit imports of a module's own `index.ts`.
- Reject imports of another module's internal files.
- Reject every unlisted cross-module dependency.
- Fail the build when a forbidden dependency is detected.
- Run as a required CI check.

Do not use a forbidden-only list as a substitute for the required allow-list.

An implementation that checks only selected prohibited imports but permits unknown dependencies by default does NOT satisfy this requirement.

The two restricted dependencies (sessions-only and read-only) additionally require semantic review; dependency-cruiser alone cannot enforce them completely.

Source: [ADR-001 technology selection and module structure; Task 7 findings and Task 8 refinement]

---

## 5. Responsibilities to preserve

| Concern | Lives in | Rule |
|---|---|---|
| Database connections and transactions | Data Access Layer | No other backend module connects to PostgreSQL or opens database transactions. |
| Version-checked writes | Data Access Layer | A write on a stale version fails and retries from fresh data. |
| SQL migrations | Data Access Layer | All versioned SQL migration files live strictly inside `data-access/migrations/`. |
| Overrides vs calculated values | Planning Core | Stored in separate fields. Recalculation never overwrites an override; the effective value is the override. |
| Recalculation | Planning Core | Commits together with the Student edit that triggered it; reads stored inputs only; never calls an external service. |
| External calls | Relevant adapters and interfaces | Never inside a database transaction: record intent, call externally, record outcome in a second transaction. |
| Credentials | Credential Handling | Refresh tokens encrypted at rest; access tokens short-lived and in memory only. |
| Notification sending | Notification Scheduler | Sole sender. Each send has an idempotency key. First acknowledgment wins. |
| Web Push transport | Push Gateway Interface | Uses `web-push`. No alternative notification transport may be introduced. |
| Progress evidence | Planning Core / Sync Engine | State is Observed or Unknown. Unknown is never treated as "no activity"; warnings built on Unknown carry an uncertainty flag. |
| Subtasks, study sessions and timer | Planning Core | Not planning inputs. They never change status, effort or start-by dates. Timer duration is computed on the server from stored timestamps, never a client timer. |
| Calendar edits | Planning Core checks, Sync Engine applies | A time change is accepted only if it passes the deadline and available-hours check; otherwise the block is marked Conflict. Never silently accept or overwrite. |

Sources: [ADR-002; ADR-004; ADR-005; ADR-006; DL-16]

### 5.1 AI payload allow-list

The AI Adapter sends only:

- Assignment title.
- Assignment description (truncated).
- Assignment type.
- Course name.
- Due date.
- The Student's skill rating for that course.

Never send:

- Student name, email or Google identifier.
- Tokens or session data.
- Submission content or grades.
- Other assignments.
- Subtasks, timers, study sessions or study time.

Never log AI payloads.

Real Student data goes only to the AI provider's paid tier. The free tier is for synthetic data in development and tests. The model identifier is a configuration value.

Source: [ADR-006 AI data boundary; ADR-003 Decision 6]

---

## 6. Architectural constraints

1. **Single backend instance:** Exactly one backend instance in v1. More requires a new ADR. [ADR-001]
2. **No on-device academic data:** The PWA caches only its static application shell. No academic data is persisted on the device. [ADR-001; DL-11]
3. **Network exposure:** Only the reverse proxy is internet-reachable. PostgreSQL is never exposed publicly. [ADR-001, Hosting]
4. **Scheduled work:** Sync, notification repeats and retries run in the backend process using a database-backed job table. No external queue, scheduler service or cache. [ADR-001 rule 8]
5. **Synchronization:** Polling is the base synchronization mechanism. Push may only trigger the same sync path. [ADR-003, Decision 2]
6. **Configuration:** Reminder time, repeat interval, sync intervals and AI model identifier are configuration values, never hard-coded. [ADR-003; ADR-005]
7. **Secrets:** OAuth client secret, token encryption key and push signing keys come from the host environment, never the repository or logs. [ADR-001, D4; ADR-006]
8. **Hosting:** The host must provide public HTTPS, an always-on backend process and a persistent database with backups. [ADR-001, D1-D3]
9. **No unauthorized infrastructure:** No Redis, external cache, message broker, external queue, in-memory event bus or additional scheduler service. [ADR-001; ADR-005]
10. **No unauthorized architectural additions:** No new framework, database, external service, queue, cache, backend module or architectural layer without a new ADR and explicit human approval. [ADR-001; architecture.md §9]
11. **Database exclusivity:** Only Data Access Layer may import `pg`, establish PostgreSQL connections, execute SQL or own database transactions. [ADR-001; ADR-002]
12. **Migration exclusivity:** All versioned SQL migrations must reside strictly inside `data-access/migrations/`. No root-level or separate migrations directory is permitted. [ADR-001; Task 8 refinement]

---

## 7. Agreed technologies

Only the technologies recorded in ADR-001 and the accepted hosting decision may be used. Do not substitute them based on preference.

| Area | Required choice | Restriction |
|---|---|---|
| Language | TypeScript on Node.js current LTS | Backend and client |
| Backend HTTP | Fastify | Business rules stay in modules, not framework constructs |
| Client | React with Vite | Single-page PWA, hand-written service worker |
| Database | PostgreSQL | Exclusive access through DAL |
| Database driver | `pg` | Data Access Layer only |
| SQL | Hand-written SQL | No ORM |
| Migrations | Versioned SQL migration files | `data-access/migrations/` only |
| Web Push | `web-push` | Push Gateway Interface only |
| Google access | Google's official Node client libraries | Relevant adapters and OAuth Client Interface only |
| Tests | Vitest | Unit and integration tests |
| Database integration tests | Real PostgreSQL instance | Not a mocked database |
| Boundary checking | dependency-cruiser | Required CI check using the Section 4 allowed-list |
| Hosting | One Azure Linux VM | Docker Compose: backend, PostgreSQL and reverse proxy |
| Reverse proxy | Caddy by default | Only internet-reachable application entry point |

### 7.1 Explicit technology prohibitions

The following substitutions and additions are prohibited:

| Prohibited technology or category | Required rule |
|---|---|
| Jest | Do not use. Vitest is mandatory for all tests. |
| Redis | Do not introduce. |
| Other external caches | Do not introduce. |
| RabbitMQ | Do not introduce. |
| Kafka | Do not introduce. |
| Other external message brokers | Do not introduce. |
| In-memory event buses | Do not introduce. |
| External job queues | Do not introduce. |
| Alternative push transports such as APNS or FCM | Do not introduce. Web Push through `web-push` is the sole notification transport. |
| ORM libraries | Do not introduce. |
| NestJS | Rejected. |
| Next.js full-stack | Rejected. |
| Spring Boot | Rejected. |
| Python/FastAPI | Rejected. |
| Microservices | Rejected. |

Do not add a replacement technology that performs the same prohibited role under another name.

A new technology, framework, database, service, queue or cache requires a new ADR and human approval before implementation.

Sources: [ADR-001 technology selection; ADR-005 notification delivery; Task 7 findings and Task 8 refinement]

---

## 8. Project structure conventions

1. Exactly eleven backend modules/interfaces are permitted, as listed in Section 3.
2. Each backend module has one directory and one public entry file named `index.ts`.
3. Other modules import only the target module's `index.ts`, never its internal files.
4. No unauthorized `shared/`, `common/`, `identity/`, `gateway/` or general-purpose backend utility directories.
5. All versioned SQL migration files live strictly inside the Data Access Layer directory at `data-access/migrations/`.
6. No separate root-level migrations directory is permitted.
7. Only the Data Access Layer may import `pg` or directly interact with PostgreSQL.
8. Database integration tests use a real PostgreSQL instance.
9. All unit and integration tests use Vitest, not Jest.
10. dependency-cruiser runs in CI using the explicit allowed-dependency list in Section 4. Unlisted cross-module imports fail the build.

### 8.1 Decisions that remain open

The following three architectural questions must not be silently resolved by the coding agent.

**Open Question 1 — Client/server package arrangement**

The team must decide whether the repository uses:

- A unified workspace; or
- Separate top-level `client/` and `server/` packages.

Do not introduce a shared business package or additional backend module under either arrangement.

**Open Question 2 — Physical placement of interface modules**

The team must decide whether:

- Push Gateway Interface and OAuth Client Interface have dedicated directories; or
- They are nested inside their respective owning modules, Notification Scheduler and Credential Handling.

Their identities, responsibilities and dependency boundaries remain separate regardless of physical placement.

**Open Question 3 — Restricted interface exposure**

The team must decide how to expose:

- API Layer → DAL: application sessions only.
- Notification Scheduler → Planning Core: read-only operations only.

The solution must preserve one public `index.ts` entry file per module.

Do not create extra modules, shared packages or additional public entry files to work around these restrictions.

Other unspecified conventions, including migration filename conventions and exact CI/deployment configuration locations, must also be proposed to the team rather than silently decided.

Sources: [ADR-001; architecture.md §5–§9; Task 8 refinement]

### 8.2 Answers recorded on 27 November 2026

The team answered all three questions in §8.1 and the related conventions (decision-log.md DL-29, DL-30, DL-44 to DL-47):

- **Open Question 1 — answered:** separate top-level `client/` and `server/` folders. No shared business package.
- **Open Question 2 — answered:** all eleven backend modules and interfaces, including Push Gateway Interface and OAuth Client Interface, have their own folders under `server/src/`. Each has one public `index.ts`. The folder names are `api-layer`, `planning-core`, `sync-engine`, `classroom-adapter`, `calendar-adapter`, `ai-adapter`, `notification-scheduler`, `credential-handling`, `data-access`, `push-gateway` and `oauth-client` (DL-45).
- **Open Question 3 — answered (DL-44):**
  - each module keeps its single `index.ts`;
  - the Data Access Layer's `index.ts` exports a named group `sessions` (issue, validate, expire), and the API Layer imports only `sessions` from the Data Access Layer;
  - Planning Core's `index.ts` exports a named group `readOnly` (upcoming start-by items, plan versions, assignment status) for Notification Scheduler, which is unused in D4.

  dependency-cruiser cannot see which names are imported, so the Gate 3 review checks this by reading the imports (§4.3, §4.4).
- **Migrations (DL-45):**
  - `server/src/data-access/migrations/NNNN_short_name.sql`, numbered in order;
  - each slice uses only the number assigned to it in the E-03 data model;
  - never edit a migration that has been applied; add a new one instead.
- **Boundary check (DL-30, DL-46):** `npm run check:boundaries`, run in `server/`, with the allow-list from §4.1 in `server/.dependency-cruiser.cjs`.
  - It must pass before any slice branch is merged.
  - Its output is pasted into the Gate 3 evidence (`evidence/Quality-Gates-Checklist.md`).
  - For D4 this local check replaces the CI wording in §4 (see §12).
- **Sample data (DL-28, DL-47):** the seed code lives inside the Data Access Layer at `server/src/data-access/seed/` and runs with `npm run seed:sample` in `server/`. It can be re-run safely and is not a migration, so §6 rules 11 and 12 still hold.

---

## 9. Actions requiring human approval

Stop and ask before:

- Adding a framework or library category outside Section 7.
- Adding a database, external service, queue, cache, message broker or scheduler.
- Creating, renaming, merging or removing a backend module.
- Introducing a shared kernel, common business package or additional backend layer.
- Changing a module's responsibilities, public interface or ownership.
- Changing an allowed dependency direction.
- Giving API Layer more DAL access than application sessions.
- Letting Notification Scheduler call a Planning Core write operation.
- Allowing any module other than DAL to access PostgreSQL.
- Moving SQL migrations outside `data-access/migrations/`.
- Changing transaction ownership or version-check responsibilities.
- Changing the AI payload allow-list.
- Changing the Web Push transport.
- Replacing Vitest with another test framework.
- Storing academic data on the client.
- Running more than one backend instance.
- Changing the client/server package arrangement.
- Deciding the physical location of the two interface modules.
- Changing the restricted-interface exposure mechanism.
- Making any other deviation from an ADR.

You may present alternatives with trade-offs. Implement them only after the team records explicit approval in an ADR or the decision log.

---

## 10. Handling ambiguity and conflicts

When documents disagree or a required architectural detail is missing:

1. Stop work on the affected behaviour or structure.
2. Identify the relevant requirement, architecture section, ADR rule or decision-log entry.
3. State exactly what is unclear or contradictory.
4. Explain what the uncertainty blocks.
5. Ask the team for an explicit decision.
6. Wait for approval before proceeding.

Never:

- Silently choose between conflicting documents.
- Invent a threshold, technology, module or dependency.
- Treat an open decision as approved.
- Replace a recorded architectural decision with a personal technical preference.
- Resolve a missing interface or ownership rule by creating a new module.

Apply the precedence in Section 2. If a conflict cannot be resolved by that precedence because the higher-priority source is itself unclear, ask the team.

---

## 11. Open items: do not assume

These items are recorded as awaiting confirmation. Ask before implementing behaviour that depends on them.

| Item | Do not assume |
|---|---|
| DL-17 (ADR-002 to ADR-006 aligned to the PRD): re-approved 27 November 2026 (DL-25) | That behaviour belonging to deferred slices may be built (§12) |
| Deadline-change notices | That they can be delivered in D4. architecture.md §8, ADR-002 and ADR-003 all say the notice is a Notification sent to the Student's devices (DL-17). OQ-34 covers only course-balance notices and urgent start-by warnings. Device delivery belongs to deferred slices S-12 and S-17, which must not be built (§12) |
| OQ-27 | Revocation keep-or-delete details beyond the PRD requirement |
| OQ-18, OQ-22, OQ-23 | Notification time of day, repeat limits or quiet hours |
| DL-06 | The AI allow-list is final; its default is awaiting PRD confirmation |
| DL-04 / OQ-24, OQ-25 | The default sync intervals (15 minutes Classroom, 5 minutes Calendar) are final |
| DL-01 | Interpretation of "local" in C-05 and V-08 (system's own database, not on-device) is confirmed by the TAs |
| Gates 1–3 | Their conditions have passed without recorded evidence |
| TypeScript skill check | The required skill check has passed without recorded evidence |
| Other OQ-xx entries | Any unresolved behaviour or technical choice is settled without explicit confirmation |

Do not implement an open item as a settled rule merely because it appears in an ADR, PRD or previous AI-generated proposal. Check its current approval status in the decision log and the relevant source.

---

## 12. Approved D4 scope: deferred slices must not be built

Recorded on 27 November 2026 (decision-log.md DL-19, DL-20, DL-27, DL-28, DL-35, DL-54; plan.md §6).

- Build only the committed slices in plan.md: S-01, S-02, S-03, S-04, S-07, S-08, S-09, S-10, S-14, S-15, S-16. Build the reserve S-19 only when the team starts it.
- **Do not build** the deferred slices S-05, S-06, S-11, S-12, S-13, S-17 and S-18. That means:
  - no calls to Google Classroom, Google Calendar, Google OAuth or Gemini;
  - no Web Push sending;
  - no AI estimation or re-estimation;
  - no Classroom revocation or reconnection flow.
- Send no student data to any external service (DL-35).
- The eleven module folders exist under `server/src/` with their public `index.ts` (DL-29, DL-45). For D4, §3.1 ("MUST implement") is met by these folders and entry files. Modules that serve only deferred slices contain no deferred behaviour (DL-54).
- **D4 precedence (DL-54).** For D4 only, and as an exception to §2, these entries take precedence. The original wording stays in place.

  | Decision-log entry (D4) | Takes precedence over |
  |---|---|
  | DL-27: one seeded demo Student, with a session issued through the Data Access Layer's `sessions` group | ADR-006 Decision 1 (Google sign-in) |
  | DL-24: local execution only, no Azure VM, no tunnel | DL-02; ADR-001 (Hosting, D1, D2); architecture.md §9.5; §6 rule 8 and the hosting rows of §7 |
  | DL-30, DL-46: the local `npm run check:boundaries` must pass before every merge | The "CI" wording in ADR-001, architecture.md §6.2, and §4.2 and §4.5. The allow-list, default-deny, intra-module and fail-on-forbidden rules in §4 still apply. |
  | DL-19, this section: deferred slices are not built | §3.1, as described above |
  | DL-35: no AI estimation; effort entered manually; no data sent externally | DL-13; ADR-003 Decision 6; ADR-006 Decision 7; the Gemini parts of §5.1 and §7 |
- The demo Student session (DL-27) and the sample-data script (DL-28) are approved temporary measures. Do not replace them with Google sign-in or Classroom import without a new team decision.
- Building any deferred behaviour requires a new decision-log entry and explicit human approval.

---

**Final instruction to the coding agent:**

Your job is to implement the architecture the team has recorded, not to design a new one.

The eleven backend modules/interfaces in Section 3 are a closed inventory. Data Access Layer exclusively owns PostgreSQL access and migrations. The technology choices in Section 7 are mandatory. The Section 4 allowed-dependency list is enforced in CI: unlisted cross-module imports fail the build, while legitimate intra-module imports remain permitted.

If you cannot comply with an architectural rule, stop and ask the team. Do not work around it by inventing a module, package, service, framework or dependency.