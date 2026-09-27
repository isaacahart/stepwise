
/*

Interaction object

type: none

type: object
object: <object>
objectId: <int>

type: block
block: <block>

type: output
output: <object>

type: statement
statement: <statement>
idx: <int>

type: block-stack
blocks: [<block>]

*/

import * as db from "../drawing/drawing_base.js";
import { objectWidth } from "../object/draw_object.js";
import { getBlockData, proofHeaderData } from "./block_data.js";
import { statementInputWidth } from "./draw_block.js";


export function mouseDownOnBlock(block, space, x, y, ctx) {
  return mouseDownOnGenericBlock(ctx, getBlockData(block, space), x, y);
}

function mouseDownOnGenericBlock(ctx, data, x, y) {
  // return a corresponding interaction object if any input or output is at the given coordinates; return a none-interaction otherwise //
  var tempx = db.blockMarginSize*2 + ctx.measureText(data.name).width;

  for (var i = 0; i < Math.min(data.boundVariables.length, data.statementInputStrings.length); i++) {
    for (var j = 0; j < data.boundVariables[i].length; j++) {
      var w = objectWidth(ctx, data.boundVariables[i][j])
      if (x > tempx && x < tempx + w) {
        // interact with bound variable
        return {type: "output", output: data.boundVariables[i][j]};
      }
      tempx += w + db.blockMarginSize;
    }

    var w = statementInputWidth(ctx, data.statementInputStrings[i])
    if (x > tempx && x < tempx + w) {
      // interact with statement input
      return {type: "statement", statement: data.statementInputs[i], idx: i};
    }
    tempx += w + db.blockMarginSize;
  }

  for (var i = 0; i < data.inputObjs.length; i++) {
    var w = objectWidth(ctx, data.inputObjs[i]);

    if (x > tempx && x < tempx + w) {
      // interact with object input
      // check whether the input is filled
      if (data.inputIds[i] >= 0) {
        var out = {type: "object", object: data.inputObjs[i], objectId: data.inputIds[i]};
        data.inputIds[i] = -1;
        return out;
      }
    }
    tempx += w + db.blockMarginSize;
  }

  if (data.outputObjs.length > 0 || data.outputBlocks.length > 0) {
    tempx += db.arrowSize + db.blockMarginSize;
  }

  for (var i = 0; i < data.outputObjs.length; i++) {
    var w = objectWidth(ctx, data.outputObjs[i]);
    if (x > tempx && x < tempx + w) {
      // interact with object output
      return {type: "output", output: data.outputObjs[i]};
    }
    tempx += w + db.blockMarginSize;
  }

  for (var i = 0; i < data.outputBlocks.length; i++) {
    var w = objectWidth(ctx, data.outputBlocks[i]);
    if (x > tempx && x < tempx + w) {
      // interact with block output
      return {type: "output", output: data.outputBlocks[i]};
    }
    tempx += w + db.blockMarginSize;
  }

  return {type:"none"};
}

export function mouseDownOnProofHeader(ctx, proof, x, y) {
  return mouseDownOnGenericBlock(ctx, proofHeaderData(proof), x, y);
}

export function mouseUpOnBlock(block, space, dragging, x, y, ctx) {
  return mouseUpOnGenericBlock(ctx, getBlockData(block, space), dragging, x, y);
}

function mouseUpOnGenericBlock(ctx, data, dragging, x, y) {
  // "drop" a dragged object onto the block at the given coordinates and return true if anything was changed, false otherwise //
  var tempx = db.blockMarginSize*2 + ctx.measureText(data.name).width;

  for (var i = 0; i < Math.min(data.boundVariables.length, data.statementInputStrings.length); i++) {
    for (var j = 0; j < data.boundVariables[i].length; j++) {
      tempx += objectWidth(ctx, data.boundVariables[i][j]) + db.blockMarginSize;
    }
    tempx += statementInputWidth(ctx, data.statementInputStrings[i]) + db.blockMarginSize;
  }

  for (var i = 0; i < data.inputObjs.length; i++) {
    var w = objectWidth(ctx, data.inputObjs[i]);

    if (x > tempx && x < tempx + w) {
      // interact with object input
      // check whether the input is filled
      if (dragging.type === "object") {
        data.inputIds[i] = dragging.objectId;
        return true;
      }
    }
    tempx += w + db.blockMarginSize;
  }

  return false;
}
