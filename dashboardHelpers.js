export function parseWeakTableString(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((table) => table.trim())
    .filter((table) => table.length > 0);
}

export function normalizeStudentSections(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function computeDashboardFilters(teacher, gradeFilter, sectionFilter) {
  const grade = gradeFilter ? Number(gradeFilter) : null;
  const section = sectionFilter ? String(sectionFilter).trim() : null;
  const allowedSections = teacher?.role === 'Teacher' ? normalizeStudentSections(teacher.sections) : null;

  if (teacher?.role === 'Admin') {
    return { grade: grade || null, section: section || null, allowedSections: null };
  }

  let selectedGrade = grade || (teacher?.grade || null);
  let selectedSection = section || (allowedSections?.length === 1 ? allowedSections[0] : null);

  return {
    grade: selectedGrade,
    section: selectedSection,
    allowedSections,
  };
}

export function getHeatmapRange(grade) {
  if (grade === 4) return 12;
  if (grade === 5) return 15;
  return 20;
}

export function formatCsvCell(value) {
  const stringValue = value == null ? '' : String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function renderHeatmapData(records, range) {
  const frequency = {};
  const total = records.length || 1;

  records.forEach((record) => {
    const tables = parseWeakTableString(record.Weak_Tables || record.weakTables || '');
    tables.forEach((table) => {
      const number = Number(table);
      if (Number.isInteger(number)) {
        frequency[number] = (frequency[number] || 0) + 1;
      }
    });
  });

  return Array.from({ length: range }, (_, index) => {
    const tableNum = index + 1;
    const count = frequency[tableNum] || 0;
    const errorRate = Number(((count / total) * 100).toFixed(1));
    return { tableNum, count, errorRate };
  });
}

export function isValidAdminCredentials(username, password) {
  return username === 'eswarijayaraman' && password === 'sandipani';
}

export function isValidTeacherCredentials(name, password) {
  const normalizedName = String(name || '').trim();
  return normalizedName.length > 0 && password === `${normalizedName}_sandipani`;
}

export function buildRosterSummary(records) {
  const roster = new Map();

  records.forEach((record) => {
    const studentKey = `${record.Roll_Number || ''}||${record.Student_Name || ''}`;
    const row = roster.get(studentKey) || {
      studentName: record.Student_Name || 'Unknown',
      rollNumber: record.Roll_Number || '—',
      grade: record.Grade || '—',
      section: record.Section || '—',
      totalAttempts: 0,
      latestScore: 0,
      highestScore: 0,
      lastTestDate: null,
      weakTableCounts: {},
      testRecords: [],
    };

    row.totalAttempts += 1;
    row.latestScore = record.Score || row.latestScore;
    row.highestScore = Math.max(row.highestScore, record.Score || 0);
    const createdAt = record.Created_Time ? new Date(record.Created_Time) : new Date(record.createdTime || null);
    if (!row.lastTestDate || (createdAt && createdAt > row.lastTestDate)) {
      row.lastTestDate = createdAt;
      row.latestScore = record.Score || row.latestScore;
    }

    const weakTables = parseWeakTableString(record.Weak_Tables || record.weakTables || '');
    weakTables.forEach((table) => {
      row.weakTableCounts[table] = (row.weakTableCounts[table] || 0) + 1;
    });

    row.testRecords.push(record);
    roster.set(studentKey, row);
  });

  return Array.from(roster.values()).map((row) => {
    const topWeakTables = Object.entries(row.weakTableCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([table]) => table)
      .join(', ');

    return {
      ...row,
      identifiedWeakTables: topWeakTables || 'None',
      lastTestDate: row.lastTestDate ? row.lastTestDate.toISOString() : '',
    };
  });
}
