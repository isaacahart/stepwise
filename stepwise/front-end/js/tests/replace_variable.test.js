import { replaceObjectInStatement } from "../statement/replace_variable.js";
import * as sb from "../statement/statement_base.js";

const exSimpleSta1 = sb.makeSimpleStatement("foobar", [5, 2, 7]);
const exSimpleSta2 = sb.makeSimpleStatement("foobar", [5, 3, 7]);
const exAnd1 = sb.makeAndStatement([exSimpleSta1, exSimpleSta2]);
const exAnd2 = sb.makeAndStatement([sb.makeSimpleStatement("foobar", [5, 2, 1]), sb.makeSimpleStatement("foobar", [5, 3, 1])]);
const exForAll1 = sb.makeForAllStatement("x", "#123456", exSimpleSta1, 5);
const exForAll2 = sb.makeForAllStatement("x", "#123456", exSimpleSta2, 5);
const exForAll3 = sb.makeForAllStatement("x", "#123456", sb.makeSimpleStatement("foobar", [0, 5, 7]), 0);

test("replace object in simple statement", () => {
  expect(replaceObjectInStatement(exSimpleSta1, 2, 3)).toStrictEqual(exSimpleSta2);
})

test("replace object not in simple statement", () => {
  expect(replaceObjectInStatement(exSimpleSta1, 3, 2)).toStrictEqual(exSimpleSta1);
})

test("replace object in and statement", () => {
  expect(replaceObjectInStatement(exAnd1, 7, 1)).toStrictEqual(exAnd2);
})

test("replace object in for all statement", () => {
  expect(replaceObjectInStatement(exForAll1, 2, 3)).toStrictEqual(exForAll2);
})

test("don't replace bound variable in for all statement", () => {
  expect(replaceObjectInStatement(exForAll1, 5, 3)).toStrictEqual(exForAll1);
})

test("replace object in for all statement and change var idx", () => {
  expect(replaceObjectInStatement(exForAll1, 2, 5)).toStrictEqual(exForAll3);
})