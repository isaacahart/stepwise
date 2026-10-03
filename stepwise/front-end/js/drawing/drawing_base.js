import { colorStatementListStrings, makeStatementListStrings } from "../statement/statement_display";

export const textSize = 14;
export const textFont = "14px Arial";
export const blockSize = 36;
export const inputSize = 12;
export const blockInputY = blockSize/2 - inputSize;
export const blockMarginSize = 10;
export const cornerRadius = 5;
export const borderWidth = 3;
export const arrowSize = 16;
export const proofHeaderSize = 48;
export const headerCornerRadius = 20;
export const indentSize = 20;
export const darkenAmt = 0.8;
export const sidebarWidth = 300;
export const sidebarInteractionWidth = 200;
export const proofX = sidebarWidth + 50;
export const proofY = 50;
export const blockMarginInList = 6;
export const tabSelectHeight = 40;
export const sidebarBorderWidth = 5;
export const textColumnWidth = 300;
export const infoTextTop = blockSize + textSize/2 + 12;
export const builtinBlockColor = "#888888";
export const sidebarColor = "#eaeaea";
export const sidebarBorderColor = "#cdcdcd";
export const normalTextColor = "#000000";
export const goodTextColor = "#0d8134";
export const normalTextColorBlock = "#ffffff";
export const goodTextColorBlock = "#18f060";

export function setupCanvas(canvas, width, height) {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.lineWidth = borderWidth;
  ctx.font = textFont;
}

export function clearCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function moveCanvasTo(canvas, x, y) {
  canvas.style.left = x - canvas.width / 2;
  canvas.style.top = y - canvas.height / 2;
}

export function darkenColor(color, amt) {
  color = color.replace("#", "");

  var num = parseInt(color, 16);

  var r = (num >> 16);
  r = Math.round(r * amt);
  var b = (num >> 8 & 0x00FF);
  b = Math.round(b * amt);
  var g = (num & 0x0000FF);
  g = Math.round(g * amt);

  return "#" + (0x1000000 + (r<255?r<1?0:r:255)*0x10000 + (b<255?b<1?0:b:255)*0x100 + (g<255?g<1?0:g:255)).toString(16).slice(1);
}

export function drawRect(ctx, x, y, w, h, corner, color) {
  const b = borderWidth/2;

  // draw object
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, corner);
  ctx.fill();

  // draw outline
  ctx.strokeStyle = darkenColor(color, darkenAmt);
  ctx.beginPath();
  if (typeof corner === "number") {
    if (corner < b) {
      ctx.roundRect(x+b, y+b, w-b*2, h-b*2, 0);
    } else {
      ctx.roundRect(x+b, y+b, w-b*2, h-b*2, corner-b);
    }
        
  } else {
    var innerCorners = []
    for (var i = 0; i < corner.length; i++) {
      innerCorners.push(corner[i]-b);
    }
    ctx.roundRect(x+b, y+b, w-b*2, h-b*2, innerCorners);
  }
  ctx.stroke();
}

function addCoords(c1, c2) {
  return {x: c1.x + c2.x, y: c1.y + c2.y};
}

export function newColumn(coord, top) {
  coord.x += textColumnWidth;
  coord.y = top;
}

export function drawTextLine(ctx, text, coord) {
  ctx.fillText(text, coord.x, coord.y);
  return addCoords(coord, {x:0, y:textSize});
}

export function drawTextLines(ctx, lines, coord, color="black") {
  ctx.fillStyle = color;
  for (var i = 0; i < lines.length; i++) {
    coord = drawTextLine(ctx, lines[i], coord);
  }
  return coord;
}

export function drawTextLinesWithLooping(ctx, lines, coord, bottom, color="black", smallerBlankLines=false) {
  ctx.fillStyle = color;
  for (var i = 0; i < lines.length; i++) {
    coord = drawTextLine(ctx, lines[i], coord);
    if (smallerBlankLines && lines[i] === "") {
      coord.y -= textSize*0.5;
    }
    if (coord.y > bottom - textSize) {
      newColumn(coord, infoTextTop);
    }
  }
  return coord;
}

export function drawInfoText(canvas, header, statements, space, coord=null) {
  if (coord == null) {
    coord = {x: 5, y: infoTextTop};
  }
  if (!Array.isArray(statements)) {
    statements = [statements];
  }
  if (header == "") {
    var lines = makeStatementListStrings(statements, space.objects);
  } else {
    var lines = [header, ...makeStatementListStrings(statements, space.objects)];
  }
  return drawTextLinesWithLooping(canvas.getContext("2d"), lines, coord, canvas.height);
}

export function drawInfoTextWithColors(canvas, header, statements, space, coord=null) {
  if (coord == null) {
    coord = {x: 5, y: infoTextTop};
  }

  if (header == "") {
    var lines = makeStatementListStrings(statements, space.objects);
    var colors = colorStatementListStrings(statements, space);
  } else {
    var lines = [header, ...makeStatementListStrings(statements, space.objects)];
    var colors = ["black", ...colorStatementListStrings(statements, space)];
  }

  const ctx = canvas.getContext("2d");

  for (var i = 0; i < lines.length; i++) {
    ctx.fillStyle = colors[i];
    coord = drawTextLine(ctx, lines[i], coord);
    if (coord.y > canvas.height - textSize) {
      newColumn(coord, infoTextTop);
    }
  }
  return coord;
}