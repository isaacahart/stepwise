import { drawTheoremByStatement, setupAndDrawTheorem } from "../theorem/draw_theorem.js";
import { clearCanvas } from "../drawing/drawing_base.js";
import { appendStatement, newStatement } from "./make_statement_ui.js";

var wrapper = document.querySelector('.statement-container');

var statementInput = document.querySelector('input[name="statement"]');

var canvas = document.querySelector('.theorem-canvas');
var nameInput = document.querySelector('input[name="name"]');
var colorInput = document.querySelector('input[name="color"]');

if (statementInput.value == "null") {
  var statement = newStatement();
} else {
  var statement = JSON.parse(statementInput.value);
}

function updateStatement() {
  statementInput.value = JSON.stringify(statement);
  if (canvas != null) {
    redrawTheorem()
  }
}

function redrawTheorem() {
  setupAndDrawTheorem(canvas, nameInput.value, colorInput.value, statement);
}

updateStatement();

appendStatement(wrapper, updateStatement, statement, [], [], [], true, false);

nameInput.addEventListener("change", redrawTheorem);
colorInput.addEventListener("change", redrawTheorem);