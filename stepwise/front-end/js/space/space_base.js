
/*
Space structure:

objects: [<object>]
statements: [<statement>]
createdBlocks: [{name:<string>, color:<color>, statement:<int>}]
theoremList: [<theorem>]
theoremIds: [<int>]
branches: [<branchSpace>]
branchStarts: [<int>]
openBranches: [<int>]
intermediateStates: [{
  objects: <int>
  statements: <int>
  createdBlocks: <int>
  openBranches: [<int>]}

*/

import { makeAndStatement, statementsEqual } from "../statement/statement_base.js";
import { tautologicallyImplies } from "../statement/tautologies.js";
import { applyModusPonensWithMinimalLogic, impliesWithMinimalLogic } from "../statement/modus_ponens.js";
import { assignObjectToQuantifier } from "../theorem/assign_objects.js";
import { defaultBlockColor, defaultBlockName, makeForAllBlock } from "../block/block_base.js";
import { emptyInputObj, emptyOutputObj, makeObject } from "../object/object_base.js";
import { makeStatementStringOneLine } from "../statement/statement_display.js";

export function emptySpace() {
  return {objects: [], statements: [], theoremList: [], theoremIds: [], createdBlocks: [], 
    intermediateStates: [], branches: [], branchStarts: [], openBranches: []};
}

export function emptySpaceWithTheorems(theoremList, theoremIds) {
  var s = emptySpace();
  s.theoremList = theoremList;
  s.theoremIds = theoremIds;
  return s;
}

export function makeSpace(objects, statements, theoremList, theoremIds, createdBlocks, intermediateStates=[],
  branches=[], branchStarts=[], openBranches=[]
) {
  return {objects: objects, statements: statements, theoremList: theoremList, theoremIds: theoremIds, createdBlocks: createdBlocks, 
    intermediateStates: intermediateStates, branches: branches, branchStarts: branchStarts, openBranches: openBranches};
}

export function clearSpace(space) {
  space.objects = [];
  space.statements = [];
  space.createdBlocks = [];
  space.intermediateStates = [];
  space.branches = [];
  space.branchStarts = [];
  space.openBranches = [];
}

export function statementInSpace(sta, space) {
  return space.statements.some((s) => { return statementsEqual(s, sta); })
}

export function statementExactlyInSpace(sta, space) {
  return space.statements.includes(sta);
}

export function addStatementToSpace(sta, space, newObjs=[], newBlocks=[], newUnnamedObjCount=0) {
  var outs = emptyOutput();

  if (sta.type === "and") {
    incrementOutputs(outs, addStatementsToSpace(sta.statements, space, newObjs, newBlocks, newUnnamedObjCount));

  } else if (sta.type === "exists") {
      var obj = newObjs.shift();
      if (obj === undefined) {
        newUnnamedObjCount += 1;
        space.objects.push(makeObject("output"+newUnnamedObjCount.toString(), sta.varColor));
      } else {
        space.objects.push(obj);
      }
      outs.objs += 1;
      incrementOutputs(outs, addStatementToSpace(assignObjectToQuantifier(sta, space.objects.length-1), space, newObjs, newBlocks, newUnnamedObjCount));

  } else if (!statementExactlyInSpace(sta, space)) {
    if (sta.type === "for-all") {
      var blk = newBlocks.shift();
      if (blk === undefined) {
        space.createdBlocks.push({name: makeStatementStringOneLine(sta, space.objects), color: defaultBlockColor, statement: space.statements.length});
      } else {
        space.createdBlocks.push({name: blk.name, color: blk.color, statement: space.statements.length});
      }
      outs.blocks.push(space.statements.length);
    }

    space.statements.push(sta);
  }

  return outs;
}

export function addStatementsToSpace(stas, space, newObjs=[], newBlocks=[], newUnnamedObjCount=0) {
  var outs = emptyOutput();
  for (var i = 0; i < stas.length; i++) {
    incrementOutputs(outs, addStatementToSpace(stas[i], space, newObjs, newBlocks, newUnnamedObjCount));
  }
  return outs;
}

export function addStatementsToSpaceWithModusPonens(sta, space, newObjs=[], newBlocks=[]) {
  var outs = addStatementToSpace(sta, space, newObjs, newBlocks);
  incrementOutputs(outs, addStatementsToSpace(applyModusPonensWithMinimalLogic(sta, makeAndStatement(space.statements)), space, newObjs, newBlocks));
  incrementOutputs(outs, addStatementsToSpace(applyModusPonensWithMinimalLogic(makeAndStatement(space.statements), sta), space, newObjs, newBlocks));
  return outs;
}

export function tautologicallyImpliedInSpace(sta, space) {
  /*
  var primes = getPrimeFormulasIn(sta);
  var relevantStatements = [];
  for (var i = 0; i < space.statements.length; i++) {
    if (hasPrimeFormulas(space.statements[i], primes)) {
      relevantStatements.push(space.statements[i]);
    }
  }*/
  return tautologicallyImplies(makeAndStatement(space.statements), sta);
}

export function impliedWithMinimalLogicInSpace(sta, space) {
  return impliesWithMinimalLogic(makeAndStatement(space.statements), sta);
}

function emptyOutput() {
  return {objs:0, blocks:[]};
}

function incrementOutputs(outs, newOuts) {
  outs.objs += newOuts.objs;
  outs.blocks.push(...newOuts.blocks);
}

export function lookupTheoremInSpace(space, id) {
  var thmIdx = space.theoremIds.indexOf(id);
  if (thmIdx < 0) {
    return undefined;
  }
  return space.theoremList[thmIdx];
}

export function getObjectsFromIds(space, ids) {
  return ids.map((id) => {
    if (id < 0 || id >= space.objects.length) {
      return emptyInputObj;
    } else {
      return space.objects[id];
    }
  });
}

export function getForAllBlock(space, idx) {
  return makeForAllBlock(idx, getStatementFromCreatedBlock(space, idx));
}

export function getStatementFromCreatedBlock(space, id) {
  if (id < 0 || id >= space.createdBlocks.length) {
    return undefined;
  } else {
    return space.statements[space.createdBlocks[id].statement];
  }
}

export function getTheoremFromCreatedBlock(space, id) {
  if (id < 0 || id >= space.createdBlocks.length) {
    return undefined;
  } else {
    return {statement: getStatementFromCreatedBlock(space, id), name: space.createdBlocks[id].name, color: space.createdBlocks[id].color};
  }
}

export function objectNamesInSpace(space) {
  return space.objects.map(obj => obj.name);
}

export function objectIdsInSpace(space) {
  return space.objects.map((obj, idx) => idx);
}

export function reduceSpaceToBranch(space) {
  return {statements: [...space.statements], objects: [...space.objects], createdBlocks: [...space.createdBlocks]};
}