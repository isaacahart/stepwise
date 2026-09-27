import { makeForAllStatement, makeSimpleStatement } from "../statement/statement_base";
import { anyVariablesUndefined } from "../statement/statement_checks";

const exSimple1 = makeSimpleStatement("foobar", [3, 1]);
const exForAll1 = makeForAllStatement("x", "", exSimple1, 3);

test("no variables undefined", () => {
  expect(anyVariablesUndefined(exSimple1, [0, 1, 3, 5])).toBe(false);
})

test("some variables undefined", () => {
  expect(anyVariablesUndefined(exSimple1, [0, 1, 5])).toBe(true);
})

test("no variables undefined for all", () => {
  expect(anyVariablesUndefined(exForAll1, [0, 1, 5])).toBe(false);
})

test("some variables undefined for all", () => {
  expect(anyVariablesUndefined(exForAll1, [0,5])).toBe(true);
})