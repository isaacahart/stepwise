import * as db from "../drawing/drawing_base.js";

export function setupListCanvas(canvas, height) {
  if (height < window.innerHeight - db.tabSelectHeight) {
    height = window.innerHeight - db.tabSelectHeight;
  }
  db.setupCanvas(canvas, db.sidebarWidth, height);
  
  const ctx = canvas.getContext("2d");
  
  ctx.fillStyle = db.sidebarColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = db.sidebarBorderColor;
  ctx.fillRect(db.sidebarWidth - db.sidebarBorderWidth, 0, db.sidebarBorderWidth, canvas.height);
}

export function setupTabCanvas(canvas) {
  db.setupCanvas(canvas, db.sidebarWidth, db.tabSelectHeight);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = db.sidebarColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = db.sidebarBorderColor;
  ctx.fillRect(canvas.width - db.sidebarBorderWidth, 0, db.sidebarBorderWidth, canvas.height);
  drawListTabs(canvas);
}

export function drawListTabs(canvas) {
  var third = db.sidebarWidth / 3;
  
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = db.sidebarBorderColor;

  ctx.fillRect(0, db.tabSelectHeight - db.sidebarBorderWidth, db.sidebarWidth, db.sidebarBorderWidth);
  ctx.fillRect(third - db.sidebarBorderWidth, 0, db.sidebarBorderWidth, db.tabSelectHeight);
  ctx.fillRect(third*2 - db.sidebarBorderWidth, 0, db.sidebarBorderWidth, db.tabSelectHeight);

  ctx.fillStyle = "#000000";
  ctx.fillText("Blocks", db.sidebarBorderWidth, db.textSize, third);
  ctx.fillText("Objects", third + db.sidebarBorderWidth, db.textSize, third);
  ctx.fillText("Statements", third*2 + db.sidebarBorderWidth, db.textSize, third);

  ctx.fillStyle = db.sidebarColor;
  ctx.fillRect(0, db.tabSelectHeight - db.sidebarBorderWidth, third - db.sidebarBorderWidth, db.sidebarBorderWidth);
}

export function mouseDownOnTab(x, y, canvas) {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = db.sidebarBorderColor;
  ctx.fillRect(0, db.tabSelectHeight - db.sidebarBorderWidth, db.sidebarWidth, db.sidebarBorderWidth);
  ctx.fillStyle = db.sidebarColor;
  var third = db.sidebarWidth / 3;

  if (y < 0 || y > db.tabSelectHeight) {
    return {type: "none"};
  } else if (x < 0 || x > db.sidebarWidth) {
    return {type: "none"};
  } else if (x < third) {
    ctx.fillRect(0, db.tabSelectHeight - db.sidebarBorderWidth, third - db.sidebarBorderWidth, db.sidebarBorderWidth);
    return {type: "tab", tab: "blocks"};
  } else if (x < third * 2) {
    ctx.fillRect(third, db.tabSelectHeight - db.sidebarBorderWidth, third - db.sidebarBorderWidth, db.sidebarBorderWidth);
    return {type: "tab", tab: "objects"};
  } else {
    ctx.fillRect(third*2, db.tabSelectHeight - db.sidebarBorderWidth, third - db.sidebarBorderWidth, db.sidebarBorderWidth);
    return {type: "tab", tab: "statements"};
  }
}