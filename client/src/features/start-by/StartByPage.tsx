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
  officialDeadline: string | null;
  studentDeadline: string | null;
  applicableDeadline: string | null;
  status: 'not_started' | 'already_started' | 'finished';
  submissionStatus: 'submitted' | 'not_submitted' | 'unavailable';
  effortHours: number | null;
  effectiveEffortHours: number | null;
  state: PlanningState;
  startBy: string | null;
  shortageHours: number;
  unknownDates: string[];
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

function formatResultLabel(item: AssignmentPlanningItem): string {
  switch (item.state) {
    case 'scheduled':
      return item.message;
    case 'shortage':
      return `short by ${Number.isInteger(item.shortageHours) ? item.shortageHours : item.shortageHours.toFixed(1)} h`;
    case 'unknown_availability':
      return item.message;
    case 'deadline_passed':
      return 'deadline passed';
    case 'no_deadline':
      return 'no deadline';
    case 'completed':
      return 'completed';
    case 'no_estimate':
      return 'no estimate';
    case 'no_remaining_effort':
      return 'no remaining effort';
  }
}

export function StartByPage() {
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
    const nextDrafts: Record<string, string> = {};
    for (const item of data.assignments) {
      nextDrafts[item.assignmentId] = item.effortHours === null ? '' : String(item.effortHours);
    }
    setDrafts(nextDrafts);
  }, []);

  useEffect(() => {
    void loadPlan();
  }, [loadPlan]);

  async function handleSaveEffort(item: AssignmentPlanningItem) {
    const raw = (drafts[item.assignmentId] ?? '').trim();
    let hoursPayload: number | null | string;
    if (raw === '') {
      hoursPayload = null;
    } else {
      const parsed = Number(raw);
      hoursPayload = Number.isNaN(parsed) ? raw : parsed;
    }

    setSavingId(item.assignmentId);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[item.assignmentId];
      return copy;
    });

    try {
      const res = await fetch(`/api/assignments/${item.assignmentId}/effort`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours: hoursPayload, version: item.version })
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          body?.error?.fieldErrors?.hours ??
          body?.error?.message ??
          `Could not save effort (HTTP ${res.status}).`;
        setErrors((prev) => ({ ...prev, [item.assignmentId]: msg }));
        if (res.status === 409) {
          await loadPlan();
        }
        return;
      }

      await loadPlan();
    } finally {
      setSavingId(null);
    }
  }

  if (loadError) {
    return <p role="alert">{loadError}</p>;
  }

  if (!plan) {
    return <p>Loading start-by dates…</p>;
  }

  const hasSampleData = plan.assignments.some((a) => a.isSample);

  return (
    <section aria-labelledby="start-by-heading">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h2 id="start-by-heading">Start-by dates</h2>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <strong>{item.title}</strong> — {item.course.name}
                    {item.isSample && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#4b5563' }}>
                        [sample data]
                      </span>
                    )}
                    <div style={{ fontSize: '0.875rem', color: '#374151', marginTop: '0.2rem' }}>
                      Deadline: {item.applicableDeadline ?? 'None'} · Status: {item.status} · Submission:{' '}
                      {item.submissionStatus}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600 }}>{formatResultLabel(item)}</div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSaveEffort(item);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.6rem' }}
                >
                  <label htmlFor={`effort-${item.assignmentId}`}>Effort (0.5–200 h, blank = no estimate):</label>
                  <input
                    id={`effort-${item.assignmentId}`}
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
                    {savingId === item.assignmentId ? 'Saving…' : 'Save'}
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
