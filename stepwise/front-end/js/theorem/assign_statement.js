import { replaceObjectInStatement } from "../statement/replace_variable";
import { assignToStatementTypes, makeNotStatement, makeSimpleStatement } from "../statement/statement_base";
import { findUnusedVariable, getUsedObjects, getUsedObjectsInList } from "../statement/used_variables";

export function assignStatements(toSta, assignStas, firstFreeVarIdx) {
  if (toSta.type == "axiom-schema" && assignStas.length > 0) {
    return assignStatementsMiddle(toSta.statement, assignStas, firstFreeVarIdx, 1);
  } else {
    return toSta;
  }
}

function assignStatementsMiddle(toSta, assignStas, firstFreeVarIdx, assignCount) {
  if (toSta.type == "axiom-schema" && assignCount < assignStas.length) {
    return assignStatementsMiddle(toSta.statement, assignStas, firstFreeVarIdx, assignCount+1);
  } else if (assignCount <= assignStas.length) {
    return assignStatementsInner(toSta, assignStas, firstFreeVarIdx, {}, getUsedObjectsInList(assignStas));
  } else {
    return toSta;
  }
}

function assignStatementsInner(toSta, assignStas, firstFreeVarIdx, changedBindings, usedObjects) {
  var f = assignToStatementTypes(toSta.type, [
    assignStatementsSimple,
    assignStatementsNot,
    assignStatementsAndOr,
    assignStatementsAndOr,
    assignStatementsIf,
    assignStatementsIf,
    assignStatementsQuantifier,
    assignStatementsQuantifier,
    (toSta) => toSta,
    assignStatementsStatementApp
  ]);
  return f(toSta, assignStas, firstFreeVarIdx, changedBindings, usedObjects);
}

function assignStatementsSimple(toSta, assignStas, firstFreeVarIdx, changedBindings, usedObjects) {
  var newObjs = [];
  for (var i = 0; i < toSta.objects.length; i++) {
    if (toSta.objects[i] in changedBindings) {
      var newObj = changedBindings[toSta.objects[i]];
    } else {
      var newObj = toSta.objects[i];
    }
    newObjs.push(newObj);
  }
  return makeSimpleStatement(toSta.relation, newObjs);
}

function assignStatementsNot(toSta, assignStas, firstFreeVarIdx, changedBindings, usedObjects) {
  return makeNotStatement(assignStatementsInner(toSta.statement, assignStas, firstFreeVarIdx, changedBindings, usedObjects));
}

function assignStatementsAndOr(toSta, assignStas, firstFreeVarIdx, changedBindings, usedObjects) {
  return {type: toSta.type,
    statements: toSta.statements.map(s => assignStatementsInner(s, assignStas, firstFreeVarIdx, changedBindings, usedObjects))};
}

function assignStatementsIf(toSta, assignStas, firstFreeVarIdx, changedBindings, usedObjects) {
  return {type: toSta.type,
    first: assignStatementsInner(toSta.first, assignStas, firstFreeVarIdx, changedBindings, usedObjects),
    second: assignStatementsInner(toSta.second, assignStas, firstFreeVarIdx, changedBindings, usedObjects)
  };
}

function assignStatementsQuantifier(toSta, assignStas, firstFreeVarIdx, changedBindings, usedObjects) {
  if (usedObjects.includes(toSta.varIdx)) {
    var newBindings = {...changedBindings};
    var newVarIdx = findUnusedVariable([...usedObjects, ...getUsedObjects(toSta.statement)], changedBindings);
    newBindings[toSta.varIdx] = newVarIdx;
  } else {
    var newBindings = changedBindings;
    var newVarIdx = toSta.varIdx;
  }
  return {type: toSta.type,
    varName: toSta.varName,
    varColor: toSta.varColor,
    varIdx: newVarIdx,
    statement: assignStatementsInner(toSta.statement, assignStas, firstFreeVarIdx, newBindings, usedObjects)
  };
}

function assignStatementsStatementApp(toSta, assignStas, firstFreeVarIdx, changedBindings, usedObjects) {
  var newObjs = [];
  for (var i = 0; i < toSta.inputVars.length; i++) {
    if (toSta.inputVars[i] in changedBindings) {
      var newObj = changedBindings[toSta.inputVars[i]];
    } else {
      var newObj = toSta.inputVars[i];
    }
    newObjs.push(newObj);
  }
  var newSta = structuredClone(assignStas[toSta.staIdx]);
  for (var i = 0; i < newObjs.length; i++) {
    newSta = replaceObjectInStatement(newSta, firstFreeVarIdx+i, newObjs[i]);
  }
  return newSta
}