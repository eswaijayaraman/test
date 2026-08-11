const TABLE_RANGE = [1, 20];
const DECIMAL_PROBABILITY = 0.35;
const PLACE_VALUE_PROBABILITY = 0.35;

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

function decimalQuestion() {
  const base = randInt(2, 12);
  const decimalString = (randInt(10, 25) / 10).toFixed(1);
  const value = Number(decimalString);
  return {
    type: 'decimal',
    text: `${decimalString} × ${base} = ?`,
    answer: value * base,
    table: base,
    raw: { a: value, b: base, style: 'decimal' },
  };
}

function placeValueQuestion() {
  const digits = randInt(1, 20);
  const multiplier = randInt(10, 90) * 10;
  return {
    type: 'placeValue',
    text: `${digits * 10} × ${multiplier / 10} = ?`,
    answer: digits * multiplier,
    table: digits,
    raw: { a: digits * 10, b: multiplier / 10, style: 'placeValue' },
  };
}

export function generateGrade6Question(preferredTable = null) {
  const roll = Math.random();
  if (roll < DECIMAL_PROBABILITY) {
    return decimalQuestion();
  }
  if (roll < DECIMAL_PROBABILITY + PLACE_VALUE_PROBABILITY) {
    return placeValueQuestion();
  }
  return directMultiplication(preferredTable);
}

export function generateGrade6DirectQuestion(preferredTable = null) {
  return directMultiplication(preferredTable);
}

export function generateGrade6DecimalQuestion() {
  return decimalQuestion();
}

export function generateGrade6PlaceValueQuestion() {
  return placeValueQuestion();
}
