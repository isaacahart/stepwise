import { emptyOutputObj, makeObject } from "../object/object_base.js";

export function makeTheorem(name, color, statement) {
  return {name: name, color: color, statement: statement}
}

export function getTheoremInputs(statement) {
  if (statement.type == "axiom-schema") {
    return getTheoremInputs(statement.statement);
  } else {
    return getTheoremInputsInner(statement);
  }
}

function getTheoremInputsInner(statement) {
  if (statement.type != "for-all") {
    return [];
  }
  var newObj = makeObject(statement.varName, statement.varColor);
  return [newObj, ...getTheoremInputs(statement.statement)];
}

export function getTheoremInputIds(statement) {
  var out = [];
  var ins = getTheoremInputs(statement)
  for (var i = 0; i < ins.length; i++) {
    out.push(i);
  }
  return out;
}

export function getSchemaStatements(statement) {
  if (statement.type != "axiom-schema") {
    return [];
  }
  return [statement.staName, ...getSchemaStatements(statement.statement)];
}

export function countFreeVariables(statement) {
  if (statement.type != "axiom-schema") {
    return [];
  }
  return [statement.freeVars, ...countFreeVariables(statement.statement)];
}

export function getFreeVariables(statement) {
  var freeVarCounts = countFreeVariables(statement);
  var out = [];
  for (var i = 0; i < freeVarCounts.length; i++) {
    var inner = [];
    for (var j = 0; j < freeVarCounts[i]; j++) {
      inner.push(emptyOutputObj);
    }
    out.push(inner);
  }
  return out;
}

export function countTheoremInputs(statement) {
  return getTheoremInputs(statement).length;
}

export function countExistStatements(statement) {
  if (statement.type != "exists") {
    return 0;
  }
  return 1 + countExistStatements(statement.statement);
}