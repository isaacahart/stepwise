import * as db from "../drawing/drawing_base.js";
import { cBlocks, createCompleteGoal, createTheoremAppFromTheorem, makeCloseCBlock } from "../block/block_base.js";
import { setupProofSpace } from "../proof/proof_base.js";
import { drawBlock } from "../block/draw_block.js";
import { emptySpace, emptySpaceWithTheorems } from "../space/space_base.js";
import { drawListTabs, setupListCanvas } from "./prover_base.js";

export function createBlockList(theoremList, theoremIds, proof) {
  var blockList = [];
  var setup = setupProofSpace(proof.statement, theoremList);
  blockList.push(createCompleteGoal(setup.goals));

  for (var i = 0; i < theoremList.length; i++) {
    blockList.push(createTheoremAppFromTheorem(theoremIds[i], theoremList[i]));
  }

  return blockList;
}

export function drawBlockList(blockList, theoremList, theoremIds, categoryCounts, categoryNames, canvas) {
  var height = blockList.length * (db.blockSize + db.blockMarginInList)
   + categoryCounts.length * (db.textSize + db.blockMarginInList)
   + db.blockMarginInList;
  setupListCanvas(canvas, height);

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";

  var y = db.blockMarginInList;
  var catStart = 0;
  var catIdx = 0;
  if (categoryNames.length > 0) {
    ctx.fillText(categoryNames[0], db.blockMarginInList, y + db.textSize/2);
    y += db.textSize + db.blockMarginInList;
  }
  for (var i = 0; i < blockList.length; i++) {
    if (i == catStart + categoryCounts[catIdx]) {
      if (categoryNames[catIdx+1] === undefined || categoryNames[catIdx+1] === "") {
        var cname = "no category"
      } else {
        var cname = categoryNames[catIdx+1];
      }
      ctx.fillStyle = "black";
      ctx.fillText(cname, db.blockMarginInList, y + db.textSize/2);
      y += db.textSize + db.blockMarginInList;
      catStart = i;
      catIdx += 1;
    }
    drawBlock(canvas, blockList[i], emptySpaceWithTheorems(theoremList, theoremIds), db.blockMarginInList, y);
    y += db.blockSize + db.blockMarginInList;
  }
}

export function mouseDownOnBlockList(blockList, categoryCounts, x, y) {
  // mouse down at the given location on the block list, return the resulting interaction //
  if (x < 0 || x > db.sidebarWidth) {
    return {type:"none"};
  }

  var tempy = db.blockMarginInList;
  var catStart = 0;
  var catIdx = 0;
  if (categoryCounts.length > 0) {
    tempy += db.textSize + db.blockMarginInList;
  }
  for (var i = 0; i < blockList.length; i++) {
    if (i == catStart + categoryCounts[catIdx]) {
      tempy += db.textSize + db.blockMarginInList;
      catStart = i;
      catIdx += 1;
    }
    if (y > tempy && y < tempy + db.blockSize) {
      if (cBlocks.includes(blockList[i].type)) {
        return {type: "block-stack", blocks: [structuredClone(blockList[i]), makeCloseCBlock()]};
      } else {
        return {type: "block", block: structuredClone(blockList[i])};
      }
    }
    tempy += db.blockSize + db.blockMarginInList;
  }

  return {type: "none"};
}