# Architecture Significant Requirements (ASRs) and Architectural Drivers

**Project:** Google Classroom-Linked AI Academic Deadline Planner
**Deliverable:** 3, Step 1 (revised)
**Status:** Revised baseline, approved by the team on 15 November 2026 (approval reported by the submitting member, per-member sign-off in Section 11). Step 2 decisions made against these drivers are in `adr/ADR-001` to `adr/ADR-006`, `decision-log.md` and `step-2-architectural-decisions.md`. Section 12 traces each ASR to its ADR. Later on 15 November 2026 the hosting provider, AI provider and language were decided and three boundary gaps closed (revision log rows 16 to 19). Row 20 records FR-15 to FR-17 (DL-16) and the two filled [confirm] cells. The ASR list, the tensions and the traceability table did not change. Row 21 records the alignment of the ADRs to the validated PRD (DL-17).

## 1. Purpose and scope

This document records requirements and constraints that can materially influence system structure, boundaries, data persistence, synchronization, concurrency, reliability, security, or performance.

An **Architecture Significant Requirement (ASR)** is a requirement or constraint that can materially influence the architecture. An **architectural driver** is a requirement, constraint, or quality expectation that creates a reason for an architectural concern to be addressed.

This document covers Step 1 only. It does not select an architectural style, define components, choose technologies, or make implementation decisions. Those decisions belong to the team in Step 2.

**Product context (summary only, the validated PRD governs):** a website linked to Google Classroom that pulls assignments and deadlines, estimates effort with an AI service using the Student's per-course skill ratings, calculates start-by dates, sends phone and laptop alerts that repeat until acknowledged, and syncs start-by blocks with Google Calendar.

**Structure of the revised list:** ten ASRs. Classroom integration and Calendar synchronization are separate entries. Notification delivery and cross-device acknowledgment remain grouped. Local transaction integrity (C-05) has its own entry. Project feasibility is no longer an ASR and is recorded as a project constraint in Section 3.

## 2. ASRs and architectural drivers

| ID | Source Requirement | Why It Is Architecturally Significant | Architectural Concern Created |
|---|---|---|---|
| **ASR-01** | **FR-01, C-01, OQ-24, OQ-25. Google Classroom integration:** retrieve Classroom assignment information, deadlines and submission status. External data access and synchronization behaviour remain subject to the documented Open Questions. | The product depends on an external platform for core academic data. Available data, access permissions and synchronization behaviour affect what the system can reliably retrieve and maintain. | External integration boundary; ownership and representation of imported data; synchronization frequency and freshness; handling of unavailable, delayed or incomplete external data; permission limitations. |
| **ASR-02** | **FR-12, C-02, BR-13, OQ-26, OQ-29. Two-way Google Calendar synchronization:** synchronize study-plan blocks with Calendar, including permitted manual Calendar changes, and account for synchronization conflicts or failures. | Synchronization occurs in both directions. A change may originate in the study plan or in Calendar, so the system must handle competing updates and preserve a coherent view of the plan. | External Calendar boundary; bidirectional data consistency; conflict detection and resolution; update ordering; ownership of changed blocks; failure and recovery behaviour. |
| **ASR-03** | **NFR-02, BR-12, BR-13, FR-01-E4, FR-12-E1. Availability of saved information during external outages:** previously saved assignments and the study plan remain viewable when Classroom or Calendar synchronization is unavailable. | The requirement separates access to previously saved information from the availability of external services. External outages must not make saved assignments or the saved study plan inaccessible. | Local data persistence; availability during external-service outages; separation of saved-data access from synchronization status; representation of potentially stale data. |
| **ASR-04** | **C-05, V-08. ACID-compliant local transactions:** the system must use ACID-compliant local transactions, as confirmed by the recorded human validation decision V-08. | This is an explicit, validated constraint, not an inferred implementation preference. Every write that changes plan state (Student edits, Classroom imports, Calendar sync writes, recalculation results) must keep its data valid. These writers can act at the same time. | Transaction boundaries and ownership; isolation between concurrent writers (Student edits, sync jobs, recalculation); durability after commit; no partial application of multi-record changes; how local transaction guarantees coexist with cross-device state (see T-01). |
| **ASR-05** | **FR-13, BR-14, OQ-27. Safe handling of Classroom access revocation and reconnection:** preserve in-progress saved edits during revocation, handle disconnection safely, and reconcile retained Classroom assignment identities after reconnection. | Revocation and reconnection affect saved user work and the relationship between imported Classroom records and locally retained assignments. | Safe disconnection and cleanup; identity reconciliation; imported-versus-local data ownership; retention and deletion boundaries; cleanup of stored access credentials (see ASR-10). |
| **ASR-06** | **FR-11, NFR-03, C-03, OQ-18, OQ-22, OQ-23. Phone and laptop notification delivery with cross-device acknowledgment:** deliver notifications to the supported devices, repeat unacknowledged notifications according to the PRD, and synchronize acknowledgment state across devices. NFR-03 specifies synchronization within one minute in at least 95% of test attempts. | Notifications have a lifecycle across multiple devices. An acknowledgment on one device must be reflected consistently on the other, while delivery and synchronization may be delayed or unavailable. | Cross-device state consistency; notification delivery reliability; acknowledgment synchronization latency; duplicate or stale notifications; retry and device-unavailability behaviour. |
| **ASR-07** | **FR-03, FR-04, FR-05, FR-06, FR-07, BR-06, BR-07, OQ-01, OQ-02, OQ-03, OQ-17. Cascading recalculation and preservation of Student overrides:** recalculate affected start-by dates when relevant effort, availability, deadline or progress inputs change, while preserving manual corrections and keeping allocation suggestions non-binding. | Multiple inputs affect dependent schedule calculations. A change to one input can affect several calculated dates, while system-generated results must not overwrite Student-controlled values. | Dependency management; recalculation consistency; handling of overlapping or concurrent updates; ownership of manual versus calculated values; preservation of Student overrides. |
| **ASR-08** | **FR-08, BR-03, BR-10, OQ-05, OQ-08, OQ-09, OQ-10. Course-neglect identification using incomplete progress evidence:** identify possible course neglect using deadlines and available progress evidence, and communicate uncertainty when progress information is incomplete. | The system derives warnings from information that may be incomplete or stale. It must not present missing progress evidence as confirmed inactivity. Its architectural weight is how unknown progress is represented and stored, not a structural boundary. | Data freshness; representation of unknown progress; reliability of derived warnings; distinction between observed evidence and uncertain inference. |
| **ASR-09** | **FR-04 (plus FR-14, BR-06, BR-07, BR-15), NFR-01. AI effort estimation as an external dependency, with assignment-list and start-by display within three seconds for up to 50 assignments.** | Effort estimates come from an external AI service, whose output can be slow, unavailable, rate-limited, or inconsistent between calls. NFR-01 alone is trivially met by local retrieval of 50 records. It becomes architecturally significant only because start-by dates depend on AI-derived values. | Boundary around the AI service; whether estimation sits on or off the display path; storage of estimates so display and recalculation work when the service is unavailable; handling of missing or invalid estimates; Student override of AI values (links to ASR-07); response-time budget for the core views. |
| **ASR-10** | **Derived from C-01, C-05 and FR-13, together with FR-01, FR-12 and the AI dependency in ASR-09. The PRD has no dedicated security or privacy requirement. Security and privacy of Google-linked data.** | The system holds authorization to a Student's Google Classroom and Calendar, stores academic data, runs on more than one device, and sends some data to an external AI service. | Where access credentials are held and which component may use them; minimum necessary access scopes; what data is sent to the AI service; protection of stored academic data on each device; credential cleanup on revocation (links to ASR-05). |

## 3. Project constraint recorded outside the ASR list

| ID | Source Requirement | Why It Is Not an ASR | Effect on Step 2 |
|---|---|---|---|
| **PC-01** | **C-04, OQ-30, OQ-31, OQ-32, OQ-33. Semester and project feasibility:** keep the delivered scope feasible for the four-member team within the course-project timeline. | A project-level feasibility driver, not a technical requirement. Treating it as an ASR would misclassify it. | Used as a decision criterion: every architectural alternative must be justifiable for four members within the timeline. Unresolved scope and simplification questions stay open until the team records decisions. |

## 4. Requirements intentionally excluded from the ASR list

These remain valid product requirements. They are excluded only because they do not independently force a major architectural decision, or their architectural implications are already represented by an ASR.

| Requirement | Reason for exclusion from the ASR list |
|---|---|
| **FR-02. Undated Classroom assignments and manual deadline entry.** | Primarily a user-input and data-management capability. Its external-data and deadline-source implications are covered by ASR-01 and ASR-04. |
| **FR-09. Assignment start status separate from Notification acknowledgment.** | Primarily a localized status-management capability. The relevant cross-device acknowledgment concern is covered by ASR-06. |
| **FR-14. Student entry and editing of Course skill ratings.** | Primarily profile-data management. Its effect on schedule calculations is covered by ASR-07, and its use as an input to AI estimation is covered by ASR-09. |
| **FR-15. Subtasks within an assignment.** | Ordinary data management and reads. Subtasks are stored with their assignment and never change status, effort or start-by dates, so no new boundary is forced. Covered by ASR-07 (separate Student data) and ASR-03 (saved data stays viewable). |
| **FR-16. Study timer, study sessions and recorded study time.** | Ordinary data management and reads. Timer state is stored on the server as timestamps and the duration is computed from them, which fits the existing single source of truth (DL-11, DL-16). Covered by ASR-07 and ASR-03. |
| **FR-17. Search, filter and sort of assignments.** | Ordinary reads over stored assignment data, served by the API layer. No new component. Covered by ASR-03 (saved data stays viewable during outages). |
| **NFR-01. Assignment-list and schedule display within three seconds for up to 50 assignments.** | No longer a standalone ASR. Local retrieval of 50 records does not force an architectural decision. Its significance comes from the AI dependency, so it is folded into ASR-09. |
| **NFR-04. Seven-day availability and up-to-five-course rating onboarding within five minutes.** | Primarily a usability and interaction-flow requirement. It does not independently force a major system boundary or persistence decision. |

Exclusion does **not** mean the requirement may be ignored. The architecture developed in later steps must still support all applicable PRD requirements.

## 5. Tensions between drivers (identified, not resolved)

These are conflicts between ASRs that Step 2 must resolve deliberately. Step 1 did not choose a resolution. The last column records where Step 2 resolved each one.

| ID | Drivers in Tension | Why It Matters | Addressed In |
|---|---|---|---|
| **T-01** | ASR-04 (local ACID transactions), ASR-06 (acknowledgment sync across phone and laptop within one minute), ASR-03 (saved data available during outages) | Two devices need either a shared source of truth or a synchronization protocol. "Local" transactions do not by themselves keep two devices consistent. | ADR-002 (shared server-side source of truth) and ADR-005 (acknowledgment propagation) |
| **T-02** | ASR-09 (external AI latency and availability) against NFR-01 (three-second display) | If estimation sits on the display path, the three-second requirement depends on an external service. | ADR-003 (AI estimation off the display path and outside transactions) and ADR-002 (recalculation uses stored estimates) |
| **T-03** | ASR-02 (permitted manual Calendar changes) against ASR-07 (preserve Student overrides in the plan) | When a block is edited in Calendar and in the plan, the system needs a rule for which one is authoritative. | ADR-004. A default rule is proposed, still depending on OQ-26 and OQ-29. |
| **T-04** | ASR-09 (sending data to an AI service) against ASR-10 (privacy of academic data) | The AI service needs enough data to estimate effort, but each field sent leaves the system. | ADR-006 (AI payload allow-list, credential handling) and ADR-003 (AI adapter) |

## 6. Open Questions and decision discipline

Open Questions are evidence of unresolved requirements or constraints, not permission to invent behaviour. Unless a decision is recorded in the team's decision log or validated PRD, the matter remains unresolved.

- **OQ-24 and OQ-25:** Classroom data access and synchronization behaviour must not be assumed beyond what the validated PRD confirms.
- **OQ-26 and OQ-29:** Calendar conflict and outage behaviour must not be silently decided during ASR identification.
- **OQ-27:** Imported-data retention and reconciliation behaviour must follow the recorded decision. Unresolved details remain open.
- **OQ-23:** Device delivery failure behaviour remains unresolved unless the team has recorded a decision.
- **OQ-30 to OQ-33:** Feasibility, deferral and simplification matters must be resolved by the team rather than inferred by the architecture document.
- **AI service behaviour (ASR-09) and security scope (ASR-10):** if the validated PRD does not record what happens when the AI service fails, or what data may be sent to it, log these as new Open Questions.
- **ADR rule:** any ADR that depends on an unresolved Open Question names that Open Question in its Context and lists it under "Conditions still open" in its Status. The team accepted ADR-001 to ADR-006 on 15 November 2026 with those conditions still open. The defaults they rest on are team defaults, not PRD facts, and an ADR is revisited if the PRD or TAs answer differently.

## 7. Explicitly confirmed constraint: C-05

The team confirms that **C-05 requires ACID-compliant local transactions**, based on the recorded human validation decision **V-08**.

- **Atomicity:** a transaction is completed as a whole or not applied as a partial transaction.
- **Consistency:** a transaction preserves the applicable data rules and integrity constraints.
- **Isolation:** concurrent transactions do not produce an invalid intermediate result.
- **Durability:** once a transaction is committed, its changes are retained.

This confirmation establishes the required transaction property. It does **not** select a database, storage engine, framework, or transaction implementation. It also does **not** define what "local" means in a multi-device product (device-local, server-local, or both). That question is part of T-01 and belongs to Step 2.

## 8. Step 1 boundary: decisions not made here

This document does not decide:

- the overall architectural style or pattern;
- the system's components, modules, or deployment topology;
- databases, storage technologies, frameworks, or programming languages;
- the implementation mechanism for offline access or synchronization;
- the specific conflict-resolution algorithm for Calendar updates;
- the implementation mechanism for notification delivery;
- the AI service provider and how it is invoked;
- how access credentials are stored and protected;
- detailed API design or integration adapter structure.

## 9. Decision areas handed to Step 2 (identified only, no decisions made)

Not every area needs its own ADR. The team decides which are significant.

| Decision Area | Fed by | Related Tensions and Open Questions | Decided In |
|---|---|---|---|
| Overall architectural style | ASR-01 to ASR-10, PC-01 | T-01 | ADR-001 |
| Data persistence and ownership | ASR-03, ASR-04, ASR-05, ASR-06 | T-01, OQ-27 | ADR-002 |
| External integration boundaries (Classroom, Calendar, AI service) | ASR-01, ASR-02, ASR-09 | T-02, T-04, OQ-24, OQ-25 | ADR-003 |
| Calendar synchronization and conflict handling | ASR-02, ASR-07 | T-03, OQ-26, OQ-29 | ADR-004 |
| Notification delivery and acknowledgment synchronization | ASR-06 | T-01, OQ-18, OQ-22, OQ-23 | ADR-005 |
| Recalculation and override model | ASR-07, ASR-08, ASR-09 | T-02, OQ-01, OQ-02, OQ-03, OQ-17 | ADR-002 (recalculation model, overrides, unknown progress) and ADR-003 (AI placement) |
| Authorization and credential boundary | ASR-05, ASR-10 | T-04 | ADR-006 |

## 10. Revision log (first baseline to this revision)

| # | Change | Reason |
|---|---|---|
| 1 | Project feasibility removed from the ASR list and recorded as PC-01. | The first baseline itself described it as not a standalone technical requirement. Keeping it as an ASR was a misclassification. |
| 2 | NFR-01 is no longer a standalone ASR. It is folded into ASR-09. | Showing 50 assignments in three seconds is trivially met by local retrieval. It matters architecturally only through the AI dependency. |
| 3 | C-05 given its own entry, ASR-04. | It is the strongest persistence driver and was buried inside the revocation entry. |
| 4 | ASR-09 added (AI effort estimation as an external dependency). | The product relies on an AI service and the first baseline had no driver for it. |
| 5 | ASR-10 added (security and privacy of Google-linked data). | Security and privacy were missing, and the course brief lists them as drivers to consider. |
| 6 | Section 5 added (tensions between drivers). | The conflict between local ACID transactions and cross-device synchronization was unaddressed. |
| 7 | IDs ASR-01 to ASR-10 added. | Lets ADRs and architecture.md trace decisions back to specific drivers. |
| 8 | Section 9 added (decision areas for Step 2). | Connects each ASR to the decisions it feeds, without making those decisions. |
| 9 | ASR-08 rationale clarified. | Its architectural weight is the representation of unknown progress, which keeps it a legitimate ASR and tells ADR-002 what to decide. |
| 10 | Section 5 column renamed to "Addressed In" and filled. | Records where each tension was resolved in Step 2. |
| 11 | Section 9 gains a "Decided In" column. | Links each decision area to its ADR. |
| 12 | Section 12 added (ASR to ADR traceability). | Lets any member show which decision answers which driver. |
| 13 | Team review on 15 November 2026: ADR statuses moved from Proposed to Accepted. Open conditions are tracked in decision-log.md. | Records the approval honestly, with the gates and Open Questions that are still unresolved. |
| 14 | Decision log extended with DL-13 (AI provider) and DL-14 (language and frameworks). | Both were undecided and are needed before AGENTS.md can name agreed technologies. Both were decided later the same day (row 16). |
| 15 | ADR files placed in an `adr/` folder and first-person wording replaced with team wording. | Matches the submission structure and the references used in this file. |
| 16 | DL-02 (hosting), DL-13 (AI provider) and DL-14 (language and frameworks) decided and recorded in ADR-001 and ADR-003. | AGENTS.md can only name technologies that are already decided and justified. |
| 17 | DL-15 added. ADR-001 gains a dependency table and an OAuth clause in rule 2. ADR-002 gains transaction rule 9 and an alternatives section for it. | The interface rows in step-2-architectural-decisions.md were marked "Inferred" and had no ADR basis. Nothing said how a changed start-by date reached Calendar and notifications, and rule 2 did not allow credential handling to call Google's token endpoint. |
| 18 | Google quotas, refresh token rules and Testing-status behaviour re-checked on Google's primary pages. DL-12 corrected. ADR-005 now names the `renotify` risk and Gate 1 tests it. ADR-006 adds `admin_policy_enforced` as a grant-loss signal. | The earlier DL-12 cited a Google Health API page and a Google Groups reply, and described Testing apps as showing the unverified-app screen. MDN lists `renotify` as limited availability. |
| 19 | No change to the ASR list, tensions, traceability table or [confirm] items. | The re-check found no new driver. The two [confirm] items need the validated PRD, which is not available to this revision. |
| 20 | FR-15 to FR-17 added to Section 4 (excluded requirements). The two [confirm] cells (ASR-09, ASR-10) filled from the validated PRD. DL-16 recorded. | The PRD gained FR-15 to FR-17 from TA-01 to TA-03. They are ordinary data management and reads and force no new ASR. The ASR list, tensions and traceability table are unchanged. |
| 21 | ADR-002 to ADR-006, decision-log.md, step-2-architectural-decisions.md and architecture.md aligned to `Final_Validated_PRD.md` (DL-17): keep-or-delete choice on revocation (FR-13, BR-14), Calendar deadline conflicts (FR-12-E4, V-04), daily reminders with the 48-hour pause and stop rules (FR-11, BR-11, BR-18), deadline-change notices (FR-01), and corrected Open Question numbers (OQ-18, OQ-22, OQ-26). The ASR list, tensions and traceability table did not change. | A comparison of the ADRs with the validated PRD found these mismatches. The changes await team re-approval. |

## 11. Team review and approval record

| Item | Record |
|---|---|
| ASR grouping | Ten entries. Approved by the team on 15 November 2026 (reported by the submitting member). |
| Classroom and Calendar | Separate ASRs to make their distinct integration boundaries and synchronization concerns clear. |
| Notifications | Delivery and cross-device acknowledgment synchronization grouped into one ASR. |
| C-05 | ACID-compliant local transactions confirmed from V-08. Now a separate entry, ASR-04. |
| Architecture design | Not performed in this document. Step 2 is recorded in ADR-001 to ADR-006, decision-log.md and step-2-architectural-decisions.md. The ADRs are Accepted, with open conditions listed in decision-log.md. |
| Items marked [confirm] | Closed on 15 November 2026. ASR-09 source: FR-04, FR-14, BR-06, BR-07, BR-15 and NFR-01. ASR-10 is derived from C-01, C-05 and FR-13, and the PRD has no dedicated security requirement. |
| PRD ID cross-check | Done on 15 November 2026 for every requirement, rule, constraint, validation, TA and Open Question ID cited in the ADRs, the decision log, architecture.md and the decisions file: each exists in `Final_Validated_PRD.md`. Descriptions were not compared word for word. FR-15 to FR-17 were added to the PRD and checked against the exclusion table in Section 4. |
| Approval status | Approval reported by the submitting member on 15 November 2026. Individual sign-off lines are below and must be completed by each member. |

**Individual sign-off (each member completes their own line):**

| Member | Name | Reviewed the ASR list and ADR-001 to ADR-006 | Date |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |

## 12. Traceability: ASR to ADR

| ASR | Primary ADR | Also addressed in |
|---|---|---|
| ASR-01 Classroom integration | ADR-003 | ADR-002, ADR-006 |
| ASR-02 Calendar two-way sync | ADR-004 | ADR-003, ADR-006 |
| ASR-03 Saved data during outages | ADR-002 | ADR-001, ADR-003, ADR-004 |
| ASR-04 ACID local transactions (C-05) | ADR-002 | ADR-001, ADR-003 |
| ASR-05 Revocation and reconnection | ADR-006 | ADR-002, ADR-004 |
| ASR-06 Notifications and acknowledgment | ADR-005 | ADR-001, ADR-002 |
| ASR-07 Recalculation and overrides | ADR-002 | ADR-003, ADR-004 |
| ASR-08 Unknown progress evidence | ADR-002 | ADR-003 |
| ASR-09 AI estimation dependency | ADR-003 | ADR-002, ADR-006 |
| ASR-10 Security and privacy | ADR-006 | ADR-001, ADR-003, ADR-004, ADR-005 |
| PC-01 Feasibility (decision criterion) | ADR-001 | all ADRs |

---

**Traceability note:** Requirement IDs and descriptions are presented as the team's working source references. Before submission, cross-check each ID, edge-case ID, business-rule ID and Open Question against the exact final validated `Final_Validated_PRD.md` and the team's decision log. Do not treat an unresolved Open Question as an approved behaviour.
