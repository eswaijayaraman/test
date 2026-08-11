const TABLE_RANGE = [1, 12];
const MISSING_FACTOR_PROBABILITY = 0.35;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function directMultiplication(preferredTable = null) {
  const table = preferredTable || randInt(...TABLE_RANGE);
  const factor = randInt(1, 12);
  return {
    type: 'direct',
    text: `${table} × ${factor} = ?`,
    answer: table * factor,
    table,
    raw: { a: table, b: factor, style: 'direct' },
  };
}

function missingFactor(preferredTable = null) {
  const table = preferredTable || randInt(...TABLE_RANGE);
  const multiplier = randInt(1, 12);
  const product = table * multiplier;
  return {
    type: 'missing',
    text: `${table} × ? = ${product}`,
    answer: multiplier,
    table,
    raw: { a: table, b: multiplier, product, style: 'missing' },
  };
}

export function generateGrade4Question(preferredTable = null) {
  const useMissing = Math.random() < MISSING_FACTOR_PROBABILITY;
  return useMissing ? missingFactor(preferredTable) : directMultiplication(preferredTable);
}

export function generateGrade4DirectQuestion(preferredTable = null) {
  return directMultiplication(preferredTable);
}

export function generateGrade4MissingFactorQuestion(preferredTable = null) {
  return missingFactor(preferredTable);
}
