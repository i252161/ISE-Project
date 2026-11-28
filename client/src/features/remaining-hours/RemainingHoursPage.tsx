import { useCallback, useEffect, useState } from 'react';

type PlanningState =
  | 'scheduled'
  | 'shortage'
  | 'unknown_availability'
  | 'no_estimate'
  | 'no_deadline'
  | 'completed'
  | 'deadline_passed'
  | 'no_remaining_effort';

interface AssignmentPlanningItem {
  assignmentId: string;
  title: string;
  course: { id: string; name: string };
  applicableDeadline: string | null;
  status: string;
  submissionStatus: string;
  effortHours: number | null;
  effectiveEffortHours: number | null;
  state: PlanningState;
  startBy: string | null;
  shortageHours: number;
  message: string;
  isSample: boolean;
  version: number;
}

interface StudentPlanResponse {
  studentId: string;
  today: string;
  timeZone: string;
  assignments: AssignmentPlanningItem[];
}

function formatStateLabel(item: AssignmentPlanningItem): string {
  switch (item.state) {
    case 'scheduled':
      return item.startBy ? `Start by ${item.startBy}` : item.message;
    case 'shortage':
      return `Short by ${Number.isInteger(item.shortageHours) ? item.shortageHours : item.shortageHours.toFixed(1)} h`;
    case 'unknown_availability':
      return item.message;
    case 'deadline_passed':
      return 'Deadline passed';
    case 'no_deadline':
      return 'No deadline';
    case 'completed':
      return 'Completed';
    case 'no_estimate':
      return 'No estimate';
    case 'no_remaining_effort':
      return 'No remaining effort';
  }
}

export function RemainingHoursPage() {
  const [plan, setPlan] = useState<StudentPlanResponse | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadPlan = useCallback(async () => {
    setLoadError(null);
    const res = await fetch('/api/planning', { credentials: 'same-origin' });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setLoadError(body?.error?.message ?? `Could not load planning data (HTTP ${res.status}).`);
      return;
    }
    const data = (await res.json()) as StudentPlanResponse;
    setPlan(data);
    // Preserve existing draft values on refresh; only initialise for new assignments
    setDrafts((prev) => {
      const next: Record<string, string> = { ...prev };
      for (const item of data.assignments) {
        if (!(item.assignmentId in next)) {
          next[item.assignmentId] = '';
        }
      }
      return next;
    });
  }, []);

  useEffect(() => {
    void loadPlan();
  }, [loadPlan]);

  async function handleReport(item: AssignmentPlanningItem) {
    const raw = (drafts[item.assignmentId] ?? '').trim();
    const parsed = raw === '' ? NaN : Number(raw);

    if (Number.isNaN(parsed)) {
      setErrors((prev) => ({
        ...prev,
        [item.assignmentId]: 'Enter a number between 0 and 200 in 0.5-hour steps.'
      }));
      return;
    }

    setSavingId(item.assignmentId);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[item.assignmentId];
      return copy;
    });

    try {
      const res = await fetch(`/api/assignments/${item.assignmentId}/remaining-hours`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remainingHours: parsed })
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          body?.error?.fieldErrors?.remainingHours ??
          body?.error?.message ??
          `Could not save report (HTTP ${res.status}).`;
        setErrors((prev) => ({ ...prev, [item.assignmentId]: msg }));
        return;
      }

      // Clear draft for this assignment after successful report
      setDrafts((prev) => ({ ...prev, [item.assignmentId]: '' }));
      await loadPlan();
    } finally {
      setSavingId(null);
    }
  }

  if (loadError) {
    return <p role="alert">{loadError}</p>;
  }

  if (!plan) {
    return <p>Loading…</p>;
  }

  const hasSampleData = plan.assignments.some((a) => a.isSample);

  return (
    <section aria-labelledby="remaining-hours-heading">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h2 id="remaining-hours-heading">Report remaining hours</h2>
        {hasSampleData && (
          <span
            style={{
              fontSize: '0.8rem',
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              background: '#eef2ff',
              border: '1px solid #c7d2fe'
            }}
          >
            Sample data
          </span>
        )}
      </div>
      <p>
        Planning day: <strong>{plan.today}</strong> ({plan.timeZone})
      </p>

      {plan.assignments.length === 0 ? (
        <p>No assignments found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.75rem' }}>
          {plan.assignments.map((item) => {
            const fieldError = errors[item.assignmentId];
            return (
              <li
                key={item.assignmentId}
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '0.75rem 1rem'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <div>
                    <strong>{item.title}</strong> — {item.course.name}
                    {item.isSample && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#4b5563' }}>
                        [sample data]
                      </span>
                    )}
                    <div style={{ fontSize: '0.875rem', color: '#374151', marginTop: '0.2rem' }}>
                      Deadline: {item.applicableDeadline ?? 'None'} · Status: {item.status}
                      {item.effectiveEffortHours !== null && (
                        <> · Effective effort: {item.effectiveEffortHours} h</>
                      )}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, color: item.state === 'shortage' ? '#b91c1c' : undefined }}>
                    {formatStateLabel(item)}
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleReport(item);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '0.6rem'
                  }}
                >
                  <label htmlFor={`rem-${item.assignmentId}`}>Hours left (0–200):</label>
                  <input
                    id={`rem-${item.assignmentId}`}
                    type="number"
                    step="0.5"
                    min="0"
                    max="200"
                    value={drafts[item.assignmentId] ?? ''}
                    onChange={(e) =>
                      setDrafts((prev) => ({ ...prev, [item.assignmentId]: e.target.value }))
                    }
                    style={{ width: '6rem', padding: '0.25rem' }}
                  />
                  <button type="submit" disabled={savingId === item.assignmentId}>
                    {savingId === item.assignmentId ? 'Reporting…' : 'Report'}
                  </button>
                </form>

                {fieldError && (
                  <p role="alert" style={{ color: '#b91c1c', margin: '0.4rem 0 0' }}>
                    {fieldError}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
