import { indentSize } from "../drawing/drawing_base.js";
import { emptySpace, emptySpaceWithTheorems, objectNamesInSpace } from "./space_base.js";

export function intermediateState(statements, objects, createdBlocks, openBranches) {
  return {
    objects: objects,
    statements: statements,
    createdBlocks: createdBlocks,
    openBranches: openBranches
  };
}

export function recordIntermediateState(space) {
  // create a new intermediate state by recording the number of items in each of the space's lists at this point //
  space.intermediateStates.push({
    objects: space.objects.length,
    statements: space.statements.length,
    createdBlocks: space.createdBlocks.length,
    openBranches: [...space.openBranches]
  });
}

export function recoverIntermediateState(space, stateNum) {
  // go back to the intermediate state specified by the given number //
  if (stateNum >= space.intermediateStates.length) {
    return;
  }
  if (stateNum < 0) {
    return recoverIntermediateState(space, 0);
  }
  const state = space.intermediateStates[stateNum];
  const branch = getBranchSpace(space, state.openBranches, stateNum);
  space.objects = branch.objects;
  space.statements = branch.statements;
  space.createdBlocks = branch.createdBlocks;
  space.branches = getIntermediateBranches(space.branches, space.branchStarts, state.openBranches, stateNum);
  space.branchStarts = space.branchStarts.slice(0, space.branches.length);
  space.openBranches = state.openBranches;
  space.intermediateStates = space.intermediateStates.slice(0, stateNum);
}

export function getIntermediateState(space, stateNum) {
  // return a new space that is the specified intermediate state //
  if (stateNum >= space.intermediateStates.length) {
    return structuredClone(space);
  }
  if (stateNum < 0) {
    return getIntermediateState(space, 0);
  }
  const state = space.intermediateStates[stateNum];
  const branch = getBranchSpace(space, state.openBranches, stateNum);
  var newSpace = emptySpaceWithTheorems(space.theoremList, space.theoremIds);
  newSpace.objects = branch.objects;
  newSpace.statements = branch.statements;
  newSpace.createdBlocks = branch.createdBlocks;
  newSpace.branches = getIntermediateBranches(space.branches, space.branchStarts, state.openBranches, stateNum);
  newSpace.branchStarts = space.branchStarts.slice(0, newSpace.branches.length);
  newSpace.openBranches = state.openBranches;
  newSpace.intermediateStates = space.intermediateStates.slice(0, stateNum);
  return newSpace;
}

function getBranchSpace(space, branchNums, stateNum) {
  var newBranch = emptyBranchSpace();
  if (branchNums.length > 0) {
    addBranchesTogether(space, newBranch, space, -1, space.branchStarts[branchNums[0]]);
  } else {
    addBranchesTogether(space, newBranch, space, -1, stateNum);
  }
  
  for (var i = 0; i < branchNums.length; i++) {
    if (i+1 < branchNums.length) {
      addBranchesTogether(space, newBranch, space.branches[branchNums[i]], space.branchStarts[branchNums[i]], space.branchStarts[branchNums[i+1]]);
    } else {
      addBranchesTogether(space, newBranch, space.branches[branchNums[i]], space.branchStarts[branchNums[i]], stateNum);
    }
  }

  return newBranch
}

function addBranchesTogether(space, branch1, branch2, branchStart, nextBranchStart) {
  if (nextBranchStart < branchStart) {
    return;
  }
  var staCount = space.intermediateStates[nextBranchStart].statements;
  var objCount = space.intermediateStates[nextBranchStart].objects;
  var blkCount = space.intermediateStates[nextBranchStart].createdBlocks;
  if (branchStart >= 0) {
    staCount -= space.intermediateStates[branchStart].statements;
    objCount -= space.intermediateStates[branchStart].objects;
    blkCount -= space.intermediateStates[branchStart].createdBlocks;
  }
  branch1.statements.push(...branch2.statements.slice(0, staCount));
  branch1.objects.push(...branch2.objects.slice(0, objCount));
  branch1.createdBlocks.push(...branch2.createdBlocks.slice(0, blkCount));
}

function getIntermediateBranches(branches, branchStarts, openBranchNums, stateNum) {
  var newBranches = [];
  for (var i = 0; i < branches.length; i++) {
    if (openBranchNums.includes(i)) {
      newBranches.push(emptyBranchSpace());
    } else if (branchStarts[i] < stateNum) {
      newBranches.push(branches[i]);
    } else {
      break;
    }
  }
  return newBranches;
}

export function newStatementsAtStep(space, stateNum, notIncluding=[]) {
  // return the statements added in given state //
  if (stateNum < 1 || stateNum >= space.intermediateStates.length) {
    return [];
  }
  const firstStas = getIntermediateState(space, stateNum-1).statements;
  const secondStas = getIntermediateState(space, stateNum).statements;
  var newStas = [];
  for (var i = 0; i < secondStas.length; i++) {
    if (!firstStas.includes(secondStas[i]) && !notIncluding.includes(secondStas[i])) {
      newStas.push(secondStas[i]);
    }
  }
  return newStas;
}

export function openSpaceBranch(space) {
  space.openBranches.push(space.branches.length);
  space.branches.push(emptyBranchSpace());
  space.branchStarts.push(space.intermediateStates.length-1);
}

export function closeSpaceBranch(space) {
  if (space.openBranches.length == 0) {
    // exit if no branches have been opened
    return;
  }
  
  const lastOpenBranch = space.openBranches.pop();
  var branch = space.branches[lastOpenBranch];
  const start = space.branchStarts[lastOpenBranch];

  // move statements/objects/blocks added after branch start into their own branch
  const startState = space.intermediateStates[start];
  branch.statements = space.statements.splice(startState.statements);
  branch.objects = space.objects.splice(startState.objects);
  branch.createdBlocks = space.createdBlocks.splice(startState.createdBlocks);
}

export function emptyBranchSpace() {
  return {statements: [], objects: [], createdBlocks: []};
}

export function getProofIndent(space) {
  if (space.intermediateStates.length > 0) {
    return Math.min(space.openBranches.length, 
      space.intermediateStates[space.intermediateStates.length-1].openBranches.length) * indentSize;
  } else {
    return space.openBranches.length * indentSize;
  }
}