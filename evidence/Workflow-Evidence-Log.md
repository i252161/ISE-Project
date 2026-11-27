# Workflow Evidence Log

**Project:** AI Academic Deadline Planner (D4)
**Required by:** Final Project Deliverable (D4), section "Workflow Evidence — Mandatory".

## How to use this log

- Add one row for every pass through the Stage 4 loop for a slice. If a slice is revised and re-run, add a new row; don't overwrite the old one.
- Fill it in as you go, not at the end. D4 says the log must let someone "reconstruct how the product evolved".
- Only record what actually happened: real chat or task references, real check results, and real decisions. Leave a cell empty rather than guessing.
- **HITL/AFK:**
  - HITL (human in the loop) means a member works alongside the AI.
  - AFK (delegated) means the AI works alone and a member reviews the result.
  - Add a one-line reason for the choice.
- **Decision:** write Accept, Revise or Reject, and give the reason.
- **Plan version:** the `plans/plan-vNN.md` copy in force when the decision was made.
- Where possible, link to the evidence itself: the chat export, the Git branch or commit, or the row in `Test-Evidence.md`.

## Log

| # | Date | Slice ID / name | Related requirement(s) | Leading / responsible member | Acceptance criteria used | HITL / AFK + reason | AI chat / task reference | Important iterations / correction loops | Checks run and actual results | Human decision (Accept / Revise / Reject) + reason | Major issue / change | plan.md version | Integration status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

## Other evidence to keep (D4)

Record these when they happen, with links:

- meaningful AI conversations;
- branches;
- rejected or revised approaches;
- implementation failures and self-corrections;
- context updates (PRD, architecture, AGENTS.md);
- ADR changes.

| Date | Type | Description | Link / location |
|---|---|---|---|
