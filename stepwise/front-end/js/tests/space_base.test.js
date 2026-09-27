import { defaultBlockColor, defaultBlockName, makeForAllBlock } from "../block/block_base";
import { emptyOutputObj, makeObject } from "../object/object_base";
import { addStatementToSpace, emptySpace, makeSpace, statementInSpace } from "../space/space_base";
import { makeAndStatement, makeExistsStatement, makeForAllStatement, makeSimpleStatement } from "../statement/statement_base";
import { makeTheorem } from "../theorem/theorem_base";

const exEmptySpace = emptySpace();
const exSimpleSta1 = makeSimpleStatement("foo", [0, 1]);
const exSimpleSta2 = makeSimpleStatement("bar", [1, 2]);
const exSimpleSta3 = makeSimpleStatement("foo", [0, 2]);
const exSimpleSta4 = makeSimpleStatement("foo", [1, 2]);
const exForAll1 = makeForAllStatement("x", "", exSimpleSta1, 1);
const exForAll2 = makeForAllStatement("y", "", exSimpleSta3, 2);
const exExists1 = makeExistsStatement("x", "", exSimpleSta1, 1);
const exExists2 = makeExistsStatement("y", "", exExists1, 0);
const exExists3 = makeExistsStatement("y", "", exForAll1, 0);
const exAnd1 = makeAndStatement([exForAll1, exExists1, exForAll2]);
const exSpace1 = makeSpace([makeObject("a", ""), makeObject("b", ""), makeObject("c", "")],
[exSimpleSta1, exSimpleSta2, exForAll1], [], [], [])

test("statement in space", () => {
  expect(statementInSpace(exSimpleSta2, exSpace1)).toBe(true);
})

test("for all statement in space", () => {
  expect(statementInSpace(exForAll2, exSpace1)).toBe(true);
})

test("statement not in space", () => {
  expect(statementInSpace(exSimpleSta3, exSpace1)).toBe(false);
})

test("add simple statement to space", () => {
  var exSpace = emptySpace();
  expect(addStatementToSpace(exSimpleSta1, exSpace)).toStrictEqual({objs:0, blocks:[]});
  expect(exSpace.statements).toStrictEqual([exSimpleSta1]);
  expect(exSpace.objects).toStrictEqual([]);  
})

test("add exists statement to space", () => {
  var exSpace = emptySpace();
  exSpace.objects.push(makeObject("a", ""));
  expect(addStatementToSpace(exExists1, exSpace, [makeObject("b", "")], [])).toStrictEqual({objs:1, blocks:[]});
  expect(exSpace.objects).toStrictEqual([makeObject("a", ""), makeObject("b", "")]);
  expect(exSpace.statements).toStrictEqual([exSimpleSta1]);
  expect(exSpace.createdBlocks).toStrictEqual([]);
})

test("add exists statement to space and change bound index", () => {
  var exSpace = emptySpace();
  exSpace.objects.push(makeObject("a", ""), makeObject("b", ""));
  addStatementToSpace(exExists1, exSpace, [makeObject("c", "")], []);
  expect(exSpace.objects).toStrictEqual([makeObject("a", ""), makeObject("b", ""), makeObject("c", "")]);
  expect(exSpace.statements).toStrictEqual([exSimpleSta3]);
})

test("add nested exists statement to space", () => {
  var exSpace = emptySpace();
  expect(addStatementToSpace(exExists2, exSpace, [makeObject("a", ""), makeObject("b", "")], [])).toStrictEqual({objs:2, blocks:[]});
  expect(exSpace.objects).toStrictEqual([makeObject("a", ""), makeObject("b", "")]);
  expect(exSpace.statements).toStrictEqual([exSimpleSta1]);
})

test("add nested exists statement to space and change bound index", () => {
  var exSpace = emptySpace();
  exSpace.objects.push(makeObject("a", ""));
  addStatementToSpace(exExists2, exSpace, [makeObject("b", ""), makeObject("c", "")], []);
  expect(exSpace.objects).toStrictEqual([makeObject("a", ""), makeObject("b", ""), makeObject("c", "")]);
  expect(exSpace.statements).toStrictEqual([exSimpleSta4]);
})

test("add nested exists statement to space with not enough objects given", () => {
  var exSpace = emptySpace();
  expect(addStatementToSpace(exExists2, exSpace, [makeObject("a", "")], [])).toStrictEqual({objs:2, blocks:[]});
  expect(exSpace.objects).toStrictEqual([makeObject("a", ""), makeObject("x", "")]);
  expect(exSpace.statements).toStrictEqual([exSimpleSta1]);
})

test("add for all statement to space", () => {
  var exSpace = emptySpace();
  exSpace.statements.push(exSimpleSta2)
  expect(addStatementToSpace(exForAll1, exSpace, [], [makeObject("A", "")])).toStrictEqual({objs:0, blocks:[1]});
  expect(exSpace.statements).toStrictEqual([exSimpleSta2, exForAll1]);
  expect(exSpace.createdBlocks).toStrictEqual([makeTheorem("A", "", 1)]);
  expect(exSpace.objects).toStrictEqual([]);
})

test("add for all statement to space with not enough blocks given", () => {
  var exSpace = emptySpace();
  exSpace.statements.push(exSimpleSta2);
  expect(addStatementToSpace(exForAll1, exSpace, [], [])).toStrictEqual({objs:0, blocks:[1]});
  expect(exSpace.statements).toStrictEqual([exSimpleSta2, exForAll1]);
  expect(exSpace.createdBlocks).toStrictEqual([makeTheorem(defaultBlockName, defaultBlockColor, 1)]);
})

test("add for all inside exists to space", () => {
  var exSpace = emptySpace();
  expect(addStatementToSpace(exExists3, exSpace, [makeObject("a", "")], [makeObject("A", "")])).toStrictEqual({objs:1, blocks:[0]});
  expect(exSpace.statements).toStrictEqual([exForAll1]);
  expect(exSpace.createdBlocks).toStrictEqual([makeTheorem("A", "", 0)]);
  expect(exSpace.objects).toStrictEqual([makeObject("a", "")]);
})

test("add and statement to space", () => {
  var exSpace = emptySpace();
  exSpace.objects.push(makeObject("a", ""));
  expect(addStatementToSpace(exAnd1, exSpace, [makeObject("b", "")], [makeObject("A", ""), makeObject("B", "")])).toStrictEqual({objs:1, blocks:[0, 2]});
  expect(exSpace.statements).toStrictEqual([exForAll1, exSimpleSta1, exForAll2]);
  expect(exSpace.createdBlocks).toStrictEqual([makeTheorem("A", "", 0), makeTheorem("B", "", 2)]);
  expect(exSpace.objects).toStrictEqual([makeObject("a", ""), makeObject("b", "")]);
})