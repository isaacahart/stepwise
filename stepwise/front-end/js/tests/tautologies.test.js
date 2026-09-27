import * as sb from "../statement/statement_base.js";
import { isTautology, isSatisfiable, tautologicallyImplies, getPrimeFormulasIn, hasPrimeFormulas } from "../statement/tautologies";

const exSimple1 = sb.makeSimpleStatement("foo", [0,1,2]);
const exSimple2 = sb.makeSimpleStatement("bar", [1,0]);
const exNot1 = sb.makeNotStatement(exSimple1);
const exAnd1 = sb.makeAndStatement([exSimple1, exSimple2]);
const exAnd2 = sb.makeAndStatement([exSimple1, exSimple1]);
const exIf1 = sb.makeIfStatement(exSimple1, exSimple2);
const exIf2 = sb.makeIfStatement(exSimple2, exSimple2);
const exForAll1 = sb.makeForAllStatement("x", "#123456", exSimple1, 2);
const exForAll2 = sb.makeForAllStatement("y", "#abcdef", sb.makeSimpleStatement("foo", [0,1,3]), 3);
const exForAll3 = sb.makeForAllStatement("z", "#f00ba5", exSimple2, 0);
const exAnd3 = sb.makeAndStatement([exForAll1, exForAll3, exForAll2]);

test("prime formulas in simple statement", () => {
  expect(getPrimeFormulasIn(exSimple1)).toStrictEqual(
    [exSimple1]);
})

test("prime formulas in and statement", () => {
  expect(getPrimeFormulasIn(exAnd1)).toStrictEqual(
    [exSimple1, exSimple2]);
})

test("duplicate prime formulas in and statement", () => {
  expect(getPrimeFormulasIn(exAnd2)).toStrictEqual(
    [exSimple1]);
})

test("prime formulas in if statement", () => {
  expect(getPrimeFormulasIn(exIf1)).toStrictEqual(
    [exSimple1, exSimple2]);
})

test("duplicate prime formulas in if statement", () => {
  expect(getPrimeFormulasIn(exIf2)).toStrictEqual(
    [exSimple2]);
})

test("prime formulas in quantifier statement", () => {
  expect(getPrimeFormulasIn(exForAll1)).toStrictEqual(
    [exForAll1]);
})

test("duplicate quantifier statements", () => {
  expect(getPrimeFormulasIn(exAnd3)).toStrictEqual(
    [exForAll1, exForAll3]);
})



test("simple statement has primes", () => {
  expect(hasPrimeFormulas(exSimple1, [exSimple2, exSimple1])).toBe(true);
})

test("if statement has primes", () => {
  expect(hasPrimeFormulas(exIf1, [exSimple2, exSimple1])).toBe(true);
})

test("and statement has primes", () => {
  expect(hasPrimeFormulas(exAnd2, [exSimple2, exSimple1])).toBe(true);
})

test("if statement doesn't have primes", () => {
  expect(hasPrimeFormulas(exIf2, [exSimple1])).toBe(false);
})



const exContradiction1 = sb.makeAndStatement([exSimple1, exNot1]);
const exOr1 = sb.makeOrStatement([exSimple1, exSimple2]);
const exOr2 = sb.makeOrStatement([exSimple1, exNot1]);
const exNot2 = sb.makeNotStatement(exSimple2);
const exNot3 = sb.makeNotStatement(exOr1);
const exAnd4 = sb.makeAndStatement([exNot1, exNot2]);
const exDeMorgan1 = sb.makeIffStatement(exNot3, exAnd4);
const exContradiction2 = sb.makeAndStatement([exOr1, exNot1, exNot2]);

test("simple statement satisfiable", () => {
  expect(isSatisfiable(exSimple1)).toBe(true);
})

test("and statement satisfiable", () => {
  expect(isSatisfiable(exAnd1)).toBe(true);
})

test("de morgan satisfiable", () => {
  expect(isSatisfiable(exDeMorgan1)).toBe(true);
})

test("contradiction unsatisfiable", () => {
  expect(isSatisfiable(exContradiction1)).toBe(false);
})

test("contradiction unsatisfiable", () => {
  expect(isSatisfiable(exContradiction2)).toBe(false);
})

test("simple statement not tautology", () => {
  expect(isTautology(exSimple1)).toBe(false);
})

test("A or not A tautology", () => {
  expect(isTautology(exOr2)).toBe(true);
})

test("de morgan tautology", () => {
  expect(isTautology(exDeMorgan1)).toBe(true);
})

test("contradiction not tautology", () => {
  expect(isTautology(exContradiction1)).toBe(false);
})

test("A does not imply A and B", () => {
  expect(tautologicallyImplies(exSimple1, exAnd1)).toBe(false);
})

test("A implies A and A", () => {
  expect(tautologicallyImplies(exSimple1, exAnd2)).toBe(true);
})

test("A implies A or B", () => {
  expect(tautologicallyImplies(exSimple1, exOr1)).toBe(true);
})

test("A implies tautology", () => {
  expect(tautologicallyImplies(exSimple1, exOr2)).toBe(true);
})