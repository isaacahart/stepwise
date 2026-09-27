import { makeObject } from "../object/object_base.js";
import { makeSpace } from "../space/space_base.js";
import * as sb from "../statement/statement_base.js";
import { makeStatementString, makeStatementStringOneLine, stringifyStatementList } from "../statement/statement_display.js";

const exSimple1 = sb.makeSimpleStatement("foo", [0, 1]);
const exSimple2 = sb.makeSimpleStatement("bar", [3, 1, 0]);
const exAnd1 = sb.makeAndStatement([exSimple1, exSimple2])
const exForAll1 = sb.makeForAllStatement("x", "#999999", exSimple2, 3);
const exForAll2 = sb.makeForAllStatement("y", "#888888", exForAll1, 0);
const exOr1 = sb.makeOrStatement([exForAll1, exSimple1]);
const exIf1 = sb.makeIfStatement(exSimple1, exSimple2);
const exExists1 = sb.makeExistsStatement("x", "#999999", exSimple2, 3);
const exApp1 = sb.makeStatementApp(0, [0, 3]);
const exSchema1 = sb.makeAxiomSchema("s1", 2, sb.makeForAllStatement("y", "#888888", sb.makeForAllStatement("x", "#999999", exApp1, 3), 0))
const exObjects1 = [makeObject("a", "#000000"), makeObject("b", "#111111"), makeObject("c", "#222222"), makeObject("d", "#333333")];

test("describe simple statement", () => {
  expect(makeStatementString(exSimple1, exObjects1)).toStrictEqual(["a is foo: b"]);
});

test("describe and statement", () => {
  expect(makeStatementString(exAnd1, exObjects1)).toStrictEqual(["|  a is foo: b", "and", "|  d is bar: b, a"]);
});

test("describe if statement", () => {
  expect(makeStatementString(exIf1, exObjects1)).toStrictEqual(["if:", "|  a is foo: b", "then:", "|  d is bar: b, a"]);
});

test("describe or statement", () => {
  expect(makeStatementString(exOr1, exObjects1)).toStrictEqual(["|  for all x:", "|  |  x is bar: b, a", "or", "|  a is foo: b"]);
});

test("describe for-all statement", () => {
  expect(makeStatementString(exForAll1, exObjects1)).toStrictEqual(["for all x:", "|  x is bar: b, a"]);
});

test("describe for-all statement", () => {
  expect(makeStatementString(exForAll2, exObjects1)).toStrictEqual(["for all y:", "|  for all x:", "|  |  x is bar: b, y"]);
});

test("describe exists statement", () => {
  expect(makeStatementString(exExists1, exObjects1)).toStrictEqual(["there exists a x such that:", "|  x is bar: b, a"]);
});

test("describe axiom schema", () => {
  expect(makeStatementString(exSchema1, exObjects1)).toStrictEqual([
    "given any statement s1 with 2 free variables:",
    "|  for all y:",
    "|  |  for all x:",
    "|  |  |  s1 is true of: y, x"
  ]);
})

test("single string and statement", () => {
  expect(makeStatementStringOneLine(exAnd1, exObjects1)).toStrictEqual("a is foo: b and d is bar: b, a");
})

test("single string if statement", () => {
  expect(makeStatementStringOneLine(exIf1, exObjects1)).toStrictEqual("if: a is foo: b then: d is bar: b, a");
})

test("single string or statement", () => {
  expect(makeStatementStringOneLine(exOr1, exObjects1)).toStrictEqual("for all x: x is bar: b, a or a is foo: b");
})

test("stringify statement list", () => {
  expect(stringifyStatementList([exSimple1, exForAll2, exExists1], exObjects1)).toStrictEqual(
    ["a is foo: b", "for all y: for all x: x is bar: b, y", "there exists a x such that: x is bar: b, a"])
})