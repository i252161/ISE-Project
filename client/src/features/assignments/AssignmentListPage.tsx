import { useEffect, useState } from 'react';
import { fetchAssignments, formatDay, STATUS_LABEL, SUBMISSION_LABEL, type AssignmentListItem } from './api';
import { cell, headCell, muted, sampleBadge, table } from './styles';

/** E-05 read-only assignment list (wireframes.md §3). S-16 adds search, filters and sort above the table. */
export function AssignmentListPage() {
  const [items, setItems] = useState<AssignmentListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetchAssignments()
      .then((list) => live && setItems(list))
      .catch((err: Error) => live && setError(err.message));
    return () => {
      live = false;
    };
  }, []);

  const anySample = items?.some((a) => a.isSample) ?? false;

  return (
    <section aria-labelledby="assignments-title">
      <h2 id="assignments-title">
        Assignments {anySample && <span style={sampleBadge}>Sample data</span>}
      </h2>
      {anySample && (
        <p style={muted}>These courses and assignments are made-up sample data. They are not from Google Classroom.</p>
      )}
      {/* [S-16] Search, filter & sort controls */}

      {error && <p role="alert">Could not load assignments: {error}</p>}
      {!items && !error && <p>Loading…</p>}
      {items && items.length === 0 && <p>No assignments.</p>}
      {items && items.length > 0 && (
        <>
          <p style={muted}>{items.length} assignments, sorted by deadline (no deadline last).</p>
          <table style={table}>
            <thead>
              <tr>
                <th style={headCell}>Assignment</th>
                <th style={headCell}>Course</th>
                <th style={headCell}>Deadline</th>
                <th style={headCell}>Status</th>
                <th style={headCell}>Submission</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td style={cell}>
                    <a href={`#/assignments/${a.id}`}>{a.title}</a>
                  </td>
                  <td style={cell}>{a.course.name}</td>
                  <td style={cell}>
                    {a.applicableDeadline === null ? (
                      <span style={muted}>No deadline</span>
                    ) : (
                      <>
                        {formatDay(a.applicableDeadline)}
                        {a.officialDeadline === null && <span style={muted}> (your deadline)</span>}
                      </>
                    )}
                  </td>
                  <td style={cell}>{STATUS_LABEL[a.status]}</td>
                  <td style={cell}>{SUBMISSION_LABEL[a.submissionStatus]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
