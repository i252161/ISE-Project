# Decision Log

Project: Google Classroom-Linked AI Academic Deadline Planner. Referenced by ADR-001 to ADR-006, by step-2-architectural-decisions.md and by ASRs_and_Architectural_Drivers.md. Last updated 15 November 2026. DL-02, DL-13, DL-14 and DL-15 were closed later the same day. DL-16 was added after the PRD gained FR-15 to FR-17. DL-17 was added when the ADRs were aligned to the validated PRD. DL-18 to DL-41 were added on 27 November 2026 after the D4 decision meeting (plan.md v02, §4.1). DL-42 to DL-54 were added later the same day as corrections and gap resolutions; DL-21 and DL-39 are marked as superseded rather than rewritten. DL-55 (contract-first foundation) and DL-56 (team assignment) were added for plan.md v03.

**Status values:**

- **Decided:** approved by the team on 15 November 2026. No outside confirmation is needed.
- **Approved, awaiting confirmation:** approved by the team as a default. It depends on an answer from the PRD or the TAs. If the answer differs, the ADRs named under "Used by" are revisited.
- **Assumption:** the architecture relies on it, but only an outside party (TAs, Google, the PRD) can confirm it. The team approved it as a working assumption.
- **Open:** not decided. A recommendation is recorded.

**Approval record:** the approval of 15 November 2026 is reported by the submitting member. Per-member sign-off lines are in Section 11 of ASRs_and_Architectural_Drivers.md.

Rule from the ASR file: an unresolved Open Question is not approved behaviour. Every "Approved, awaiting confirmation" entry below is a default chosen by the team, not a PRD fact.

## Entries

### DL-01: Meaning of "local" in C-05 and V-08

- **Reading used:** "local" means the system's own database as opposed to Google's systems. It does not mean on-device storage.
- **Status:** Assumption (approved as the working reading).
- **Needs:** TA confirmation (Gate 3). The V-08 wording is now taken from the validated PRD. The critique is that an asynchronous OAuth token drop mid-edit could corrupt the database. The change is that local writes must run inside ACID-compliant transactions before the disconnection flow starts (FR-13-E5). C-05 adds that saved local edits must be transactionally preserved before disconnection or token-revocation cleanup, and that the exact database choice stays subject to feasibility. Both concern the system's own writes, which fits the reading above.
- **Question for the TAs:** see question 1 below.
- **If answered "on-device":** ADR-001 and ADR-002 are revisited, with Alternative C (server database plus offline client database and write queue) as the fallback.
- **Used by:** ADR-001, ADR-002.

### DL-02: Hosting

- **Requirements (fixed in ADR-001):** public HTTPS with a valid certificate, an always-on backend process, a persistent relational database with backups, secrets via environment or secret store.
- **Status:** Decided on 15 November 2026 (reported by the submitting member), type and provider.
- **Decision:** one Linux virtual machine in Azure, paid from the Azure for Students credit. Full detail is in ADR-001 (Hosting). Any plan that sleeps when idle is excluded, because the notification scheduler and sync engine would stop.
- **Checked on Microsoft Learn, 15 November 2026:** $100 in credits with no credit card, valid for one year, renewable each year for an active student, eligibility verified through the institution's email address. A public IP can carry a DNS name label that resolves as `label.region.cloudapp.azure.com`, so no domain purchase is needed.
- **Not checked:** whether the team's university email passes the verification, and how long $100 lasts for the chosen VM size. Confirm both at sign-up.
- **Fallbacks, in order:** any other always-on VPS the team can pay for, then the demo laptop behind a tunnel that gives a valid HTTPS address. The scheduler then runs only while the laptop is awake.
- **Used by:** ADR-001.

### DL-03: Database product

- **Constraint (ADR-002):** relational, multi-record ACID transactions, isolation, durability, persistent storage (ADR-001, D3).
- **Status:** Decided. PostgreSQL.
- **Reason:** row-level locking and selectable isolation levels fit transaction rules 3 and 8 in ADR-002 and the job leasing in ADR-001 rule 8. A mainstream server database is straightforward to defend against C-05. Backups are easier to arrange on most hosts.
- **Considered alternative:** SQLite in write-ahead-log mode on a persistent disk. Lowest effort for a single instance, but one writer at a time and only suitable on a host with durable local disk.
- **Accepted cost:** one more process to run, back up and secure.
- **Used by:** ADR-002.

### DL-04: Synchronization defaults (OQ-24, OQ-25)

- **Decided defaults:** Classroom every 15 minutes per Student, Calendar every 5 minutes per Student, refresh on app open with at least 60 seconds between refreshes, random jitter on all intervals. All are configuration values.
- **Status:** Decided. The values may change without a new ADR once OQ-24 and OQ-25 record the freshness requirement. If polling cannot meet that requirement, ADR-003 is revisited (push as an accelerator).
- **Basis:** Google's quotas, checked on 15 November 2026 on Google's own pages. Classroom: 1,200 per minute per user, 3,000 per minute per project, 4,000,000 per day (page shown as last updated 2026-09-03). Calendar: 600 per minute per user per project and 10,000 per minute per project. The Calendar figure of 1,000,000 per day is a billing threshold, not a rate limit. The expected load is far below all of them. The team still checks the figures in its own Cloud project before the demo, because limits can differ per project.
- **Used by:** ADR-003.

### DL-05: AI failure behaviour (new Open Question for the PRD)

- **Default:** the previous estimate is kept. With no estimate, the item shows "no estimate" and no calculated start-by date, and the Student may enter effort manually as an override. Requests retry with backoff up to three attempts, then wait for the next sync. New assignments show "estimating" until the first estimate arrives.
- **Status:** Approved, awaiting confirmation.
- **Needs:** add as a new Open Question in the PRD and have the TAs accept the "estimating" and "no estimate" states.
- **Used by:** ADR-003, ADR-002.

### DL-06: What may be sent to the AI service (new Open Question for the PRD)

- **Allow-list:** assignment title, truncated description, assignment type, course name, due date, the Student's skill rating for that course.
- **Never sent:** name, email, Google identifier, session data, submission content, grades, other assignments, tokens.
- **Status:** Approved, awaiting confirmation.
- **Needs:** PRD confirmation and an Open Question entry. The Student sees a notice that assignment details go to an AI service.
- **Used by:** ADR-006, ADR-003.

### DL-07: Permitted Calendar edits and conflict rule (OQ-26, OQ-29)

- **Default:** a Calendar time change is imported into the plan only if it fits the official deadline and the available hours. Otherwise the plan and the event are left as they are and the Student sees an explicit conflict to resolve (FR-12-E4, FR-12-AC6, FR-12-AC7, V-04). Deleting a block's event is also permitted as a team default: it marks the block "not on Calendar" and does not recreate it. A Student edit beats a calculated value. Between two valid Student edits the later wins and the earlier is logged and shown. During an outage, writes queue and retry and the plan stays usable (BR-13, FR-12-E1). If Calendar access is revoked, sync stops, the plan is kept, the Student is warned and existing blocks are left in place (FR-12-E5).
- **Status:** Approved, awaiting confirmation. Revised on 15 November 2026 to follow FR-12 and V-04 (DL-17). The team re-approves the revised wording.
- **Needs:** the OQ-29 answer, the rest of the OQ-26 answer (V-04 resolves it only in part), and whether blocks may live in a separate calendar created by the app.
- **Used by:** ADR-004.

### DL-08: Retention after Classroom revocation (OQ-27)

- **Default:** stored tokens are deleted at once. Imported assignments stay available, marked disconnected and stale, pending the Student's choice. The Student is prompted to keep or delete them (FR-13, BR-14) and is prompted again until they choose. Keeping them keeps everything attached to them. Deleting them removes the assignments with their overrides, subtasks, study sessions, timer state and notification schedules, after a warning and confirmation when they are used in the plan (FR-13-E3, FR-15-E7, FR-16-E7). Student-entered data that belongs to the Student rather than to an assignment (availability, skill ratings) is kept either way. An edit in progress commits or rolls back before the disconnection or deletion is finalized (FR-13-E5). The Student can also delete everything from the app. On reconnection, matched assignments are not duplicated and manual corrections and personal targets are kept (FR-13-E4).
- **Status:** Approved, awaiting confirmation. The keep-or-delete choice is a PRD requirement. The rest is a team default under OQ-27. Revised on 15 November 2026 (DL-17). The team re-approves the revised wording.
- **Needs:** the OQ-27 answer (what happens to imported data after disconnection, reconnection or a retain or delete choice).
- **Used by:** ADR-002, ADR-006.

### DL-09: Notification parameters and delivery failure (OQ-18, OQ-22, OQ-23)

- **Repeat cadence:** an unacknowledged Notification repeats once per day (BR-11, FR-11-E3). The time of day is a configuration value (OQ-18). The PRD sets no maximum number of repeats and no quiet hours.
- **Pause and stop rules (from the PRD):** "Got it" stops the active Notification on all devices and pauses new start Reminders for that assignment for 48 hours. After that, daily start Reminders resume only if the assignment is still unstarted and is neither Finished nor Submitted. A daily Reminder and an unacknowledged Notification for the same assignment combine into one per day. Start Reminders stop when the assignment is Started, Finished or Submitted (FR-11-E4 to E6, BR-18). Submission reminder timing is open (OQ-20).
- **Acknowledged on one device, other not synchronized (OQ-22):** the acknowledgment applies to both once synchronized, within the NFR-03 target (FR-11-E2).
- **Delivery failure default (OQ-23):** a push subscription reported as gone is removed, the device shows "notifications off" in the app, other devices continue, and an unacknowledged item stays visible in the app.
- **Status:** Approved, awaiting confirmation. Revised on 15 November 2026 to follow FR-11 and BR-18 (DL-17). The team re-approves the revised wording.
- **Needs:** the OQ-18, OQ-22 and OQ-23 answers, plus Gate 1.
- **Used by:** ADR-005.

### DL-10: Reading of NFR-03

- **Reading used:** "acknowledgment state consistent across phone and laptop within one minute" means the state shown in the app and the stop of repeats. It does not mean an already displayed tray notification disappears on every device, because Chrome does not allow silent pushes.
- **Status:** Assumption (approved as the working reading).
- **Needs:** TA confirmation.
- **Used by:** ADR-005.

### DL-11: No persistent client data cache in v1

- **Decision:** the PWA caches only its static application shell. Academic data is never stored persistently on a device.
- **Status:** Decided.
- **Reason:** less data on each device (ASR-10), less to build (PC-01), no ASR needs it.
- **Used by:** ADR-001, ADR-006.

### DL-12: OAuth consent screen and verification for the demo

- **Decision:** stay in Testing status, add the team and demo accounts as test users, and reconnect shortly before the demo. Do not publish to production for the course.
- **Status:** Decided.
- **Re-checked on 15 November 2026 against Google's primary pages:** the OAuth 2.0 page (https://developers.google.com/identity/protocols/oauth2, refresh token expiration section) says a project with an External user type and Testing status gets refresh tokens that expire in 7 days, unless the only scopes are within `openid`, email and profile. It also lists the other reasons a refresh token stops working, including six months of non-use, a limit of 100 live refresh tokens per Google Account per client ID, and `admin_policy_enforced` when an administrator restricts the app. The app verification overview (https://developers.google.com/identity/protocols/oauth2/production-readiness/overview) gives a hard cap of 100 test users for Testing status, and says Testing apps show a warning that the app is in testing, not the standard unverified-app screen.
- **Correction:** the earlier version of this entry cited a Google Health API page and a Google Groups reply, and said Testing apps show the unverified-app screen. The primary pages above replace those sources, and the unverified-app wording was wrong.
- **Not verified:** whether `calendar.app.created` and the three Classroom scopes are flagged as sensitive. The consent screen configuration in the Cloud console shows the flag. This only matters if the team ever publishes to production.
- **Used by:** ADR-004, ADR-006.

### DL-13: AI service provider (new)

- **Status:** Decided on 15 November 2026 (reported by the submitting member).
- **Decision:** the Gemini API from Google, paid tier, Flash-Lite class model. The model identifier is a configuration value. Detail and alternatives are in ADR-003, Decision 6.
- **Checked on Google's pricing page, 15 November 2026:** the page states that free-tier content is used to improve Google's products and paid-tier content is not. Paid Flash-Lite prices run from $0.10 to $0.30 per million input tokens and $0.40 to $2.50 per million output tokens. The page shows no date.
- **Rules:** real Student data goes only to the paid tier. The free tier is for synthetic data in development and tests. If billing cannot be enabled, the AI adapter runs disabled and the DL-05 failure behaviour applies to every item.
- **Not checked:** whether the team can create a Google Cloud billing account, the terms linked from the pricing page, and the current terms and prices of other providers (Anthropic, OpenAI).
- **Used by:** ADR-003, ADR-006.

### DL-14: Implementation language and frameworks (new)

- **Status:** Decided on 15 November 2026 (reported by the submitting member).
- **Decision:** TypeScript on Node.js for backend and client. Fastify for the HTTP layer. React with Vite as a single-page PWA with a hand-written service worker. `pg` with hand-written SQL and versioned SQL migrations. The `web-push` package. Google's official Node client libraries. Vitest with integration tests on a real PostgreSQL instance. dependency-cruiser in CI for the boundary check. Alternatives and reasons are in ADR-001 (Technology selection).
- **Not done:** the skill check this entry originally recommended. At least two members must be able to review TypeScript code. If fewer can, ADR-001 is revisited before coding starts.
- **Not checked:** package versions and maintenance status. Check at install time.
- **Used by:** ADR-001.

### DL-15: Boundary clarifications found while closing Step 2 (new)

- **Status:** Decided on 15 November 2026 (reported by the submitting member).
- **Why:** three gaps surfaced when the "Inferred" interface rows of step-2-architectural-decisions.md were turned into decisions.
- **Decisions:**
  1. **Dependency directions.** One table of which module may depend on which, enforced by a CI check (ADR-001).
  2. **Derived outputs follow the plan.** Calendar blocks and notification schedules store the plan version they were built from and are rebuilt when it differs. The planning core never calls them (ADR-002, rule 9). Without this, nothing in the ADRs said how a changed start-by date reached Calendar or notifications.
  3. **OAuth client interface.** Credential handling must call Google's token endpoints, which rule 2 of ADR-001 did not allow. It does so through a named interface that follows the adapter rule.
- **Used by:** ADR-001, ADR-002, ADR-004, ADR-005.

### DL-16: FR-15 to FR-17 added from the TA requirements (new)

- **Status:** Decided on 15 November 2026 (reported by the submitting member).
- **Why:** the PRD gained FR-15 (subtasks), FR-16 (study timer and recorded study time) and FR-17 (search, filter and sort), from TA-01 to TA-03 given at the Deliverable 2 demo.
- **Decision:** subtasks, study sessions and timer state are planning-core data stored in the server database. Timer duration is computed from stored timestamps (a start time plus pause and resume events), not from a client timer. Search, filter and sort are API reads and add no component. No new ASR, no new component, no new ADR.
- **Boundaries kept:** subtasks and recorded study time never change Started, Finished or Submitted status, effort or start-by dates (BR-20, BR-21, OQ-40). They are never sent to the AI service, so the allow-list in DL-06 is unchanged. Devices keep no academic data (DL-11).
- **Related open items:** OQ-37 (subtask limits) and OQ-41 (whether the NFR-01 three-second target applies to search and filter results).
- **Used by:** ADR-002, architecture.md, step-2-architectural-decisions.md, ASRs_and_Architectural_Drivers.md, AGENTS.md.

### DL-17: Alignment of the ADRs to the validated PRD (new)

- **Status:** Drafted on 15 November 2026 from `Final_Validated_PRD.md`. Re-approved 27 November 2026 (DL-25).
- **Why:** a comparison of the ADRs, the decision log, the ASR file, architecture.md and the decisions file with the validated PRD found mismatches. The PRD governs.
- **Decisions:**
  1. **Revocation (ADR-006, ADR-002, DL-08).** The Student chooses to keep or delete imported assignments, and they stay available and pending until the choice is made (FR-13, BR-14). The earlier default kept everything and offered only a delete-all option.
  2. **Calendar edits (ADR-004, DL-07).** A Calendar time change that breaks the official deadline or the available hours becomes a conflict for the Student, not an accepted override (FR-12-E4, V-04). On Calendar revocation, existing blocks are left in place (FR-12-E5).
  3. **Notifications (ADR-005, DL-09).** Repeats are daily. "Got it" pauses new start Reminders for 48 hours. A Reminder and an unacknowledged Notification combine into one per assignment per day. Start Reminders stop when the assignment is Started, Finished or Submitted (FR-11, BR-11, BR-18).
  4. **Deadline-change Notifications (ADR-003, ADR-002).** A Classroom deadline change creates a stored notice in the same transaction as the import batch. The latest deadline is applied and affected start-by dates are recalculated once; if several changes arrive before processing, the Student is notified once for that assignment (FR-01-E2, FR-01-AC2, FR-01-AC3). The notice is a Notification sent to the Student’s devices (RG-50, BR-19), subject to RG-52’s one-Notification-per-assignment-per-day limit. OQ-34 applies only to course-balance notices and urgent start-by warnings, whose device delivery remains open.
  5. **Open Question numbers.** OQ-18 is the time of day for daily reminders. OQ-22 is a device that acknowledged while the other has not synchronized. "Maximum repeats" and "quiet hours" are removed because the PRD has neither. OQ-26 is partially resolved by V-04.
  6. **Housekeeping.** The sync engine, not the Calendar adapter, persists the block to event mapping (decisions file corrected). ADR-003 no longer lists DL-04 as awaiting approval. The V-08 wording is recorded in DL-01.
- **Not changed:** ADR-001, the diagram, the ASR list, the tensions and the traceability table.
- **Used by:** ADR-002 to ADR-006, architecture.md, step-2-architectural-decisions.md, ASRs_and_Architectural_Drivers.md.

### DL-18: Authoritative PRD (D4)

- **Status:** Decided by the team on 27 November 2026 (D4 decision meeting; plan.md D-01).
- **Decision:** `PRD.md` is the authoritative PRD. `Final_Validated_PRD.md` and `Draft prd.md` are superseded.
- **Basis:** `PRD.md` contains all of `Final_Validated_PRD.md` plus FR-15 to FR-17 and Section 7a; only five header and trace lines differ. D4 and AGENTS.md name `PRD.md`.
- **Alternatives considered:** keep `Final_Validated_PRD.md`, which lacks FR-15 to FR-17; `Draft prd.md`, an earlier draft.
- **Note:** DL-17, the ASR file §11 and step-2-architectural-decisions.md cite `Final_Validated_PRD.md`. Those citations are unchanged. FR-01 to FR-14 read the same in both files.
- **Used by:** all project documents.

### DL-19: D4 committed scope, reserve and deferrals (OQ-30, OQ-31, OQ-33)

- **Status:** Decided by the team on 27 November 2026 (plan.md D-02).
- **Decision:**
  - **Committed (11 slices):** S-01, S-02, S-03, S-04, S-07, S-08, S-09, S-10, S-14, S-15, S-16.
  - **Reserve (one card):** S-19, recurring weekly availability (FR-03-AC6).
  - **Deferred and not built:** S-05, S-06, S-11, S-12, S-13, S-17, S-18.
  - No requirement is deleted. PRD.md §11 and the notes under the affected FR headings record the delivery status.
  - D-15 (Calendar block times) and D-16 (notification details) are not decided, because S-17 and S-18 are not built.
- **Alternatives considered:** a 5-slice "Lean" scope; a 10-slice "Medium" scope; a larger scope including Classroom import and Gemini estimation.
- **Reason:** the team requires at least 11 complete slices. These 11 are the plan.md slices that need no external service (C-04, RG-31, RG-32).
- **Used by:** plan.md, PRD.md (§8 OQ-30, OQ-31, OQ-33; §11), AGENTS.md §12.

### DL-20: Feasibility checks skipped for D4

- **Status:** Decided by the team on 27 November 2026.
- **Decision:** the Gemini check (F-AI), the Classroom check (Gate 2, called F2 in plan.md) and the push check (Gate 1, called F1) are not run, because those features are deferred (DL-19). The demo uses labelled sample data. FR-01 and FR-04's AI estimation are therefore not delivered, and the final report must say so plainly.
- **Alternatives considered:** run F-AI and F2 on 27 November, to keep S-05 or S-11 available as reserves.
- **Note:** the Gates table below is unchanged; Gates 1 to 3 stay "Not run" or "Not asked".
- **Used by:** plan.md, the final report.

### DL-21: TypeScript stack kept; peer review of every slice

- **Status:** Decided by the team on 27 November 2026 (plan.md D-21). **Superseded by DL-42 on 27 November 2026** (the skill check is now required before E-01).
- **Decision:** the DL-14 stack stays. Every slice is reviewed by a teammate other than its author, who runs the checks and can explain the change at the demo. The result of the TypeScript skill check is recorded as a fact when known; it does not block anything.
- **Alternatives considered:** revisit ADR-001 before coding if fewer than two members can review TypeScript (DL-14; ADR-001 revisit condition); change the stack.
- **Resolved:** DL-42 aligns this with DL-14 and ADR-001 (Trade-offs, Revisit conditions): the skill check is done before coding starts.
- **Used by:** plan.md, the evidence files.

### DL-22: Code sharing and branches

- **Status:** Decided by the team on 27 November 2026 (plan.md D-25).
- **Decision:** code is shared through a private GitHub repository. Each slice has its own branch. Branches are merged one at a time. The author never reviews their own slice.
- **Alternatives considered:** one machine with Git worktrees and at most two agents; working in sequence with no shared repository.
- **Note:** D4 allows Git or GitHub "at the group's own responsibility".
- **Used by:** plan.md §11.

### DL-23: PostgreSQL in Docker Desktop

- **Status:** Decided by the team on 27 November 2026 (plan.md D-26).
- **Decision:** PostgreSQL runs in Docker Desktop, using Docker Compose (architecture.md §9.5).
- **Alternatives considered:** installing PostgreSQL directly on each laptop.
- **Note:** on 27 November, Docker was not found on at least one team laptop. Installing it is part of enabling work E-00.
- **Used by:** plan.md (E-00, E-01), README.md.

### DL-24: Local execution only

- **Status:** Decided by the team on 27 November 2026 (plan.md D-11).
- **Decision:** the product runs locally only: no Azure VM and no tunnel.
- **Alternatives considered:** the Azure VM (DL-02); the demo laptop behind a tunnel (DL-02 fallback).
- **Consequence:** there is no public HTTPS address. The features that need one (Web Push, S-17) are deferred.
- **D4 precedence (DL-54):** for D4 this entry takes precedence over DL-02, ADR-001 (Hosting, D1, D2), architecture.md §9.5 and AGENTS.md §6 rule 8 and §7. Their wording is unchanged.
- **Used by:** plan.md, README.md.

### DL-25: DL-17 re-approved

- **Status:** Decided by the team on 27 November 2026 (plan.md D-18).
- **Decision:** DL-17 is re-approved as written, except that behaviour belonging to deferred slices is not built. The team will sign the four member sign-off lines in ASR file §11.
- **Alternatives considered:** amend DL-17 further; leave it awaiting approval.
- **Note:** this entry supersedes the "awaiting team approval" status of DL-17. The DL-17 status lines in this log, ADR-002 to ADR-006, architecture.md and AGENTS.md §11 now read "re-approved 27 November 2026 (DL-25)".
- **Used by:** ADR-002 to ADR-006, architecture.md, AGENTS.md.

### DL-26: Proceed without TA answers

- **Status:** Decided by the team on 27 November 2026 (plan.md D-20).
- **Decision:** the team does not wait for TA answers on DL-01, DL-05, DL-06 and DL-10. It proceeds with the team defaults already recorded and treats them as assumptions (plan.md A-03). A later TA answer is handled as a change request.
- **Alternatives considered:** wait for the TA answers before building the affected slices.
- **Used by:** plan.md §3.

### DL-27: Demo Student session (temporary departure from ADR-006 Decision 1)

- **Status:** Decided by the team on 27 November 2026 (plan.md D-07).
- **Decision:** the early slices use one seeded demo Student. The Student gets a real application session, issued by the API Layer through its sessions-only Data Access Layer path. This is a temporary departure from ADR-006 Decision 1 (Google sign-in).
- **Alternatives considered:** Google sign-in first (ADR-006 Decision 1).
- **Reason:** Google sign-in belongs with S-11, which is deferred (DL-19).
- **Resolved:** the sessions-only exposure is set in DL-44.
- **D4 precedence (DL-54):** for D4 this entry takes precedence over ADR-006 Decision 1. ADR-006's wording is unchanged.
- **Used by:** plan.md (E-02).

### DL-28: Sample data

- **Status:** Decided by the team on 27 November 2026 (plan.md D-08).
- **Decision:** a script loads sample data directly into the database: at least 50 assignments across 5 courses, including undated assignments and mixed statuses. The UI labels it "sample data".
- **Alternatives considered:** the Classroom Adapter returns the sample records, which would exercise the real Sync Engine import path.
- **Note:** sample data does not satisfy FR-01.
- **Resolved:** the script's location and command are set in DL-47.
- **Used by:** plan.md (E-04), README.md.

### DL-29: Repository layout (AGENTS.md §8.1, Open Questions 1 and 2)

- **Status:** Decided by the team on 27 November 2026 (plan.md D-09).
- **Decision:** separate top-level `client/` and `server/` folders. All eleven backend modules and interfaces have their own folders under `server/`.
- **Alternatives considered:** a unified workspace; nesting Push Gateway Interface and OAuth Client Interface inside Notification Scheduler and Credential Handling.
- **Resolved:** Open Question 3 in DL-44; module folder names and the migration filename convention in DL-45.
- **Used by:** AGENTS.md §8.2, plan.md (E-01).

### DL-30: Local boundary check

- **Status:** Decided by the team on 27 November 2026 (plan.md D-10).
- **Decision:** dependency-cruiser runs as a local command. It must pass before any slice branch is merged, and its output is pasted into the Gate 3 evidence.
- **Alternatives considered:** a Git pre-commit hook; GitHub Actions CI.
- **Resolved:** the command name and location are set in DL-46.
- **D4 precedence (DL-54):** for D4 this entry takes precedence over the CI wording in ADR-001, architecture.md §6.2 and AGENTS.md §4.2 and §4.5. The allow-list, default-deny and fail-on-forbidden rules still apply. Their wording is unchanged.
- **Used by:** AGENTS.md §8.2, evidence/Quality-Gates-Checklist.md.

### DL-31: ADR-001 module list amended

- **Status:** Decided by the team on 27 November 2026 (plan.md D-19). Applied the same day.
- **Decision:** the "Backend" bullet in ADR-001's Decision section now lists all eleven modules and interfaces, adding Push Gateway Interface and OAuth Client Interface.
- **Alternatives considered:** leave ADR-001 as it was and add only a decision-log note.
- **Reason:** AGENTS.md §2 ranks ADRs above architecture.md, so a 9-module list could mislead a coding agent.
- **Note:** on 27 November 2026 the two interface rows were also added to ADR-001's dependency table, matching AGENTS.md §4.1.
- **Used by:** ADR-001, AGENTS.md §3.

### DL-32: Start-by date rule (OQ-02): R1-B with conventions C-0

- **Status:** Decided by the team on 27 November 2026 (plan.md D-03).
- **Rule (R1-B, shared hours, latest deadline planned first):**
  - Sort the Student's assignments by applicable deadline, latest first.
  - For each one, fill its effective effort backwards into the hours still free on usable days before its deadline.
  - Its start-by date is the earliest day that received hours.
  - If the free hours before the deadline cannot cover the effort, no start-by date is shown and the shortage is shown instead (BR-04).
- **Conventions C-0:**
  - Today counts as a planning day; the deadline day does not.
  - Hours are in 0.5 h steps.
  - Effective effort is the Student's override, otherwise the estimate. D4 has no AI estimates (DL-35), so an assignment without entered effort shows "no estimate" and no start-by date (DL-05).
  - The applicable deadline follows DL-37.
- **Worked example 1** (today = Monday): A needs 4 h and is due Thursday. B needs 4 h and is due Friday. Availability is 2 h on each of Monday to Thursday.
  - B goes first: Thursday 2 + Wednesday 2 → B starts Wednesday.
  - Then A: Wednesday has no hours left, so Tuesday 2 + Monday 2 → A starts Monday.
- **Worked example 2:** as example 1, but A needs 6 h. A gets Monday 2 + Tuesday 2 = 4 h → no start-by date for A, short by 2 h.
- **Alternatives considered:** R1-A, which fills each assignment backwards on its own. It is simpler, but it double-books hours when deadlines overlap. In example 1 it would start A on Tuesday and B on Wednesday, and both would count Wednesday's hours.
- **Known trade-off** (disclosed when the rule was approved): when hours are short, the shortage appears on the earlier-deadline assignment. The rule allocates time; it does not rank assignments.
- **Further details:** DL-48 covers blank days, equal deadlines, which assignments take part, and deadlines already passed. DL-50 covers remaining-hours reports.
- **Used by:** S-03, S-04, S-07, S-09, S-10.

### DL-33: Allocation rule (OQ-03, OQ-04): R2-A

- **Status:** Decided by the team on 27 November 2026 (plan.md D-04).
- **Rule:** the suggested allocation is R1-B's daily split for each assignment. The Student's edits are stored as overrides (ADR-002, rule 5). When hours are short, the suggestions are neutral facts only and are never ranked (BR-05, N-01).
- **Worked example** (from DL-32 example 2):
  - "B: Wednesday 2 h, Thursday 2 h."
  - "A: Monday 2 h, Tuesday 2 h — short by 2 h before Thursday."
  - Suggestions: "Add 2 h of availability between Monday and Wednesday" or "Review the effort entered for A". Neither is placed above the other.
- **Alternatives considered:** R2-B, which splits each day's hours in proportion to remaining effort. In DL-32 example 1, A would get only 3 of its 4 h by Wednesday and show a false 1 h shortage.
- **Further details:** DL-51 covers how edits work.
- **Used by:** S-04.

### DL-34: Neglect rule (OQ-08 to OQ-10): R3-A, activity and the 3-day advisory

- **Status:** Decided by the team on 27 November 2026 (plan.md D-05).
- **Rule (R3-A):** a course gets a possible-imbalance notice when all three of these hold:
  1. it has an unfinished, unsubmitted assignment whose start-by date is within the next 3 days or has passed;
  2. none of its assignments has had any activity in the last 7 days;
  3. at least one other course has had activity in that period.

  The notice says that progress is unknown (BR-03, BR-10).
- **Activity** means the Student marks an assignment Already Started or Finished (S-08), or enters a progress or remaining-hours report (S-07). Study timer sessions are not activity (OQ-40). S-09 therefore depends on S-07 and S-08.
- **3-day advisory:** shown when 3 or more full days have passed with no activity. Boundary cases: 2 days → no; 3 days → yes; 4 days → yes.
  - The FR-08 requirement text says "over three consecutive days", while FR-08-AC2 and AC6 say "after three". The wording is ambiguous. "3 or more full days" is the team's approved interpretation. The FR-08 requirement text is unchanged.
- **Worked example:** Math has a start-by date in 2 days and its last activity was 9 days ago. Physics had activity yesterday. English has nothing upcoming. → Only Math gets a notice, for example "No recent progress logged for Math — you may not have recorded it."
- **Alternatives considered:** R3-B (planned share of hours compared with reported share); counting timer sessions as activity; showing the advisory only after more than 3 days.
- **Further details:** DL-52 covers how the 3-day count works.
- **Used by:** S-09.

### DL-35: AI estimation not built; effort entered manually

- **Status:** Decided by the team on 27 November 2026 (plan.md D-06, D-14).
- **Decision:** AI estimation is not built for D4. Effort is entered manually (the DL-05 default). Gemini is not used, and no student data is sent anywhere.
- **Alternatives considered:** the Gemini paid tier (DL-13); the free tier with synthetic data; a local rule-based estimator (ADR-006, Alternative 3C, which would change the requirement).
- **Consequence:** FR-04's estimation, the "unreliable" flag and re-estimation are not delivered (PRD.md §11).
- **D4 precedence (DL-54):** for D4 this entry takes precedence over DL-13, ADR-003 Decision 6 and ADR-006 Decision 7. Their wording is unchanged.
- **Used by:** plan.md (S-03), PRD.md §11, AGENTS.md §12.

### DL-36: Blank availability is unknown; V-01 wording; OQ-01

- **Status:** Decided by the team on 27 November 2026 (plan.md D-12).
- **Decision:**
  - Blank availability means "unknown", never default hours (BR-17).
  - The V-01 row in PRD.md §7 is corrected to match.
  - OQ-01 is resolved: availability is entered day by day. The only way to prefill days is S-19's Student-confirmed recurring baseline, and baseline days are labelled as such.
- **Alternatives considered:** treat unentered future days as default study hours (the former V-01 wording).
- **Note:** BR-17 and FR-03-E1 place the baseline beyond the first seven days. DL-53 covers the baseline details.
- **Used by:** S-01, S-03, S-19; PRD.md §7 and §8.

### DL-37: Which deadline planning uses

- **Status:** Decided by the team on 27 November 2026 (plan.md D-17).
- **Decision:** planning uses the official deadline. When the assignment is undated, it uses the Student-entered deadline. There is no separate pacing target in the committed scope.
- **Alternatives considered:** plan toward the personal pacing target; use whichever of the two is earlier.
- **Note:** FR-02's pacing-target behaviour (AC3, AC6) occurs only when an official deadline arrives through Classroom sync, which belongs to deferred S-12.
- **Used by:** S-03, S-10.

### DL-38: Progress report content (FR-07)

- **Status:** Decided by the team on 27 November 2026 (plan.md D-22).
- **Decision:** a progress report stores remaining hours (0 or more, in steps of 0.5, maximum 200) with a timestamp. The latest report replaces older ones. A remaining value of 0 does not change the status; the Student marks Finished through S-08.
- **Alternatives considered:** also record percent complete (RG-16 says percent done is not remaining effort); treat 0 remaining as Finished automatically.
- **Further details:** DL-50 covers how a report feeds R1-B.
- **Used by:** S-07, S-09.

### DL-39: Zero-length study timer sessions (FR-16)

- **Status:** Decided by the team on 27 November 2026 (plan.md D-23). **Superseded by DL-43 on 27 November 2026** (follow FR-16-AC4).
- **Decision:** stopping a timer session at 0 elapsed seconds discards it with a message. Any longer session is saved. Only one timer can run at a time (FR-16-AC8).
- **Alternatives considered:** save 0-second sessions.
- **Resolved:** superseded by DL-43, which follows FR-16-AC4 and saves every stopped session with its duration.
- **Used by:** S-15.

### DL-40: Student-entered deadline dates (FR-02)

- **Status:** Decided by the team on 27 November 2026 (plan.md D-24).
- **Decision:** a Student-entered deadline may be today or later. Yesterday or earlier is rejected with a message. A deadline of today leaves no planning days, so the result is a shortage.
- **Alternatives considered:** allow past dates; reject today.
- **Used by:** S-10.

### DL-41: Input limits

- **Status:** Decided by the team on 27 November 2026 (plan.md D-13).
- **Decision:**
  - **Availability:** 0 to 24 hours in steps of 0.5; 0 is allowed and differs from blank.
  - **Time zone:** fixed at Asia/Karachi; a day starts at midnight; "next 7 days" means today plus 6.
  - **Course ratings:** 1 to 5, labelled Very Low, Low, Moderate, High and Very High Confidence.
  - **Subtask title:** 1 to 200 characters after trimming whitespace.
  - **FR-17 date ranges:** include both end dates; a range that ends before it starts is rejected.
- **Alternatives considered:** 1-hour steps; the browser's time zone; date ranges that exclude their end dates; no limit on subtask titles.
- **Used by:** S-01, S-02, S-14, S-16.

**About DL-44 to DL-53:** the team approved the gap resolutions NG-1 to NG-10 on 27 November 2026 and asked the AI assistant to fill in their wording. The wording below was drafted by the assistant from the project documents. The team reviews it at the next plan version, and any change is recorded as a new entry.

### DL-42: TypeScript skill check before E-01 (revises DL-21)

- **Status:** Decided by the team on 27 November 2026 (plan.md D-21, corrected). Supersedes the "does not block" sentence of DL-21.
- **Decision:** the TypeScript skill check (DL-14) must be done before enabling work E-01 starts. No member's result is recorded until the team provides it. The peer-review rule of DL-21 stays: every slice is reviewed by a teammate other than its author, who runs the checks.
- **Alternatives considered:** a skill check that does not block (DL-21 as first recorded).
- **Note:** this matches DL-14 and ADR-001 (Trade-offs: "done before coding starts"; Revisit conditions). If fewer than two members can review TypeScript, the ADR-001 revisit condition applies.
- **Used by:** plan.md (E-01).

### DL-43: Every stopped study session is saved (revises DL-39)

- **Status:** Decided by the team on 27 November 2026 (plan.md D-23, corrected). Supersedes DL-39.
- **Decision:** follow FR-16-AC4. Every stopped session is saved with its duration, including 0 seconds. Only one timer can run at a time (FR-16-AC8).
- **Alternatives considered:** discard 0-second sessions with a message (DL-39 as first recorded).
- **Used by:** S-15.

### DL-44: Restricted interfaces (AGENTS.md §8.1, Open Question 3; plan.md NG-1)

- **Status:** Approved by the team on 27 November 2026. Wording drafted by the AI assistant at the team's request.
- **Decision:**
  - Each module keeps one public `index.ts`.
  - The Data Access Layer's `index.ts` exports a named group `sessions` (issue, validate, expire). The API Layer imports only `sessions` from the Data Access Layer.
  - Planning Core's `index.ts` exports a named group `readOnly` (upcoming start-by items, plan versions, assignment status) for Notification Scheduler. That module is deferred, so `readOnly` is unused in D4.
  - dependency-cruiser cannot see which names are imported, so the Gate 3 review checks that every API Layer import from the Data Access Layer uses only `sessions` (AGENTS.md §4.3 and §4.4 already require this review).
- **Alternatives considered:** a second entry file for each restricted interface (AGENTS.md §8.1 keeps one `index.ts` per module); an ESLint rule (a new tool category, which needs approval under AGENTS.md §9).
- **Used by:** E-01, E-02, AGENTS.md §8.2.

### DL-45: Module folders and migration naming (plan.md NG-2)

- **Status:** Approved by the team on 27 November 2026. Wording drafted by the AI assistant at the team's request.
- **Decision:**
  - **Client:** `client/`.
  - **Backend modules,** under `server/src/`: `api-layer`, `planning-core`, `sync-engine`, `classroom-adapter`, `calendar-adapter`, `ai-adapter`, `notification-scheduler`, `credential-handling`, `data-access`, `push-gateway`, `oauth-client`.
  - **Migrations:** `server/src/data-access/migrations/NNNN_short_name.sql`, numbered in order with four digits. E-03 gives each slice its own migration number in advance. A migration that has been applied is never edited; a change goes in a new migration.
- **Alternatives considered:** module folders directly under `server/`; migrations named by timestamp.
- **Used by:** E-01, E-03, AGENTS.md §8.2.

### DL-46: Boundary-check command (plan.md NG-3)

- **Status:** Approved by the team on 27 November 2026. Wording drafted by the AI assistant at the team's request.
- **Decision:** the boundary check is `npm run check:boundaries`, run in `server/`. Its configuration file is `server/.dependency-cruiser.cjs`, holding the allow-list from AGENTS.md §4.1. The command is documented in README.md and AGENTS.md §8.2, and its output is pasted into the Gate 3 evidence (DL-30).
- **Alternatives considered:** other script names (for example `npm run lint:deps`).
- **Used by:** E-01, every slice's Gate 3.

### DL-47: Sample-data script (plan.md NG-4)

- **Status:** Approved by the team on 27 November 2026. Wording drafted by the AI assistant at the team's request.
- **Decision:**
  - The script lives inside the Data Access Layer at `server/src/data-access/seed/` and runs with `npm run seed:sample` in `server/`.
  - It can be re-run safely, reloading the sample rows for the demo Student.
  - It is not a migration.
  - How rows are marked as sample data, so that the UI can label them (DL-28), is part of the E-03 data model.
- **Alternatives considered:** sample rows inside a migration, which would mix demo data into the schema history; a script outside the Data Access Layer, which would break AGENTS.md §6 rule 11.
- **Used by:** E-04, README.md.

### DL-48: Start-by rule details (plan.md NG-5)

- **Status:** Approved by the team on 27 November 2026. Wording drafted by the AI assistant at the team's request. Extends DL-32.
- **Decision:**
  - **Blank days:** a blank (unknown) day gives no hours, and R1-B plans from the entered days.
    - If the entered hours cover the effort, show the start-by date and prompt the Student to fill in the blank days.
    - If they don't, and any day before the deadline is blank, show "cannot be determined yet" and name the blank days (RG-42, RG-45, FR-06-AC1).
    - If every day is entered, show the shortage (FR-05-AC3).
  - **Equal deadlines:** ordered by stable assignment ID. This is a technical order only. It is not a priority and is not shown.
  - **Which assignments take part:** only those with an applicable deadline (DL-37), effective effort above 0, and neither Finished nor Submitted.
  - **Deadlines already passed:** a deadline before today gives no start-by date, the label "deadline passed", and takes no hours. A deadline of today leaves no planning days, so the result is a shortage (DL-40).
- **Worked example** (today = Monday): C needs 3 h, due Thursday. Availability is Monday 1, Tuesday blank, Wednesday 1.
  - → "Cannot be determined yet — enter availability for Tuesday."
  - With Tuesday entered as 0 → short by 1 h.
  - If C needs 2 h and Tuesday is blank → start-by Monday, plus a prompt to fill in Tuesday.
- **Used by:** S-03, and through it S-04, S-07, S-09, S-10.

### DL-49: Manual effort entry limits (plan.md NG-6)

- **Status:** Approved by the team on 27 November 2026. Wording drafted by the AI assistant at the team's request.
- **Decision:** manual effort is 0.5 to 200 hours in steps of 0.5, matching the DL-38 maximum. 0 is rejected with a message. A blank means "no estimate" (DL-05). Boundary cases: 0 rejected, 0.5 accepted, 200 accepted, 200.5 rejected.
- **Alternatives considered:** allow 0; no maximum.
- **Used by:** S-03.

### DL-50: Remaining hours in planning (plan.md NG-7)

- **Status:** Approved by the team on 27 November 2026. Wording drafted by the AI assistant at the team's request. Extends conventions C-0 in DL-32.
- **Decision:**
  - The hours R1-B uses for an assignment come from whichever was saved most recently: the Student's effort entry or the latest remaining-hours report (FR-07, FR-07-E2, RG-51).
  - A report of 0 means the assignment takes no hours and gets no start-by date. Its status does not change (DL-38).
- **Worked example:** effort entered as 6 h on Monday; 4 h remaining reported on Tuesday → planning uses 4 h. The effort is then edited to 5 h on Wednesday → planning uses 5 h.
- **Alternatives considered:** a report always wins over a later effort edit.
- **Used by:** S-07, S-03.

### DL-51: Allocation edits (plan.md NG-8)

- **Status:** Approved by the team on 27 November 2026. Wording drafted by the AI assistant at the team's request. Extends DL-33.
- **Decision:**
  - Editing an assignment's hours on one day stores an override for that assignment and day (ADR-002 rule 5). Overrides are placed first and count towards that assignment's effort. R1-B then fills the remaining effort, and the other assignments, around them.
  - An edit larger than that day's availability minus the other overrides on that day is rejected with a message, so that no hours are invented (N-03).
  - If availability later drops below the existing overrides, they are kept and the day is flagged "over-allocated". They are never dropped silently (FR-06-E3, RG-51).
- **Worked example** (DL-32 example 2): the Student sets A to 2 h on Wednesday.
  - B, the latest deadline, then gets Thursday 2 + Tuesday 2 → B starts Tuesday.
  - A gets Wednesday 2 (the override) + Monday 2 = 4 of 6 h → no start-by date, short by 2 h.
  - Setting A to 3 h on Wednesday is rejected, because Wednesday has only 2 h.
- **Alternatives considered:** let an edit exceed availability with a warning; re-run R1-B without keeping the edit.
- **Used by:** S-04.

### DL-52: 3-day advisory counting (plan.md NG-9)

- **Status:** Approved by the team on 27 November 2026. Wording drafted by the AI assistant at the team's request. Extends DL-34.
- **Decision:**
  - Days without activity = today's date minus the later of two dates: the start-by date, or the date of the last activity. Days are counted in the Asia/Karachi time zone (DL-41).
  - The advisory is shown once the start-by date has passed and the count is 3 or more.
  - Any activity, as DL-34 defines it, restarts the count.
- **Worked example:** start-by date Monday and no activity → Wednesday counts 2 (no advisory); Thursday counts 3 (advisory); Friday counts 4 (advisory).
- **Alternatives considered:** count from the start-by date only, ignoring later activity.
- **Used by:** S-09.

### DL-53: Recurring weekly baseline (plan.md NG-10)

- **Status:** Approved by the team on 27 November 2026. Wording drafted by the AI assistant at the team's request. Extends DL-36.
- **Decision:**
  - The baseline holds one value per weekday, Monday to Sunday, each 0 to 24 hours in steps of 0.5, or blank. A blank weekday stays unknown.
  - It applies only to days from today + 7 onward that have no individual entry (BR-17, FR-03-E1, FR-03-AC6).
  - It is saved only after the Student explicitly confirms it with a "Use this weekly pattern" action (FR-03: "explicitly Student-confirmed"). Days filled from it are labelled "baseline".
  - Clearing the baseline returns those days to unknown.
- **Worked example:** the baseline says Monday 2 h and leaves Tuesday blank.
  - A Monday at today + 7 with no entry → 2 h, labelled "baseline".
  - A Tuesday at today + 8 with no entry → unknown.
  - Any day within today to today + 6 with no entry → unknown.
- **Alternatives considered:** one value for every day of the week; letting the baseline also fill the first seven days.
- **Used by:** S-19.

### DL-54: D4 precedence over original document wording

- **Status:** Decided by the team on 27 November 2026 (resolves plan.md CF-1, CF-2, CF-3, CF-7, CF-10).
- **Decision:** for D4 only, and as an exception to the precedence order in AGENTS.md §2, these entries take precedence. The original wording stays in the named documents.
  - DL-27 (demo Student session) over ADR-006 Decision 1.
  - DL-24 (local execution) over DL-02, ADR-001 (Hosting, D1, D2), architecture.md §9.5, and AGENTS.md §6 rule 8 and §7.
  - DL-30 and DL-46 (local boundary check) over the CI wording in ADR-001, architecture.md §6.2, and AGENTS.md §4.2 and §4.5. The allow-list, default-deny and fail-on-forbidden rules still apply.
  - DL-19 and AGENTS.md §12 (deferred slices not built) over AGENTS.md §3.1: all eleven module folders exist with their public `index.ts`, and modules that serve only deferred slices contain no deferred behaviour.
  - DL-35 (no AI estimation) over DL-13, ADR-003 Decision 6 and ADR-006 Decision 7.
- **Also resolved the same day:**
  - CF-4 by DL-42;
  - CF-5 by DL-43;
  - CF-6 by DL-34, which records the team's interpretation;
  - CF-8 by the DL-17 status updates noted in DL-25;
  - CF-9 by the two new rows in ADR-001's dependency table.
- **Used by:** AGENTS.md §2 and §12, plan.md §4.3.

### DL-55: Contract-first foundation and merge-friendly file layout

- **Status:** Decided by the team on 27 November 2026 (plan.md v03). Proposed by the AI assistant; the team asked for it to be applied.
- **Decision:** the foundation (E-01 to E-05) defines a shared **contract** before any feature slice starts, so that slices can be built in parallel without waiting for each other:
  - **Tables first:** E-03 defines, and a foundation migration creates, every table and column the committed slices need. That covers availability, ratings, status, progress reports, manual deadlines, allocation overrides, subtasks, timer sessions and the baseline. A slice adds a migration only if it needs something the contract missed, using a number reserved in E-03. This refines DL-45.
  - **Sample data fills every field** (E-04): availability with some blank days, ratings, every status, and progress reports with dates. Slices can then be built and tested before the slices that would normally create that data.
  - **Placeholder recalculation:** Planning Core gets one placeholder recalculation function, named in E-03. Slices that trigger recalculation (S-07, S-10) call it. S-03 replaces the placeholder with the real R1-B calculation.
  - **Shared files prepared in advance** (E-01, E-05): the API route list, the client navigation, the Planning Core `index.ts` exports and the assignment detail-page slots each have **one marked line or slot per slice**. Each slice fills in only its own.
  - **One folder per slice:** `server/src/<module>/<slice-name>/` and `client/src/features/<slice-name>/`. These are folders inside existing modules, not new modules (AGENTS.md §3.1).
  - **All packages installed in E-01.** Slices do not change `package.json`.
  - **Merging:** one GitHub pull request per slice, one approval from the assigned reviewer, then squash and merge. Pull `main` before starting each slice.
- **What still depends on what:**
  - every slice needs the foundation;
  - S-07 and S-04 follow S-03 (same person);
  - the reserve S-19 follows S-01.
  - The checks in S-09 and S-10 that need real start-by dates are re-run in integration check **I-1**, after S-03 is merged. Those two slices count as accepted only after I-1.
- **Alternatives considered:** the earlier track plan, in which slices waited on other people's slices (plan.md v02 §9).
- **Cost:** about 1–2 extra hours of foundation work on Friday, for the complete contract and the prepared shared files.
- **Used by:** plan.md v03 §6, §8, §9, §11; slices/.

### DL-56: Team assignment

- **Status:** Decided by the team on 27 November 2026. The team asked for the work to be divided among Ali, Rehan, Subhan and Ahmad. The mapping was drafted by the AI assistant and can be swapped by the team.
- **Decision:**
  - **Ali:** E-01; S-03 → S-07 → S-04; Gate 5 on 30 November.
  - **Rehan:** E-00 repository; E-03; S-01, S-14, S-09; NFR measurements and README on 30 November.
  - **Subhan:** E-04; S-15, S-10; reserve S-19; report, CCP, contribution log and sign-offs on 30 November.
  - **Ahmad:** E-02, E-05; S-02, S-16, S-08; packaging and demo rehearsal on 30 November.
- **Peer review rotation:** Rehan reviews Ali's work, Subhan reviews Rehan's, Ahmad reviews Subhan's, and Ali reviews Ahmad's. Nobody reviews their own work (DL-22).
- **Alternatives considered:** the plan.md v02 tracks A to D, which had more waiting between people.
- **Used by:** plan.md v03 §9, slices/README.md, each person's MY-TASKS.md.

### DL-57: Version-checked writes (api-contract.md §1.1)

- **Status:** Approved by the group lead on 28 November 2026, closing the item raised in the E-03 peer review (Workflow Evidence Log row 3). Wording drafted by the AI assistant.
- **Decision:** assignments, allocation overrides, subtasks and timer sessions carry a `version`. Every read returns it; every write sends the version the client last read; a stale version changes nothing and returns `409 VERSION_CONFLICT` with the current representation. Server bookkeeping (a remaining-hours report touching `last_activity_at`) does not bump it.
- **Used by:** S-04, S-08, S-10, S-14, S-15.

### DL-58: How sample data is loaded (E-04)

- **Status:** Approved by the group lead on 28 November 2026. Extends DL-28 and DL-47. Wording drafted by the AI assistant.
- **Decision:**
  - `npm run seed:sample` reloads one Student's sample rows in a single transaction. It never deletes the Student row. It deletes only that Student's `is_sample` courses (the foreign keys remove their assignments, ratings, reports, overrides, subtasks and timer sessions) and the availability rows for the 14 days it fills (today to today + 13).
  - Dates are relative to the day it runs, in Asia/Karachi. Ids are derived from the Student and the row's name, so a re-run on the same day gives identical rows.
  - Only stopped timer sessions are seeded.
  - **Tests:** the Vitest global setup loads the demo Student's sample data once, as of `2027-01-11` (exposed as `SAMPLE_DATA_TODAY`). Test files must not reload the demo Student's sample data, because test files run in parallel on one database; tests that need to reload use a fresh Student.
- **Alternatives considered:** deleting all of the Student's rows (would wipe non-sample data); re-creating the Student (logs everyone out); seeding the demo Student inside each test file (races between parallel test files).
- **Used by:** E-04, E-05 and every slice test that reads sample data.

## Gates

| Gate | What it proves | Owner ADR | If it fails | Status |
|---|---|---|---|---|
| Gate 1 | Repeat-until-acknowledged works on the team's Android phones and a laptop, on the deployed HTTPS host, with 19 of 20 attempts meeting the 60 second target and every repeat actually alerting (the `renotify` risk in ADR-005) | ADR-005, ADR-001 | Revisit ADR-001 (native client or Android wrapper) | Not run |
| Gate 2 | A real student account can complete OAuth with the three Classroom scopes, list courses and coursework, and the coursework feed registration result is recorded | ADR-003, ADR-006 | No Classroom data flows for those accounts. Revisit ADR-003 and ADR-006 | Not run |
| Gate 3 | The TAs confirm the reading of "local" in C-05 and V-08 | ADR-002 | Revisit ADR-001 and ADR-002 | Not asked |

## Questions to send the TAs

1. **"Local" (DL-01, Gate 3).** "C-05 requires ACID-compliant local transactions. Does 'local' mean the data must live on the Student's device, or does it mean our own database, as opposed to changes made inside Google's systems? Our design keeps one server-side database so phone and laptop share state."
2. **NFR-03 (DL-10).** "Does 'acknowledgment state consistent across phone and laptop within one minute' mean the state shown in the app and the stop of repeats, or must an already displayed notification disappear from the other device too? Chrome requires every push to show a visible notification, so a silent clear is not possible."
3. **AI states (DL-05).** "If the AI service is slow or down, is it acceptable that a new assignment shows 'estimating', and that an item with no estimate shows 'no estimate' with the option to enter effort manually?"
4. **AI data (DL-06).** "May assignment title, truncated description, type, course name, due date and the Student's skill rating for that course be sent to an external AI service, with a notice shown to the Student?"
5. **Calendar (DL-07, OQ-26, OQ-29).** "FR-12 lets a Calendar time change update the plan unless it breaks the official deadline, in which case we show a conflict. Is that also the rule when a change breaks the Student's available hours? Is deleting a block's event a permitted change? Is it acceptable that study blocks live in a separate calendar created by the app? What should happen during a Calendar outage?"
6. **Retention (DL-08, OQ-27).** "After the Student revokes Classroom access we ask them to keep or delete the imported assignments, as FR-13 says. If they delete, is it right that the subtasks, study sessions and plan data attached to those assignments are removed with them? For how long should kept assignments stay shown as stale?"
7. **Notifications (DL-09, OQ-18, OQ-22, OQ-23).** "At what time of day should the daily reminders be sent? If one device acknowledges and the other has not synchronized yet, is it enough that the acknowledgment applies to both once synchronized? What should happen when a device cannot be reached?"
8. **Freshness (OQ-24, OQ-25).** "How soon must a new or changed Classroom assignment appear in the planner?"

## Items only the team can fill

- The PRD IDs for ASR-09 and ASR-10 are now filled in the ASR file (ASR-09 from FR-04, FR-14, BR-06, BR-07, BR-15, NFR-01; ASR-10 derived from C-01, C-05 and FR-13, with no dedicated PRD security requirement).
- Azure for Students sign-up with a university email (DL-02), and a Google Cloud billing account for the AI paid tier (DL-13). Neither is confirmed.
- The skill check for the chosen stack (DL-14).
- Answers to OQ-18, OQ-22, OQ-23, OQ-24, OQ-25, OQ-26, OQ-27 and OQ-29.
- Team re-approval of the revised DL-07, DL-08 and DL-09, the new DL-17, and the matching changes in ADR-002 to ADR-006.
- Each of the four members' own sign-off in Section 11 of ASRs_and_Architectural_Drivers.md.
