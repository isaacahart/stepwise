/*
Proof Structure:

statement: <statement>
name: <string>
color: <color>
steps: <block>
goals: [<statement>]
complete: <boolean>
completedAt: <int>
editingOutput(?): <int>
subproofs: [{
  statement: <statement>
  goals: [<statement>]
  complete: <boolean>
  completedAt: <int>}]
currentBranch: <branchSpace>
subproofHasFailed: <boolean>
subproofFailedAt: <int>

*/

import * as db from "../drawing/drawing_base.js";
import { applyBlock, subproofFailed } from "../block/apply_block.js";
import { checkComplete } from "../block/check_complete.js";
import { addStatementToSpace, clearSpace, objectNamesInSpace, reduceSpaceToBranch } from "../space/space_base.js";
import { getInnerStatement } from "../theorem/assign_objects.js";
import { getTheoremInputs } from "../theorem/theorem_base.js";
import { blockHeight, drawBlock, drawProofHeader } from "../block/draw_block.js";
import { emptyBranchSpace, getIntermediateState, getProofIndent, openSpaceBranch, recordIntermediateState, recoverIntermediateState } from "../space/intermediate_spaces.js";
import { getBlockData } from "../block/block_data.js";

export function setupProof(name, color, statement, steps) {
  var proof = {statement: statement, name: name, color: color, steps: steps, goals: []};
  resetProofVariables(proof);
  return proof;
}

function resetProofVariables(proof) {
  proof.complete = false;
  proof.completedAt = -1;
  proof.subproofs = [];
  proof.subproofHasFailed = false;
  proof.subproofFailedAt = -1;
  proof.currentBranch = emptyBranchSpace();
}

export function runAndDrawProof(proof, space, canvas) {
  // run and draw the proof from the beginning. this will mutate space, proof, and canvas objects //
  setupProofSpace(proof, space);
  resetProofVariables(proof);
  proof.currentBranch = reduceSpaceToBranch(space);

  db.setupCanvas(canvas, canvas.width, db.proofHeaderSize + proof.steps.length * db.blockSize);
  drawProofHeader(canvas, 0, 0, proof);

  return runAndDrawProofLoop(proof, space, 0, canvas, db.proofHeaderSize);
}

export function runAndDrawProofFromStep(proof, space, step, canvas) {
  const ctx = canvas.getContext("2d");
  var tempy = db.proofHeaderSize + step * db.blockSize
  ctx.clearRect(0, tempy, canvas.width, db.proofHeaderSize + proof.steps.length * db.blockSize - tempy);

  const oldImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
  db.setupCanvas(canvas, canvas.width, db.proofHeaderSize + proof.steps.length * db.blockSize);
  ctx.putImageData(oldImg, 0, 0);
  
  recoverIntermediateState(space, step);

  proof.complete = proof.complete && proof.completedAt < step;
  proof.subproofs.splice(space.branches.length);
  for (var i = 0; i < proof.subproofs.length; i++) {
    proof.subproofs[i].complete = proof.subproofs[i].complete && proof.subproofs[i].completedAt < step;
  }
  proof.subproofHasFailed = proof.subproofHasFailed && proof.subproofFailedAt < step;

  return runAndDrawProofLoop(proof, space, step, canvas, tempy);
}

function runAndDrawProofLoop(proof, space, step, canvas, startY) {
  var tempy = startY;

  for (var i = step; i < proof.steps.length; i++) {
    recordIntermediateState(space);

    if (!proof.subproofHasFailed && subproofFailed(proof.steps[i], space, proof)) {
      proof.subproofHasFailed = true;
      proof.subproofFailedAt = i;
      proof.currentBranch = reduceSpaceToBranch(space);
    }

    applyBlock(proof.steps[i], space, proof);

    if (space.openBranches.length > 0) {
      completeSubproof(proof, space, i, proof.subproofs[space.openBranches[space.openBranches.length-1]]);
    } else {
      completeSubproof(proof, space, i, proof);
    }

    drawBlock(canvas, proof.steps[i], space, getProofIndent(space), tempy);

    tempy += blockHeight(proof.steps[i]);
  }

  if (!proof.subproofHasFailed) {
    proof.currentBranch = reduceSpaceToBranch(space);
  }

  recordIntermediateState(space);
}

function completeSubproof(proof, space, step, subproof) {
  if (checkComplete(proof.steps[step], space, subproof.goals)) {
    subproof.complete = true;
    subproof.completedAt = step;
  }
}

export function setupProofSpace(proof, space) {
  clearSpace(space);
  space.objects = getTheoremInputs(proof.statement);

  var innerSta = getInnerStatement(proof.statement);
  while (innerSta.type == "implication") {
    addStatementToSpace(innerSta.first, space, []);
    innerSta = innerSta.second;
  }

  proof.goals = [];
  if (innerSta.type == "and") {
    for (var i = 0; i < innerSta.statements.length; i++) {
      proof.goals.push(innerSta.statements[i]);
    }
  } else {
    proof.goals.push(innerSta);
  }
}

export function beginSubproof(proof, space, claim, goals) {
  openSpaceBranch(space);
  proof.subproofs.push({
    statement: claim,
    goals: goals,
    complete: false,
    completedAt: -1
  });
}

export function objectsAtStep(space, step, staIdx, proof) {
  var boundVars = getBlockData(proof.steps[step], space).boundVariables[staIdx]
  if (boundVars === undefined) {
    var boundVars = [];
  }
  return [...getIntermediateState(space, step).objects, ...boundVars];
}

export function objectNamesAtStep(space, step, staIdx, proof) {
  return objectsAtStep(space, step, staIdx, proof).map(obj => obj.name);
}