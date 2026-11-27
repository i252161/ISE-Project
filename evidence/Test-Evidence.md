# Test Evidence

**Project:** AI Academic Deadline Planner (D4)
**Required by:** Testing Instructions and Quality Gates (D4), section "Testing Evidence".

## How to use this table

- Record the tests that decide whether a slice can be accepted. You don't need long reports.
- **Test Type:** one of
  - **functional:** does it meet the requirement?
  - **negative:** invalid, missing or unexpected input.
  - **EP:** equivalence partitioning, one value from each valid or invalid group.
  - **BVA:** boundary value analysis, values at and just beside a limit.
  - **regression:** do earlier slices still work?
- Use EP and BVA only where they make sense. Don't apply them to every requirement.
- **Actual** must be the real observed result from a test a team member ran. A slice is not complete just because the AI agent says it works.
- Keep failed attempts and re-tests as their own rows. They are useful evidence.
- In "Slice / Requirement", reference the slice ID and the PRD acceptance criterion where one exists (for example `FR-15-AC8`).

## Results

| Slice / Requirement | Test Type | Input / Condition | Expected | Actual | Pass / Fail |
|---|---|---|---|---|---|
