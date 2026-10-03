import * as db from "../drawing/drawing_base.js";
import { createCompleteGoal, createTheoremAppFromTheorem, makeExistsDefinitionBlock, makeModusPonensBlock, makeProofByContradictionBlock, makeProveExistsBlock, makeProveForAllBlock, makeProveIfBlock, makeReflexivityBlock, makeSubstituteBlock, makeTautologyBlock } from "../block/block_base.js";
import { objectNamesAtStep, runAndDrawProof, setupProof } from "../proof/proof_base.js";
import { mouseDownOnTab, setupListCanvas, setupTabCanvas } from "../proverui/prover_base.js";
import { drawHoveredInformation } from "../proverui/block_information.js";
import { drawBlockList, mouseDownOnBlockList } from "../proverui/block_list.js";
import { drawObjectList, mouseDownOnObjectList } from "../proverui/object_list.js";
import { drawProofHoveredInfo, mouseDownOnProof, mouseUpOnProof, runProofFromChangedOutput } from "../proof/interact_with_proof.js";
import { drawStatementList, mouseDownOnStatementList, setupStatementCanvas } from "../proverui/statement_list.js";
import { emptySpaceWithTheorems } from "../space/space_base.js";
import { setupBlockCanvas, setupBlockStackCanvas } from "../block/draw_block.js";
import { setupObjectCanvas } from "../object/draw_object.js";
import { emptyOutputObj } from "../object/object_base.js";
import { appendStatement } from "./make_statement_ui.js";

var theoremCategories = document.querySelectorAll(".block-category");
var theoremList = [];
var theoremIds = [];
var blockList = [];
var categoryNames = [];
var categoryCounts = [];

var proofDisplay = document.querySelector(".proof-display");
var draggingDisplay = document.querySelector(".dragging-display");
var listDisplay = document.querySelector(".list-display");
var tabDisplay = document.querySelector(".tab-display");
var thmStatementDisplay = document.querySelector(".thm-statement-display");
var sidebarDiv = document.querySelector(".sidebar");

setupTheoremList();

db.setupCanvas(draggingDisplay, 0, 0);
setupTabCanvas(tabDisplay);
setupListCanvas(listDisplay, window.innerHeight - db.tabSelectHeight);
db.setupCanvas(proofDisplay, innerWidth-db.proofX, innerHeight);
listDisplay.style.top = db.tabSelectHeight;
proofDisplay.style.left = db.proofX;
proofDisplay.style.top = db.proofY;
drawHoveredInformation(thmStatementDisplay, {type: "none"});

var thmName = document.querySelector(".theorem-name").value;
var thmColor = document.querySelector(".theorem-color").value;
var thmStatement = JSON.parse(document.querySelector(".theorem-statement").value);

var space = emptySpaceWithTheorems(theoremList, theoremIds);
var stepsInput = document.querySelector(".proof-steps")
var proofSteps = JSON.parse(stepsInput.value);
if (typeof proofSteps === "string" || proofSteps instanceof String) {
  proofSteps = JSON.parse(proofSteps);
}
var proof = setupProof(thmName, thmColor, thmStatement, proofSteps);
runAndDrawProof(proof, space, proofDisplay);

var specialBlocks = JSON.parse(document.querySelector(".special-blocks").value);
if (typeof specialBlocks === "string" || specialBlocks instanceof String) {
  specialBlocks = JSON.parse(specialBlocks);
}
categoryCounts.splice(0, 0, 0);

function addSpecialBlock(type, constuctor) {
  if (specialBlocks.includes(type)) {
    blockList.splice(0, 0, constuctor());
    categoryCounts[0] += 1;
  }
}

addSpecialBlock("substitute", makeSubstituteBlock);
addSpecialBlock("exists-definition", makeExistsDefinitionBlock);
addSpecialBlock("reflexive-equality", makeReflexivityBlock);
addSpecialBlock("proof-by-contradiction", makeProofByContradictionBlock);
addSpecialBlock("prove-exists", makeProveExistsBlock);
addSpecialBlock("prove-for-all", makeProveForAllBlock);
addSpecialBlock("prove-if", makeProveIfBlock);
addSpecialBlock("modus-ponens", makeModusPonensBlock);
addSpecialBlock("tautology", makeTautologyBlock);
addSpecialBlock("complete-goal", () => createCompleteGoal(proof.goals));
categoryNames.splice(0, 0, "Special blocks");
drawBlockList(blockList, theoremList, theoremIds, categoryCounts, categoryNames, listDisplay);

var dragging = {type: "none"};
var listTab = "blocks";
var editingOutput = emptyOutputObj;
var interactable = true;

var editOutputMenu = document.querySelector(".edit-output");
var outputBackButton = document.querySelector(".close-edit-output");
var outputNameInput = document.querySelector('[name="output-name"]');
var outputColorInput = document.querySelector('[name="output-color"]');
var editStatementMenu = document.querySelector(".edit-statement");
var statementContainer = document.querySelector(".statement-container");
var editStatementBackButton = document.querySelector(".close-edit-statement");
var helpTextMenu = document.querySelector(".help-text");
var helpBackButton = document.querySelector(".close-help-text");
var helpOpenButton = document.querySelector(".open-help-text");
var shade = document.querySelector(".shade");
var completedInput = document.querySelector(".completed");
var backButton = document.querySelector('input[type="submit"]');

if (!proof.complete) {
  openHelpMenu();
} else {
  backButton.classList.add("play");
}

function updateStepsInput() {
  stepsInput.value = JSON.stringify(proof.steps);
  if (proof.complete) {
    completedInput.value = "true";
    backButton.classList.add("play");
  } else {
    completedInput.value = "false";
    backButton.classList.remove("play");
  }
}

function setupTheoremList() {
  for (var j = 0; j < theoremCategories.length; j++) {
    var theoremDataList = theoremCategories[j].children
    categoryNames.push(theoremCategories[j].dataset.category);
    categoryCounts.push(theoremDataList.length);
    
    for (var i = 0; i < theoremDataList.length; i++) {
      var id = parseInt(theoremDataList[i].dataset.id, 10);
      theoremIds.push(id);
      theoremList.push({statement: JSON.parse(theoremDataList[i].dataset.statement),
        name: theoremDataList[i].dataset.name,
        color: theoremDataList[i].dataset.color});
      blockList.push(createTheoremAppFromTheorem(id, theoremList[theoremList.length-1].statement));
    }
  }
}

function makeDragObjectEvent(canvas) {
  return function(event) {
    if (dragging.type !== "none") {
      db.moveCanvasTo(canvas, event.clientX, event.clientY + (canvas.height - db.blockSize) / 2);
    }
  }
}

function beginDrag(x, y) {
  db.setupCanvas(draggingDisplay, 0, 0);
  if (dragging.type === "block") {
    setupBlockCanvas(draggingDisplay, dragging.block, space);
  } else if (dragging.type === "object") {
    setupObjectCanvas(draggingDisplay, dragging.object);
  } else if (dragging.type === "block-stack") {
    setupBlockStackCanvas(draggingDisplay, dragging.blocks, space);
  } else if (dragging.type === "statement") {
    setupStatementCanvas(draggingDisplay, dragging.statement, proof.currentBranch);
  }
  if (dragging.type != "none") {
    disableTouchScroll();
  }
  db.moveCanvasTo(draggingDisplay, x, y + (draggingDisplay.height - db.blockSize) / 2);
  updateStepsInput()
}

function tabClickEvent(event) {
  if (!interactable) {
    return;
  }
  var tabIntr = mouseDownOnTab(event.offsetX, event.offsetY, event.target);
  if (tabIntr.type === "tab") {
    listTab = tabIntr.tab;
    drawList();
  }
}

function drawList() {
  if (listTab == "blocks") {
    drawBlockList(blockList, theoremList, theoremIds, categoryCounts, categoryNames, listDisplay);
  } else if (listTab == "objects") {
    drawObjectList(proof.currentBranch, listDisplay);
  } else if (listTab == "statements") {
    drawStatementList(listDisplay, proof.currentBranch, proof);
  }
}

function listMouseDownEvent(event) {
  if (!interactable) {
    return;
  }
  if (event.offsetX > db.sidebarInteractionWidth) {
    return;
  }
  if (listTab === "blocks") {
    dragging = mouseDownOnBlockList(blockList, categoryCounts, event.offsetX, event.offsetY);
  } else if (listTab === "objects") {
    dragging = mouseDownOnObjectList(proof.currentBranch, event.offsetX, event.offsetY);
  } else if (listTab === "statements") {
    dragging = mouseDownOnStatementList(proof.currentBranch, proof, event.offsetX, event.offsetY);
  }
  beginDrag(event.clientX, event.clientY);
}

function proofMouseDownEvent(event) {
  if (!interactable) {
    return;
  }
  var interaction = mouseDownOnProof(proof, space, event.offsetX, event.offsetY, event.target);
  if (interaction.type == "output") {
    openEditOutputMenu(interaction.output);
  } else if (interaction.type == "statement") {
    openEditStatementMenu(interaction.statement, interaction.idx, interaction.step);
  } else {
    dragging = interaction;
    beginDrag(event.clientX, event.clientY);
    drawList();
  }
}

function openEditOutputMenu(output) {
  editingOutput = output;
  setInteractable(false);
  editOutputMenu.classList.remove("hidden");
  outputNameInput.value = output.name;
  outputColorInput.value = output.color;
}

function openEditStatementMenu(statement, idx, step) {
  statementContainer.replaceChildren();
  appendStatement(statementContainer, () => {}, statement, objectNamesAtStep(space, step, idx, proof));
  editStatementMenu.classList.remove("hidden")
  setInteractable(false);
}

function endDragEvent(event) {
  if (event.clientX > db.sidebarWidth) {
    mouseUpOnProof(proof, space, dragging, event.pageX - db.proofX, event.pageY - db.proofY, proofDisplay);
    updateStepsInput();
    drawList();
    hoverEvent(event);
  }
  enableTouchScroll();
  dragging = {type: "none"};
  draggingDisplay.width = 0;
  draggingDisplay.height = 0;
}

function hoverEvent(event) {
  if (event.clientX < db.sidebarWidth) {
    if (listTab === "blocks") {
      drawHoveredInformation(thmStatementDisplay, mouseDownOnBlockList(blockList, categoryCounts, event.offsetX, event.offsetY), space);
    } else if (listTab === "objects") {
      drawHoveredInformation(thmStatementDisplay, mouseDownOnObjectList(proof.currentBranch, event.offsetX, event.offsetY), proof.currentBranch);
    } else {
      drawHoveredInformation(thmStatementDisplay, {type:"none"}, proof.currentBranch);
    }
    
  } else {
    drawProofHoveredInfo(thmStatementDisplay, proof, space, event.pageX - db.proofX, event.pageY - db.proofY);
  }
}

function setInteractable(val) {
  interactable = val;
  if (val) {
    shade.classList.add("hidden");
  } else {
    shade.classList.remove("hidden");
  }
}

function closeOutputMenu() {
  editOutputMenu.classList.add("hidden");
  setInteractable(true);
  editingOutput.name = outputNameInput.value;
  editingOutput.color = outputColorInput.value;
  runProofFromChangedOutput(proof, space, proofDisplay);
  drawList();
}

function openHelpMenu() {
  if (!interactable || helpTextMenu == null) {
    return;
  }
  helpTextMenu.classList.remove("hidden");
  setInteractable(false);
}

function closeHelpMenu() {
  helpTextMenu.classList.add("hidden");
  setInteractable(true);
}

function closeStatementMenu() {
  editStatementMenu.classList.add("hidden");
  setInteractable(true);
  runProofFromChangedOutput(proof, space, proofDisplay);
  drawList();
}

function disableTouchScroll() {
  document.body.style.touchAction = "none";
  document.body.style.overflow = "hidden";
  sidebarDiv.style.touchAction = "none";
  sidebarDiv.style.overflow = "hidden";
}

function enableTouchScroll() {
  document.body.style.touchAction = "auto";
  document.body.style.overflow = "auto";
  sidebarDiv.style.touchAction = "auto";
  sidebarDiv.style.overflow = "auto";
}

document.addEventListener("pointermove", makeDragObjectEvent(draggingDisplay));
document.addEventListener("pointermove", hoverEvent);
document.addEventListener("pointerup", endDragEvent);
tabDisplay.addEventListener("click", tabClickEvent);
listDisplay.addEventListener("pointerdown", listMouseDownEvent);
proofDisplay.addEventListener("pointerdown", proofMouseDownEvent);
document.addEventListener("pointerdown", hoverEvent);
outputBackButton.addEventListener("click", closeOutputMenu);
editStatementBackButton.addEventListener("click", closeStatementMenu);
if (helpTextMenu != null) {
  helpOpenButton.addEventListener("click", openHelpMenu);
  helpBackButton.addEventListener("click", closeHelpMenu);
}
