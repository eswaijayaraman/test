import { describe, it, expect } from 'vitest';
import {
  generateGrade4Question,
  generateGrade4DirectQuestion,
  generateGrade4MissingFactorQuestion,
} from './grade4Gen.js';
import {
  generateGrade5Question,
  generateGrade5DirectQuestion,
  generateGrade5WordProblem,
} from './grade5Gen.js';
import {
  generateGrade6Question,
  generateGrade6DirectQuestion,
  generateGrade6DecimalQuestion,
  generateGrade6PlaceValueQuestion,
} from './grade6Gen.js';

function validateQuestion(question) {
  expect(question).toHaveProperty('text');
  expect(question).toHaveProperty('answer');
  expect(question).toHaveProperty('table');
  expect(typeof question.text).toBe('string');
  expect(typeof question.table).toBe('number');
  expect(question.text.length).toBeGreaterThan(0);
}

describe('Grade 4 generator', () => {
  it('produces valid direct multiplication questions', () => {
    const question = generateGrade4DirectQuestion(7);
    validateQuestion(question);
    expect(question.type).toBe('direct');
    expect(question.text).toContain('×');
    expect(question.answer).toBe(7 * question.raw.b);
    expect(question.table).toBe(7);
  });

  it('produces valid missing factor questions', () => {
    const question = generateGrade4MissingFactorQuestion(8);
    validateQuestion(question);
    expect(question.type).toBe('missing');
    expect(question.text).toContain('? =');
    expect(question.answer).toBe(question.raw.b);
    expect(question.table).toBe(8);
  });

  it('produces a valid randomized grade 4 question', () => {
    const question = generateGrade4Question();
    validateQuestion(question);
    expect(['direct', 'missing']).toContain(question.type);
  });
});

describe('Grade 5 generator', () => {
  it('produces valid direct multiplication questions', () => {
    const question = generateGrade5DirectQuestion(13);
    validateQuestion(question);
    expect(question.type).toBe('direct');
    expect(question.answer).toBe(13 * question.raw.b);
    expect(question.table).toBe(13);
  });

  it('produces valid word problem questions', () => {
    const question = generateGrade5WordProblem(14);
    validateQuestion(question);
    expect(question.type).toBe('word');
    expect(question.text).toContain('baskets');
    expect(question.answer).toBe(14 * question.raw.b);
    expect(question.table).toBe(14);
  });

  it('produces a valid randomized grade 5 question', () => {
    const question = generateGrade5Question();
    validateQuestion(question);
    expect(['direct', 'word']).toContain(question.type);
  });
});

describe('Grade 6 generator', () => {
  it('produces valid direct multiplication questions', () => {
    const question = generateGrade6DirectQuestion(18);
    validateQuestion(question);
    expect(question.type).toBe('direct');
    expect(question.answer).toBe(18 * question.raw.b);
    expect(question.table).toBe(18);
  });

  it('produces valid decimal multiplication questions', () => {
    const question = generateGrade6DecimalQuestion();
    validateQuestion(question);
    expect(question.type).toBe('decimal');
    expect(question.text).toMatch(/\d+\.\d+ × \d+/);
    expect(question.answer).toBeCloseTo(Number(question.raw.a) * question.raw.b, 5);
  });

  it('produces valid place value multiplication questions', () => {
    const question = generateGrade6PlaceValueQuestion();
    validateQuestion(question);
    expect(question.type).toBe('placeValue');
    expect(question.text).toContain('×');
    expect(question.answer).toBe(Number(question.raw.a) * question.raw.b);
  });

  it('produces a valid randomized grade 6 question', () => {
    const question = generateGrade6Question();
    validateQuestion(question);
    expect(['direct', 'decimal', 'placeValue']).toContain(question.type);
  });
});
