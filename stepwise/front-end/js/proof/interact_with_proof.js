import { cBlocks } from "../block/block_base.js";
import { blockWidth } from "../block/draw_block.js";
import { mouseDownOnBlock, mouseDownOnProofHeader, mouseUpOnBlock } from "../block/interact_with_block.js";
import * as db from "../drawing/drawing_base.js";
import { drawHoveredInformation } from "../proverui/block_information.js";
import { getIntermediateState, getProofIndent, newStatementsAtStep } from "../space/intermediate_spaces.js";
import { runAndDrawProofFromStep } from "./proof_base.js";

export function mouseDownOnProof(proof, space, x, y, canvas) {
  // update the proof on a mouse click at position x, y //
  // first find the clicked block

  if (y > 0 && y < db.proofHeaderSize) {
    return mouseDownOnProofHeader(canvas.getContext("2d"), proof, x, y);
  }

  y -= db.proofHeaderSize;
  var step = Math.floor(y / db.blockSize);
  if (step < 0 || step >= proof.steps.length) {
    // no interaction if click is above or below the proof
    return {interaction: {type: "none"}, space: space};
  }
  y = y - step * db.blockSize;
  var intSpace = getIntermediateState(space, step);

  var indent = getProofIndent(getIntermediateState(space, step+1));
  // stop if click is to the right of the block
  if (x - indent > blockWidth(canvas, proof.steps[step], intSpace)) {
    return {type:"none"};
  }
  
  // find what interaction is obtained by clicking the block
  var blockInteract = mouseDownOnBlock(proof.steps[step], intSpace, x - indent, y, canvas.getContext("2d"));
  if (blockInteract.type === "none") {
    // if no interaction, the click is on the block itself
    return mouseDownOnBlockInProof(proof, space, step, canvas);
  } else if (blockInteract.type === "output" || blockInteract.type === "statement") {
    proof.editingOutput = step;
    blockInteract.step = step;
    return blockInteract;
  } else {
    runAndDrawProofFromStep(proof, space, step, canvas);
    return blockInteract;
  }
}

function mouseDownOnBlockInProof(proof, space, step, canvas) {
  var blk = proof.steps[step];
  if (blk.type == "close-c-block") {
    return {type: "none"};
  } else if (cBlocks.includes(blk.type)) {
    var blocksAndSteps = blocksUntilCloseC(proof, step);
    proof.steps.splice(step, blocksAndSteps.steps);
    runAndDrawProofFromStep(proof, space, step, canvas);
    return {type: "block-stack", blocks: blocksAndSteps.blocks};
  } else {
    proof.steps.splice(step, 1);
    runAndDrawProofFromStep(proof, space, step, canvas);
    return {type: "block", block: blk};
  }
}

function blocksUntilCloseC(proof, step) {
  var blocks = [];
  var depth = 0;
  for (var i = step; i < proof.steps.length; i++) {
    blocks.push(proof.steps[i]);
    if (cBlocks.includes(proof.steps[i].type)) {
      depth++;
    } else if (proof.steps[i].type == "close-c-block") {
      depth--;
    }
    if (depth == 0) {
      return {blocks: blocks, steps: i-step+1};
    }
  }
  return {blocks: blocks, steps: proof.steps.length-step};
}

export function drawProofHoveredInfo(canvas, proof, space, x, y) {
  if (x < 0) {
    return drawHoveredInformation(canvas, {type: "none"}, space);
  }
  if (y < db.proofHeaderSize) {
    const intSpace = getIntermediateState(space, 0);
    return drawHoveredInformation(canvas, {type:"theorem", 
      theorem: {statement: proof.statement, name: proof.name, color: proof.color}, 
      newStas: intSpace.statements,
      goals: proof.goals
    }, intSpace, false);
  }
  y -= db.proofHeaderSize;
  var step = Math.floor(y / db.blockSize);
  if (step < 0 || step >= proof.steps.length) {
    return drawHoveredInformation(canvas, {type: "none"}, space);
  }
  const intSpace = getIntermediateState(space, step+1);
  return drawHoveredInformation(canvas,
    {type:"block", block: proof.steps[step], newStas: newStatementsAtStep(space, step+1)},
    intSpace, false);
}

export function mouseUpOnProof(proof, space, dragging, x, y, canvas) {
  // update the proof when a given dragging object/block is dropped on the proof and return true if a change was made //
  // first find the clicked block
  y -= db.proofHeaderSize;
  var step = Math.floor(y / db.blockSize);
  
  if (dragging.type === "block") {
    addBlocksToProofAtStep(proof, [dragging.block], step, space, canvas);
    return true;
  } else if (dragging.type === "block-stack") {
    addBlocksToProofAtStep(proof, dragging.blocks, step, space, canvas);
    return true;
  }

  if (step < 0 || step >= proof.steps.length) {
    // no interaction if dropping object above or below proof
    return false;
  }
  y = y - step * db.blockSize;
  var intSpace = getIntermediateState(space, step);

  if (mouseUpOnBlock(proof.steps[step], intSpace, dragging, x - getProofIndent(getIntermediateState(space, step+1)), y, canvas.getContext("2d"))) {
    // if object is successfully dropped, the proof should be rerun
    runAndDrawProofFromStep(proof, space, step, canvas);
    return false;
  }
  return false;
}

function addBlocksToProofAtStep(proof, blocks, step, space, canvas) {
  // blocks can be dropped on, above, or below the proof
  if (step <= 0) {
    proof.steps.splice(0, 0, ...blocks);
    runAndDrawProofFromStep(proof, space, 0, canvas);
  } else if (step >= proof.steps.length) {
    proof.steps.push(...blocks);
    runAndDrawProofFromStep(proof, space, proof.steps.length - blocks.length, canvas);
  } else {
    proof.steps.splice(step, 0, ...blocks);
    runAndDrawProofFromStep(proof, space, step, canvas);
  }
}

export function runProofFromChangedOutput(proof, space, canvas) {
  runAndDrawProofFromStep(proof, space, proof.editingOutput, canvas);
}