import { drawBlock } from "../block/draw_block.js";
import * as db from "../drawing/drawing_base.js";
import { drawObject } from "../object/draw_object.js";
import { getForAllBlock } from "../space/space_base.js";
import { setupListCanvas } from "./prover_base.js";

export function drawObjectList(space, canvas) {
  var height = space.objects.length * (db.inputSize*2 + db.blockMarginInList) + space.createdBlocks.length * (db.blockSize + db.blockMarginInList) + db.blockMarginInList;
  setupListCanvas(canvas, height);

  var y = db.blockMarginInList;
  for (var i = 0; i < space.objects.length; i++) {
    drawObject(canvas, db.blockMarginInList, y, space.objects[i]);
    y += db.inputSize*2 + db.blockMarginInList;
  }

  for (var i = 0; i < space.createdBlocks.length; i++) {
    drawBlock(canvas, getForAllBlock(space, i), space, db.blockMarginInList, y);
    y += db.blockSize + db.blockMarginInList;
  }
}

export function mouseDownOnObjectList(space, x, y) {
  if (x < 0 || x > db.sidebarWidth) {
    return {type: "none"};
  }

  var tempy = db.blockMarginInList;
  for (var i = 0; i < space.objects.length; i++) {
    if (y > tempy && y < tempy + db.inputSize*2) {
      return {type: "object", object: space.objects[i], objectId: i};
    }
    tempy += db.inputSize*2 + db.blockMarginInList;
  }

  for (var i = 0; i < space.createdBlocks.length; i++) {
    if (y > tempy && y < tempy + db.blockSize) {
      return {type: "block", block: structuredClone(getForAllBlock(space, i))};
    }
    tempy += db.blockSize + db.blockMarginInList;
  }

  return {type: "none"};
}