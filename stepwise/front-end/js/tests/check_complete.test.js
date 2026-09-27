import { checkComplete } from "../block/check_complete";
import { emptySpace } from "../space/space_base";
import { makeExistsStatement, makeSimpleStatement } from "../statement/statement_base"

const exCG1 = {type:"complete-goal", inputs:[]}
const exCG2 = {type:"complete-goal", inputs:[3]}
const exCG3 = {type:"complete-goal", inputs:[4, 2]}
const exGoal1 = makeSimpleStatement("foo", [0, 2]);
const exGoal2 = makeExistsStatement("x", "#123456", exGoal1, 2);
const exGoal3 = makeExistsStatement("y", "#abcdef", exGoal2, 0);
var exSpace1 = emptySpace();
var exSpace2 = emptySpace();
var exSpace3 = emptySpace();
exSpace1.statements.push(exGoal1);
exSpace2.statements.push(makeSimpleStatement("foo", [4, 2]));
exSpace3.statements.push(makeSimpleStatement("foo", [4, 2]));
exSpace3.statements.push(exGoal1);

test("complete no goals", () => {
    expect(checkComplete(exCG1, exSpace1, [])).toBe(true);
})

test("complete goal with no inputs", () => {
    expect(checkComplete(exCG1, exSpace1, [exGoal1])).toBe(true);
})

test("dont complete goal with no inputs", () => {
    expect(checkComplete(exCG1, exSpace2, [exGoal1])).toBe(false);
})

test("complete goal with two inputs", () => {
    expect(checkComplete(exCG3, exSpace2, [exGoal3])).toBe(true);
})

test("dont complete goal with two inputs", () => {
    expect(checkComplete(exCG3, exSpace1, [exGoal3])).toBe(false);
})

test("complete two goals", () => {
    expect(checkComplete(exCG3, exSpace3, [exGoal1, exGoal3])).toBe(true);
})

test("complete two goals again", () => {
    expect(checkComplete(exCG3, exSpace3, [exGoal3, exGoal1])).toBe(true);
})

test("dont complete three goals", () => {
    expect(checkComplete(exCG3, exSpace3, [exGoal1, exGoal2, exGoal3])).toBe(false);
})

test("complete goal with not enough inputs", () => {
    var exCG4 = {type:"complete-goal", inputs:[]};
    expect(checkComplete(exCG4, exSpace1, [exGoal2])).toBe(false);
    expect(exCG4.inputs).toStrictEqual([-1]);
})

test("complete goal with not enough inputs", () => {
    var exCG4 = {type:"complete-goal", inputs:[3]};
    expect(checkComplete(exCG4, exSpace1, [exGoal3])).toBe(false);
    expect(exCG4.inputs).toStrictEqual([3, -1]);
})

test("complete goal with too many inputs", () => {
    var exCG4 = {type:"complete-goal", inputs:[4, 2]};
    expect(checkComplete(exCG4, exSpace1, [exGoal2])).toBe(false);
    expect(exCG4.inputs).toStrictEqual([4]);
})

test("complete two goals with not enough inputs", () => {
    var exCG4 = {type:"complete-goal", inputs:[3, 4]};
    checkComplete(exCG4, exSpace1, [exGoal3, exGoal2]);
    expect(exCG4.inputs).toStrictEqual([3, 4, -1]);
})

test("complete two goals with not enough inputs again", () => {
    var exCG4 = {type:"complete-goal", inputs:[3, 4]};
    checkComplete(exCG4, exSpace1, [exGoal3, exGoal1, exGoal2]);
    expect(exCG4.inputs).toStrictEqual([3, 4, -1]);
})

test("complete two goals with too many inputs", () => {
    var exCG4 = {type:"complete-goal", inputs:[3, 4, 6, 7]};
    checkComplete(exCG4, exSpace1, [exGoal3, exGoal1, exGoal2]);
    expect(exCG4.inputs).toStrictEqual([3, 4, 6]);
})