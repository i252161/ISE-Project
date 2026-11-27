# ADR-004: Calendar Synchronization and Conflict Handling

## Status

Accepted on 15 November 2026. Approved by the team. The approval is reported by the submitting member, and per-member sign-off lines are in Section 11 of ASRs_and_Architectural_Drivers.md. Depends on ADR-001, ADR-002 and ADR-003. Amended on 15 November 2026 (DL-17) to follow the validated PRD. The amendment was re-approved 27 November 2026 (DL-25).

**Conditions still open:**

- OQ-26 is partially resolved by V-04: the PRD imports manual changes to study-block times when permitted, subject to the official deadline (FR-12). The rest of the conflict rules, and the OQ-29 outage rules, are defaults (DL-07, revised under DL-17, awaiting team re-approval) and await the PRD or TA answer.
- DL-12: decided. The demo uses Testing mode. Whether the Calendar scope needs verification for public use is not confirmed.

## Context

**Drivers (from ASRs_and_Architectural_Drivers.md):**

- **ASR-02 (FR-12, C-02, BR-13, OQ-26, OQ-29):** two-way synchronization of study-plan blocks with Google Calendar, including permitted manual Calendar changes. A manual time change is imported unless it breaks the official deadline or the available hours, in which case the Student resolves a conflict (FR-12-E4, FR-12-AC6, FR-12-AC7, V-04).
- **ASR-07:** system-calculated values must not overwrite Student-controlled values.
- **ASR-03:** the saved study plan stays viewable when Calendar is unavailable.
- **ASR-10:** minimum necessary access to the Student's Calendar.
- **T-03:** permitted manual Calendar changes against preserving Student overrides in the plan.

**Facts from Google's documentation. Checked on 15 November 2026 against the pages named:**

- Calendar authorization page: `calendar.app.created` is described as making secondary calendars and seeing, creating, changing and deleting events on them. `calendar.events.owned` is described as seeing, creating, changing and deleting events on calendars the user owns. The page does not say whether either scope is sensitive.
- Calendar synchronization guide: incremental sync with sync tokens returns only changed events, deletions included. HTTP 410 means the token is invalid, and the client must wipe its local copy and run a full sync.

**Recorded earlier and not re-checked:**

- Broader Calendar scopes exist.
- Push notifications for Calendar need a public HTTPS endpoint, carry no change details and can drop messages. ADR-003 keeps polling as the base mechanism.
- The team has not confirmed whether the chosen scope changes the OAuth verification requirements for production. Google's scope documentation says sensitive scopes need Google review, and the consent screen in the Cloud console shows whether a scope is flagged as sensitive. The demo uses Testing mode (DL-12, decided), so verification is not needed for it.

**Questions:**

1. Which part of the Student's Calendar does the system touch?
2. Who is authoritative when a block changes on both sides?
3. How are Calendar changes detected, and what happens when Calendar is unavailable?

## Alternatives considered

### 1. Where the blocks live and which scope is used

- **A. A dedicated secondary calendar created by the app, with `calendar.app.created` (selected).** Pros: the app can only touch its own calendar, which is the smallest access that works (ASR-10). Study blocks never mix with the Student's other events. Detecting changes only needs to read one calendar. Cons: blocks appear under a separate calendar that the Student must keep visible. Deleting that calendar removes all blocks.
- **B. Events in the Student's primary calendar with `calendar.events.owned`.** Pros: blocks appear alongside everything else. Cons: the grant reaches every calendar the Student owns, and the app must filter its own events from all others.
- **C. A full calendar scope.** Pros: no scope limits. Cons: the broadest access, with no requirement that needs it.

### 2. Authority when a block changes on both sides

- **A. The plan is authoritative for system-calculated values. A Student edit on either side beats a calculated value, provided a Calendar time change passes the deadline and availability check (FR-12-E4). Between two valid Student edits, the later one wins and the earlier one is logged (selected).** Pros: honours ASR-07 and the permitted manual Calendar changes of ASR-02, is deterministic, and is cheap to implement. Cons: a later edit silently replaces an earlier one, so the log and a visible notice carry the safety net.
- **B. One-way sync from plan to Calendar, with Calendar edits overwritten.** Pros: simplest. Cons: contradicts the two-way requirement and the permitted manual Calendar changes.
- **C. Calendar authoritative for block times.** Pros: respects whatever the Student does in Calendar. Cons: recalculated dates and overrides would be confused, which ASR-07 forbids.
- **D. Field-level three-way merge with a conflict-resolution screen.** Pros: loses nothing. Cons: significant UI and logic cost that a four-member team cannot afford (PC-01).

## Decision

1. **Placement:** Alternative A. The Calendar adapter creates one dedicated calendar for the Student and manages only events on it. Each plan block stores the Calendar event identifier, the event version marker last seen and the plan version last synced (ADR-002, rule 8). Events carry a private marker holding the block identifier so a lost mapping can be rebuilt.
2. **Authority and conflict rules:** Alternative A, applied as follows.

| Case | Action |
|---|---|
| Plan changed (recalculation or Student edit), Calendar unchanged | Write the new time to Calendar. |
| Student moves or resizes a block in Calendar, plan unchanged, and the new time passes the check below | Accept it. Store it as a Student override of the block time. Later recalculations do not move it. |
| Student moves or resizes a block in Calendar and the new time breaks the official deadline or the available hours | Do not accept it. Leave the plan and the Calendar event as they are. Mark the block Conflict and show the Student an explicit conflict to resolve. Write nothing to that event until the Student resolves it. |
| Student deletes a block's event in Calendar | Mark the block "not on Calendar". Do not recreate it automatically. The Student can re-enable it. The plan data is untouched. |
| Both sides changed since the last sync, one change is a system recalculation | The Student edit wins. |
| Both sides changed since the last sync, both are Student edits | The later edit wins, compared by the plan record's update time and the Calendar event's update time. Both edits must pass the check below. An edit that fails it becomes a Conflict instead. The loser is written to the sync log and shown to the Student in a notice. |
| Calendar event changed in a field other than time or deletion | Not read back. The next plan write may overwrite it. |
| Block removed from the plan (for example the assignment was removed) | Delete the Calendar event, even if it was edited in Calendar. |
| Student deletes the whole dedicated calendar | Mark all blocks "not on Calendar" and offer to recreate the calendar. |

   **The check (FR-12-E4):** the planning core tests a Calendar time change against the assignment's official deadline and the Student's available hours. A change that fails is never silently accepted and never silently overwritten.

   The "permitted manual Calendar changes" in ASR-02 are read as time changes (FR-12, V-04) and, as a team default, deletion of a block's event. OQ-26 may widen or narrow this list (DL-07).
3. **Change detection:** the sync engine reads the dedicated calendar with incremental sync tokens at the interval set in ADR-003. Outbound writes follow ADR-002, rule 9: a block whose stored plan version differs from the current plan version is rewritten, and a Calendar edit is passed to the planning core, which applies the check and either stores a Student override or records a Conflict, in one transaction (ADR-002, rules 1 and 9). A 410 response clears the token, runs a full read of that calendar, and reconciles by the stored mapping.
4. **Failures and outages (OQ-29):** Calendar writes are recorded as pending operations before the call (ADR-002, rule 6), retried with backoff, and coalesced so only the latest state per block is sent. Block status is Synced, Pending, Failed or Conflict. A Calendar outage changes only sync status (ADR-003). The plan stays fully usable and nothing is lost. Read failures mark the Calendar source Stale.
5. **Revocation:** if the Calendar grant is lost, the sync engine stops Calendar syncing for that Student and warns the Student. Existing Calendar events are left as they are (FR-12-E5, BR-13). Blocks show "Calendar disconnected" in the plan, and the plan is untouched (see ADR-006 for credential cleanup and reconnection).

## Rationale

- **ASR-02, T-03:** the case table gives every combination of changes exactly one outcome.
- **ASR-07:** Student edits become overrides stored apart from calculated values (ADR-002, rule 5), so recalculation cannot undo them.
- **FR-12, V-04:** a Calendar edit that breaks the official deadline or the available hours is never silently accepted or overwritten. It becomes a conflict the Student resolves.
- **ASR-03:** Calendar failures never reach the plan data.
- **ASR-10:** the narrowest scope that supports the requirement is used, and only one calendar is ever read.
- **PC-01:** a case table with last-edit-wins is implementable and testable by four members. Three-way merge is not.

## Trade-offs and consequences

- Last-edit-wins can discard an earlier Student edit. The sync log and the Student notice are the mitigation.
- A conflict needs a Student action, which costs a notice and a resolve step in the client.
- A separate calendar is a small usability cost. Students must keep it visible and not delete it.
- The comparison of plan update time and Calendar update time assumes the two clocks are close. A few seconds of skew only matters when both sides were edited almost simultaneously.
- The default rules beyond the deadline check rest on OQ-26 and OQ-29 answers that the PRD has not given yet.

## Revisit conditions

- OQ-26 or OQ-29 resolve differently from the defaults in DL-07.
- The PRD requires Calendar events in the Student's primary calendar. Then Alternative 1B applies.
- Google's scope or verification rules make `calendar.app.created` unsuitable for the demo (DL-12).

## Dependencies and open items

- Depends on ADR-001, ADR-002, ADR-003. Related to ADR-006 (credentials and revocation).
- Resolve OQ-26 and OQ-29 and update DL-07.
- Check the scope's sensitivity flag in the Cloud console (DL-12). The demo plan is Testing mode, decided.



