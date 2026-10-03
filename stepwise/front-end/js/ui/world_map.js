import * as db from "../drawing/drawing_base.js";

const mapMargin = 50;
const lineWidth = 3;
const nodeRadius = 20;

const editMode = document.querySelector(".edit-mode") !== null;

var canvas = document.querySelector(".map");

var sx = 0;
var sy = 0;

var nodeElements = document.querySelector(".nodes").children;
var nodes = [];
for (var i = 0; i < nodeElements.length; i++) {
  var elt = nodeElements[i];
  var v = elt.value.replaceAll("'", '"');
  var newNode = {
    x: JSON.parse(v).x,
    y: JSON.parse(v).y,
    name: elt.dataset.name,
    color: elt.dataset.color,
    id: parseInt(elt.dataset.id)};
  if (elt.dataset.complete !== undefined) {
    newNode.complete = elt.dataset.complete;
  }
  if (elt.dataset.link !== undefined) {
    newNode.link = elt.dataset.link;
  }
  nodes.push(newNode);
}

var edgesInput = document.querySelector('[name="edges"]');
var edges = JSON.parse(edgesInput.value.replaceAll("'", '"'));

var mouseDown = false;
var selectedNode = null;
var prevDragX = 0;
var prevDragY = 0;

function updateEdgeInput() {
  if (editMode) {
    edgesInput.value = JSON.stringify(edges);
  }
}

updateEdgeInput();

function getNode(id) {
  for (var i = 0; i < nodeElements.length; i++) {
    if (nodes[i].id == id) {
      return nodes[i];
    }
  }
  return {x:0, y:0, name:"", color:"#000000", id};
}

function drawArrow(ctx, fromx, fromy, tox, toy) {
  var headlen = 10; // length of head in pixels
  var dx = tox - fromx;
  var dy = toy - fromy;
  var midx = (tox + fromx) / 2;
  var midy = (toy + fromy) / 2;
  var angle = Math.atan2(dy, dx);
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(tox, toy);
  ctx.moveTo(midx, midy);
  ctx.lineTo(midx - headlen * Math.cos(angle - Math.PI / 6), midy - headlen * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(midx, midy);
  ctx.lineTo(midx - headlen * Math.cos(angle + Math.PI / 6), midy - headlen * Math.sin(angle + Math.PI / 6));
}

function drawNode(ctx, node, selected) {
  if (node.complete === "false") {
    var color = "gray";
  } else {
    var color = node.color;
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(node.x - sx, node.y - sy, nodeRadius, 0, 2 * Math.PI);
  ctx.fill();
  if (selected) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  if (node.complete === "unlocked") {
    ctx.fillStyle = "gray";
    ctx.beginPath();
    ctx.arc(node.x - sx, node.y - sy, nodeRadius*0.6, 0, 2 * Math.PI);
    ctx.fill();
  }

  var w = ctx.measureText(node.name).width;
  var x = node.x - sx - w/2
  var y = node.y - sy + nodeRadius + db.textSize
  db.drawRect(ctx, x-5, y - db.textSize/2 - 5, w + 10, db.textSize, 5, color);
  ctx.fillStyle = "white";
  ctx.fillText(node.name, x, y);
}

function drawMap() {
  if (editMode) {
    db.setupCanvas(canvas, window.innerWidth - mapMargin - parseInt(canvas.style.left), window.innerHeight - mapMargin - parseInt(canvas.style.top));
  } else {
    db.setupCanvas(canvas, window.innerWidth, window.innerHeight);
  }
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = editMode ? "white" : "lightgray";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "black";
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  for (var i = 0; i < edges.length; i++) {
    var from = getNode(edges[i].from);
    var to = getNode(edges[i].to);
    drawArrow(ctx, from.x - sx, from.y - sy, to.x - sx, to.y - sy);
  }
  ctx.stroke();

  for (var i = 0; i < nodes.length; i++) {
    drawNode(ctx, nodes[i], selectedNode === i);
  }

  ctx.fillStyle = "black";
  if (editMode) {
    ctx.fillText("Drag to move levels. Shift click to create or remove path from selected level.", 5, canvas.height - db.textSize);
  } else {
    ctx.fillText("Drag to scroll. Click to play level.", 5, canvas.height - db.textSize);
  }
}

function nodeCollision(node, x, y) {
  var dx = x - node.x;
  var dy = y - node.y;
  return (dx*dx + dy*dy) < nodeRadius*nodeRadius;
}

function getHoveredNode(x, y) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodeCollision(nodes[i], x+sx, y+sy)) {
      return i;
    }
  }
  return null;
}

function beginDrag(event) {
  mouseDown = true;
  prevDragX = event.offsetX;
  prevDragY = event.offsetY;
  selectedNode = getHoveredNode(event.offsetX, event.offsetY);
  if (!editMode && selectedNode !== null) {
    window.location.replace(nodes[selectedNode].link);
  }
}

function endDrag(event) {
  mouseDown = false;
  enableTouchScroll();
}

function moveMouse(event) {
  if (!mouseDown) {
    return;
  }
  var mx = Math.round(event.offsetX);
  var my = Math.round(event.offsetY);
  if (selectedNode === null) {
    sx -= (mx - prevDragX);
    sy -= (my - prevDragY);
    prevDragX = mx;
    prevDragY = my;
  } else {
    nodes[selectedNode].x = mx + sx;
    nodes[selectedNode].y = my + sy;
    nodeElements[selectedNode].value = JSON.stringify({x:nodes[selectedNode].x, y:nodes[selectedNode].y});
  }
  drawMap();
}

function modifyEdges(event) {
  if (selectedNode === null) {
    return;
  }
  var hovered = getHoveredNode(event.offsetX, event.offsetY);
  if (hovered === null || hovered === selectedNode) {
    return;
  }
  var idx = edges.findIndex((edge) => {return edge.from === nodes[selectedNode].id && edge.to === nodes[hovered].id;});
  if (idx === -1) {
    edges.push({from: nodes[selectedNode].id, to: nodes[hovered].id});
  } else {
    edges.splice(idx, 1);
  }
  updateEdgeInput();
}

function mouseDownOnMap(event) {
  disableTouchScroll();
  if (event.shiftKey) {
    modifyEdges(event);
  }
  beginDrag(event);
  drawMap();
}

function disableTouchScroll() {
  document.body.style.touchAction = 'none';
  document.body.style.overflow = 'hidden';
}

function enableTouchScroll() {
  document.body.style.touchAction = 'auto';
  document.body.style.overflow = 'auto';
}

drawMap();
canvas.addEventListener("pointerdown", mouseDownOnMap);
canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointermove", moveMouse);
