import { generateGrade4Question } from './grade4Gen.js';
import { generateGrade5Question } from './grade5Gen.js';
import { generateGrade6Question } from './grade6Gen.js';
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

const TIME_LIMITS = { 4: 60, 5: 45, 6: 30 };
const QUESTION_COUNT = 10;

const elements = {
  profileSection: document.getElementById('profileSection'),
  teacherLoginSection: document.getElementById('teacherLoginSection'),
  dashboardSection: document.getElementById('dashboardSection'),
  testSection: document.getElementById('testSection'),
  resultSection: document.getElementById('resultSection'),
  profileForm: document.getElementById('profileForm'),
  studentName: document.getElementById('studentName'),
  studentGrade: document.getElementById('studentGrade'),
  studentSection: document.getElementById('studentSection'),
  studentRollNumber: document.getElementById('studentRollNumber'),
  teacherLoginForm: document.getElementById('teacherLoginForm'),
  teacherName: document.getElementById('teacherName'),
  teacherRole: document.getElementById('teacherRole'),
  teacherAssignedGrade: document.getElementById('teacherAssignedGrade'),
  teacherAssignedSections: document.getElementById('teacherAssignedSections'),
  teacherPassword: document.getElementById('teacherPassword'),
  teacherLoginError: document.getElementById('teacherLoginError'),
  dashboardGradeFilter: document.getElementById('dashboardGradeFilter'),
  dashboardSectionFilter: document.getElementById('dashboardSectionFilter'),
  dashboardLoadBtn: document.getElementById('dashboardLoadBtn'),
  metricTotalDrills: document.getElementById('metricTotalDrills'),
  metricAvgAccuracy: document.getElementById('metricAvgAccuracy'),
  metricAvgSpeed: document.getElementById('metricAvgSpeed'),
  metricWeakTables: document.getElementById('metricWeakTables'),
  heatmapGrid: document.getElementById('heatmapGrid'),
  heatmapDescription: document.getElementById('heatmapDescription'),
  heatmapDetail: document.getElementById('heatmapDetail'),
  scoreDistribution: document.getElementById('scoreDistribution'),
  exportCsvBtn: document.getElementById('exportCsvBtn'),
  rosterDateStart: document.getElementById('rosterDateStart'),
  rosterDateEnd: document.getElementById('rosterDateEnd'),
  rosterSearch: document.getElementById('rosterSearch'),
  rosterTableContainer: document.getElementById('rosterTableContainer'),
  questionProgress: document.getElementById('questionProgress'),
  timerBadge: document.getElementById('timerBadge'),
  timerBar: document.getElementById('timerBar'),
  questionLabel: document.getElementById('questionLabel'),
  answerInput: document.getElementById('answerInput'),
  submitAnswerBtn: document.getElementById('submitAnswerBtn'),
  skipQuestionBtn: document.getElementById('skipQuestionBtn'),
  feedbackMessage: document.getElementById('feedbackMessage'),
  scoreValue: document.getElementById('scoreValue'),
  accuracyValue: document.getElementById('accuracyValue'),
  timeValue: document.getElementById('timeValue'),
  weakTablesValue: document.getElementById('weakTablesValue'),
  retryTestBtn: document.getElementById('retryTestBtn'),
  newProfileBtn: document.getElementById('newProfileBtn'),
  saveStatus: document.getElementById('saveStatus'),
};

const state = {
  student: null,
  grade: null,
  section: null,
  rollNumber: null,
  teacher: null,
  dashboardRecords: [],
  rosterSummary: [],
  questions: [],
  currentIndex: 0,
  correctCount: 0,
  answers: [],
  missedTables: new Set(),
  tableAttempts: {},
  tableErrors: {},
  timer: null,
  timeStarted: null,
  timeTaken: 0,
  savedToCatalyst: false,
};

function showSection(sectionId) {
  ['profileSection', 'teacherLoginSection', 'dashboardSection', 'testSection', 'resultSection'].forEach((id) => {
    const section = document.getElementById(id);
    if (!section) return;
    section.classList.toggle('hidden', id !== sectionId);
  });
}

function formatSeconds(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = Math.max(0, Math.ceil(seconds % 60)).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function createQuestionForGrade(grade, preferredTable = null) {
  if (grade === 4) {
    return generateGrade4Question(preferredTable);
  }
  if (grade === 5) {
    return generateGrade5Question(preferredTable);
  }
  return generateGrade6Question(preferredTable);
}

function getPreferredTable() {
  if (state.missedTables.size === 0) {
    return null;
  }
  const missed = Array.from(state.missedTables);
  return missed[Math.floor(Math.random() * missed.length)];
}

function buildQuestionQueue() {
  state.questions = Array.from({ length: QUESTION_COUNT }, () => createQuestionForGrade(state.grade));
  state.currentIndex = 0;
  state.correctCount = 0;
  state.answers = [];
  state.tableAttempts = {};
  state.tableErrors = {};
  state.missedTables = new Set();
  state.savedToCatalyst = false;
}

function updateQuestionProgress() {
  elements.questionProgress.textContent = `Question ${state.currentIndex + 1} of ${QUESTION_COUNT}`;
}

function renderQuestion() {
  if (state.currentIndex >= state.questions.length) {
    finishTest();
    return;
  }

  const question = state.questions[state.currentIndex];
  elements.questionLabel.textContent = question.text;
  elements.answerInput.value = '';
  elements.feedbackMessage.textContent = '';
  elements.answerInput.focus();
  updateQuestionProgress();
}

function refreshTimer() {
  const totalSeconds = TIME_LIMITS[state.grade];
  const elapsedSeconds = (Date.now() - state.timeStarted) / 1000;
  const remaining = Math.max(0, totalSeconds - elapsedSeconds);
  const percent = Math.max(0, Math.min(100, (remaining / totalSeconds) * 100));

  elements.timerBadge.textContent = formatSeconds(remaining);
  elements.timerBar.style.width = `${percent}%`;
  if (percent > 60) {
    elements.timerBar.style.background = 'linear-gradient(90deg, #22c55e, #84cc16)';
  } else if (percent > 30) {
    elements.timerBar.style.background = 'linear-gradient(90deg, #f59e0b, #f97316)';
  } else {
    elements.timerBar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
  }

  if (remaining <= 0) {
    finishTest();
  }
}

function startTimer() {
  state.timeStarted = Date.now();
  refreshTimer();
  if (state.timer) clearInterval(state.timer);
  state.timer = setInterval(refreshTimer, 100);
}

function stopTimer() {
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
  state.timeTaken = Math.round((Date.now() - state.timeStarted) / 1000);
}

function evaluateAnswer(rawValue, expected) {
  const normalized = rawValue.trim();
  if (normalized === '') {
    return false;
  }

  const answerNumber = Number(normalized);
  if (Number.isNaN(answerNumber)) {
    return false;
  }

  if (!Number.isInteger(expected)) {
    return Math.abs(answerNumber - expected) < 0.01;
  }
  return answerNumber === expected;
}

function replaceFutureQuestion(preferredTable) {
  const futureIndex = state.questions.findIndex((_, idx) => idx > state.currentIndex);
  if (futureIndex !== -1) {
    state.questions[futureIndex] = createQuestionForGrade(state.grade, preferredTable);
  }
}

function recordTableAttempt(table, isError) {
  const key = String(table);
  state.tableAttempts[key] = (state.tableAttempts[key] || 0) + 1;
  if (isError) {
    state.tableErrors[key] = (state.tableErrors[key] || 0) + 1;
  }
}

function handleAnswer(isCorrect, question) {
  const tableKey = question.table;
  recordTableAttempt(tableKey, !isCorrect);

  if (isCorrect) {
    state.correctCount += 1;
    elements.feedbackMessage.textContent = 'Great work!';
    elements.feedbackMessage.style.color = '#16a34a';
  } else {
    state.missedTables.add(question.table);
    replaceFutureQuestion(question.table);
    elements.feedbackMessage.textContent = `Keep trying — correct answer was ${question.answer}.`;
    elements.feedbackMessage.style.color = '#b91c1c';
  }

  state.answers.push({ question, isCorrect });
  state.currentIndex += 1;

  setTimeout(() => {
    if (state.currentIndex >= state.questions.length) {
      finishTest();
      return;
    }
    renderQuestion();
  }, 260);
}

async function finishTest() {
  stopTimer();
  state.timeTaken = state.timeTaken || Math.round((Date.now() - state.timeStarted) / 1000);
  const score = computeScore();
  const weakTables = computeWeakTables();
  const accuracy = Math.round((state.correctCount / QUESTION_COUNT) * 100);

  elements.scoreValue.textContent = String(score);
  elements.accuracyValue.textContent = `${accuracy}%`;
  elements.timeValue.textContent = `${state.timeTaken}s`;
  elements.weakTablesValue.textContent = weakTables.length ? weakTables.join(', ') : 'None';
  elements.saveStatus.textContent = 'Saving result...';
  showSection('resultSection');

  const report = {
    student: state.student,
    grade: state.grade,
    section: state.section,
    score,
    totalQuestions: QUESTION_COUNT,
    timeTaken: state.timeTaken,
    weakTables,
    createdTime: new Date().toISOString(),
  };

  try {
    const saved = await saveResult(report);
    elements.saveStatus.textContent = saved
      ? 'Result saved to Catalyst Data Store.'
      : 'Saved locally because Catalyst SDK is unavailable.';
  } catch (error) {
    console.error(error);
    elements.saveStatus.textContent = 'Unable to save result. See console for details.';
  }
}

function computeScore() {
  const accuracyComponent = (state.correctCount / QUESTION_COUNT) * 70;
  const speedComponent = Math.max(0, ((TIME_LIMITS[state.grade] - state.timeTaken) / TIME_LIMITS[state.grade]) * 30);
  const bonus = state.correctCount === QUESTION_COUNT ? 5 : 0;
  return Math.min(100, Math.round(accuracyComponent + speedComponent + bonus));
}

function computeWeakTables() {
  return Object.keys(state.tableAttempts)
    .filter((table) => {
      const attempts = state.tableAttempts[table];
      const errors = state.tableErrors[table] || 0;
      return attempts > 0 && errors / attempts >= 0.3;
    })
    .sort((a, b) => Number(a) - Number(b));
}

function getGradeFromForm() {
  return Number(elements.studentGrade.value);
}

elements.profileForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = elements.studentName.value.trim();
  const grade = getGradeFromForm();
  const section = elements.studentSection.value.trim();
  if (!name || !grade || !section) {
    return;
  }

  state.student = name;
  state.grade = grade;
  state.section = section;
  buildQuestionQueue();
  startTimer();
  renderQuestion();
  showSection('testSection');
});

elements.submitAnswerBtn.addEventListener('click', () => {
  const question = state.questions[state.currentIndex];
  const answerValue = elements.answerInput.value;
  const isCorrect = evaluateAnswer(answerValue, question.answer);
  handleAnswer(isCorrect, question);
});

elements.skipQuestionBtn.addEventListener('click', () => {
  const question = state.questions[state.currentIndex];
  handleAnswer(false, question);
});

elements.retryTestBtn.addEventListener('click', () => {
  buildQuestionQueue();
  state.timeStarted = Date.now();
  startTimer();
  renderQuestion();
  showSection('testSection');
});

elements.newProfileBtn.addEventListener('click', () => {
  elements.profileForm.reset();
  elements.saveStatus.textContent = '';
  showSection('profileSection');
});

elements.teacherLoginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = elements.teacherName.value.trim();
  const role = elements.teacherRole.value;
  const password = elements.teacherPassword.value.trim();
  const grade = elements.teacherAssignedGrade.value ? Number(elements.teacherAssignedGrade.value) : null;
  const sections = normalizeStudentSections(elements.teacherAssignedSections.value);

  elements.teacherLoginError.classList.add('hidden');
  elements.teacherLoginError.textContent = '';

  if (!name || !role || !password) {
    elements.teacherLoginError.textContent = 'Enter name, role, and password.';
    elements.teacherLoginError.classList.remove('hidden');
    return;
  }

  const isValidCredentials =
    role === 'Admin'
      ? isValidAdminCredentials(name, password)
      : isValidTeacherCredentials(name, password);

  if (!isValidCredentials) {
    elements.teacherLoginError.textContent = 'Invalid username or password.';
    elements.teacherLoginError.classList.remove('hidden');
    return;
  }

  state.teacher = {
    name,
    role,
    grade,
    sections,
  };

  try {
    await refreshDashboard();
    showSection('dashboardSection');
  } catch (err) {
    elements.heatmapDetail.innerHTML = '<p class="note">Unable to load dashboard data. Catalyst SDK may be unavailable.</p>';
    showSection('dashboardSection');
  }
});

elements.dashboardLoadBtn.addEventListener('click', async () => {
  await refreshDashboard();
});

elements.rosterSearch.addEventListener('input', renderRosterTable);

elements.rosterDateStart.addEventListener('change', renderRosterTable);

elements.rosterDateEnd.addEventListener('change', renderRosterTable);

elements.exportCsvBtn.addEventListener('click', exportRosterCsv);

async function saveResult(report) {
  if (!window.catalyst || !catalyst.datastore) {
    saveReportLocally(report);
    return false;
  }

  const datastore = catalyst.datastore();
  const studentsTable = datastore.table('Students');
  const testResultsTable = datastore.table('TestResults');

  const row = {
    Student_Name: report.student,
    Grade: report.grade,
    Section: report.section,
  };

  try {
    const existingStudent = await studentsTable.query().where('Student_Name', '==', report.student).where('Grade', '==', report.grade).where('Section', '==', report.section).find();
    let studentRecordId;
    if (existingStudent && existingStudent.length > 0 && existingStudent[0].ROWID) {
      studentRecordId = existingStudent[0].ROWID;
    } else {
      const insertedStudent = await studentsTable.insert(row);
      studentRecordId = insertedStudent.ROWID;
    }

    await testResultsTable.insert({
      Student_ID: studentRecordId,
      Score: report.score,
      Total_Questions: report.totalQuestions,
      Time_Taken_Sec: report.timeTaken,
      Weak_Tables: report.weakTables.join(','),
      Teacher_Name: state.teacher?.role === 'Teacher' ? state.teacher.name : null,
      Created_Time: report.createdTime,
    });
    state.savedToCatalyst = true;
    return true;
  } catch (error) {
    console.warn('Catalyst save failed', error);
    saveReportLocally(report);
    return false;
  }
}

function saveReportLocally(report) {
  const key = `multiplication-report-${Date.now()}`;
  localStorage.setItem(key, JSON.stringify(report));
}

function buildTeacherFilters() {
  if (!state.teacher) return {};

  const gradeFilter = Number(elements.dashboardGradeFilter.value) || null;
  const sectionFilter = elements.dashboardSectionFilter.value.trim() || null;
  return computeDashboardFilters(state.teacher, gradeFilter, sectionFilter);
}

async function loadDashboardData() {
  if (!state.teacher) {
    throw new Error('Teacher login required');
  }
  if (!window.catalyst || !catalyst.datastore) {
    throw new Error('Catalyst SDK unavailable');
  }

  const datastore = catalyst.datastore();
  const testResultsTable = datastore.table('TestResults');
  const filters = buildTeacherFilters();

  let query = testResultsTable.query();
  if (filters.grade) {
    query = query.where('Grade', '==', Number(filters.grade));
  }
  if (filters.section) {
    query = query.where('Section', '==', filters.section);
  }
  if (filters.allowedSections && filters.allowedSections.length > 0 && !filters.section) {
    if (filters.allowedSections.length === 1) {
      query = query.where('Section', '==', filters.allowedSections[0]);
    } else {
      query = query.where('Section', 'in', filters.allowedSections);
    }
  }

  const records = await query.find();
  state.dashboardRecords = records;
  state.rosterSummary = buildRosterSummary(records);
  return records;
}

async function refreshDashboard() {
  const grade = state.teacher?.grade || Number(elements.dashboardGradeFilter.value) || 4;
  const records = await loadDashboardData();
  renderDashboardMetrics(records, grade);
  renderHeatmap(records, grade);
  renderScoreDistribution(records);
  renderRosterTable();
  elements.heatmapDetail.innerHTML = '<p class="note">Select a table cell or student row for deep review details.</p>';
}

function filterRosterSummary() {
  const nameRollSearch = elements.rosterSearch.value.trim().toLowerCase();
  const startDate = elements.rosterDateStart.value ? new Date(elements.rosterDateStart.value) : null;
  const endDate = elements.rosterDateEnd.value ? new Date(elements.rosterDateEnd.value) : null;

  return state.rosterSummary.filter((row) => {
    const searchMatches = nameRollSearch
      ? `${row.studentName} ${row.rollNumber}`.toLowerCase().includes(nameRollSearch)
      : true;

    const dateMatches = (!startDate && !endDate) || (row.lastTestDate && (() => {
      const date = new Date(row.lastTestDate);
      if (startDate && date < startDate) return false;
      if (endDate && date > new Date(endDate.getTime() + 24 * 60 * 60 * 1000 - 1)) return false;
      return true;
    })());

    return searchMatches && dateMatches;
  });
}

function renderHeatmap(records, grade) {
  const range = getHeatmapRange(grade);
  const heatmapData = renderHeatmapData(records, range);

  elements.heatmapGrid.innerHTML = heatmapData
    .map((cell) => {
      const stateClass = cell.errorRate > 25 ? 'heatmap-needs' : cell.errorRate >= 10 ? 'heatmap-moderate' : 'heatmap-mastered';
      return `
        <button class="heatmap-cell ${stateClass}" data-table="${cell.tableNum}" type="button">
          ${cell.tableNum}\n${cell.errorRate}%
        </button>`;
    })
    .join('');

  elements.heatmapGrid.querySelectorAll('.heatmap-cell').forEach((button) => {
    button.addEventListener('click', () => {
      const tableNum = Number(button.dataset.table);
      renderHeatmapDetail(tableNum, records);
    });
  });
}

function renderHeatmapDetail(tableNum, records) {
  const matchingStudents = records
    .filter((record) => parseWeakTableString(record.Weak_Tables || record.weakTables || '').includes(String(tableNum)))
    .map((record) => ({
      studentName: record.Student_Name || 'Unknown',
      rollNumber: record.Roll_Number || '—',
      score: record.Score || 0,
      timeTaken: record.Time_Taken_Sec || 0,
      date: record.Created_Time ? new Date(record.Created_Time).toLocaleString() : 'Unknown',
    }));

  if (matchingStudents.length === 0) {
    elements.heatmapDetail.innerHTML = `<p class="note">No students have this table flagged for review yet.</p>`;
    return;
  }

  elements.heatmapDetail.innerHTML = `
    <div class="panel-header">
      <h4>Table of ${tableNum} — Students needing review</h4>
    </div>
    <table>
      <thead>
        <tr>
          <th>Student</th>
          <th>Roll</th>
          <th>Score</th>
          <th>Time</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${matchingStudents
          .map(
            (row) => `
            <tr>
              <td>${row.studentName}</td>
              <td>${row.rollNumber}</td>
              <td>${row.score}%</td>
              <td>${row.timeTaken}s</td>
              <td>${row.date}</td>
            </tr>`
          )
          .join('')}
      </tbody>
    </table>`;
}

function renderScoreDistribution(records) {
  if (!records || records.length === 0) {
    elements.scoreDistribution.innerHTML = '<p class="note">No score data available to render distribution.</p>';
    return;
  }

  const buckets = {
    '<50%': 0,
    '50-75%': 0,
    '75-90%': 0,
    '90-100%': 0,
  };

  records.forEach((record) => {
    const score = Number(record.Score || 0);
    if (score < 50) buckets['<50%'] += 1;
    else if (score < 75) buckets['50-75%'] += 1;
    else if (score < 90) buckets['75-90%'] += 1;
    else buckets['90-100%'] += 1;
  });

  const rows = Object.entries(buckets)
    .map(([label, count]) => {
      return `
      <div class="distribution-row">
        <span>${label}</span>
        <strong>${count}</strong>
      </div>`;
    })
    .join('');

  elements.scoreDistribution.innerHTML = `<div class="distribution-list">${rows}</div>`;
}

function renderDashboardMetrics(records, grade) {
  const totalDrills = records.length;
  const avgScore = records.length
    ? Math.round(records.reduce((sum, record) => sum + Number(record.Score || 0), 0) / records.length)
    : 0;
  const avgSpeed = records.length
    ? Math.round(records.reduce((sum, record) => sum + Number(record.Time_Taken_Sec || 0), 0) / records.length)
    : 0;

  const weakTableCounts = {};
  records.forEach((record) => {
    parseWeakTableString(record.Weak_Tables || record.weakTables || '').forEach((table) => {
      weakTableCounts[table] = (weakTableCounts[table] || 0) + 1;
    });
  });

  const topWeakTables = Object.entries(weakTableCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([table]) => `${table}s`)
    .join(', ') || 'None';

  elements.metricTotalDrills.textContent = totalDrills;
  elements.metricAvgAccuracy.textContent = `${avgScore}%`;
  elements.metricAvgSpeed.textContent = `${avgSpeed}s`;
  elements.metricWeakTables.textContent = topWeakTables;
  elements.heatmapDescription.textContent = `Grade ${grade || 4} tables 1–${getHeatmapRange(grade || 4)}`;
}

function renderRosterTable() {
  const records = filterRosterSummary();
  if (!records || records.length === 0) {
    elements.rosterTableContainer.innerHTML = '<p class="note">No matching student records found.</p>';
    return;
  }

  const rows = records
    .map((row) => {
      return `
      <tr data-roll="${row.rollNumber}" data-name="${row.studentName}">
        <td>${row.studentName}</td>
        <td>${row.rollNumber}</td>
        <td>${row.totalAttempts}</td>
        <td>${row.latestScore}%</td>
        <td>${row.identifiedWeakTables}</td>
        <td>${new Date(row.lastTestDate).toLocaleDateString()}</td>
      </tr>`;
    })
    .join('');

  elements.rosterTableContainer.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Student Name</th>
          <th>Roll No</th>
          <th>Tests Attempted</th>
          <th>Latest Score</th>
          <th>Weak Tables</th>
          <th>Last Test Date</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

  elements.rosterTableContainer.querySelectorAll('tbody tr').forEach((row) => {
    row.addEventListener('click', () => {
      const studentName = row.dataset.name;
      const rollNumber = row.dataset.roll;
      renderStudentDetail(studentName, rollNumber);
    });
  });
}

function renderStudentDetail(studentName, rollNumber) {
  const matchingRecords = state.dashboardRecords.filter(
    (record) => record.Student_Name === studentName && String(record.Roll_Number) === String(rollNumber)
  );

  if (!matchingRecords.length) {
    elements.heatmapDetail.innerHTML = '<p class="note">No detail records available for that student.</p>';
    return;
  }

  const rows = matchingRecords
    .sort((a, b) => new Date(b.Created_Time || b.createdTime) - new Date(a.Created_Time || a.createdTime))
    .map((record) => {
      const history = record.Answer_History ? JSON.parse(record.Answer_History) : [];
      const answers = history
        .map((entry) => `${entry.question.text} — ${entry.isCorrect ? '✔️' : '✖️'}`)
        .slice(0, 3)
        .join('<br>');

      return `
        <tr>
          <td>${record.Score || 0}%</td>
          <td>${record.Time_Taken_Sec || 0}s</td>
          <td>${parseWeakTableString(record.Weak_Tables || record.weakTables || '').join(', ') || 'None'}</td>
          <td>${new Date(record.Created_Time || record.createdTime).toLocaleString()}</td>
          <td>${answers || 'No answer detail'}</td>
        </tr>`;
    })
    .join('');

  elements.heatmapDetail.innerHTML = `
    <div class="panel-header">
      <h4>${studentName} — Roll ${rollNumber}</h4>
    </div>
    <table>
      <thead>
        <tr>
          <th>Score</th>
          <th>Time</th>
          <th>Weak Tables</th>
          <th>Date</th>
          <th>Sample Answers</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function downloadCsv(data, filename) {
  const csvContent = data.map((row) => row.map(formatCsvCell).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportRosterCsv() {
  const records = filterRosterSummary();
  if (!records.length) {
    alert('No roster data available for export.');
    return;
  }

  const header = [
    'Student_Name',
    'Grade',
    'Section',
    'Roll_Number',
    'Total_Attempts',
    'Average_Score',
    'Highest_Score',
    'Flagged_Weak_Tables',
    'Last_Test_Timestamp',
  ];

  const rows = records.map((row) => [
    row.studentName,
    row.grade,
    row.section,
    row.rollNumber,
    row.totalAttempts,
    row.latestScore,
    row.highestScore,
    row.identifiedWeakTables,
    row.lastTestDate,
  ]);

  downloadCsv([header, ...rows], 'teacher_roster_report.csv');
}

showSection('profileSection');
