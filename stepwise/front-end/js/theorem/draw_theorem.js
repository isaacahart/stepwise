import { theoremBlockData } from "../block/block_data.js";
import { drawGenericBlock, genericBlockWidth } from "../block/draw_block.js";
import * as db from "../drawing/drawing_base.js";
import { drawObject, drawObjectOutput, objectWidth } from "../object/draw_object.js";
import { getTheoremInputIds, getTheoremInputs } from "./theorem_base.js";

export function setupAndDrawTheorem(canvas, name, color, statement) {
  var inputs = getTheoremInputs(statement);
  db.setupCanvas(canvas, 0, 0);
  db.setupCanvas(canvas, genericBlockWidth(canvas.getContext("2d"), theoremBlockData(name, color, statement))+2, db.blockSize);
  drawGenericBlock(canvas, 0, 0, theoremBlockData(name, color, statement));
}

export function drawTheoremByStatement(canvas, x, y, name, color, statement) {
  drawGenericBlock(canvas, x, y, theoremBlockData(name, color, statement));
}

export function setupTheoremCanvas(canvas, name, statement) {
  db.setupCanvas(canvas, genericBlockWidth(canvas.getContext("2d"), theoremBlockData(name, color, statement)))
}