
import { assignToStatementTypes } from "../statement/statement_base.js";

export function findUnusedVariable(objects, bindings) {
  /* find the earliest unused object idx for use as a bound variable */
  var found = false;
  var i = -1;
  while (!found) {
    i++;
    found = !(objects.includes(i) || Object.values(bindings).includes(i));
  }
  return i;
}

export function getUsedObjectsInList(stas) {
  var vars = [];
  for (var i = 0; i < stas.length; i++) {
    getInnerBoundVariablesHelper(stas[i], vars);
  }
  return vars;
}

export function getUsedObjects(sta) {
  /* return a list of all variables bound by quantifiers or present in relations in the given statement */
  var vars = [];
  getInnerBoundVariablesHelper(sta, vars);
  return vars;
}

function getInnerBoundVariablesHelper(sta, vars) {
  var f = assignToStatementTypes(sta.type, [
    (sta, vars) => { vars.push(...sta.objects); },
    (sta, vars) => { getInnerBoundVariablesHelper(sta.statement, vars); },
    getBoundVariablesAndOr,
    getBoundVariablesAndOr,
    getBoundVariablesIf,
    getBoundVariablesIf,
    getBoundVariablesQuantifier,
    getBoundVariablesQuantifier,
    (sta, vars) => { getInnerBoundVariablesHelper(sta.statement, vars); },
    (sta, vars) => { vars.push(...sta.inputVars); }
  ]);
  f(sta, vars);
}

function getBoundVariablesAndOr(sta, vars) {
  for (var i = 0; i < sta.statements.length; i++) {
    getInnerBoundVariablesHelper(sta.statements[i], vars);
  }
}

function getBoundVariablesIf(sta, vars) {
  getInnerBoundVariablesHelper(sta.first, vars);
  getInnerBoundVariablesHelper(sta.second, vars);
}

function getBoundVariablesQuantifier(sta, vars) {
  if ("varIdx" in sta) {
    vars.push(sta.varIdx);
  }
  return getInnerBoundVariablesHelper(sta.statement, vars);
}