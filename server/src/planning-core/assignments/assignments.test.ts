import { describe, expect, it } from 'vitest';
import { applicableDeadline, compareByDeadline, effectiveEffortHours, type AssignmentListItem } from './index';

// E-05 rules, no database.

const t = (iso: string) => new Date(iso);

describe('E-05 planning-core assignment rules', () => {
  it('E-05-U1 applicable deadline: official wins, else Student, else none', () => {
    expect(applicableDeadline({ officialDeadline: '2026-12-02', studentDeadline: '2026-12-01' })).toBe('2026-12-02');
    expect(applicableDeadline({ officialDeadline: null, studentDeadline: '2026-12-01' })).toBe('2026-12-01');
    expect(applicableDeadline({ officialDeadline: null, studentDeadline: null })).toBeNull();
  });

  it('E-05-U2 effective effort is whichever was saved last (DL-50 worked example)', () => {
    // Effort 6 h Monday, report 4 h Tuesday → 4 h.
    const base = { effortHours: 6, effortUpdatedAt: t('2026-11-23T09:00:00Z'), latestReportHours: 4, latestReportAt: t('2026-11-24T09:00:00Z') };
    expect(effectiveEffortHours(base)).toBe(4);
    // Effort edited to 5 h Wednesday → 5 h.
    expect(effectiveEffortHours({ ...base, effortHours: 5, effortUpdatedAt: t('2026-11-25T09:00:00Z') })).toBe(5);
    // A report of 0 is a real value, not "missing".
    expect(effectiveEffortHours({ ...base, latestReportHours: 0 })).toBe(0);
    expect(effectiveEffortHours({ ...base, latestReportHours: null, latestReportAt: null })).toBe(6);
    expect(effectiveEffortHours({ ...base, effortHours: null, effortUpdatedAt: null })).toBe(4);
    expect(effectiveEffortHours({ effortHours: null, effortUpdatedAt: null, latestReportHours: null, latestReportAt: null })).toBeNull();
  });

  it('E-05-U3 sorts by deadline ascending, undated last, ties by title then id', () => {
    const item = (id: string, title: string, d: string | null) => ({ id, title, applicableDeadline: d }) as AssignmentListItem;
    const sorted = [
      item('3', 'B', null), item('2', 'Z', '2026-12-05'), item('5', 'A', null),
      item('1', 'Lab 3', '2026-12-02'), item('4', 'Lab 3', '2026-12-02'), item('0', 'Alpha', '2026-12-02')
    ].sort(compareByDeadline);
    expect(sorted.map((a) => a.id)).toEqual(['0', '1', '4', '2', '5', '3']);
  });
});
