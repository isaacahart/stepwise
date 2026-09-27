import * as db from "../drawing/drawing_base.js";

export function drawObject(canvas, x, y, object) {
  return drawObjectWithColors(canvas, x, y, object, object.name, object.color, "white");
}

export function drawObjectOutput(canvas, x, y, object) {
  return drawObjectWithColors(canvas, x, y, object, object.name, "white", object.color);
}

export function objectWidth(ctx, object) {
  var w = 2 * db.inputSize;
  w += ctx.measureText(object.name).width;
  return w;
}

function drawObjectWithColors(canvas, x, y, object, name, objectColor, textColor) {
  const ctx = canvas.getContext("2d");
  var width = objectWidth(ctx, object);

  db.drawRect(ctx, x, y, width, db.inputSize*2, db.inputSize, objectColor);

  // draw text
  ctx.textBaseline = "middle";
  ctx.fillStyle = textColor;
  ctx.fillText(name, x+db.inputSize, y+db.inputSize);

  return width;
}

export function setupObjectCanvas(canvas, object) {
  const ctx = canvas.getContext("2d");
  db.setupCanvas(canvas, objectWidth(ctx, object)+2, db.inputSize*2);
  drawObject(canvas, 0, 0, object);
}