import * as sb from "../statement/statement_base.js";
import { assignStatements } from "../theorem/assign_statement.js";

const exSimple1 = sb.makeSimpleStatement("foobar", [0, 2]);
const exSimple2 = sb.makeSimpleStatement("foobar", [1, 5, 4]);
const exSimple3 = sb.makeSimpleStatement("foobar", [2, 4, 1]);
const exApp1 = sb.makeStatementApp(0, [0, 2]);
const exAnd1 = sb.makeAndStatement(exApp1, sb.makeStatementApp(1, [3]));
const exForAll1 = sb.makeForAllStatement("x", "", exSimple1, 2);
const exForAll2 = sb.makeForAllStatement("x", "", sb.makeForAllStatement("y", "", exApp1, 0), 2);
const exForAll3 = sb.makeForAllStatement("x", "", exAnd1, 2);
const exSchema1 = sb.makeAxiomSchema("s1", 2, exSimple1);
const exSchema2 = sb.makeAxiomSchema("s2", 2, exForAll2);
const exSchema3 = sb.makeAxiomSchema("s3", 1, sb.makeAxiomSchema("s4", 2, exForAll3));

test("assign statement to simple", () => {
  expect(assignStatements(exSimple1, [exSimple1], 4)).toStrictEqual(exSimple1);
})

test("assign not enough statements", () => {
  expect(assignStatements(exSchema3, [exSimple1], 4)).toStrictEqual(sb.makeAxiomSchema("s4", 2, exForAll3));
})

test("assign statement with no applications", () => {
  expect(assignStatements(exSchema1, [exSimple2], 4)).toStrictEqual(exSimple1);
})

test("assign statement with one application", () => {
  expect(assignStatements(exSchema2, [exSimple2], 4)).toStrictEqual(
    sb.makeForAllStatement("x", "", sb.makeForAllStatement("y", "", sb.makeSimpleStatement("foobar", [1, 2, 0]), 0), 2)
  );
})