import * as db from "../drawing/drawing_base.js";
import { drawObject, drawObjectOutput, objectWidth } from "../object/draw_object.js";
import { makeObject } from "../object/object_base.js";
import { getBlockData, proofHeaderData } from "./block_data.js";

export function drawBlock(canvas, block, space, x, y) {
  drawGenericBlock(canvas, x, y, getBlockData(block, space));
}

export function drawGenericBlock(canvas, x, y, data, isHeader=false) {
  const ctx = canvas.getContext("2d");
  var width = genericBlockWidth(ctx, data);

  if (isHeader) {
    db.drawRect(ctx, x, y, width, db.proofHeaderSize, [db.headerCornerRadius, db.headerCornerRadius, db.cornerRadius, db.cornerRadius], data.color);
  } else {
    db.drawRect(ctx, x, y, width, db.blockSize, db.cornerRadius, data.color);
  }

  var tempx = x;
  tempx += db.blockMarginSize;
  ctx.textBaseline = "middle";
  if ("textColor" in data) {
    ctx.fillStyle = data.textColor;
  } else {
    ctx.fillStyle = db.normalTextColorBlock;
  }
  ctx.fillText(data.name, tempx, y+db.blockSize/2);
  tempx += ctx.measureText(data.name).width + db.blockMarginSize;

  for (var i = 0; i < Math.min(data.boundVariables.length, data.statementInputStrings.length); i++) {
    for (var j = 0; j < data.boundVariables[i].length; j++) {
      tempx += drawObjectOutput(canvas, tempx, y + db.blockInputY, data.boundVariables[i][j]);
      tempx += db.blockMarginSize
    }
    tempx += drawStatementInput(canvas, tempx, y + db.blockInputY, data.statementInputStrings[i]);
    tempx += db.blockMarginSize
  }

  for (var i = 0; i < data.inputObjs.length; i++) {
    tempx += drawObject(canvas, tempx, y + db.blockInputY, data.inputObjs[i]);
    tempx += db.blockMarginSize
  }

  if (data.outputObjs.length > 0 || data.outputBlocks.length > 0) {
    ctx.fillStyle = data.textColor;
    ctx.fillText("→", tempx, y+db.blockSize/2);
    tempx += db.arrowSize + db.blockMarginSize;
  }

  for (var i = 0; i < data.outputObjs.length; i++) {
    tempx += drawObjectOutput(canvas, tempx, y + db.blockInputY, data.outputObjs[i]);
    tempx += db.blockMarginSize
  }
  for (var i = 0; i < data.outputBlocks.length; i++) {
    tempx += drawBlockOutput(canvas, tempx, y + db.blockInputY, data.outputBlocks[i]);
    tempx += db.blockMarginSize
  }
}

export function drawProofHeader(canvas, x, y, proof) {
  drawGenericBlock(canvas, x, y, proofHeaderData(proof), true);
}

export function blockWidth(canvas, block, space) {
  return genericBlockWidth(canvas.getContext("2d"), getBlockData(block, space));
}

export function genericBlockWidth(ctx, data) {
  var w = (2 + data.inputObjs.length + data.outputObjs.length + data.outputBlocks.length) * db.blockMarginSize;
  w += ctx.measureText(data.name).width;

  for (var i = 0; i < Math.min(data.boundVariables.length, data.statementInputStrings.length); i++) {
    for (var j = 0; j < data.boundVariables[i].length; j++) {
      w += objectWidth(ctx, data.boundVariables[i][j]);
      w += db.blockMarginSize
    }
    w += statementInputWidth(ctx, data.statementInputStrings[i]);
    w += db.blockMarginSize
  }
  for (var i = 0; i < data.inputObjs.length; i++) {
    w += objectWidth(ctx, data.inputObjs[i]);
  }
  if (data.outputObjs.length > 0 || data.outputBlocks.length > 0) {
    w += db.arrowSize + db.blockMarginSize;
  }
  for (var i = 0; i < data.outputObjs.length; i++) {
    w += objectWidth(ctx, data.outputObjs[i]);
  }
  for (var i = 0; i < data.outputBlocks.length; i++) {
    w += objectWidth(ctx, data.outputBlocks[i]);
  }
  return w;
}

export function setupBlockCanvas(canvas, block, space) {
  setupGenericBlockCanvas(canvas, block, getBlockData(block, space));
  drawBlock(canvas, block, space, 0, 0);
}

function setupGenericBlockCanvas(canvas, block, data) {
  const ctx = canvas.getContext("2d");
  var width = genericBlockWidth(ctx, data);
  var height = blockHeight(block);
  db.setupCanvas(canvas, width+2, height);
}

export function setupBlockStackCanvas(canvas, blocks, space) {
  const ctx = canvas.getContext("2d");
  var blockData = blocks.map(blk => getBlockData(blk, space));
  var width = maxBlockWidth(ctx, blockData);
  var height = db.blockSize * blocks.length;
  db.setupCanvas(canvas, width+2, height);

  var y = 0;
  for (var i = 0; i < blockData.length; i++) {
    drawGenericBlock(canvas, 0, y, blockData[i]);
    y += db.blockSize;
  }
}

function maxBlockWidth(ctx, blockData) {
  var width = 0;
  for (var i = 0; i < blockData.length; i++) {
    var w = genericBlockWidth(ctx, blockData[i]);
    if (w > width) {
      width = w;
    }
  }
  return width;
}

export function drawBlockOutput(canvas, x, y, object) {
  const ctx = canvas.getContext("2d");
  var width = objectWidth(ctx, object);

  db.drawRect(ctx, x, y, width, db.inputSize*2, 0, "#ffffff");

  // draw text
  ctx.textBaseline = "middle";
  ctx.fillStyle = object.color;
  ctx.fillText(object.name, x+db.inputSize, y+db.inputSize);

  return width;
}

function drawStatementInput(canvas, x, y, staString) {
  return drawBlockOutput(canvas, x, y, makeObject(staString, "#000000"));
}

export function statementInputWidth(ctx, staString) {
  return objectWidth(ctx, makeObject(staString, "#000000"));
}

export function blockHeight(block) {
  return db.blockSize;
}