import * as sb from "../statement/statement_base.js";
import { assignObjects, assignObjectToQuantifier, getInnerStatement } from "../theorem/assign_objects.js";

const exSimpleSta1 = sb.makeSimpleStatement("foobar", []);
const exSimpleSta2 = sb.makeSimpleStatement("foobar", [5, 2, 7]);
const exForAll1 = sb.makeForAllStatement("x", "#123456", sb.makeSimpleStatement("foobar", [0]));
const exForAll2 = sb.makeForAllStatement("x", "#123456", 
        sb.makeForAllStatement("y", "#abcdef", sb.makeSimpleStatement("foobar", [0, 1, 0])));
const exForAll3 = sb.makeForAllStatement("x", "#123456", 
  sb.makeAndStatement([
    sb.makeForAllStatement("y", "#abcdef",
      sb.makeSimpleStatement("foobar", [0, 1, 0]))]))
const exForAll4 = sb.makeForAllStatement("x", "#123456", 
        sb.makeForAllStatement("y", "#abcdef", sb.makeSimpleStatement("foobar", [4, 8]), 4), 8);
const exExists1 = sb.makeForAllStatement("x", "#123456", 
        sb.makeExistsStatement("y", "#abcdef", sb.makeSimpleStatement("foobar", [0, 1, 0])));
const exExists2 = sb.makeExistsStatement("y", "#abcdef", sb.makeSimpleStatement("foobar", [3, 0, 1]), 3)
const exExists3 = sb.makeExistsStatement("x", "#123456", exExists2, 1)

test("assign to simple statement", () => {
    expect(assignObjects(exSimpleSta1, [])).toStrictEqual(exSimpleSta1);
})

test("assign no variables", () => {
    expect(assignObjects(exForAll1, [-1])).toStrictEqual(
        sb.makeForAllStatement("x", "#123456", sb.makeSimpleStatement("foobar", [0]), 0));
})

test("assign a variable", () => {
    expect(assignObjects(exForAll1, [3])).toStrictEqual(
        sb.makeSimpleStatement("foobar", [3]));
})

test("assign two variables", () => {
    expect(assignObjects(exForAll2, [5, 3])).toStrictEqual(
        sb.makeSimpleStatement("foobar", [5, 3, 5]));
})

test("assign one of two variables", () => {
    expect(assignObjects(exForAll2, [-1, 3])).toStrictEqual(
        sb.makeForAllStatement("x", "#123456", sb.makeSimpleStatement("foobar", [0, 3, 0]), 0));
})

test("assign one of two variables and change variable index", () => {
    expect(assignObjects(exForAll2, [-1, 0])).toStrictEqual(
        sb.makeForAllStatement("x", "#123456", sb.makeSimpleStatement("foobar", [2, 0, 2]), 2));
})

/*
test("assign a variable with exists statement", () => {
    expect(assignObjects(exExists1, [3])).toStrictEqual(
        sb.makeExistsStatement("y", "#abcdef", sb.makeSimpleStatement("foobar", [3, 0, 3]), 0));
})*/

test("assign variables to statements separated by non-for-all statement and change variable index", () => {
    expect(assignObjects(exForAll3, [1])).toStrictEqual(sb.makeAndStatement([
        sb.makeForAllStatement("y", "#abcdef", sb.makeSimpleStatement("foobar", [1, 2, 1]), 2)]));
})

test("assign two variables with varIdx", () => {
    expect(assignObjects(exForAll4, [4, 3])).toStrictEqual(
        sb.makeSimpleStatement("foobar", [3, 4]));
})

test("assign one of two variables with varIdx", () => {
    expect(assignObjects(exForAll4, [-1, 3])).toStrictEqual(
        sb.makeForAllStatement("x", "#123456", sb.makeSimpleStatement("foobar", [3, 8]), 8));
})



test("get inner simple statement", () => {
  expect(getInnerStatement(exSimpleSta1)).toStrictEqual(exSimpleSta1);
})

test("get inner for all", () => {
  expect(getInnerStatement(exForAll1)).toStrictEqual(sb.makeSimpleStatement("foobar", [0]));
})

test("get inner for all", () => {
  expect(getInnerStatement(exForAll2)).toStrictEqual(sb.makeSimpleStatement("foobar", [0, 1, 0]));
})


test("get inner separated for alls", () => {
  expect(getInnerStatement(exForAll3)).toStrictEqual(
    sb.makeAndStatement([
    sb.makeForAllStatement("y", "#abcdef",
      sb.makeSimpleStatement("foobar", [0, 1, 0]), 1)]));
})


test("assign single object to exists statement", () => {
  expect(assignObjectToQuantifier(exExists2, 2)).toStrictEqual(
    sb.makeSimpleStatement("foobar", [2, 0, 1])
  );
})

test("assign existing object to exists statement", () => {
  expect(assignObjectToQuantifier(exExists2, 1)).toStrictEqual(
    sb.makeSimpleStatement("foobar", [1, 0, 1])
  );
})

test("assign already bound object to exists statement", () => {
  expect(assignObjectToQuantifier(exExists3, 3)).toStrictEqual(
    sb.makeExistsStatement("y", "#abcdef", sb.makeSimpleStatement("foobar", [2, 0, 3]), 2)
  );
})

test("assign single object to non-quantifier", () => {
  expect(assignObjectToQuantifier(exSimpleSta2, 2)).toStrictEqual(exSimpleSta2);
})