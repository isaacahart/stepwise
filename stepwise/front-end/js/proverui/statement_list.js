import * as db from "../drawing/drawing_base.js";
import { makeStatementListStrings, sortStatements } from "../statement/statement_display.js";
import { setupListCanvas } from "./prover_base.js";

export function drawStatementList(canvas, space, proof) {
  var lines1 = makeStatementListStrings(proof.goals, space.objects);
  var lines2 = makeStatementListStrings(sortStatements(space.statements), space.objects);
  
  var height = db.textSize * (lines1.length + lines2.length + 5);
  setupListCanvas(canvas, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";

  var y = db.sidebarBorderWidth + db.textSize/2;
  ctx.fillText("Goals / Want to Show:", 5, y);
  y += db.textSize;

  for (var i = 0; i < lines1.length; i++) {
    ctx.fillText(lines1[i], 5, y);
    y += db.textSize;
  }

  if (proof.complete) {
    ctx.fillStyle = "green";
    ctx.fillText("Goals completed!", 5, y);
    y += db.textSize;
    ctx.fillStyle = "black";
  }

  y += db.textSize;
  ctx.fillText("Established Statements:", 5, y);
  y += db.textSize;

  for (var i = 0; i < lines2.length; i++) {
    ctx.fillText(lines2[i], 5, y);
    y += db.textSize;
  }
}