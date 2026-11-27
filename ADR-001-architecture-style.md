# ADR-001: Architecture Style and System Structure

## Status

Accepted on 15 November 2026. Approved by the team. The approval is reported by the submitting member, and per-member sign-off lines are in Section 11 of ASRs_and_Architectural_Drivers.md.

The original draft required Gate 1 to pass before acceptance. The team accepted the decision now so that later steps can proceed. The Gate 1 failure path stays in Revisit conditions.

**Conditions still open:**

- Gate 1 (the notification test defined in ADR-005) has not been run.
- DL-01: the meaning of "local" in C-05 and V-08 is an assumption awaiting TA confirmation. If it is overturned, this ADR is revisited together with ADR-002.

**Closed on 15 November 2026 (reported by the submitting member):** DL-02 (hosting provider recorded), DL-14 (language and frameworks recorded) and DL-15 (module dependency directions and two boundary clarifications). All three are in the Decision section below. None has been tested yet. The skill check recommended in DL-14 is still to be done.

## Context

The system is a Google Classroom-linked deadline planner. It is used primarily on an Android phone and also on a laptop through a web browser.

**Drivers (from ASRs_and_Architectural_Drivers.md):**

- **ASR-01, ASR-02:** two external integrations (Classroom, Calendar), one of them bidirectional.
- **ASR-03:** saved information stays viewable when Classroom or Calendar is unavailable.
- **ASR-04 (C-05):** ACID-compliant local transactions.
- **ASR-06:** notifications on phone and laptop, repeated until acknowledged, with acknowledgment synchronized across devices within one minute in at least 95% of test attempts.
- **ASR-09, ASR-10:** external AI estimation dependency, and security and privacy of Google-linked data.
- **PC-01:** four-member team and a fixed course timeline.
- **T-01:** local ACID transactions against cross-device acknowledgment synchronization.

**Why the structure question is not trivial:** repeating notifications and Calendar change detection need something that keeps running independently of any single device. A laptop browser tab only runs while open, and a phone app should not be relied on to run background work. Two devices also need a shared source of truth to stay consistent.

**Question:** what overall architectural style and system structure should the team adopt?

## Alternatives considered

### A. Server-authoritative modular monolith with one PWA client (selected)

One backend deployable divided into modules, and one web client used on both phone and laptop.

- **Pros:** a single shared source of truth for acknowledgment sync. A scheduler that does not depend on any device. One client codebase. Simplest to test and demo (open a URL). Smallest context for the AI coding agent.
- **Cons:** needs hosting with a public HTTPS address and an always-on process. Phone notification quality depends on PWA behaviour. Fresh data is unavailable when the server is down. Modules can become tangled if boundaries are not enforced. Background work in one process means one backend instance only.

### B. Server-authoritative modular monolith with a native Android app and a web client

- **Pros:** more control over notification behaviour on the phone.
- **Cons:** two client codebases, plus build, signing and distribution. Harder to test and to demo to evaluators. Strains PC-01 for four members.

### C. Local-first device databases with synchronization

- **Pros:** the most literal reading of "local" transactions in C-05.
- **Cons:** needs cross-device conflict handling. Still needs a server for Calendar change handling and notification scheduling. No ASR requires offline editing, so the complexity buys nothing the ASRs ask for.

### D. Microservices

- **Pros:** independent deployment and scaling.
- **Cons:** operational and integration overhead that four members cannot absorb in the timeline. No ASR requires independent scaling or deployment.

## Decision

Adopt **Alternative A: a server-authoritative modular monolith with a single PWA client** used on the Android phone and the laptop browser.

**Structure:**

- **Client:** the PWA. Presentation only. It holds no business rules and does not talk to external services. Its service worker exists to show push notifications and to cache the static application shell. It keeps **no persistent copy of academic data** in v1 (DL-11). Every data view comes from the API.
- **Backend:** one deployable with these eleven modules and interfaces: API layer, planning core, sync engine, Classroom adapter, Calendar adapter, AI adapter, notification scheduler, credential handling, data access layer, push gateway interface, OAuth client interface. (Amended on 27 November 2026, decision-log.md DL-31: the push gateway interface and the OAuth client interface, already required by boundary rule 2 and DL-15, are now listed here so that this list matches architecture.md §5.2 and AGENTS.md §3.)
- **External systems:** Google Classroom, Google Calendar, an AI service, and the browser push services used by Web Push.

**Boundary rules:**

1. Clients communicate only with the API layer.
2. Only the adapters communicate with external systems. The notification scheduler sends Web Push messages through a push gateway interface, and credential handling calls Google's OAuth endpoints (code exchange, token refresh, revocation) through an OAuth client interface. Both follow the same rule as an adapter: one interface, and no other module calls those systems. (The OAuth clause was added on 15 November 2026. Rule 5 and ADR-006 already required credential handling to refresh tokens, which rule 2 did not allow.)
3. Only the data access layer touches the database, and it owns transaction boundaries (see ADR-002).
4. The planning core has no knowledge of Google or the AI service. It works on internal data only.
5. Only the credential handling module reads stored credentials (refresh tokens and the encryption key). Adapters obtain short-lived access tokens from it through its interface and never read stored credentials (see ADR-006).
6. Only the notification scheduler sends notifications.
7. Modules interact through defined interfaces and never use each other's internals.
8. Scheduled work (sync jobs, notification repeats, retries) runs inside the backend process on a database-backed job table. No external queue, scheduler service or cache is added without a new ADR.

**Deployment constraints (the host must satisfy all four; the provider is recorded in DL-02):**

- **D1:** a public HTTPS address with a valid certificate. Service workers, OAuth redirects and Web Push all depend on it.
- **D2:** an always-on backend process. A host that suspends idle processes breaks the notification scheduler and the sync engine.
- **D3:** a persistent relational database with backups.
- **D4:** secrets (OAuth client secret, token encryption key, push signing keys) supplied through the host's environment or secret store and never committed to the repository.

**Single instance rule:** v1 runs exactly one backend instance. Job leasing and in-process scheduling assume it. Running more than one instance requires a new ADR.

**Module structure and allowed dependencies (decided 15 November 2026, DL-15):**

Each backend module is one directory with one public entry file. Other modules import only that file. An automated dependency check in CI fails the build on any other import, and on any dependency not listed below.

| Module | May depend on |
|---|---|
| API layer | Planning core, notification scheduler, sync engine (to request a refresh), credential handling (sign-in and grants), data access layer (application sessions only) |
| Planning core | Data access layer |
| Sync engine | Classroom, Calendar and AI adapters, planning core, data access layer |
| Classroom, Calendar and AI adapters | Credential handling (to obtain access tokens) and their own external system. Never the data access layer. |
| Notification scheduler | Planning core (read-only interface), data access layer, push gateway interface |
| Credential handling | Data access layer, OAuth client interface |
| Data access layer | The database only |
| Push gateway interface | Browser push services only. No other backend module. (Row added 27 November 2026, decision-log.md DL-31, to match AGENTS.md §4.1.) |
| OAuth client interface | Google OAuth endpoints only. No other backend module. (Row added 27 November 2026, DL-31, to match AGENTS.md §4.1.) |

Nothing depends on the API layer. The planning core calls no module except the data access layer. The sync engine, not an adapter, persists what an adapter returns. How a changed start-by date reaches Calendar and notifications is set in ADR-002, rule 9.

**Technology selection (decided 15 November 2026, DL-14):**

| Area | Choice | Reason |
|---|---|---|
| Language | TypeScript on Node.js (current LTS release), for backend and client | One language and one toolchain for a four-member team. Types help hold the module interfaces. DL-14 recommended one language for both sides. |
| Backend HTTP layer | Fastify | A small HTTP framework. Business rules live in the modules above, not in framework constructs. |
| Client | React with Vite, built as a single-page PWA with a hand-written service worker | The service worker shows push notifications and caches the static shell only (DL-11). |
| Database access | node-postgres (`pg`) with hand-written SQL and versioned SQL migration files, inside the data access layer only | Explicit control of transactions and version-checked writes (ADR-002, rules 6 and 8). No ORM that hides them. |
| Web Push | The `web-push` package, inside the push gateway interface | Implements VAPID (ADR-005). |
| Google access | Google's official Node client libraries, inside the adapters and the OAuth client interface only | Keeps Google types out of other modules (rule 4). |
| Tests | Vitest. Integration tests run against a real PostgreSQL instance, not a mock. | C-05 is a property of the database, so a mock cannot prove it. |
| Boundary check | dependency-cruiser in CI, configured from the table above | Turns the boundary rules into a failing build instead of text alone. |

Alternatives considered for the stack:

- **Python with FastAPI for the backend and React for the client.** Two languages and two toolchains.
- **NestJS.** Its module and injection features overlap with the boundary rules, but the framework surface is larger and the rules would then live in framework conventions that an AI agent can bend. Fastify with a dependency check is lighter and stricter.
- **Next.js full-stack.** Blurs the client and API boundary in rule 1 and adds server rendering that no ASR needs.
- **Spring Boot.** Too heavy for the team and the timeline (PC-01).

**Hosting (decided 15 November 2026, DL-02):** one Linux virtual machine in Azure, paid from the Azure for Students credit.

- Checked on Microsoft Learn on 15 November 2026: the offer gives $100 in credits with no credit card, valid for one year and renewable each year while the person is an active student. Eligibility is verified through the institution's email address.
- Not checked: whether the team's university email passes that verification, and how long $100 lasts for the chosen VM size. Both are confirmed at sign-up, before other work depends on the host.
- The VM runs Docker Compose with three containers: the backend, PostgreSQL, and a reverse proxy that obtains and renews a public certificate automatically (Caddy by default). Only the proxy is reachable from the internet. PostgreSQL listens on the internal Docker network only.
- Host name: a public IP with a DNS name label resolves as `label.region.cloudapp.azure.com` (Microsoft Learn, checked), so no domain purchase is needed for D1.
- D2: a VM does not suspend idle processes. D3: the database files sit on the VM's persistent disk and a nightly dump is copied off the VM to Azure Blob Storage. D4: secrets come from an environment file outside the repository, readable only by the service account.
- Fallbacks, in order: any other always-on VPS the team can pay for, then the demo laptop behind a tunnel (DL-02).

## Rationale

- **ASR-06, T-01:** one server-side source of truth is the simplest way to reflect an acknowledgment on both devices.
- **ASR-01, ASR-02:** adapters isolate each external boundary, so failures and changes in Google or the AI service stay contained.
- **ASR-04:** a single backend and database keeps transaction guarantees straightforward.
- **ASR-09:** the AI adapter keeps the external AI dependency behind one boundary.
- **ASR-10:** one credential module limits where tokens can be accessed, and no persistent client data cache means less academic data sits on each device.
- **PC-01:** one backend and one client is the lowest-cost structure that satisfies the ASRs. Microservices and dual clients were rejected on this ground. In-process scheduling avoids operating a queue. One language and one VM keep the stack small.
- **Boundary enforcement:** the dependency table and the CI check make rules 1 to 7 fail a build when broken. This is the main protection against an AI coding agent drifting from the structure.
- **ASR-10, hosting:** only the reverse proxy is public, and the database is never exposed.

## Trade-offs and consequences

- The team must provide hosting that satisfies D1 to D4.
- Phone notification behaviour is a known risk. It is tested early (Gate 1).
- The monolith needs enforced module boundaries. The boundary rules above carry into `AGENTS.md`.
- With no client data cache, the app shows nothing useful when the server is unreachable. ASR-03 covers outages of Classroom and Calendar, not of this server.
- One instance means no horizontal scaling and a restart gap. Job state lives in the database, so a restart loses no scheduled work.
- The skill check from DL-14 (at least two members who can review TypeScript code) has not been done. It is done before coding starts.
- The host depends on Azure for Students eligibility and credit that the team has not confirmed. One VM is a single point of failure, accepted for a course project.
- Package choices (Fastify, `pg`, `web-push`, Vitest, dependency-cruiser) are named without versions. Version and maintenance status are checked at install time.

## Revisit conditions

- **Gate 1:** the repeat-until-acknowledged notification test defined in ADR-005 fails on the team's Android phones, or the laptop does not see the acknowledgment within one minute. Reconsider a native client (Alternative B) or an Android wrapper around the PWA.
- The PRD or the client requires a native app or offline editing on the phone.
- No host satisfying D1 to D4 is available for the demo.
- Fewer than two members can review TypeScript code.
- The team's reading of "local" in C-05 and V-08 turns out to mean on-device (DL-01).

## Dependencies and open items

- ADR-002 to ADR-006 depend on this decision.
- DL-01 (meaning of "local", assumption), DL-02 (hosting, decided), DL-11 (no client data cache, decided), DL-14 (language and frameworks, decided) and DL-15 (dependency directions and boundary clarifications, decided) are in decision-log.md.



