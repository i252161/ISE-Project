# ADR-006: Identity, Credential Handling, Revocation and AI Data Boundary

## Status

Accepted on 15 November 2026. Approved by the team. The approval is reported by the submitting member, and per-member sign-off lines are in Section 11 of ASRs_and_Architectural_Drivers.md. Depends on ADR-001, ADR-002 and ADR-003. Amended on 15 November 2026 (DL-17) to follow the validated PRD. The amendment was re-approved 27 November 2026 (DL-25).

**Conditions still open:**

- DL-06: the AI data allow-list is approved by the team as a default and needs PRD confirmation and a new Open Question entry.
- OQ-27: the PRD fixes the keep-or-delete choice after revocation (FR-13, BR-14). The details around it are defaults (DL-08, revised under DL-17, awaiting team re-approval) and await the PRD or TA answer.
- Closed on 15 November 2026: the PRD source for ASR-10. It is derived from C-01, C-05 and FR-13. The PRD has no dedicated security or privacy requirement (see the ASR file, Section 2).
- Gate 2 has not been run. A school domain that blocks the app would stop all Classroom data.
- DL-12: decided. The demo uses Testing mode.

## Context

**Drivers (from ASRs_and_Architectural_Drivers.md):**

- **ASR-05 (FR-13, BR-14, OQ-27):** safe handling of Classroom access revocation and reconnection, preserving in-progress edits and reconciling retained records.
- **ASR-10:** security and privacy of Google-linked data: where credentials are held, which component may use them, minimum scopes, what is sent to the AI service, and cleanup on revocation.
- **ASR-09, T-04:** the AI service needs enough data to estimate effort, but every field sent leaves the system.
- **ASR-03:** saved data stays viewable when external services are unavailable.
- **PC-01:** four members, fixed timeline.

**Facts recorded from Google's documentation (November 2026). The team re-verifies them before the demo:**

- Users can view and revoke consent at any time from their Google Account settings. The team found no confirmation that an existing grant can be reduced to a single scope from there, so this ADR treats removal of the whole app as the account-side revocation path.
- Since 2024 the consent screen can show a checkbox per scope, so a Student may grant some requested scopes and refuse others. The app must check which scopes were actually granted.
- Checked on 15 November 2026 on Google's OAuth 2.0 page (refresh token expiration section): a refresh token stops working when the user revokes access, after six months without use, when the account exceeds the limit of live refresh tokens (100 per Google Account per OAuth client ID), when time-limited access the user granted expires, and when an administrator restricts the services in the app's scopes (error `admin_policy_enforced`). A project with an External user type and Testing status gets refresh tokens that expire in 7 days, unless the only scopes requested are within `openid`, email and profile.
- Checked the same day on Google's app verification overview: Testing status has a hard cap of 100 test users and shows a warning that the app is in testing, not the standard unverified-app screen.
- Recorded earlier and not re-checked: a rejected refresh token returns `invalid_grant`.
- Student-account scopes `classroom.courses.readonly`, `classroom.coursework.me.readonly` and `classroom.student-submissions.me.readonly` exist (ADR-003). Calendar's `calendar.app.created` exists (ADR-004).
- A school Workspace domain may restrict which third-party apps its accounts can authorize. The team has not verified how its university domain is configured. Gate 2 tests this with a real student account.

**Questions:**

1. How is a Student identified?
2. How is access to Classroom and Calendar granted, stored and used?
3. How is revocation detected and handled, and what happens on reconnection?
4. What may be sent to the AI service?

## Alternatives considered

### 1. Student identity

- **A. Google sign-in with identity scopes only, followed by an application session, and Classroom and Calendar access as separate later grants (selected).** Pros: no planner passwords to store, a minimum-scope grant per service, and revoking Classroom access does not end the Student's session or destroy their identity record. Cons: ties identity to Google, and a Student who fully removed the app from their Google account must go through the sign-in consent again once their session ends.
- **B. A separate planner account with its own password, plus a Google connection.** Pros: sign-in is independent of Google grants. Cons: password storage, reset and recovery flows, and a larger attack surface for a four-member team.
- **C. A single combined Google grant for identity and data access.** Pros: one consent step. Cons: refusing or losing the data scopes also removes the sign-in, which conflicts with preserving the Student's saved work during revocation (ASR-05).

### 2. Where tokens are held

- **A. Refresh tokens stored on the server, encrypted at rest, read only by the credential handling module (selected).** Pros: tokens never reach a device, background sync and notification scheduling can run without the Student present, and the single module matches ADR-001, rule 5. Cons: the server becomes a high-value target and holds the encryption key.
- **B. Tokens held in the client.** Pros: no server-side secret storage. Cons: breaks ADR-001 (clients do not talk to external services), exposes tokens to the browser, and stops all background work when the app is closed.
- **C. No refresh tokens, online access only.** Pros: nothing long-lived to protect. Cons: no background sync, no Calendar writes while the Student is away, and polling in ADR-003 cannot run.
- **D. A managed key service or external secret vault for token encryption.** Pros: stronger key handling. Cons: extra infrastructure and cost. Noted as an upgrade path.

### 3. What goes to the AI service

- **A. A fixed allow-list of estimation fields, enforced by the AI adapter (selected).** Pros: one control point, testable, limits exposure (T-04). Cons: estimates may be less accurate than with more context.
- **B. Send the full assignment record and Student profile.** Pros: richest context. Cons: sends identifying and unrelated academic data outside the system.
- **C. No external AI, a local rule-based estimator.** Pros: nothing leaves the system. Cons: the product is defined around an AI estimate, so this changes the requirement.

## Decision

1. **Identity:** Alternative 1A. The Student signs in with Google using identity scopes only (`openid`, `email`, `profile`). The Student record is keyed by the stable Google account identifier. After sign-in the API layer issues an application session cookie (HttpOnly, Secure, SameSite) backed by a session row in the database, with a long, configurable lifetime. The planner stores no passwords.
2. **Grants and scopes:** each external service is connected in its own step, requested only when the Student chooses to connect it. After each consent the credential module checks which scopes were actually granted and records the result.
   - Classroom: `classroom.courses.readonly`, `classroom.coursework.me.readonly`, `classroom.student-submissions.me.readonly`.
   - Calendar: `calendar.app.created` (ADR-004).
   - A partial grant connects only what was granted. The app shows which features are unavailable and offers to request the rest.
3. **Credential storage:** Alternative 2A. Refresh tokens are encrypted before they reach the database, with a key supplied through the host's secret store (ADR-001, D4). Access tokens are short-lived and kept in memory only. No token, authorization code or key is logged. Clients never receive them. Adapters obtain an access token by asking the credential handling module's interface for one, per Student and service. The module refreshes it from the stored refresh token when needed and returns only the access token. Adapters never read, store or log refresh tokens. (Clarification added 15 November 2026 to close an interface gap between ADR-001 rule 5 and this ADR.)
4. **Revocation detection:** the sync engine treats `invalid_grant`, `admin_policy_enforced`, a missing granted scope, or an authorization error on a Google call as loss of that grant. This one rule covers Student revocation in Google, in-app disconnect, partial consent, and expiry for any reason, including the seven day expiry of Testing mode. An `admin_policy_enforced` error is recorded with the reason "blocked by the school administrator", so the Student is not told to reconnect when reconnecting cannot work.
5. **Revocation handling:**
   - Sync for the affected service stops, and its sync status becomes Disconnected with a reason (ADR-003).
   - The credential module deletes the stored tokens in the same transaction as the status change (ADR-002, rule 4). On an in-app disconnect it also asks Google to revoke the grant where the API allows.
   - **Keep or delete (FR-13, BR-14).** Imported assignments stay available, marked disconnected and stale, pending the Student's choice (FR-13-E1). The app prompts the Student to keep or delete them, and prompts again whenever the Student opens imported assignments before choosing (FR-13-E2). Neither choice is made for the Student.
   - **If the Student keeps them:** the assignments and everything attached to them stay, marked disconnected and stale (DL-08).
   - **If the Student deletes them:** the assignments are removed together with what is attached to them: overrides, subtasks, study sessions, timer state and notification schedules (FR-15-E7, FR-16-E7). Where an assignment is used in the study plan, the app first warns that related plan data will be removed and asks for confirmation (FR-13-E3). The deletion applies as one transaction (ADR-002, rule 4).
   - **Kept either way:** Student-entered data that belongs to the Student rather than to an assignment (availability, skill ratings).
   - **Edits in progress first (FR-13-E5, V-08):** an edit under way when access is lost commits or rolls back safely before the disconnection or the deletion is finalized, and the Student is told of any recoverable failure.
   - Removing overrides and notification schedules with a deleted assignment is a team default under OQ-27 (DL-08). The PRD sets it only for subtasks and study sessions.
   - Saved data stays viewable for as long as the Student has an application session. After a full removal of the app from Google, the Student can sign in again with identity scopes only and see the retained data without reconnecting Classroom.
   - The Student can delete all their data and stored credentials from within the app.
6. **Reconnection:** on a new grant, retained records are reconciled by stable Classroom identifiers in a single transaction (ADR-002, rule 4). Student edits and overrides on retained records are preserved. Matched assignments are not duplicated, official deadline fields are refreshed, and manual effort corrections and personal target dates are kept (FR-13-E4, V-09). Assignments the Student deleted are imported again as new records. Records that no longer exist in Classroom are marked removed from Classroom, not deleted.
7. **AI data boundary:** Alternative 3A. The AI adapter sends only these fields: assignment title, assignment description (truncated), assignment type, course name, due date, and the Student's skill rating for that course. It never sends the Student's name, email, Google identifier, session data, submission content, grades, other assignments, or any token. The client shows a plain notice that assignment details are sent to an AI service, and the notice names the provider (Google's Gemini API, ADR-003 Decision 6). Real Student data is sent only on the provider's paid tier. Payloads are not logged. The allow-list is a default awaiting PRD confirmation (DL-06). Subtasks, study timers, study sessions and recorded study time (FR-15, FR-16, DL-16) are not on the allow-list and are never sent.
8. **Transport and storage:** all traffic uses HTTPS (ADR-001, D1). The client keeps no persistent academic data (DL-11), so removing a device leaves no academic data on it.

## Rationale

- **ASR-05:** one revocation rule and one atomic cleanup make every way of losing access behave the same. Separate grants and an application session keep the Student's identity and saved work intact.
- **ASR-10:** the credential module is the only reader of tokens, scopes are minimal, tokens never leave the server, and the client holds no academic data.
- **T-04:** the allow-list makes what leaves the system explicit and reviewable.
- **ASR-03:** saved data does not depend on a live Google grant while a session exists.
- **PC-01:** no password system, no vault, no extra identity provider.

## Trade-offs and consequences

- The server holds encrypted refresh tokens and an encryption key. Protecting them is part of the host setup (ADR-001, D4).
- Identity depends on Google. This is acceptable because the product is Classroom-linked.
- While the consent screen is in Testing status, External-app refresh tokens expire every seven days. Students would be sent to reconnect weekly. The demo plan is Testing mode, with the team and demo accounts added as test users and a reconnect shortly before the demo (DL-12, decided). Production publishing would bring Google's verification steps, whose duration the team has not checked.
- The Student must make the keep-or-delete choice. Until then imported assignments stay in a pending state and the app keeps prompting.
- Restricting the AI payload may lower estimate quality. That is a deliberate privacy choice.
- The notice and the paid-tier rule depend on the provider's terms. The team reads the terms linked from Google's pricing page before the demo (not done).
- If a Student's school domain blocks the app, no Classroom data flows. Gate 2 finds this early.

## Revisit conditions

- The PRD requires retained data to be viewable after the session ends without any Google sign-in. Then identity needs rethinking (Alternative 1B).
- OQ-27 resolves in a way that changes what is retained.
- The PRD or the TAs require a different AI data scope.
- The Gate 2 account test fails on the team's university accounts.

## Dependencies and open items

- Depends on ADR-001, ADR-002 and ADR-003. ADR-004 relies on the Calendar grant defined here.
- Resolve OQ-27 (DL-08). The PRD source for ASR-10 is recorded (see Status).
- The AI payload allow-list is approved by the team as a default. Log it as a new Open Question in the PRD and obtain confirmation (DL-06).
- Demo consent-screen plan decided: Testing mode (DL-12).
- Gate 2: real student account test (see ADR-003).
