import { statementTypes, statementTypeLabels, assignToStatementTypes } from "../statement/statement_base.js";

const noop = () => {};

function copyAndAddToList(lst, elt) {
  var out = [...lst]
  out.push(elt)
  return out
}

export function newStatement() {
  return {type: "simple", relation: "", objects: []};
}

function clearData(sta) {
  for (var key of Object.keys(sta)) {
    if (key != "type") {
      delete sta[key];
    }
  }

  var f = assignToStatementTypes(sta.type, [
    clearSimpleData,
    clearNotData,
    clearAndOrData,
    clearAndOrData,
    clearImplicationData,
    clearImplicationData,
    clearQuantifierData,
    clearQuantifierData,
    clearAxiomSchemaData,
    clearStatementAppData
  ], noop);

  return f(sta);
}

function clearSimpleData(sta) {
  sta.relation = "";
  sta.objects = [];
}

function clearNotData(sta) {
  sta.statement = newStatement();
}

function clearAndOrData(sta) {
  sta.statements = [];
}

function clearImplicationData(sta) {
  sta.first = newStatement();
  sta.second = newStatement();
}

function clearQuantifierData(sta) {
  sta.varName = "";
  sta.varColor = "#000000";
  sta.statement = newStatement();
}

function clearAxiomSchemaData(sta) {
  sta.staName = "";
  sta.freeVars = 0;
  sta.statement = newStatement();
}

function clearStatementAppData(sta) {
  sta.staIdx = 0;
  sta.inputVars = [];
}

/*
function changeVariableName(id, name, statement, variables, element, updateFunc) {
  var f = assignToStatementTypes(statement.type, [
    changeVariableNameSimple,
    changeVariableNameNot,
    changeVariableNameAndOr,
    changeVariableNameAndOr,
    changeVariableNameIf,
    changeVariableNameIf,
    changeVariableNameQuantifier,
    changeVariableNameQuantifier,
    noop,
    changeVariableNameStatementApp
  ], noop);

  // make it so the new variable name is remembered if the statement type is changed
  var typeSelect = element.querySelector("select");
  var chosenType = typeSelect.selectedIndex;
  typeSelect.remove();
  
  // type select should come before the div containing statement data
  var div = element.querySelector("div");
  var newTypeSelect = createTypeSelect(updateFunc, statement, variables);
  element.insertBefore(newTypeSelect, div);
  newTypeSelect.selectedIndex = chosenType;

  // recurse
  f(id, name, statement, variables, div, updateFunc);
}

function changeVariableNameObjectSelects(id, name, element) {
  var selectInputs = element.querySelectorAll('select[name="object-select"]');
  for (var i = 0; i < selectInputs.length; i++) {
    selectInputs[i].options[id].value = name;
    selectInputs[i].options[id].text = name;
  }
}

function changeVariableNameSimple(id, name, sta, variables, element, updateFunc) {
  changeVariableNameObjectSelects(id, name, element);

  // Change the add object button to add inputs with the correct amount of options
  var addObjButton = element.querySelector('input[type="button"]');
  addObjButton.remove();
  var delObjsButton = element.querySelector('input[type="button"]');
  addObjButton = createAddObjectButton(updateFunc, sta, variables);
  element.insertBefore(addObjButton, delObjsButton);
}

function changeVariableNameNot(id, name, sta, variables, element, updateFunc) {
  var statementField = element.querySelector("fieldset");
  changeVariableName(id, name, sta.first, variables, statementField, updateFunc);
}

function changeVariableNameAndOr(id, name, sta, variables, element, updateFunc) {
  var statementFields = element.querySelectorAll("fieldset");
  for (var i = 0; i < statementFields.length; i++) {
    changeVariableName(id, name, sta.statements[i], variables, statementFields[i], updateFunc);
  }
}

function changeVariableNameIf(id, name, sta, variables, element, updateFunc) {
  var statementFields = element.querySelectorAll("fieldset");
  changeVariableName(id, name, sta.first, variables, statementFields[0], updateFunc);
  changeVariableName(id, name, sta.second, variables, statementFields[1], updateFunc);
}

function changeVariableNameQuantifier(id, name, sta, variables, element, updateFunc) {
  var varInput = element.querySelector('input[type="text"]');
  varInput.remove()

  varInput = createVariableNameInput(updateFunc, sta, variables, variables.length);
  var colorInput = element.querySelector('input[type="color"]');
  element.insertBefore(varInput, colorInput);

  var statementField = element.querySelector("fieldset");
  changeVariableName(id, name, sta.statement, copyAndAddToList(variables, sta.varName), statementField, updateFunc);
}

function changeVariableNameStatementApp(id, name, sta, variables, element, updateFunc) {
  var objectDiv = element.querySelector(".objects");
  changeVariableNameObjectSelects(id, name, objectDiv);
}

function changeStatementName(id, name, sta, element, updateFunc) {
  var f = assignToStatementTypes(sta.type, [
    noop,
    changeStatementNameNot,
    changeStatementNameAndOr,
    changeStatementNameAndOr,
    changeStatementNameIf,
    changeStatementNameIf,
    changeStatementNameQuantifier,
    changeStatementNameQuantifier,
    changeStatementNameAxiomSchema,
    changeStatementNameStatementApp
  ])

  // make it so the new statement name is remembered if the statement type is changed
  var typeSelect = element.querySelector("select");
  var chosenType = typeSelect.selectedIndex;
  typeSelect.remove();
  
  // type select should come before the div containing statement data
  var div = element.querySelector("div");
  var newTypeSelect = createTypeSelect(updateFunc, sta, variables);
  element.insertBefore(newTypeSelect, div);
  newTypeSelect.selectedIndex = chosenType;

  f(id, name, sta, element, updateFunc);
}
*/

function changeFreeVariables(sta, changedId, freeVarCount) {
  var f = assignToStatementTypes(sta.type, [
    noop,
    changeFreeVariablesNot,
    changeFreeVariablesAndOr,
    changeFreeVariablesAndOr,
    changeFreeVariablesIf,
    changeFreeVariablesIf,
    changeFreeVariablesNot,
    changeFreeVariablesNot,
    noop,
    changeFreeVariablesStatementApp
  ]);
  return f(sta, changedId, freeVarCount);
}

function changeFreeVariablesNot(sta, changedId, freeVarCount) {
  changeFreeVariables(sta.statement, changedId, freeVarCount);
}

function changeFreeVariablesAndOr(sta, changedId, freeVarCount) {
  for (var i = 0; i < sta.statements.length; i++) {
    changeFreeVariables(sta.statements[i], changedId, freeVarCount);
  }
}

function changeFreeVariablesIf(sta, changedId, freeVarCount) {
  changeFreeVariables(sta.first, changedId, freeVarCount);
  changeFreeVariables(sta.second, changedId, freeVarCount);
}

function changeFreeVariablesStatementApp(sta, changedId, freeVarCount) {
  if (sta.staIdx != changedId) {
    return;
  }
  if (sta.inputVars.length > freeVarCount) {
    sta.inputVars.splice(freeVarCount);
  } else {
    for (var i = sta.inputVars.length; i < freeVarCount; i++) {
      sta.inputVars.push(0);
    }
  }
}

function appendSimpleStatement(element, updateFunc, sta, variables, schemaStas, freeVarCounts, allowSchemata, allowStatementApps) {
  // Relation type input
  var typeInput = document.createElement("input");
  typeInput.type = "text";
  typeInput.value = sta.relation;
  typeInput.addEventListener("change", function(event) {
    sta.relation = event.target.value;
    updateFunc();
  });
  element.appendChild(typeInput);

  // Objects input
  for (var j = 0; j < sta.objects.length; j++) {
    var objSelect = createObjectSelect(updateFunc, sta.objects, variables, j, sta.objects[j]);
    element.appendChild(objSelect);
  }

  if (variables.length > 0) {
    // Add object button
    var addObjButton = createAddObjectButton(updateFunc, sta, variables);
    element.appendChild(addObjButton);

    // Remove objects button
    var delObjButton = document.createElement("input");
    delObjButton.type = "button";
    delObjButton.value = "Clear Objects";
    delObjButton.classList.add("delete");
    delObjButton.addEventListener("click", function(event) {
      var objInputs = event.target.parentNode.querySelectorAll("select");
      for (var i = 0; i < objInputs.length; i++) {
        objInputs[i].remove();
      }
      sta.objects = [];
      updateFunc();
    })
    element.appendChild(delObjButton);  
  }
}

function createObjectSelect(updateFunc, objects, variables, objIdx, selected) {
  var objSelect = document.createElement("select");
  objSelect.name = "object-select";

  for (var i = 0; i < variables.length; i++) {
    var option = document.createElement("option");
    option.value = variables[i];
    option.text = variables[i];
    objSelect.add(option);
  }

  objSelect.selectedIndex = selected;

  objSelect.addEventListener("change", function(event) {
      objects[objIdx] = event.target.selectedIndex;
      updateFunc();
  });

  return objSelect;
}

function createAddObjectButton(updateFunc, sta, variables) {
  var addObjButton = document.createElement("input");
  addObjButton.type = "button";
  addObjButton.value = "Add Object Reference";

  addObjButton.addEventListener("click", function(event) {
    sta.objects.push(0);
    var objSelect = createObjectSelect(updateFunc, sta.objects, variables, sta.objects.length - 1, 0);
    event.target.parentNode.insertBefore(objSelect, event.target);
    updateFunc();
  });

  return addObjButton;
}

function appendNotStatement(element, updateFunc, sta, variables, schemaStas, freeVarCounts, allowSchemata, allowStatementApps) {
  appendStatement(element, updateFunc, sta.statement, variables, schemaStas, freeVarCounts, false, allowStatementApps);
}

function appendAndOrStatement(element, updateFunc, sta, variables, schemaStas, freeVarCounts, allowSchemata, allowStatementApps) {
  var addButton = document.createElement("input")
  addButton.type = "button"
  addButton.value = "Add Statement"
  addButton.classList.add("and-or-button");
  addButton.addEventListener("click", function(event) {
    var s = newStatement()
    sta.statements.push(s)
    appendStatement(event.target.parentNode, updateFunc, s, variables, schemaStas, freeVarCounts, false, allowStatementApps);

    addAndOrDeleteButton(event.target.parentNode, updateFunc, sta, sta.statements.indexOf(s));

    updateFunc();
  });
  element.appendChild(addButton);

  for (var i = 0; i < sta.statements.length; i++) {
    appendStatement(element, updateFunc, sta.statements[i], variables, schemaStas, freeVarCounts, false, allowStatementApps);
    addAndOrDeleteButton(element, updateFunc, sta, i);
  }
}

function addAndOrDeleteButton(element, updateFunc, sta, idx) {
  var delButton = document.createElement("input");
  delButton.type = "button";
  delButton.value = "Delete Statement";
  delButton.classList.add("and-or-button");
  delButton.classList.add("delete");
  delButton.addEventListener("click", function(event) {
    sta.statements.splice(idx, 1);
    event.target.previousElementSibling.remove();
    event.target.remove();
    updateFunc();
  })
  element.appendChild(delButton);
}

function appendIfStatement(element, updateFunc, sta, variables, schemaStas, freeVarCounts, allowSchemata, allowStatementApps) {
  var ifLabel = document.createElement("p");
  ifLabel.innerText = "If:";
  element.appendChild(ifLabel);
  appendStatement(element, updateFunc, sta.first, variables, schemaStas, freeVarCounts, false, allowStatementApps);

  var thenLabel = document.createElement("p");
  thenLabel.innerText = "Then:";
  element.appendChild(thenLabel);
  appendStatement(element, updateFunc, sta.second, variables, schemaStas, freeVarCounts, false, allowStatementApps);
}

function appendIffStatement(element, updateFunc, sta, variables, schemaStas, freeVarCounts, allowSchemata, allowStatementApps) {
  appendStatement(element, updateFunc, sta.first, variables, schemaStas, freeVarCounts, false, allowStatementApps);

  var thenLabel = document.createElement("p");
  thenLabel.innerText = "If and only if";
  element.appendChild(thenLabel);
  appendStatement(element, updateFunc, sta.second, variables, schemaStas, freeVarCounts, false, allowStatementApps);
}

function createVariableNameInput(element, updateFunc, sta, variables, schemaStas, freeVarCounts, allowStatementApps) {
  var varInput = document.createElement("input");
  varInput.type = "text";
  varInput.name = "var";
  varInput.classList.add("var-input");
  varInput.value = sta.varName;
  varInput.addEventListener("change", function(event) {
    sta.varName = event.target.value;
    element.querySelector("fieldset").remove();
    appendStatement(element, updateFunc, sta.statement, [...variables, sta.varName], schemaStas, freeVarCounts, false, allowStatementApps);
    updateFunc();
  });
  return varInput;
}

function appendQuantifierStatement(element, updateFunc, sta, variables, schemaStas, freeVarCounts, allowSchemata, allowStatementApps, label1, label2) {
  var varLabel = document.createElement("label")
  varLabel.htmlFor = "var";
  varLabel.innerHTML = label1;
  element.appendChild(varLabel);

  var varInput = createVariableNameInput(element, updateFunc, sta, variables, schemaStas, freeVarCounts, allowStatementApps);
  element.appendChild(varInput);

  var colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.value = sta.varColor;
  colorInput.addEventListener("change", function(event) {
    sta.varColor = event.target.value;
    updateFunc();
  });
  element.appendChild(colorInput);

  sta.varIdx = variables.length;

  var label = document.createElement("p");
  label.innerText = label2;
  element.appendChild(label);

  appendStatement(element, updateFunc, sta.statement, [...variables, sta.varName], schemaStas, freeVarCounts, false, allowStatementApps);
}

function appendForAllStatement(element, updateFunc, sta, variables, schemaStas, freeVarCounts, allowSchemata, allowStatementApps) {
  appendQuantifierStatement(element, updateFunc, sta, variables, schemaStas, freeVarCounts, false, allowStatementApps, "For all ", "");
}

function appendExistsStatement(element, updateFunc, sta, variables, schemaStas, freeVarCounts, allowSchemata, allowStatementApps) {
  appendQuantifierStatement(element, updateFunc, sta, variables, schemaStas, freeVarCounts, false, allowStatementApps, "There exists a ", "such that");
}

function createStatementNameInput(element, updateFunc, sta, variables, schemaStas, freeVarCounts) {
  var nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.name = "sta-name";
  nameInput.value = sta.staName;
  nameInput.addEventListener("change", function(event) {
    sta.staName = event.target.value;
    element.querySelector("fieldset").remove();
    appendStatement(element, updateFunc, sta.statement, variables, [...schemaStas, sta.staName], [...freeVarCounts, sta.freeVars], true, true);
    updateFunc();
  });
  return nameInput;
}

function createFreeVariablesInput(element, updateFunc, sta, variables, schemaStas, freeVarCounts) {
  var freeVarsInput = document.createElement("select");
  freeVarsInput.name = "free-vars";

  var b = document.createElement("button");
  b.classList.add("select-button");
  freeVarsInput.appendChild(b)

  for (var i = 0; i < 10; i++) {
    var option = document.createElement("option");
    option.value = i;
    option.text = i;
    freeVarsInput.add(option);
  }

  freeVarsInput.value = sta.freeVars;

  freeVarsInput.addEventListener("change", function(event) {
    sta.freeVars = parseInt(event.target.value, 10);
    changeFreeVariables(sta.statement, schemaStas.length, sta.freeVars);
    element.querySelector("fieldset").remove();
    appendStatement(element, updateFunc, sta.statement, variables, [...schemaStas, sta.staName], [...freeVarCounts, sta.freeVars], true, true);
    updateFunc();
  });

  return freeVarsInput;
}

function createSchemaStatementSelect(updateFunc, sta, schemaStas, freeVarCounts, objectDiv, variables) {
  var staSelect = document.createElement("select");
  staSelect.name = "select-schema-statement";

  var b = document.createElement("button");
  b.classList.add("select-button");
  staSelect.appendChild(b);

  for (var i = 0; i < schemaStas.length; i++) {
    var option = document.createElement("option");
    option.value = i;
    option.text = schemaStas[i];
    staSelect.add(option);
  }

  staSelect.value = sta.staIdx;

  staSelect.addEventListener("change", function(event) {
    sta.staIdx = parseInt(event.target.value, 10);
    objectDiv.replaceChildren();
    sta.inputVars = [];
    for (var j = 0; j < freeVarCounts; j++) {
      var objSelect = createObjectSelect(updateFunc, sta.inputVars, variables, j, 0);
      objectDiv.appendChild(objSelect);
    }
    updateFunc();
  });

  return staSelect;
}

function appendAxiomSchema(element, updateFunc, sta, variables, schemaStas, freeVarCounts, allowSchemata, allowStatementApps) {
  var nameLabel = document.createElement("label");
  nameLabel.htmlFor = "sta-name";
  nameLabel.innerHTML = "Given any statement ";
  element.appendChild(nameLabel);

  var nameInput = createStatementNameInput(element, updateFunc, sta, variables, schemaStas, freeVarCounts);
  element.appendChild(nameInput);

  var freeVarLabel = document.createElement("label");
  freeVarLabel.htmlFor = "free-vars";
  freeVarLabel.innerHTML = " with ";
  element.appendChild(freeVarLabel);

  var freeVarsInput = createFreeVariablesInput(element, updateFunc, sta, variables, schemaStas, freeVarCounts);
  element.appendChild(freeVarsInput);

  var label = document.createElement("label");
  label.innerText = " free variables:";
  element.appendChild(label);

  appendStatement(element, updateFunc, sta.statement, variables, [...schemaStas, sta.staName], [...freeVarCounts, sta.freeVars], true, true);
}

function appendStatementApp(element, updateFunc, sta, variables, schemaStas, freeVarCounts, allowSchemata, allowStatementApps) {
  var label = document.createElement("label");
  label.innerHTML = "Statement "
  element.appendChild(label);

  var objectDiv = document.createElement("div");
  objectDiv.classList.add("objects");
  var schemaStatementSelect = createSchemaStatementSelect(updateFunc, sta, schemaStas, freeVarCounts, objectDiv, variables);
  element.appendChild(schemaStatementSelect);

  label = document.createElement("p");
  if (sta.inputVars.length > 0) {
    label.innerHTML = "is true when its free variables are replaced with the objects:"
  } else {
    label.innerHTML = "is true"
  }
  element.appendChild(label);
  element.appendChild(objectDiv);

  for (var j = 0; j < sta.inputVars.length; j++) {
    var objSelect = createObjectSelect(updateFunc, sta.inputVars, variables, j, sta.inputVars[j]);
    objectDiv.appendChild(objSelect);
  }
}

function appendStatementOfType(element, updateFunc, sta, variables, schemaStas, freeVarCounts, allowSchemata, allowStatementApps) {
  var f = assignToStatementTypes(sta.type, [
    appendSimpleStatement,
    appendNotStatement,
    appendAndOrStatement,
    appendAndOrStatement,
    appendIfStatement,
    appendIffStatement,
    appendForAllStatement,
    appendExistsStatement,
    appendAxiomSchema,
    appendStatementApp
  ], noop);

  f(element, updateFunc, sta, variables, schemaStas, freeVarCounts, allowSchemata, allowStatementApps);
}

function createTypeSelect(updateFunc, statement, variables, schemaStas, freeVarCounts, allowSchemata, allowStatementApps) {
  var typeSelect = document.createElement("select");
  typeSelect.name = "statement-type";

  var b = document.createElement("button");
  b.classList.add("select-button");
  typeSelect.appendChild(b);

  for (var i = 0; i < statementTypes.length; i++) {
    if ((allowSchemata || statementTypes[i] != "axiom-schema") && (allowStatementApps || statementTypes[i] != "statement-app")) {
      var option = document.createElement("option");
      option.value = statementTypes[i];
      option.text = statementTypeLabels[i];
      typeSelect.add(option);
    }
  }

  typeSelect.value = statement.type;

  addTypeChangeListener(typeSelect, updateFunc, statement, variables, schemaStas, freeVarCounts, allowSchemata, allowStatementApps);

  return typeSelect;
}


function addTypeChangeListener(element, updateFunc, statement, variables, schemaStas, freeVarCounts, allowSchemata, allowStatementApps) {
  element.addEventListener("change", function(event) {
    statement.type = event.target.value;
    clearData(statement);
    if (statement.type == "statement-app") {
      for (var i = 0; i < freeVarCounts[0]; i++) {
        statement.inputVars.push(0);
      }
    }
    event.target.nextElementSibling.remove();
    var dataDiv = document.createElement("div");
    appendStatementOfType(dataDiv, updateFunc, statement, variables, schemaStas, freeVarCounts, allowSchemata, allowStatementApps);
    event.target.parentNode.appendChild(dataDiv);
    event.target.parentNode.className = event.target.value;
    updateFunc();
  });
}

export function appendStatement(element, updateFunc, statement, variables, schemaStas=[], freeVarCounts=[], allowSchemata=false, allowStatementApps=false) {
  var fieldset = document.createElement("fieldset");

  var typeSelect = createTypeSelect(updateFunc, statement, variables, schemaStas, freeVarCounts, allowSchemata, allowStatementApps);
  fieldset.appendChild(typeSelect);
  fieldset.className = typeSelect.value;

  var dataDiv = document.createElement("div");
  appendStatementOfType(dataDiv, updateFunc, statement, variables, schemaStas, freeVarCounts, allowSchemata, allowStatementApps);
  fieldset.appendChild(dataDiv);

  element.appendChild(fieldset);
}