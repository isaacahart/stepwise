import * as sb from "../statement/statement_base.js";
import { getUsedObjects } from "../statement/used_variables";

const exSimpleSta2 = sb.makeSimpleStatement("foobar", [5, 2, 7]);
const exExists2 = sb.makeExistsStatement("y", "#abcdef", sb.makeSimpleStatement("foobar", [3, 0, 1]), 3)
const exExists3 = sb.makeExistsStatement("x", "#123456", exExists2, 1)

test("get used objects in relation", () => {
  expect(getUsedObjects(exSimpleSta2)).toStrictEqual([5, 2, 7]);
})

test("get used objects in quantifier", () => {
  expect(getUsedObjects(exExists3)).toStrictEqual([1, 3, 3, 0, 1]);
})