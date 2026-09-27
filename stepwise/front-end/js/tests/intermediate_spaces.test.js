import { makeObject } from "../object/object_base";
import { closeSpaceBranch, emptyBranchSpace, getIntermediateState, intermediateState, openSpaceBranch, recordIntermediateState, recoverIntermediateState } from "../space/intermediate_spaces";
import { emptySpace, makeSpace } from "../space/space_base";
import { makeSimpleStatement } from "../statement/statement_base";

// no branch statements
const exStaList1 = [makeSimpleStatement("aa", []), makeSimpleStatement("ab", []), makeSimpleStatement("ac", []),
  makeSimpleStatement("ad", []), makeSimpleStatement("ae", [])];
const exStaList2 = [makeSimpleStatement("aa", []), makeSimpleStatement("ab", []), makeSimpleStatement("ac", [])];

const exObjList1 = [makeObject("A", "1"), makeObject("B", "2")];
const exObjList2 = [makeObject("A", "1"), makeObject("B", "2"), makeObject("C", "3")];
const exBlkList1 = [{name:"1", color:"", statement: 4}];

// branch 0 statements
const exStaList3 = [makeSimpleStatement("ba", []), makeSimpleStatement("bb", []), makeSimpleStatement("bc", []), makeSimpleStatement("bd", []), makeSimpleStatement("be", [])];
// branch 1 statements
const exStaList4 = [makeSimpleStatement("ca", []), makeSimpleStatement("cb", []), makeSimpleStatement("cc", []), makeSimpleStatement("cd", [])];
// branch 2 statements
const exStaList5 = [makeSimpleStatement("da", []), makeSimpleStatement("db", []), makeSimpleStatement("dc", []), makeSimpleStatement("dd", [])];
// unclosed branch 0 and 1 statements
const staListStep3 = [makeSimpleStatement("aa", []), makeSimpleStatement("ab", []), makeSimpleStatement("ac", []), makeSimpleStatement("ba", [])]
const staListStep7 = [makeSimpleStatement("aa", []), makeSimpleStatement("ab", []), makeSimpleStatement("ac", []),
  makeSimpleStatement("ba", []), makeSimpleStatement("bb", []), makeSimpleStatement("bc", []),
  makeSimpleStatement("ca", []), makeSimpleStatement("cb", []), makeSimpleStatement("cc", []), makeSimpleStatement("cd", [])];
const staListStep7AfterClose = [makeSimpleStatement("aa", []), makeSimpleStatement("ab", []), makeSimpleStatement("ac", []),
  makeSimpleStatement("ba", []), makeSimpleStatement("bb", []), makeSimpleStatement("bc", [])];
const staListStep8 = [makeSimpleStatement("aa", []), makeSimpleStatement("ab", []), makeSimpleStatement("ac", []),
  makeSimpleStatement("ba", []), makeSimpleStatement("bb", []), makeSimpleStatement("bc", []), makeSimpleStatement("bd", [])];
// unclosed branch 0 statements
const staListStep9 = [makeSimpleStatement("aa", []), makeSimpleStatement("ab", []), makeSimpleStatement("ac", []),
  makeSimpleStatement("ba", []), makeSimpleStatement("bb", []), makeSimpleStatement("bc", []), makeSimpleStatement("bd", []), makeSimpleStatement("be", [])];
const staListStep12 = [makeSimpleStatement("aa", []), makeSimpleStatement("ab", []), makeSimpleStatement("ac", []), makeSimpleStatement("ad", []),
  makeSimpleStatement("da", []), makeSimpleStatement("db", []), makeSimpleStatement("dc", [])];
  
const exBranch0 = {statements: exStaList3, objects: exObjList1, createdBlocks: []};
const exBranch1 = {statements: exStaList4, objects: [makeObject("C", "3")], createdBlocks: exBlkList1};
const exBranch2 = {statements: exStaList5, objects: [makeObject("C", "3")], createdBlocks: []};

const exSpace0 = makeSpace([makeObject("A", "1")], [], [], [], []);
const exSpace1 = makeSpace(exObjList1, exStaList1, [], [], exBlkList1, 
  [intermediateState(0,1,0,[]), intermediateState(1,2,0,[]), intermediateState(3,2,0,[]), 
    intermediateState(4,2,0,[]), intermediateState(5,2,1,[])]);
const space1Step2 = makeSpace(exObjList1, exStaList2, [], [], [], [intermediateState(0,1,0,[]), intermediateState(1,2,0,[])]);

// space after all branches are done
const exSpace2 = makeSpace(exObjList1, exStaList1, [], [], [], [
  intermediateState(0,1,0,[]),
  intermediateState(1,2,0,[]),
  intermediateState(3,2,0,[]),
  intermediateState(4,2,0,[0]), 
  intermediateState(6,2,0,[0]), 
  intermediateState(7,3,0,[0,1]),
  intermediateState(9,3,1,[0,1]), 
  intermediateState(10,3,1,[0,1]), 
  intermediateState(7,2,0,[0]), 
  intermediateState(8,2,0,[0]),
  intermediateState(4,2,0,[]), 
  intermediateState(5,2,0,[2]), 
  intermediateState(7,3,0,[2]), 
  intermediateState(8,3,0,[2]),
  intermediateState(5,2,1,[])], [exBranch0, exBranch1, exBranch2], [2,4,10]);

const space2Step3 = makeSpace(exObjList1, staListStep3, [], [], [], [
  intermediateState(0,1,0,[]),
  intermediateState(1,2,0,[]),
  intermediateState(3,2,0,[])], [emptyBranchSpace()], [2], [0]);

const space2Step7 = makeSpace(exObjList2, staListStep7, [], [], exBlkList1, [
  intermediateState(0,1,0,[]),
  intermediateState(1,2,0,[]),
  intermediateState(3,2,0,[]),
  intermediateState(4,2,0,[0]), 
  intermediateState(6,2,0,[0]), 
  intermediateState(7,3,0,[0,1]),
  intermediateState(9,3,1,[0,1])], [emptyBranchSpace(), emptyBranchSpace()], [2,4], [0,1]);

const space2Step7BeforeClose = makeSpace(exObjList2, staListStep7, [], [], exBlkList1, [
  intermediateState(0,1,0,[]),
  intermediateState(1,2,0,[]),
  intermediateState(3,2,0,[]),
  intermediateState(4,2,0,[0]), 
  intermediateState(6,2,0,[0]), 
  intermediateState(7,3,0,[0,1]),
  intermediateState(9,3,1,[0,1]), 
  intermediateState(10,3,1,[0,1])], [emptyBranchSpace(), emptyBranchSpace()], [2,4], [0,1]);

const space2Step7AfterClose = makeSpace(exObjList1, staListStep7AfterClose, [], [], [], [
  intermediateState(0,1,0,[]),
  intermediateState(1,2,0,[]),
  intermediateState(3,2,0,[]),
  intermediateState(4,2,0,[0]), 
  intermediateState(6,2,0,[0]), 
  intermediateState(7,3,0,[0,1]),
  intermediateState(9,3,1,[0,1]), 
  intermediateState(10,3,1,[0,1])], [emptyBranchSpace(), exBranch1], [2,4], [0]);

const space2Step8 = makeSpace(exObjList1, staListStep8, [], [], [], [
  intermediateState(0,1,0,[]),
  intermediateState(1,2,0,[]),
  intermediateState(3,2,0,[]),
  intermediateState(4,2,0,[0]), 
  intermediateState(6,2,0,[0]), 
  intermediateState(7,3,0,[0,1]),
  intermediateState(9,3,1,[0,1]), 
  intermediateState(10,3,1,[0,1])], [emptyBranchSpace(), exBranch1], [2,4], [0]);

const space2Step12 = makeSpace(exObjList2, staListStep12, [], [], [], [
  intermediateState(0,1,0,[]),
  intermediateState(1,2,0,[]),
  intermediateState(3,2,0,[]),
  intermediateState(4,2,0,[0]), 
  intermediateState(6,2,0,[0]), 
  intermediateState(7,3,0,[0,1]),
  intermediateState(9,3,1,[0,1]), 
  intermediateState(10,3,1,[0,1]), 
  intermediateState(7,2,0,[0]), 
  intermediateState(8,2,0,[0]),
  intermediateState(4,2,0,[]), 
  intermediateState(5,2,0,[2])], [exBranch0, exBranch1, emptyBranchSpace()], [2,4,10], [2]);


test("record intermediate state", () => {
  var space = structuredClone(exSpace1);
  space.intermediateStates.pop();
  recordIntermediateState(space);
  expect(space).toEqual(exSpace1);
})

test("get intermediate state, no branches", () => {
  space = structuredClone(exSpace1);
  expect(getIntermediateState(space, 2)).toEqual(space1Step2);
  expect(space).toEqual(exSpace1);
})

test("recover intermediate state, no branches", () => {
  space = structuredClone(exSpace1);
  recoverIntermediateState(space, 2);
  expect(space).toEqual(space1Step2);
})

test("get intermediate state with state num less than 0", () => {
  expect(getIntermediateState(exSpace1, -1)).toEqual(exSpace0);
})

test("get intermediate state with state num greater than number of states", () => {
  expect(getIntermediateState(exSpace1, 1000)).toEqual(exSpace1);
})

test("open branch", () => {
  var space = structuredClone(exSpace1);
  openSpaceBranch(space);
  expect(space.openBranches).toEqual([0]);
  expect(space.branchStarts).toEqual([4]);
  expect(space.branches).toEqual([emptyBranchSpace()]);
}) 

test("close branch where none have been opened", () => {
  var space = structuredClone(exSpace1);
  closeSpaceBranch(space);
  expect(space).toEqual(exSpace1);
})

test("get intermediate state before branches", () => {
  expect(getIntermediateState(exSpace2, 2)).toEqual(space1Step2);
})

test("get intermediate state in first branch", () => {
  expect(getIntermediateState(exSpace2, 3)).toEqual(space2Step3);
})

test("get intermediate state in nested branch", () => {
  expect(getIntermediateState(exSpace2, 7)).toEqual(space2Step7);
})

test("get intermediate state after nested branch", () => {
  expect(getIntermediateState(exSpace2, 8)).toEqual(space2Step8);
})

test("get intermediate state in second branch", () => {
  expect(getIntermediateState(exSpace2, 12)).toEqual(space2Step12);
})

test("recover intermediate state with branches", () => {
  var space = structuredClone(exSpace2);
  recoverIntermediateState(space, 8);
  expect(space).toEqual(space2Step8);
})

test("close nested branch", () => {
  var space = structuredClone(space2Step7BeforeClose);
  closeSpaceBranch(space);
  expect(space).toEqual(space2Step7AfterClose);
})