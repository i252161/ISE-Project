import { useEffect, useState } from 'react';
import {
  fetchAssignment,
  formatDay,
  formatHours,
  formatTimestamp,
  NotFound,
  STATUS_LABEL,
  SUBMISSION_LABEL,
  type AssignmentDetail
} from './api';
import { muted, sampleBadge, slot } from './styles';

/**
 * E-05 read-only assignment detail (wireframes.md §4).
 *
 * The marked slots at the bottom belong to later slices (DL-55). A slice replaces ONLY its own
 * <section data-slice-slot="…"> line with its component, e.g. <SubtasksSlot assignment={a} />,
 * imported from client/src/features/<slice-name>/. Keep the data-slice-slot attribute.
 */
export function AssignmentDetailPage({ id }: { id: string }) {
  const [a, setA] = useState<AssignmentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setA(null);
    setError(null);
    fetchAssignment(id)
      .then((detail) => live && setA(detail))
      .catch((err: Error) => live && setError(err instanceof NotFound ? 'This assignment does not exist.' : err.message));
    return () => {
      live = false;
    };
  }, [id]);

  return (
    <section aria-labelledby="assignment-title">
      <p>
        <a href="#/assignments">← Assignments</a>
      </p>
      {error && <p role="alert">{error}</p>}
      {!a && !error && <p>Loading…</p>}
      {a && (
        <>
          <h2 id="assignment-title">
            {a.title} — {a.course.name} {a.isSample && <span style={sampleBadge}>Sample data</span>}
          </h2>
          <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '0.3rem 1rem' }}>
            <dt>Official deadline</dt>
            <dd style={{ margin: 0 }}>{a.officialDeadline ? formatDay(a.officialDeadline) : <span style={muted}>No deadline</span>}</dd>
            <dt>Your deadline</dt>
            <dd style={{ margin: 0 }}>{formatDay(a.studentDeadline)}</dd>
            <dt>Status</dt>
            <dd style={{ margin: 0 }}>{STATUS_LABEL[a.status]}</dd>
            <dt>Submission</dt>
            <dd style={{ margin: 0 }}>{SUBMISSION_LABEL[a.submissionStatus]}</dd>
            <dt>Effort entered</dt>
            <dd style={{ margin: 0 }}>{formatHours(a.effortHours)}</dd>
            <dt>Latest remaining hours</dt>
            <dd style={{ margin: 0 }}>
              {a.latestRemainingHours
                ? `${formatHours(a.latestRemainingHours.remainingHours)} (reported ${formatTimestamp(a.latestRemainingHours.reportedAt)})`
                : '—'}
            </dd>
            <dt>Hours used for planning</dt>
            <dd style={{ margin: 0 }}>{formatHours(a.effectiveEffortHours)}</dd>
            <dt>Last activity</dt>
            <dd style={{ margin: 0 }}>{formatTimestamp(a.lastActivityAt)}</dd>
          </dl>
          {a.description && <p>{a.description}</p>}

          {/* --- E-03 shared assignment detail page: slice-owned slots (DL-55). One line each. --- */}
          <section data-slice-slot="S-03-start-by" style={slot}>Start-by date: not built yet (S-03)</section>
          <section data-slice-slot="S-04-allocation" style={slot}>Allocation: not built yet (S-04)</section>
          <section data-slice-slot="S-07-remaining-hours" style={slot}>Remaining-hours report: not built yet (S-07)</section>
          <section data-slice-slot="S-08-status" style={slot}>Status controls: not built yet (S-08)</section>
          <section data-slice-slot="S-09-balance-warnings" style={slot}>Warnings: not built yet (S-09)</section>
          <section data-slice-slot="S-10-student-deadline" style={slot}>Your own deadline: not built yet (S-10)</section>
          <section data-slice-slot="S-14-subtasks" style={slot}>Subtasks: not built yet (S-14)</section>
          <section data-slice-slot="S-15-study-timer" style={slot}>Study timer: not built yet (S-15)</section>
        </>
      )}
    </section>
  );
}
