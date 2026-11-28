# ADR-005: Notification Delivery and Acknowledgment Synchronization

## Status

Accepted on 15 November 2026. Approved by the team. The approval is reported by the submitting member, and per-member sign-off lines are in Section 11 of ASRs_and_Architectural_Drivers.md. Depends on ADR-001, ADR-002 and ADR-003. Amended on 15 November 2026 (DL-17) to follow the validated PRD. The amendment was re-approved 27 November 2026 (DL-25).

**Conditions still open:**

- Gate 1 (defined below) has not been run. A failure triggers the Gate 1 revisit in ADR-001.
- OQ-18: the PRD fixes daily repeats (BR-11, FR-11) but not the time of day. The time of day is a configuration value.
- OQ-22: what happens when one device acknowledges and another has not synchronized. The default is FR-11-E2: the acknowledgment applies to both once synchronized, within the NFR-03 target.
- OQ-19 and OQ-20: reminder behaviour once an assignment is started but unfinished, and submission reminder timing, are open in the PRD. The scheduler follows the stop rules in Decision 2 and leaves submission reminder timing to OQ-20.
- OQ-23: the delivery failure default (DL-09) is approved by the team and awaits confirmation.
- DL-10: the TAs have not yet confirmed the reading of NFR-03.

## Context

**Drivers (from ASRs_and_Architectural_Drivers.md):**

- **ASR-06 (FR-11, BR-11, BR-18, NFR-03, C-03, OQ-18, OQ-22, OQ-23):** deliver notifications to phone and laptop, repeat unacknowledged Notifications daily, and synchronize acknowledgment state across devices within one minute in at least 95% of test attempts. "Got it" also pauses new start Reminders for that assignment for 48 hours (BR-18).
- **ASR-04, T-01:** acknowledgment is a state change that two devices must agree on.
- **ASR-10:** notification endpoints identify a Student's devices.
- **PC-01:** four members, fixed timeline.

**Fact recorded (November 2026), to be proven by Gate 1:** Chrome requires every push message to produce a visible notification. If a service worker handles a push without showing one, Chrome displays a generic "this site has been updated in the background" notification instead. Silent pushes are therefore not available to this system. Checked on 15 November 2026 on MDN: Chrome and Edge reject a push subscription unless it is created with `userVisibleOnly: true`, which is the promise that every push has a visible effect. MDN does not describe the generic-notification behaviour, so that part is still recorded and not checked.

**Assumptions not yet verified, to be proven by Gate 1:**

- Push services answer 404 or 410 when a subscription has expired or been removed.
- Notifications that share a `tag` replace each other in the tray, and `renotify` lets a replacement alert again. MDN lists `renotify` as limited availability and experimental, not Baseline (checked 15 November 2026), and its browser compatibility table was not read. This is the weakest assumption in this ADR, because a repeat that updates the tray without alerting defeats repeat-until-acknowledged. Gate 1 therefore tests that each repeat alerts, not only that the tray entry changes.
- A high-urgency Web Push message is delivered promptly while the phone is idle.

**Questions:**

1. How does a PWA deliver a repeating notification to an Android phone and a laptop?
2. Where does the repeat logic run?
3. How does an acknowledgment on one device reach the other?
4. What happens when one device cannot be reached?

## Alternatives considered

### 1. Delivery channel

- **A. Web Push from the server (VAPID) to a service worker on each device (selected).** Pros: standards-based, no native app, one client codebase (ADR-001), works on both the phone browser and the laptop browser. Cons: delivery timing depends on the browser and the Android power state, and every push must show a visible notification.
- **B. Native Android app using Firebase Cloud Messaging.** Pros: the most reliable phone delivery. Cons: a second client codebase and distribution cost (ADR-001, Alternative B). Kept as the Gate 1 fallback.
- **C. Client-side timers (page or service worker timers).** Pros: no server push. Cons: unreliable when the browser is closed, not synchronized between devices, and cannot satisfy repeat-until-acknowledged.
- **D. Email or SMS.** Pros: independent of the browser. Cons: not a phone and laptop alert in the PRD's sense, adds a provider and cost, and still needs the same repeat logic.

### 2. Where the repeat logic runs

- **A. An in-process loop over a database table of scheduled notifications (selected).** Pros: no new infrastructure (ADR-001, rule 8), state survives restarts, easy to inspect and test. Cons: relies on the single-instance rule, and timing granularity is the loop interval.
- **B. An external queue or cron service.** Pros: stronger scheduling guarantees. Cons: extra infrastructure that four members must run and learn.
- **C. In-memory timers per notification.** Pros: precise. Cons: lost on restart, so repeat state disappears.

### 3. Acknowledgment propagation

- **A. One shared database record, the server stops repeating when it commits, and open clients refresh state by polling every 30 seconds while visible (selected).** Pros: no new transport, meets a one-minute target with margin, simple to test. Cons: a hidden tab refreshes only when it becomes visible again.
- **B. Server-Sent Events or WebSocket updates.** Pros: lower latency. Cons: persistent connections and reconnection logic that the one-minute requirement does not justify.
- **C. A silent push that tells the other device to close its notification.** Pros: would clear the tray. Cons: not available, because Chrome requires a visible notification for every push.

## Decision

1. **Delivery:** Alternative 1A. Each device registers a push subscription after the Student grants notification permission on it. Subscriptions are stored in the database and read only by the notification scheduler (ADR-001, rule 6). Messages use high urgency. Every message shows a visible notification with an Acknowledge action. Repeats of one notification share a `tag` so they replace each other in the tray, and set `renotify` so each repeat alerts. If Gate 1 shows that repeats update the tray silently, the service worker closes the previous notification and shows a new one instead. That fallback is itself untested. If it also fails to alert, the Gate 1 revisit in ADR-001 applies.
2. **Schedule and repeat logic:** Alternative 2A. Each notification has a stored schedule: state (Scheduled, Active, Acknowledged, Stopped), next due time and repeat count. Each assignment also stores the end of its start-reminder pause. Schedule rows are built from stored start-by dates and carry the plan version they were built from. The scheduler rebuilds a row whose version differs from the current plan version (ADR-002, rule 9), so the planning core never calls the scheduler. The scheduler loop selects due rows, leases them, re-reads the state, sends, records the outcome in a second transaction (ADR-002, rule 6), and schedules the next repeat only if the notification is still unacknowledged. Each send has an idempotency key made of notification id and repeat number. The cadence follows the PRD: an unacknowledged Notification repeats once per day (BR-11, FR-11-E3). The repeat interval and the time of day are configuration values, not constants in code, so Gate 1 can run with a short test value (OQ-18). The scheduler also applies these rules:
   - **One Notification per assignment per day.** If a daily Reminder is due while an earlier Notification for the same assignment is unacknowledged, they combine into one (FR-11-E5).
   - **Got it pause.** An acknowledgment stops the active Notification on all devices and starts a 48-hour pause on new start Reminders for that assignment. After the pause, daily start Reminders resume only if the assignment is still unstarted and is neither Finished nor Submitted (FR-11, BR-18). "Got it" never changes Started status (BR-09).
   - **Stop rule.** Before each send the scheduler re-reads the assignment's Started, Finished and Submitted status through the planning core's read-only interface. If the assignment is Started, Finished or Submitted, its start Reminders and the repeats of its start Notification stop and the schedule row becomes Stopped. If it is Finished but not Submitted, submission Reminders apply (FR-10, timing open in OQ-20). If it is Submitted, no further Reminders are sent (FR-11-E6, BR-18).
3. **Acknowledgment:** a single atomic, idempotent database update (ADR-002, rule 3). It can come from the Acknowledge action in the service worker, the app, or a notification tap. The first acknowledgment wins. In the same transaction it records the 48-hour start-reminder pause for the assignment (BR-18) and changes nothing else about the assignment (BR-09). The scheduler re-checks state immediately before each send, so no repeat is sent after the commit apart from one already in flight.
4. **Propagation:** Alternative 3A. Open clients poll notification state every 30 seconds while visible, and also when the tab regains focus. An already displayed tray notification on another device may remain until the Student dismisses it. Tapping it opens the app, which shows the acknowledged state. NFR-03 is read as the state the app shows and the moment repeats stop, not the removal of an already shown tray entry (DL-10, needs TA confirmation).
5. **Device delivery failure (OQ-23 default, DL-09):** when a push service reports a subscription as gone, the scheduler removes it and the app shows that device as "notifications off". Other devices keep receiving. Other failures retry with backoff within the repeat cycle. An unacknowledged item is always visible in the app regardless of delivery.
6. **Permission denied or revoked on a device:** the app shows the device as "notifications off" and explains how to enable them. Nothing else changes.

## Gate 1 test (still to be run; a failure triggers the ADR-001 revisit)

Run on the team's actual Android phones and a laptop browser, against the deployed host from ADR-001 (a real HTTPS address, not localhost), with the repeat interval set to a short test value.

1. A notification is delivered to a phone that has been idle with the screen off and the browser swiped away, within 60 seconds of its scheduled time.
2. Repeats arrive at the configured interval until acknowledged and then stop. Each repeat alerts the user (sound, vibration or heads-up display), not only a silent tray update.
3. Acknowledged on the phone: the laptop shows the acknowledged state within 60 seconds and no further repeat arrives on either device.
4. Acknowledged on the laptop: the phone stops repeating and shows the state within 60 seconds of opening or focusing the app.
5. Repeat items 3 and 4 for 20 attempts in total. Pass if at least 19 meet the 60-second target (95%).
6. Repeat item 1 with battery saver on and after a phone restart. Record the result even if it fails.

A failed item 1, 2 or 5 triggers the Gate 1 revisit in ADR-001: a native client or an Android wrapper that uses a native push channel.

The daily cadence, the 48-hour pause, the merging rule and the stop rules (FR-11-AC3 to AC6) are ordinary tests run with shortened values. They are not part of Gate 1, which tests delivery and cross-device acknowledgment only.

## Rationale

- **ASR-06:** server-side scheduling plus one shared record is the shortest path to "repeat until acknowledged" and "same state on both devices".
- **T-01:** acknowledgment is a single row update, so no cross-device conflict protocol exists.
- **PC-01:** no native app, no queue, no WebSocket layer.
- **ASR-04:** acknowledgment and schedule changes are single transactions with no external call inside them.
- **ASR-10:** subscription data stays inside the scheduler's boundary.

## Trade-offs and consequences

- Phone delivery quality depends on Chrome and Android behaviour that only Gate 1 can prove.
- Stale tray entries on another device can persist until dismissed.
- A hidden tab shows the acknowledgment only once it becomes visible, which is acceptable only under the NFR-03 reading in DL-10.
- The scheduler loop interval limits timing precision. A 15 second loop is adequate for daily repeats and for the short test interval used in Gate 1.
- The time of day for daily reminders is unknown until OQ-18 is answered, so it is a configuration value. The PRD sets no maximum number of repeats and no quiet hours.

## Revisit conditions

- Gate 1 fails.
- The TAs read NFR-03 as requiring the tray entry itself to disappear on every device (DL-10).
- The single-instance rule is lifted (ADR-001).

## Dependencies and open items

- Depends on ADR-001, ADR-002 and ADR-003.
- Resolve OQ-18, OQ-22 and OQ-23 and update DL-09.
- Confirm the NFR-03 reading with the TAs (DL-10).
- Run Gate 1.



