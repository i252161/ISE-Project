import { availability as availabilityData } from '../../data-access/index';

export interface AvailabilityDay {
  date: string;
  hours: number | null;
  availability: 'known' | 'unknown';
  source: 'individual' | null;
}

export class ValidationError extends Error {
  constructor(public fieldErrors: Record<string, string>) {
    super('Invalid availability input.');
  }
}

const HOURS_ERROR = 'Enter 0 to 24 hours in 0.5-hour steps.';

export function validateHours(value: unknown): value is number | null {
  if (value === null) {
    return true;
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new ValidationError({ hours: HOURS_ERROR });
  }
  if (value < 0 || value > 24 || value * 2 !== Math.trunc(value * 2)) {
    throw new ValidationError({ hours: HOURS_ERROR });
  }
  return true;
}

export function todayInKarachi(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

export function addUtcDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days));
  return [
    result.getUTCFullYear(),
    String(result.getUTCMonth() + 1).padStart(2, '0'),
    String(result.getUTCDate()).padStart(2, '0')
  ].join('-');
}

export function assertDateInHorizon(studyDate: string, now: Date = new Date()) {
  if (!isValidDate(studyDate)) {
    throw new ValidationError({ date: 'Enter a date in YYYY-MM-DD format.' });
  }
  const today = todayInKarachi(now);
  const last = addUtcDays(today, 6);
  if (studyDate < today || studyDate > last) {
    throw new ValidationError({ date: 'Date must be within today and the next six days.' });
  }
}

export async function getAvailability(
  studentId: string,
  from: string,
  days: number,
  now: Date = new Date()
): Promise<{ days: AvailabilityDay[]; timeZone: 'Asia/Karachi' }> {
  if (!isValidDate(from)) {
    throw new ValidationError({ date: 'Enter a date in YYYY-MM-DD format.' });
  }
  if (days !== 7) {
    throw new ValidationError({ days: 'days must be 7.' });
  }
  const today = todayInKarachi(now);
  if (from !== today) {
    throw new ValidationError({ date: 'from must be today in Asia/Karachi.' });
  }

  const rows = await availabilityData.getRange(studentId, from, days);
  const byDate = new Map(rows.map((row) => [row.study_date, row]));
  const result: AvailabilityDay[] = [];
  for (let offset = 0; offset < days; offset += 1) {
    const date = addUtcDays(from, offset);
    const row = byDate.get(date);
    if (!row) {
      result.push({ date, hours: null, availability: 'unknown', source: null });
    } else {
      const hours = Number(row.hours);
      result.push({ date, hours, availability: 'known', source: 'individual' });
    }
  }
  return { days: result, timeZone: 'Asia/Karachi' };
}

export async function putAvailability(
  studentId: string,
  studyDate: string,
  hours: unknown,
  now: Date = new Date()
): Promise<AvailabilityDay> {
  assertDateInHorizon(studyDate, now);
  validateHours(hours);

  if (hours === null) {
    await availabilityData.clear(studentId, studyDate);
    return { date: studyDate, hours: null, availability: 'unknown', source: null };
  }

  if (typeof hours !== 'number') {
    throw new ValidationError({ hours: HOURS_ERROR });
  }
  await availabilityData.upsert(studentId, studyDate, hours, now.toISOString());
  return { date: studyDate, hours, availability: 'known', source: 'individual' };
}
