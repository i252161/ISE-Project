# ADR-002: Data Persistence, Ownership and Recalculation Model

## Status

Accepted on 15 November 2026. Approved by the team. The approval is reported by the submitting member, and per-member sign-off lines are in Section 11 of ASRs_and_Architectural_Drivers.md. Depends on ADR-001. The database product is decided: PostgreSQL (DL-03). Transaction rule 9 was added on 15 November 2026 (DL-15). Amended on 15 November 2026 (DL-16): the data-ownership table gains subtasks, study sessions and study timer state, following the PRD's new FR-15 to FR-17. Amended again on 15 November 2026 (DL-17) to follow the validated PRD on revocation (FR-13, BR-14) and Calendar edits (FR-12), and to add deadline-change notices (FR-01). The DL-17 amendment was re-approved 27 November 2026 (DL-25).

**Conditions still open:**

- DL-01 and Gate 3: the TAs have not yet confirmed that "local" in C-05 and V-08 means the system's own store and not on-device storage. If they say on-device, this ADR is superseded (see Revisit conditions).
- OQ-27: the PRD fixes the Student's keep-or-delete choice after revocation (FR-13, BR-14). The details around it are defaults (DL-08, revised under DL-17, awaiting team re-approval) and await the PRD or TA answer.

## Context

**Drivers (from ASRs_and_Architectural_Drivers.md):**

- **ASR-04 (C-05, V-08):** ACID-compliant local transactions.
- **ASR-03 (NFR-02):** previously saved assignments and the study plan stay viewable when Classroom or Calendar is unavailable.
- **ASR-05 (FR-13, OQ-27):** access revocation and reconnection must preserve in-progress edits and reconcile retained Classroom records.
- **ASR-06 (NFR-03):** acknowledgment state must be consistent across phone and laptop within one minute in at least 95% of test attempts.
- **ASR-07:** calculated values and Student overrides must not be confused or overwritten, and a change to one input can affect several calculated dates.
- **ASR-08:** warnings derived from incomplete progress evidence must not present missing evidence as confirmed inactivity.
- **T-01:** local ACID transactions against cross-device synchronization.
- **T-02 (data side):** start-by dates depend on AI-derived values.

**Dependency:** ADR-001 selects a server-authoritative modular monolith with a PWA client.

**Questions:**

1. Where does authoritative data live, and who owns each kind of data?
2. How are transactions handled when several writers act at once?
3. How is recalculation organised so overrides survive and ASR-04 holds?

## Alternatives considered

### 1. Where authoritative data lives

**A. One server-side relational database as the single source of truth (selected).**

- **Pros:** a single shared source of truth for both devices. Multi-record ACID transactions are a standard capability of relational databases. Straightforward to reason about, test and demonstrate.
- **Cons:** depends on the server being reachable. No offline editing. Data lives on a hosted system, which raises the stakes for protecting it (ASR-10).

**B. Device-local database per client, synchronized between devices.**

- **Pros:** the most literal reading of "local".
- **Cons:** needs a conflict-resolution protocol between devices. Acknowledgment sync within one minute becomes a distributed-systems problem. Calendar change handling and notification scheduling still need a server.

**C. Hybrid: server database plus a fully offline-capable client database with a write queue.**

- **Pros:** supports editing while offline.
- **Cons:** the cost of B plus the cost of A. No ASR requires offline editing.

**D. A data store without multi-record transactions.**

- **Pros:** flexible structure.
- **Cons:** fails C-05 for changes spanning several records (for example, an edit and its dependent recalculation). Acceptable only if it provides multi-record ACID transactions, in which case it has no advantage over A here.

### 2. Recalculation model

**A. Recompute on write and store the results (selected).** When an input changes, the planning core recomputes the affected start-by dates inside the same transaction and stores them.

- **Pros:** Calendar blocks and notification schedules need stored start-by dates anyway. Reads are plain lookups, so the three-second display requirement holds trivially. Atomic with the edit, which satisfies ASR-04.
- **Cons:** the recalculation code must know which records depend on which inputs.

**B. Compute on read, store no calculated values.**

- **Pros:** no stale calculated values.
- **Cons:** the scheduler and the Calendar sync would need to recompute independently and could disagree with what the Student saw. Harder to detect that a date changed and therefore needs a new Calendar write or notification.

**C. Event-driven asynchronous recalculation.**

- **Pros:** decouples writers from recalculation.
- **Cons:** eventual consistency between an edit and its results, which conflicts with ASR-04 and makes ASR-07 harder to test. Not justified at this scale.

### 3. How derived outputs learn about plan changes (added 15 November 2026, DL-15)

**A. Derived records store the plan version they were built from, and their owners rebuild what differs (selected).** Pros: the planning core stays free of Calendar and notification code, a recalculation never waits for an external system, and the rule is easy to test. Cons: derived records lag the plan by up to one loop or sync interval.

**B. The planning core calls the sync engine and the notification scheduler directly after a recalculation.** Pros: no lag. Cons: breaks the dependency direction in ADR-001 (the core depends on nothing but the data access layer), and a failure in either module would reach the edit transaction.

**C. A change-event table that the other modules consume.** Pros: explicit history of changes. Cons: more tables and consumer bookkeeping for no gain over a version comparison at this scale.

## Decision

Adopt **one server-side relational database** as the single source of truth for all plan and notification data, accessed only through the data access layer (ADR-001, boundary rule 3). Recalculate with **recompute on write, stored**.

**Reading of C-05:** "local" is read as the system's own store, as opposed to Google's systems. It is not read as on-device. ACID describes how transactions behave, not where the database sits. This reading is an assumption until the TAs confirm it (DL-01, Gate 3).

**Data ownership:**

| Data | Owner | Authoritative source |
|---|---|---|
| Imported Classroom records (assignments, deadlines, submission status) | Sync engine, through the Classroom adapter | Google for the source fields. The local copy is the system's record, keyed by stable Classroom identifiers. After revocation the Student chooses to keep or delete the imported assignments (FR-13, BR-14). The details follow OQ-27 (default in DL-08). |
| Student-entered data (availability, skill ratings, manual deadlines, manual corrections) | Planning core | The database |
| Student overrides (manual effort, manual start-by date, accepted Calendar edits) | Planning core | The database, stored in fields separate from calculated values |
| AI effort estimates | AI adapter produces them, data access layer stores them | Stored separately from overrides, each with a state (pending, available, failed) and a timestamp |
| Subtasks (FR-15) | Planning core | The database, stored under their assignment. Never a planning input. They do not change Started, Finished or Submitted status, effort or start-by dates (BR-20). |
| Study sessions (FR-16) | Planning core | The database, one row per completed session with its duration, stored under their assignment. Recorded study time is kept apart from the Effort estimate and reported remaining effort and does not change them (BR-21). |
| Study timer state (FR-16) | Planning core | The database. A start time plus pause and resume events. The duration is computed from these stored timestamps, never from a client-side timer. Timer state lives on the server because DL-11 says devices keep no academic data, and it also lets a second device show the same state. Stopping the timer saves a study session. |
| Calculated start-by dates | Planning core | Derived and stored separately from overrides |
| Progress evidence | Sync engine (Classroom status) and Student (start status, FR-09) | Each item has an explicit state, Observed or Unknown, plus a timestamp. Unknown is never converted into "no activity". |
| Derived neglect warnings (ASR-08) | Planning core | Recomputed from evidence. A warning built on any Unknown evidence carries an "uncertain" flag that the client must display. |
| Deadline-change notices (FR-01, BR-01) | Planning core | The database. Created in the same transaction as the Classroom import batch that changes the deadline. The latest deadline is applied and affected start-by dates are recalculated once; if several changes arrive before processing, the Student is notified once for that assignment (FR-01-E2, FR-01-AC2, FR-01-AC3). The notice is a Notification and is sent to the Student’s devices, consistent with RG-50 and BR-19. Device delivery follows the Notification rules, including RG-52’s one-Notification-per-assignment-per-day limit. OQ-34 applies only to course-balance notices and urgent start-by warnings. |
| Calendar block mapping and sync state | Sync engine, rules in ADR-004 | The database. Each block carries the plan version it was built from (rule 9). A block whose Calendar edit broke the official deadline or the available hours carries a Conflict status until the Student resolves it (ADR-004). |
| Notification and acknowledgment state | Notification scheduler | The database (ADR-005). Schedule rows carry the plan version they were built from (rule 9). Each assignment also stores the end of its start-reminder pause (FR-11, BR-18). |
| Sync cursors | Sync engine | The database (last successful sync times, Calendar sync tokens) |
| Application sessions | API layer, through the data access layer | The database (ADR-006) |
| Access credentials | Credential handling module | Encrypted at rest, mechanism in ADR-006 |

**Transaction rules:**

1. A Student edit and the recalculation it triggers commit together or not at all. Recalculation reads stored inputs only and never calls an external service.
2. A Classroom import batch applies as a whole or not at all.
3. An acknowledgment update is a single atomic, idempotent change. The first acknowledgment wins and later ones change nothing.
4. Revocation cleanup, the Student's keep-or-delete choice (including deleting imported assignments and what is attached to them) and reconnection reconciliation each apply atomically. An edit in progress commits or rolls back before the disconnection or deletion is finalized (FR-13-E5, V-08).
5. Overrides are stored apart from calculated values, so recalculation never overwrites them. Where an override exists, the effective value is the override.
6. External calls never run inside a database transaction. Record the intended state in a committed transaction, make the call, then record the outcome in a second transaction.
7. A returned AI estimate and the recalculation it triggers commit together or not at all.
8. Records that more than one writer can change (assignment plan state, Calendar block mapping) carry a version number. A write based on an out-of-date version fails and is retried from fresh data. This covers the isolation concern between Student edits, sync jobs and recalculation.
9. **Derived outputs follow the plan.** Calendar blocks (ADR-004) and notification schedules (ADR-005) are derived from stored start-by dates. The planning core never calls the sync engine, the Calendar adapter or the notification scheduler. Each derived record stores the plan version it was built from. The sync engine and the notification scheduler compare that version with the current plan version and rebuild what differs. Changes in the other direction (a Calendar edit that passes the deadline and availability check, an imported batch, a returned estimate) reach the planning core through its interface as one transaction (rules 1, 2 and 7). Added on 15 November 2026 (DL-15): the earlier text did not say how a changed start-by date reaches Calendar and notifications.

**Database product:** PostgreSQL (DL-03, approved by the team). It provides multi-record transactions, selectable isolation levels and row-level locking, which transaction rules 3 and 8 and the job leasing in ADR-001 rule 8 rely on. It must satisfy ADR-001 deployment constraint D3. SQLite in write-ahead-log mode was the considered alternative: less to set up, but one writer at a time and suitable only on a host with durable local disk. The accepted cost is one more process to run, back up and secure.

## Rationale

- **ASR-04:** a relational store gives ACID transactions across related records without custom machinery. Rule 8 handles concurrent writers with a check any such database supports.
- **ASR-06, T-01:** a single source of truth makes acknowledgment sync a matter of both devices reading the same record, with no cross-device conflict protocol.
- **ASR-03:** saved data lives in the system's own store, so Classroom or Calendar being down does not make it inaccessible. Sync status is kept separate from data access (ADR-003).
- **ASR-05:** retained imported data and local data coexist in one store, so reconciliation after reconnection is a single-store operation.
- **ASR-07:** separate storage of overrides and calculated values enforces the preservation rule structurally. Recompute on write keeps a change and its consequences in one transaction.
- **ASR-08:** an explicit Unknown state makes it impossible for a warning to treat missing evidence as observed inactivity. This is the architectural weight of ASR-08: a data representation rule, not a new component.
- **T-02 (data side):** rules 1, 6 and 7 together keep the AI service out of every transaction.
- **ASR-02, ASR-03, ASR-06, ASR-07 (rule 9):** a recalculation commits without waiting for Calendar or push. If either is down, the plan is already correct and the derived records catch up on the next loop or sync.

## Trade-offs and consequences

- No offline editing on the phone.
- Availability of saved data depends on the server being up.
- Hosted user data must be protected (ASR-10). The credential module and the data access layer are the two places that matter.
- Recompute on write means the dependency rules between inputs and start-by dates must be written and tested carefully.
- Calendar blocks and notification schedules can lag the plan by up to one scheduler loop or one sync interval (rule 9).
- The Student's keep-or-delete choice is fixed by the PRD (FR-13). What a delete removes beyond the assignments and what is attached to them cannot be fully specified until OQ-27 is resolved. The default is in DL-08.
- PostgreSQL is one more service to run, configure and back up (ADR-001, D3).
- If the TAs meant on-device storage by "local", this ADR is superseded (see Revisit conditions).

## Revisit conditions

- The TAs confirm that "local" in C-05 and V-08 means on-device (DL-01). The fallback is Alternative C, whose cost is the cost of A plus a client database and a write queue.
- Offline editing becomes a requirement.
- OQ-27 resolves in a way that changes what is retained.
- Hosting cannot provide a suitable relational database.

## Dependencies and open items

- Depends on ADR-001.
- ADR-003 (integration and sync), ADR-004 (Calendar), ADR-005 (notifications) and ADR-006 (identity and credentials) depend on this decision.
- Confirm "local" against V-08 (DL-01).
- Database product recorded: PostgreSQL (DL-03).



