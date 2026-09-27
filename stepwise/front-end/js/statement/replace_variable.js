import { assignToStatementTypes, makeSimpleStatement } from "./statement_base";
import { findUnusedVariable, getUsedObjects } from "./used_variables";

export function replaceObjectInStatement(sta, obj1, obj2, boundVars=[], changedVars={}) {
  var f = assignToStatementTypes(sta.type, [
    replaceObjectSimple,
    replaceObjectNot,
    replaceObjectAndOr,
    replaceObjectAndOr,
    replaceObjectIf,
    replaceObjectIf,
    replaceObjectQuantifier,
    replaceObjectQuantifier,
    sta => sta,
    sta => sta
  ]);
  return f(sta, obj1, obj2, boundVars, changedVars);
}

function replaceObjectSimple(sta, obj1, obj2, boundVars, changedVars) {
  var newSta = makeSimpleStatement(sta.relation, []);
  for (var i = 0; i < sta.objects.length; i++) {
    if (sta.objects[i] == obj1 && !boundVars.includes(obj1)) {
      newSta.objects.push(obj2);
    } else {
      if (sta.objects[i] in changedVars) {
        newSta.objects.push(changedVars[sta.objects[i]]);
      } else {
        newSta.objects.push(sta.objects[i]);
      }
    }
  }
  return newSta;
}

function replaceObjectNot(sta, obj1, obj2, boundVars, changedVars) {
  return {type: sta.type,
    statement: replaceObjectInStatement(sta.statement, obj1, obj2, boundVars, changedVars)
  };
}

function replaceObjectAndOr(sta, obj1, obj2, boundVars, changedVars) {
  return {type: sta.type,
    statements: sta.statements.map(s => replaceObjectInStatement(s, obj1, obj2, boundVars, changedVars))
  };
}

function replaceObjectIf(sta, obj1, obj2, boundVars, changedVars) {
  return {type: sta.type,
    first: replaceObjectInStatement(sta.first, obj1, obj2, boundVars, changedVars),
    second: replaceObjectInStatement(sta.second, obj1, obj2, boundVars, changedVars)
  };
}

function replaceObjectQuantifier(sta, obj1, obj2, boundVars, changedVars) {
  newSta = {type: sta.type, varName: sta.varName, varColor: sta.varColor, varIdx: sta.varIdx};
  var newChangedVars = changedVars;
  if (sta.varIdx == obj2) {
    newChangedVars = {...changedVars};
    const changedVar = findUnusedVariable(getUsedObjects(sta), [...boundVars, obj2])
    newChangedVars[sta.varIdx] = changedVar;
    newSta.varIdx = changedVar;
  }
  newSta.statement = replaceObjectInStatement(sta.statement, obj1, obj2, [...boundVars, newSta.varIdx], newChangedVars);
  return newSta;
}