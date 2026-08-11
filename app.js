import { generateGrade4Question } from './grade4Gen.js';
import { generateGrade5Question } from './grade5Gen.js';
import { generateGrade6Question } from './grade6Gen.js';

const TIME_LIMITS = { 4: 60, 5: 45, 6: 30 };
const QUESTION_COUNT = 10;

const elements = {
  profileSection: document.getElementById('profileSection'),
  testSection: document.getElementById('testSection'),
  resultSection: document.getElementById('resultSection'),
  teacherSection: document.getElementById('teacherSection'),
  profileForm: document.getElementById('profileForm'),
  studentName: document.getElementById('studentName'),
  studentGrade: document.getElementById('studentGrade'),
  studentSection: document.getElementById('studentSection'),
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
  reportGradeFilter: document.getElementById('reportGradeFilter'),
  reportSectionFilter: document.getElementById('reportSectionFilter'),
  loadReportsBtn: document.getElementById('loadReportsBtn'),
  reportsContainer: document.getElementById('reportsContainer'),
};

const state = {
  student: null,
  grade: null,
  section: null,
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
  ['profileSection', 'testSection', 'resultSection', 'teacherSection'].forEach((id) => {
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

elements.loadReportsBtn.addEventListener('click', async () => {
  try {
    const reports = await loadTeacherReports();
    renderReportTable(reports);
  } catch (err) {
    elements.reportsContainer.innerHTML = '<p class="note">Unable to load reports. Catalyst SDK may be unavailable.</p>';
  }
  showSection('teacherSection');
});

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

async function loadTeacherReports() {
  if (!window.catalyst || !catalyst.datastore) {
    throw new Error('Catalyst SDK unavailable');
  }

  const datastore = catalyst.datastore();
  const testResultsTable = datastore.table('TestResults');

  const filterGrade = elements.reportGradeFilter.value;
  const filterSection = elements.reportSectionFilter.value.trim();
  let query = testResultsTable.query();
  if (filterGrade) {
    query = query.where('Grade', '==', Number(filterGrade));
  }
  if (filterSection) {
    query = query.where('Section', '==', filterSection);
  }

  return await query.find();
}

function renderReportTable(records) {
  if (!records || records.length === 0) {
    elements.reportsContainer.innerHTML = '<p class="note">No saved reports found for the selected filters.</p>';
    return;
  }

  const rows = records
    .map((report) => {
      return `
      <tr>
        <td>${report.Student_ID || '—'}</td>
        <td>${report.Score}</td>
        <td>${report.Total_Questions}</td>
        <td>${report.Time_Taken_Sec}s</td>
        <td>${report.Weak_Tables || 'None'}</td>
        <td>${new Date(report.Created_Time || report.createdTime).toLocaleString()}</td>
      </tr>`;
    })
    .join('');

  elements.reportsContainer.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Student ID</th>
          <th>Score</th>
          <th>Questions</th>
          <th>Time</th>
          <th>Weak Tables</th>
          <th>Saved At</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

showSection('profileSection');
