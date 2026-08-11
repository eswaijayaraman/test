const TABLE_RANGE = [1, 15];
const WORD_PROBLEM_PROBABILITY = 0.4;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function directMultiplication(preferredTable = null) {
  const table = preferredTable || randInt(...TABLE_RANGE);
  const factor = randInt(2, 12);
  return {
    type: 'direct',
    text: `${table} × ${factor} = ?`,
    answer: table * factor,
    table,
    raw: { a: table, b: factor, style: 'direct' },
  };
}

function wordProblem(preferredTable = null) {
  const table = preferredTable || randInt(1, 15);
  const baskets = randInt(4, 8);
  return {
    type: 'word',
    text: `If 1 basket holds ${table} apples, how many apples are in ${baskets} baskets?`,
    answer: table * baskets,
    table,
    raw: { a: table, b: baskets, style: 'word' },
  };
}

export function generateGrade5Question(preferredTable = null) {
  const useWord = Math.random() < WORD_PROBLEM_PROBABILITY;
  return useWord ? wordProblem(preferredTable) : directMultiplication(preferredTable);
}

export function generateGrade5DirectQuestion(preferredTable = null) {
  return directMultiplication(preferredTable);
}

export function generateGrade5WordProblem(preferredTable = null) {
  return wordProblem(preferredTable);
}
