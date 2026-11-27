# ADR-003: External Integration Structure, Synchronization and AI Estimation Boundary

## Status

Accepted on 15 November 2026. Approved by the team. The approval is reported by the submitting member, and per-member sign-off lines are in Section 11 of ASRs_and_Architectural_Drivers.md. Depends on ADR-001 and ADR-002. Amended on 15 November 2026 (DL-17) to follow the validated PRD. The amendment was re-approved 27 November 2026 (DL-25).

**Conditions still open:**

- OQ-24 and OQ-25: the Classroom freshness requirement is not recorded. The sync defaults in DL-04 are approved by the team and kept as configuration values.
- Gate 2 (real student account test) has not been run.
- DL-05: the AI failure behaviour awaits PRD and TA confirmation.
- DL-13 is closed: the AI provider is recorded in Decision 6 below. Billing for the paid tier is not yet enabled, and the team has not confirmed that it can be.

## Context

**Drivers (from ASRs_and_Architectural_Drivers.md):**

- **ASR-01, ASR-02:** Classroom and Calendar are external boundaries with their own availability, permissions and update behaviour.
- **ASR-03:** saved data stays viewable when an external service is unavailable.
- **ASR-09:** the AI effort-estimation service is an external dependency.
- **ASR-10:** security and privacy of Google-linked data (credential and revocation handling are in ADR-006).
- **T-02:** AI latency against the three-second display requirement.
- **OQ-24, OQ-25:** Classroom data access and synchronization behaviour are not fully specified.

**Facts from Google's documentation. Checked on 15 November 2026 against the pages named:**

- **Classroom usage limits** (Classroom "Usage Limits" page, shown as last updated 2026-09-03): 3,000 queries per minute per project, 1,200 per minute per user, 4,000,000 per day.
- **Calendar usage limits** (Calendar "Usage limits" page): 10,000 requests per minute per project and 600 per minute per user per project. The 1,000,000 per day figure is a billing threshold, not a rate limit. The page recommends truncated exponential backoff with random jitter, random sync times instead of fixed ones, and push notifications in preference to polling.
- **Calendar incremental sync** (Calendar synchronization guide): each response carries a sync token. A later call with it returns only changes, deleted events included. An HTTP 410 means the token is invalid, and the client must wipe its local copy and run a full sync.
- **Classroom push notifications** (Classroom push notification page): registration needs the Cloud Pub/Sub prerequisites and billing enabled on the project. A registration lasts one week unless extended. Notifications stop if the user disconnects the app. The coursework feed needs the push notifications scope plus the "students" version of the coursework scope or its read-only variant.

**Recorded earlier and not re-checked:**

- Google describes the "students" scopes as covering students in classes you teach or administer. A student account therefore very likely cannot register for the coursework feed. This is an inference from the scope wording and is not confirmed (Gate 2). Notifications reach only data the registering credentials can view.
- `classroom.courses.readonly`, `classroom.coursework.me.readonly` and `classroom.student-submissions.me.readonly` exist and cover a Student's own classes, coursework and submissions.
- Calendar push notifications need an HTTPS endpoint with a valid certificate (self-signed certificates are rejected). They carry no change details, so the system must fetch the changes. Channels expire and must be replaced manually. Google states that a small percentage of messages are dropped, so syncing must work without them.
- Limits can change. Re-check them in the Cloud console for the team's own project before the demo.

**Questions:**

1. How is access to external systems structured?
2. How is data kept in sync, and how often?
3. Where does the AI service sit relative to display and recalculation?
4. How are failures handled when an operation spans the database and an external service?

## Alternatives considered

### 1. Integration structure

- **A. One adapter per external system behind internal interfaces (selected).** Pros: Google and AI details stay contained, the planning core stays testable, and failures are isolated. Cons: more modules to write and maintain.
- **B. Feature modules call external APIs directly.** Pros: less code at first. Cons: Google details leak everywhere, the code is hard to test, and it violates ADR-001 boundary rule 2.
- **C. One generic integration gateway for everything.** Pros: a single place for external calls. Cons: mixes unlike protocols and failure modes and tends to become a catch-all module.

### 2. Synchronization strategy

- **A. Polling-first, with push as an optional accelerator (selected).** Pros: correctness does not depend on push, which is very likely unavailable for student accounts (Classroom), lossy (Calendar) or expensive to set up (billing, public certificate, renewals). Cons: freshness is limited by the polling interval, and it uses API quota.
- **B. Push-first with polling as a fallback.** Pros: lower latency when push works. Cons: the most setup and the most moving parts (Pub/Sub, public endpoint, renewal jobs per user and per course), and it depends on the unconfirmed Classroom student-account behaviour.
- **C. Polling only, push never.** Pros: simplest. Cons: closes the door on lower latency if the freshness requirement later needs it.

### 3. AI estimation placement

- **A. Asynchronous estimation, results stored, recalculation uses stored estimates only (selected).** Pros: the display path and every transaction stay independent of the AI service, so T-02 disappears. An AI outage only delays new estimates. Cons: a new assignment shows "estimating" until the estimate arrives, and the start-by date follows later.
- **B. Call the AI service synchronously when a view is displayed.** Pros: always fresh. Cons: puts an external service on the display path and breaks the three-second requirement during slow or failed calls.
- **C. Call the AI service inside the edit-and-recalculate transaction.** Pros: results are immediate. Cons: holds a database transaction open across a network call (ADR-002, rule 6), and an AI outage blocks Student edits.
- **D. Estimate once at import and never re-estimate.** Pros: fewest calls. Cons: ignores changes to skill ratings, which are an AI input (ASR-09), so estimates go stale.

### 4. Cross-system failure handling

- **A. Record intent, call, record outcome, with idempotent retry and reconciliation on the next sync (selected).** Pros: works with any external system, survives crashes, and never leaves a transaction open across a network call. Cons: temporary divergence between database and external state, which sync status makes visible.
- **B. Distributed transaction across the database and the external service.** Pros: no divergence. Cons: Google's APIs offer no such protocol. Not available.
- **C. Fail fast with no retry.** Pros: simplest. Cons: every transient outage becomes a lost update and a manual action for the Student.

## Decision

1. **Adapters:** one adapter each for Classroom, Calendar and the AI service, behind internal interfaces. The planning core sees only internal data models. The AI provider is the Gemini API (Decision 6 below, DL-13). The adapter interface keeps the provider replaceable.
2. **Synchronization:** polling-first, run by the sync engine as database-backed jobs (ADR-001, rule 8).
   - Default Classroom interval: 15 minutes per Student. Default Calendar interval: 5 minutes per Student, using incremental sync tokens (ADR-004). Both are configuration values (DL-04) and may change once OQ-24 and OQ-25 record the freshness requirement.
   - A refresh also runs when the Student opens the app or asks for one, with at least 60 seconds between refreshes per Student and source.
   - Intervals carry random jitter so jobs do not align.
   - Classroom polling re-reads the Student's own courses, coursework and submissions and compares them with stored records by stable Classroom identifiers. Each import batch applies atomically (ADR-002, rule 2).
   - When an import batch changes an official deadline, the planning core stores a deadline-change notice in the same transaction and recalculates affected start-by dates once from the latest saved inputs (FR-01, FR-01-AC2). If several deadline changes arrive before processing, the latest deadline is applied and the Student is notified once for that assignment (FR-01-E2, FR-01-AC3). This notice is a Notification sent to the Student’s devices, not an in-app-only notice (RG-50, BR-19). The notification scheduler builds it from the stored notice by the same plan-version mechanism as ADR-002, rule 9. Device delivery also follows RG-52’s one-Notification-per-assignment-per-day limit. OQ-34 remains open only for whether course-balance notices and urgent start-by warnings should also be sent to devices; it does not apply to deadline-change Notifications.
   - Push is optional and later. If it is added, a push message only triggers the same sync path and is never a separate data path. It is considered only after the Classroom student-account registration test passes (Gate 2).
   - Load check: at five courses a Classroom sync is about 11 calls (the team's estimate: one course list plus coursework and submissions per course). At a 15-minute interval that is roughly 44 calls per Student per hour. 100 Students would use about 73 calls per minute against a 3,000 per minute project limit. Calendar at 5 minutes is 12 calls per Student per hour against 600 per minute per user. Quota is not the constraint at course-project scale.
3. **AI estimation:** Alternative A. Estimation requests are produced by the sync engine and by skill-rating changes, run as background jobs through the AI adapter, and stored with a state (pending, available, failed). When an estimate returns, it is stored and the dependent recalculation runs in one transaction (ADR-002, rule 7). The display path and recalculation never call the AI service.
   - **On failure:** the previous estimate is kept. If none exists, the item is marked "no estimate", shows no calculated start-by date, and the Student may enter effort manually, which is stored as an override. Failed requests retry with exponential backoff up to three attempts, then wait for the next sync cycle. The PRD must confirm this behaviour (DL-05, logged as a new Open Question).
   - What may be sent to the AI service is decided in ADR-006.
4. **Cross-system failures:** Alternative A. External calls run outside database transactions (ADR-002, rule 6). Operations are idempotent, retried with exponential backoff and jitter, honour 403 and 429 rate-limit responses, and are reconciled on the next sync.
5. **Outages:** each source (Classroom, Calendar, AI) has a sync status per Student: Current (with last success time), Stale (with last success time and last error), or Disconnected (with reason, set by ADR-006). An external failure only changes this status. It never blocks access to saved data (ASR-03), and the client shows "last synced at" wherever imported data appears (ASR-08).
6. **AI provider (DL-13, decided 15 November 2026):** the Gemini API from Google, on the paid tier, with a Flash-Lite class model. The model identifier is a configuration value, because Google's model names change often.
   - **Why:** Google's pricing page (checked 15 November 2026) states that paid-tier content is not used to improve Google's products and free-tier content is. This matters because assignment details leave the system (T-04). The same page lists paid Flash-Lite prices between $0.10 and $0.30 per million input tokens and between $0.40 and $2.50 per million output tokens. At an assumed 500 input and 150 output tokens per estimate, one estimate costs about $0.0001 at the lowest listed rates and about $0.0005 at the highest. The token counts are the team's assumption. The team already runs a Google Cloud project for OAuth.
   - **Rules:** real Student data goes only to the paid tier. The free tier may be used only with synthetic data in development and tests. If billing cannot be enabled, the AI adapter runs disabled: every item shows "no estimate" and the Student enters effort manually, which is the failure behaviour in Decision 3 (DL-05).
   - **Alternatives not selected:** the Anthropic API and the OpenAI API. The team has not compared their current terms or prices, so they are not rejected on evidence. A swap needs a decision log entry and human approval, not a new ADR, provided the adapter interface and the ADR-006 allow-list do not change and the new provider gives written terms that API data is not used for training. Also not selected: the Gemini free tier (free-tier content is used to improve products), a local rule-based estimator (ADR-006, Alternative 3C, which changes the requirement), and a self-hosted model (extra hosting cost and operations that PC-01 does not allow).

## Rationale

- **ASR-01, ASR-02, ASR-03:** polling-first makes correctness independent of push behaviour, and adapters isolate each external failure mode.
- **ASR-09, T-02:** with estimation asynchronous and stored, the three-second display requirement depends only on local reads.
- **ASR-04 (via ADR-002):** no external call sits inside a transaction, so the AI service can never hold a lock or block an edit.
- **ASR-10, T-04:** one adapter per service is the single control point for what leaves the system. The provider choice follows the checked difference in data use between Gemini's paid and free tiers.
- **PC-01:** polling is the cheapest approach for four members and leaves push as a later upgrade. The quota check shows polling is affordable.

## Trade-offs and consequences

- Freshness is bounded by the polling interval. The defaults are proposals until OQ-24 and OQ-25 are answered.
- Google's Calendar guidance prefers push to polling. This decision departs from it on purpose: Calendar push can drop messages, so polling is needed anyway, and Classroom push very likely does not work for student accounts. Calendar push stays available as an accelerator (Revisit conditions).
- The AI provider depends on billing being enabled and on Google's paid-tier terms staying as checked. The team reads the terms linked from the pricing page before the demo (not done).
- Polling load grows with the number of Students. This is acceptable at course-project scale.
- New assignments show an "estimating" state for a short time. The PRD must accept this behaviour (DL-05).
- Temporary divergence between database and external state is expected and made visible through sync status.

## Revisit conditions

- The Classroom student-account registration test succeeds and polling cannot meet the freshness requirement. Then add push as an accelerator.
- Google's usage limits change or the Student count grows enough to make the intervals impractical.
- The PRD rejects the "estimating" or "no estimate" behaviour.
- Billing cannot be enabled, or Google's paid-tier data terms change.

## Dependencies and open items

- Depends on ADR-001 and ADR-002. ADR-004 (Calendar), ADR-005 (notifications) and ADR-006 (identity, credentials, AI payload) depend on or extend this decision.
- Record the Classroom freshness requirement (OQ-24, OQ-25). The defaults in DL-04 are decided and may change once it is recorded.
- Gate 2: run the Classroom account test with a real student account (OAuth with the three Classroom scopes, listing courses and coursework, and one attempt at the coursework feed registration).
- Record the AI failure behaviour in the PRD (DL-05).
- AI provider decided (DL-13). Enable billing on the team's Google Cloud project and read the paid-tier terms.



