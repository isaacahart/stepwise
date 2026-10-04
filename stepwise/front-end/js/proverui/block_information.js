import { assignToBlockTypes, getBlockTheorem } from "../block/block_base.js";
import { drawBlock } from "../block/draw_block.js";
import * as db from "../drawing/drawing_base.js";
import { drawObject } from "../object/draw_object.js";
import { tautologicallyImpliedInSpace } from "../space/space_base.js";
import { makeIfStatement } from "../statement/statement_base.js";
import { isTautology } from "../statement/tautologies.js";
import { getUsedObjects } from "../statement/used_variables.js";
import { drawTheoremByStatement } from "../theorem/draw_theorem.js";

export function drawHoveredInformation(canvas, hovered, space, inList=true) {
  setupInfoCanvas(canvas);
  if (hovered.type == "block") {
    return drawBlockInformation(canvas, hovered.block, hovered.newStas, space, inList);
  } else if (hovered.type == "block-stack") {
    if (hovered.blocks.length > 0) {
      return drawBlockInformation(canvas, hovered.blocks[0], hovered.newStas, space, inList);
    }
  } else if (hovered.type == "theorem") {
    return drawProofHeaderInformation(canvas, hovered.theorem, hovered.newStas, hovered.goals, space);
  } else if (hovered.type == "object") {
    return drawObjectInformation(canvas, hovered.object, hovered.objectId, space);
  }
}

function drawBlockInformation(canvas, block, newStas, space, inList) {
  if (!inList || !(block.type == "theorem-app" || block.type == "for-all-block")) {
    drawBlock(canvas, block, space, 5, 10);
  }
  var f = assignToBlockTypes(block.type, [
    drawTheoremBlockInformation,
    drawTheoremBlockInformation,
    () => {},
    drawTautologyBlockInformation,
    drawModusPonensBlockInformation,
    drawProveIfBlockInformation,
    () => {},
    drawProveForAllBlockInformation,
    drawProveExistsBlockInformation,
    drawReflexivityBlockInformation,
    drawSubstituteBlockInformation,
    drawProofByContradictionBlockInformation,
    drawExistsDefinitionBlockInformation,
    drawFindContradictionBlockInformation
  ]);
  return f(canvas, block, newStas, space, inList);
}

function setupInfoCanvas(canvas) {
  var h = window.innerHeight*0.35
  db.setupCanvas(canvas, window.innerWidth - db.sidebarWidth, h);
  canvas.style.right = 0;
  canvas.style.bottom = 0;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = db.sidebarColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = db.sidebarBorderColor;
  ctx.fillRect(0, 0, canvas.width, 5);
}

function drawTheoremBlockInformation(canvas, block, newStas, space, inList) {
  var thm = getBlockTheorem(block, space);
  if (thm === undefined || thm.statement === undefined) {
    return;
  }
  if (inList) {
    drawTheoremByStatement(canvas, 5, 10, thm.name, thm.color, thm.statement);
    db.drawInfoText(canvas, "This theorem says:", thm.statement, space);
  }

  if (newStas !== undefined) {
    db.drawInfoTextWithColors(canvas, "We now know:", newStas, space);
  }
}

function drawTautologyBlockInformation(canvas, block, newStas, space, inList) {
  if (inList) {
    return db.drawInfoText(canvas, "Establish a statement that logically follows from what we know by the rules of And, Or, Not, If, and If and only if", [], space);
  }
  const ctx = canvas.getContext("2d");
  var coord = db.drawInfoText(canvas, "", block.statement, space);
  if (isTautology(block.statement)) {
    ctx.fillText("IS always true so was added to the list of established statements", 5, coord.y);
  } else if (tautologicallyImpliedInSpace(block.statement, space)) {
    ctx.fillText("IS implied by the established statements so was added to the list of established statements", 5, coord.y);
  } else {
    ctx.fillText("IS NOT always true so was NOT added to the list of established statements", 5, coord.y);
  }
}

function drawModusPonensBlockInformation(canvas, block, newStas, space, inList) {
  if (inList) {
    return db.drawInfoText(canvas, "A is true and 'if A then B' is true, then B is true", [], space);
  }
  var coord = db.drawInfoText(canvas, "Statement 1:", block.sta1, space);
  db.newColumn(coord, db.infoTextTop);
  db.drawInfoText(canvas, "Statement 2:", block.sta2, space, coord);
}

function drawProveIfBlockInformation(canvas, block, newStas, space, inList) {
  if (inList) {
    return db.drawInfoText(canvas, "If we assume A is true and show B that is true, then we'll know that if A then B", [], space);
  }
  var coord = db.drawInfoText(canvas, "Statement to prove:", makeIfStatement(block.sta1, block.sta2), space);
  coord = db.drawInfoText(canvas, "We assume:", newStas, space, coord);
  coord = db.drawInfoText(canvas, "We want to show:", block.sta2, space, coord);
}

function drawProveForAllBlockInformation(canvas, block, newStas, space, inList) {
  if (inList) {
    return db.drawInfoText(canvas, "Take a generic object, and if a given statement holds for that object we'll know it holds for all objects", [], space);
  }
  db.drawInfoText(canvas, "We want to show:", block.statement, space);
}

function drawProveExistsBlockInformation(canvas, block, newStas, space, inList) {
  if (inList) {
    return db.drawInfoText(canvas, "Supply an object satisfying the given statement to show there exists such an object", [], space);
  }
  if (newStas.length == 0) {
    db.drawInfoText(canvas, "We want to find a " + block.var.name + " such that:", block.statement, space);
  } else {
    db.drawInfoText(canvas, "We now know:", newStas, space);
  }
}

function drawReflexivityBlockInformation(canvas, block, newStas, space, inList) {
  if (inList) {
    return db.drawInfoText(canvas, "Establish that the inputted object equals itself", [], space);
  }
  db.drawInfoText(canvas, "We now know:", newStas, space);
}

function drawSubstituteBlockInformation(canvas, block, newStas, space, inList) {
  if (inList) {
    return db.drawInfoText(canvas, "If the two inputted objects are equal, replace the first with the second in the given statement", [], space);
  }
  db.drawInfoText(canvas, "We now know:", newStas, space);
}

function drawProofByContradictionBlockInformation(canvas, block, newStas, space, inList) {
  if (inList) {
    return db.drawInfoText(canvas, "To prove a statement, assume it is false and find a contradiction", [], space);
  }
  db.drawInfoText(canvas, "We assume:", newStas, space);
}

function drawExistsDefinitionBlockInformation(canvas, block, newStas, space, inList) {
  if (inList) {
    return db.drawInfoText(canvas, "'not for all [statement]' and 'exists not [statement]' are equivalent, so supply one you've established to get the other", [], space);
  }
  db.drawInfoText(canvas, "We now know:", newStas, space);
}

function drawFindContradictionBlockInformation(canvas, block, newStas, space, inList) {
  if (inList) {
    return db.drawInfoText(canvas, "If there is another statement that directly contradicts the given statement, this will complete your subproof", [], space);
  }
}


function drawProofHeaderInformation(canvas, theorem, newStas, goals, space) {
  drawTheoremByStatement(canvas, 5, 10, theorem.name, theorem.color, theorem.statement);
  var coord = db.drawInfoText(canvas, "Statement to prove:", theorem.statement, space);
  //db.newColumn(coord, db.infoTextTop);
  coord = db.drawInfoTextWithColors(canvas, "We assume:", newStas, space, coord);
  //db.newColumn(coord, db.infoTextTop);
  coord = db.drawInfoText(canvas, "We want to show:", goals, space, coord);
}

function drawObjectInformation(canvas, object, objId, space) {
  drawObject(canvas, 5, 10, object);
  var coord = {x: 5, y: db.inputSize*2 + db.textSize/2 + 15};
  for (var i = 0; i < space.statements.length; i++) {
    if (space.statements[i].type == "simple" || (space.statements[i].type == "not" && space.statements[i].statement.type == "simple")) {
      if (getUsedObjects(space.statements[i]).includes(objId)) {
        coord = db.drawInfoText(canvas, "", space.statements[i], space, coord);
      }
    }
  }
}