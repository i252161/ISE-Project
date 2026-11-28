import { useEffect, useState } from 'react';

interface AvailabilityDay {
  date: string;
  hours: number | null;
  availability: 'known' | 'unknown';
  source: 'individual' | null;
}

interface AvailabilityResponse {
  days: AvailabilityDay[];
  timeZone: 'Asia/Karachi';
}

export function AvailabilityPage() {
  const [days, setDays] = useState<AvailabilityDay[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/availability?days=7', { credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load availability');
        return response.json() as Promise<AvailabilityResponse>;
      })
      .then((data) => {
        if (!active) return;
        setDays(data.days);
        setDrafts(Object.fromEntries(data.days.map((day) => [
          day.date,
          day.hours === null ? '' : day.hours.toFixed(1)
        ])));
      })
      .catch(() => {
        if (active) setMessage('Could not load availability.');
      });
    return () => { active = false; };
  }, []);

  async function saveAvailability() {
    setMessage('');
    const nextErrors: Record<string, string> = {};
    const nextDays = [...days];

    for (let index = 0; index < days.length; index += 1) {
      const day = days[index]!;
      const raw = drafts[day.date] ?? '';
      let hours: number | null;

      if (raw.trim() === '') {
        hours = null;
      } else {
        if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw.trim())) {
          nextErrors[day.date] = 'Enter 0 to 24 hours in 0.5-hour steps.';
          continue;
        }
        hours = Number(raw.trim());
        if (!Number.isFinite(hours) || hours < 0 || hours > 24 || hours * 2 !== Math.trunc(hours * 2)) {
          nextErrors[day.date] = 'Enter 0 to 24 hours in 0.5-hour steps.';
          continue;
        }
      }

      const response = await fetch(`/api/availability/${day.date}`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours })
      });
      if (!response.ok) {
        const payload = await response.json() as { error?: { fieldErrors?: Record<string, string> } };
        nextErrors[day.date] = payload.error?.fieldErrors?.hours
          ?? 'Enter 0 to 24 hours in 0.5-hour steps.';
      } else {
        const saved = await response.json() as AvailabilityDay;
        nextDays[index] = saved;
        setDrafts((current) => ({
          ...current,
          [saved.date]: saved.hours === null ? '' : saved.hours.toFixed(1)
        }));
      }
    }

    setErrors(nextErrors);
    setDays(nextDays);
    if (Object.keys(nextErrors).length === 0) setMessage('Availability saved.');
  }

  return (
    <section>
      <h2>Study availability</h2>
      <p>Set the hours you can study each day. Blank means Unknown.</p>
      <table>
        <thead>
          <tr><th>Day / Date</th><th>Available hours</th><th>State</th></tr>
        </thead>
        <tbody>
          {days.map((day, index) => (
            <tr key={day.date}>
              <td>{index === 0 ? 'Today' : day.date}</td>
              <td>
                <input
                  aria-label={`Available hours for ${day.date}`}
                  type="text"
                  value={drafts[day.date] ?? ''}
                  onChange={(event) => {
                    setDrafts((current) => ({ ...current, [day.date]: event.target.value }));
                    setErrors((current) => ({ ...current, [day.date]: '' }));
                  }}
                />
                {errors[day.date] && <div role="alert">{errors[day.date]}</div>}
              </td>
              <td>{day.hours === null ? 'Unknown' : 'Known'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" onClick={saveAvailability}>Save availability</button>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
