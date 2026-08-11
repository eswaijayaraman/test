import { describe, it, expect } from 'vitest';
import {
  parseWeakTableString,
  normalizeStudentSections,
  computeDashboardFilters,
  getHeatmapRange,
  formatCsvCell,
  renderHeatmapData,
  buildRosterSummary,
  isValidAdminCredentials,
  isValidTeacherCredentials,
} from './dashboardHelpers.js';

describe('dashboardHelpers', () => {
  it('parses weak table strings with commas and whitespace', () => {
    expect(parseWeakTableString('7, 13,14')).toEqual(['7', '13', '14']);
    expect(parseWeakTableString('')).toEqual([]);
    expect(parseWeakTableString(null)).toEqual([]);
  });

  it('normalizes assigned sections from comma-separated input', () => {
    expect(normalizeStudentSections('A,B,C')).toEqual(['A', 'B', 'C']);
    expect(normalizeStudentSections(' A , B ')).toEqual(['A', 'B']);
    expect(normalizeStudentSections('')).toEqual([]);
  });

  it('returns correct heatmap ranges for grade levels', () => {
    expect(getHeatmapRange(4)).toBe(12);
    expect(getHeatmapRange(5)).toBe(15);
    expect(getHeatmapRange(6)).toBe(20);
    expect(getHeatmapRange(99)).toBe(20);
  });

  it('quotes CSV cells with commas and quotes properly', () => {
    expect(formatCsvCell('7,13,14')).toBe('"7,13,14"');
    expect(formatCsvCell('hello"world')).toBe('"hello""world"');
    expect(formatCsvCell('plain')).toBe('plain');
    expect(formatCsvCell(null)).toBe('');
  });

  it('computes heatmap data with error rates for weak tables', () => {
    const records = [
      { Weak_Tables: '7,13' },
      { Weak_Tables: '7' },
      { Weak_Tables: '14' },
    ];

    const results = renderHeatmapData(records, 15);
    expect(results[6]).toEqual(expect.objectContaining({ tableNum: 7, count: 2, errorRate: 66.7 }));
    expect(results[12]).toEqual(expect.objectContaining({ tableNum: 13, count: 1, errorRate: 33.3 }));
    expect(results[13]).toEqual(expect.objectContaining({ tableNum: 14, count: 1, errorRate: 33.3 }));
  });

  it('validates admin and teacher credentials correctly', () => {
    expect(isValidAdminCredentials('eswarijayaraman', 'sandipani')).toBe(true);
    expect(isValidAdminCredentials('eswarijayaraman', 'wrong')).toBe(false);
    expect(isValidTeacherCredentials('Anita', 'Anita_sandipani')).toBe(true);
    expect(isValidTeacherCredentials('Anita', 'anita_sandipani')).toBe(false);
  });

  it('computes dashboard filters for admin and teacher roles', () => {
    expect(computeDashboardFilters({ role: 'Admin' }, null, null)).toEqual({ grade: null, section: null, allowedSections: null });
    expect(computeDashboardFilters({ role: 'Teacher', grade: 5, sections: 'A,B' }, null, null)).toEqual({ grade: 5, section: null, allowedSections: ['A', 'B'] });
    expect(computeDashboardFilters({ role: 'Teacher', grade: 5, sections: 'A,B' }, null, 'A')).toEqual({ grade: 5, section: 'A', allowedSections: ['A', 'B'] });
  });

  it('builds roster summaries aggregated by student', () => {
    const records = [
      {
        Roll_Number: '401',
        Student_Name: 'Aarav',
        Grade: 5,
        Section: 'A',
        Score: 90,
        Weak_Tables: '12',
        Created_Time: '2026-08-11T10:00:00.000Z',
      },
      {
        Roll_Number: '401',
        Student_Name: 'Aarav',
        Grade: 5,
        Section: 'A',
        Score: 95,
        Weak_Tables: '12,13',
        Created_Time: '2026-08-12T10:00:00.000Z',
      },
    ];

    const roster = buildRosterSummary(records);
    expect(roster).toHaveLength(1);
    expect(roster[0]).toMatchObject({
      studentName: 'Aarav',
      rollNumber: '401',
      totalAttempts: 2,
      latestScore: 95,
      highestScore: 95,
      identifiedWeakTables: '12, 13',
    });
  });
});
