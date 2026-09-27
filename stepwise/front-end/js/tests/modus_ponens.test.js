import { applyModusPonens, applyModusPonensWithMinimalLogic, applyModusPonensWithTautologies, impliesWithMinimalLogic } from "../statement/modus_ponens.js";
import * as sb from "../statement/statement_base.js";

const exSimple1 = sb.makeSimpleStatement("foo", [2, 5, 4]);
const exSimple2 = sb.makeSimpleStatement("bar", [0, 4]);
const exSimple3 = sb.makeSimpleStatement("baz", [99]);
const exSimple4 = sb.makeSimpleStatement("equal", [0, 0]);
const exIf1 = sb.makeIfStatement(exSimple1, exSimple2);
const exIff1 = sb.makeIffStatement(exSimple1, exSimple2);
const exOr1 = sb.makeOrStatement([exSimple1, exSimple3]);
const exOr2 = sb.makeOrStatement([exSimple3, exSimple2, exSimple1]);
const exIf2 = sb.makeIfStatement(exOr1, exSimple2);
const exIf3 = sb.makeIfStatement(exSimple2, exSimple1);
const exAnd1 = sb.makeAndStatement([exSimple1, exSimple2]);
const exAnd2 = sb.makeAndStatement([exSimple1, exSimple2, exSimple3]);
const exAnd3 = sb.makeAndStatement([exIf1, exIf3, exSimple2]);

test("modus ponens simple statements", () => {
  expect(applyModusPonens(exSimple1, exIf1)).toStrictEqual([exSimple2]);
})

test("modus ponens fails simple statements", () => {
  expect(applyModusPonens(exSimple2, exIf1)).toStrictEqual([]);
})

test("modus ponens with iff and simple statements", () => {
  expect(applyModusPonens(exSimple1, exIff1)).toStrictEqual([exSimple2]);
})

test("modus ponens with iff and reversed simple statements", () => {
  expect(applyModusPonens(exSimple2, exIff1)).toStrictEqual([exSimple1]);
})

test("modus ponens with tautologies simple statements", () => {
  expect(applyModusPonensWithTautologies(exSimple1, exIf1)).toStrictEqual([exSimple2]);
})

test("modus ponens with tautologies", () => {
  expect(applyModusPonensWithTautologies(exSimple1, exIf2)).toStrictEqual([exSimple2]);
})

test("modus ponens with minimal logic", () => {
  expect(applyModusPonensWithMinimalLogic(exSimple1, exIf2)).toStrictEqual([exSimple2]);
})

test("simple statements don't imply each other with minimal logic", () => {
  expect(impliesWithMinimalLogic(exSimple1, exSimple2)).toBe(false);
})

test("and statement implies simple statement with minimal logic", () => {
  expect(impliesWithMinimalLogic(exAnd1, exSimple2)).toBe(true);
})

test("and statement does not imply simple statement with minimal logic", () => {
  expect(impliesWithMinimalLogic(exAnd1, exSimple3)).toBe(false);
})

test("and statement implies and statement with minimal logic", () => {
  expect(impliesWithMinimalLogic(exAnd2, exAnd1)).toBe(true);
})

test("and statement does not imply and statement with minimal logic", () => {
  expect(impliesWithMinimalLogic(exAnd1, exAnd2)).toBe(false);
})

test("simple statement implies or statement with minimal logic", () => {
  expect(impliesWithMinimalLogic(exSimple1, exOr1)).toBe(true);
})

test("simple statement does not imply or statement with minimal logic", () => {
  expect(impliesWithMinimalLogic(exSimple2, exOr1)).toBe(false);
})

test("and statement implies or statement with minimal logic", () => {
  expect(impliesWithMinimalLogic(exAnd1, exOr1)).toBe(true);
})

test("and statement does not imply or statement with minimal logic", () => {
  expect(impliesWithMinimalLogic(exAnd3, exOr1)).toBe(false);
})

test("or statement implies or statement with minimal logic", () => {
  expect(impliesWithMinimalLogic(exOr1, exOr2)).toBe(true);
})

test("or statement does not imply or statement with minimal logic", () => {
  expect(impliesWithMinimalLogic(exOr2, exOr1)).toBe(false);
})

test("and statement implies iff statement with minimal logic", () => {
  expect(impliesWithMinimalLogic(exAnd3, exIff1)).toBe(true);
})

test("and statement implies reflexive equality", () => {
  expect(impliesWithMinimalLogic(exAnd3, exSimple4)).toBe(true);
})