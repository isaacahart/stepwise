import { getTheoremInputs, countTheoremInputs, countExistStatements, getSchemaStatements, getFreeVariables } from "../theorem/theorem_base.js";
import * as sb from "../statement/statement_base.js";
import * as ob from "../object/object_base.js";

const exSimple1 = sb.makeSimpleStatement("foo", [1, 3]);
const exForAll1 = sb.makeForAllStatement("x", "#123456", exSimple1);
const exForAll2 = sb.makeForAllStatement("x", "#123456", 
        sb.makeForAllStatement("y", "#abcdef", exSimple1));
const exExists1 = sb.makeExistsStatement("x", "#123456", 
        sb.makeExistsStatement("y", "#abcdef", exSimple1));
const exSchema1 = sb.makeAxiomSchema("s2", 2, exForAll2);
const exSchema2 = sb.makeAxiomSchema("s1", 1, exSchema1);

test("get simple inputs", () => {
  expect(getTheoremInputs(exSimple1)).toStrictEqual([]);
})

test("get one for-all input", () => {
  expect(getTheoremInputs(exForAll1)).toStrictEqual([ob.makeObject("x", "#123456")]);
})

test("get two for-all inputs", () => {
  expect(getTheoremInputs(exForAll2)).toStrictEqual(
    [ob.makeObject("x", "#123456"), ob.makeObject("y", "#abcdef")]);
})

test("get for-all inputs in axiom schema", () => {
  expect(getTheoremInputs(exForAll2)).toStrictEqual(
    [ob.makeObject("x", "#123456"), ob.makeObject("y", "#abcdef")]);
})

test("count two for-all inputs", () => {
  expect(countTheoremInputs(exForAll2)).toBe(2);
})

test("count two exists inputs", () => {
  expect(countExistStatements(exExists1)).toBe(2);
})

test("get schema statement names", () => {
  expect(getSchemaStatements(exSchema2)).toStrictEqual(["s1", "s2"]);
})

test("get free variables with two schemas", () => {
  expect(getFreeVariables(exSchema2)).toStrictEqual([[ob.emptyOutputObj], [ob.emptyOutputObj, ob.emptyOutputObj]]);
})