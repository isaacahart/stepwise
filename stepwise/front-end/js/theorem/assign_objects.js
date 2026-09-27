
import { assignToStatementTypes, makeNotStatement } from "../statement/statement_base.js";
import { findUnusedVariable, getUsedObjects } from "../statement/used_variables.js";

// Assign actual objects (represented by integers) to for-all statements
// Assignments of -1 indicate the respective for-all statement will not be assigned an object
export function assignObjects(statement, objects, numObjsInSpace=Infinity, toType="for-all") {
  return assignObjectsHelper(statement, objects, {}, toType, numObjsInSpace);
}

// accumulates which object idxs are bound to which for-all statements
function assignObjectsHelper(statement, objects, bindings, toType, numObjs) {
  var f = assignToStatementTypes(statement.type, [
    assignObjectsSimple,
    assignObjectsNot,
    assignObjectsAndOr,
    assignObjectsAndOr,
    assignObjectsIf,
    assignObjectsIf,
    assignObjectsQuantifier,
    assignObjectsQuantifier,
    (statement) => statement,
    (statement) => statement]);
  if (statement.type == toType) {
    return f(statement, objects, bindings, toType, numObjs);
  } else {
    var newSta = f(statement, objects, bindings, "", numObjs);
    newSta.type = statement.type;
    return newSta;
  }
}

function assignObjectsSimple(sta, objects, bindings, toType, numObjs) {
  var newObjs = [];
  for (var i = 0; i < sta.objects.length; i++) {
    if (sta.objects[i] in bindings) {
      var newObj = bindings[sta.objects[i]];
    } else {
      var newObj = sta.objects[i];
    }
    newObjs.push(newObj);
  }
  return {"relation": sta.relation, "objects": newObjs};
}

function assignObjectsNot(sta, objects, bindings, toType, numObjs) {
  return {"statement": assignObjectsHelper(sta.statement, [], bindings, toType, numObjs)};
}

function assignObjectsAndOr(sta, objects, bindings, toType, numObjs) {
  var newStatements = sta.statements.map((s) => {return assignObjectsHelper(s, [], bindings, toType, numObjs);});
  return {"statements": newStatements};
}

function assignObjectsIf(sta, objects, bindings, toType, numObjs) {
  return {"first": assignObjectsHelper(sta.first, [], bindings, toType, numObjs),
    "second": assignObjectsHelper(sta.second, [], bindings, toType, numObjs)
  };
}

function assignObjectsQuantifier(sta, objects, bindings, toType, numObjs) {
  if (sta.type !== toType || objects.length == 0 || objects[0] === -1 || objects[0] >= numObjs) {
    // if the quantified variable is not assigned in objects, let it bind some unused variable
    if ("varIdx" in sta) {
      var varIdx = sta.varIdx;
    } else {
      var varIdx = Object.keys(bindings).length;
    }
    
    var newBindingPair = {};
    if (objects.includes(varIdx) || Object.values(bindings).includes(varIdx)) {
      var newBinding = findUnusedVariable([...objects, ...getUsedObjects(sta.statement)], bindings);
      newBindingPair[varIdx] = newBinding;
    } else {
      var newBinding = varIdx;
      newBindingPair[varIdx] = newBinding;
    }
    
    if (objects.length == 0) {
      var newObjects = [];
    } else {
      var newObjects = objects.slice(1);
    }

    return {"type": sta.type,
        "varName": sta.varName,
        "varColor": sta.varColor,
        "varIdx": newBinding,
        "statement": assignObjectsHelper(sta.statement, newObjects, {...bindings, ...newBindingPair}, toType, numObjs)};

  } else {
    // if the quantified variable is assigned, add that assignment to the bindings list, and remove the for-all statement
    var newBinding = objects[0];
    var newBindingPair = {};
    if ("varIdx" in sta) {
      newBindingPair[sta.varIdx] = newBinding;
    } else {
      newBindingPair[Object.keys(bindings).length] = newBinding;
    }
    return assignObjectsHelper(sta.statement, objects.slice(1), {...bindings, ...newBindingPair}, toType, numObjs);
  }
}

function assignObjectsExists(sta, objects, bindings, toType, numObjs) {
  return {"varName": sta.varName,
    "varColor": sta.varColor,
    "statement": assignObjectsHelper(sta.statement, [], bindings, toType, numObjs)};
}

export function getInnerStatement(sta) {
  return getInnerStatementHelperOuter(sta, 0);
}

function getInnerStatementHelperOuter(sta, varIdx) {
  var f = assignToStatementTypes(sta.type, [
    getInnerStatementSimple,
    getInnerStatementNot,
    getInnerStatementAndOr,
    getInnerStatementAndOr,
    getInnerStatementIf,
    getInnerStatementIf,
    getInnerStatementForAllOuter,
    getInnerStatementQuantifier,
    (sta) => sta,
    (sta) => sta
  ]);
  return f(sta, varIdx);
}

function getInnerStatementHelperInner(sta, varIdx) {
  var f = assignToStatementTypes(sta.type, [
    getInnerStatementSimple,
    getInnerStatementNot,
    getInnerStatementAndOr,
    getInnerStatementAndOr,
    getInnerStatementIf,
    getInnerStatementIf,
    getInnerStatementQuantifier,
    getInnerStatementQuantifier,
    (sta) => sta,
    (sta) => sta
  ]);
  return f(sta, varIdx);
}

function getInnerStatementSimple(sta, varIdx) {
  return sta;
}

function getInnerStatementNot(sta, varIdx) {
  return makeNotStatement(getInnerStatementHelperInner(sta.statement, varIdx));
}

function getInnerStatementAndOr(sta, varIdx) {
  var stas = [];
  for (var i = 0; i < sta.statements.length; i++) {
    stas.push(getInnerStatementHelperInner(sta.statements[i], varIdx));
  }
  return {type: sta.type, statements: stas};
}

function getInnerStatementIf(sta, varIdx) {
  return {type: sta.type, 
    first: getInnerStatementHelperInner(sta.first, varIdx), 
    second: getInnerStatementHelperInner(sta.second, varIdx)};
}

function getInnerStatementForAllOuter(sta, varIdx) {
  return getInnerStatementHelperOuter(sta.statement, varIdx+1);
}

function getInnerStatementQuantifier(sta, varIdx) {
  return {type: sta.type,
    varName: sta.varName, 
    varColor: sta.varColor, 
    statement: getInnerStatementHelperInner(sta.statement, varIdx+1), 
    varIdx: varIdx};
}


export function assignObjectToQuantifier(sta, obj) {
  /* assign the given object to the quantifier and return the inner statement */
  if (obj === -1 || (sta.type !== "for-all" && sta.type !== "exists")) {
    return sta;
  }
  return assignSingleObjectHelper(sta.statement, obj, sta.varIdx, -1, []);
}

function assignSingleObjectHelper(sta, obj, boundObj, changedBinding, boundVars) {
  var f = assignToStatementTypes(sta.type, [
    assignSingleObjectSimple,
    assignSingleObjectNot,
    assignSingleObjectAndOr,
    assignSingleObjectAndOr,
    assignSingleObjectIf,
    assignSingleObjectIf,
    assignSingleObjectQuantifier,
    assignSingleObjectQuantifier,
    (sta) => sta,
    (sta) => sta
  ]);
  var newSta = f(sta, obj, boundObj, changedBinding, boundVars);
  newSta.type = sta.type;
  return newSta;
}

function assignSingleObjectSimple(sta, obj, boundObj, changedBinding, boundVars) {
  var newObjs = sta.objects.map((b) => { 
    if (b === boundObj) { return obj; }
    else if (b === obj && changedBinding !== -1) { return changedBinding; }
    else { return b; }});
  return {relation: sta.relation, objects: newObjs};
}

function assignSingleObjectNot(sta, obj, boundObj, changedBinding, boundVars) {
  return {statement: assignSingleObjectHelper(sta.statement, obj, boundObj, changedBinding, boundVars)};
}

function assignSingleObjectAndOr(sta, obj, boundObj, changedBinding, boundVars) {
  var newStatements = sta.statements.map((s) => {return assignSingleObjectHelper(s, obj, boundObj, changedBinding, boundVars);});
  return {statements: newStatements};
}

function assignSingleObjectIf(sta, obj, boundObj, changedBinding, boundVars) {
  return {first: assignSingleObjectHelper(sta.first, obj, boundObj, changedBinding, boundVars),
    second: assignSingleObjectHelper(sta.second, obj, boundObj, changedBinding, boundVars)};
}

function assignSingleObjectQuantifier(sta, obj, boundObj, changedBinding, boundVars) {
  if (sta.varIdx === obj) {
    var bv = getUsedObjects(sta);
    var idx = findUnusedVariable(boundVars, bv);
    var s = assignSingleObjectHelper(sta.statement, obj, boundObj, idx, [...boundVars, idx]);
  } else {
    var idx = sta.varIdx;
    var s = assignSingleObjectHelper(sta.statement, obj, boundObj, changedBinding, [...boundVars, sta.varIdx]);
  }
  return {varName: sta.varName,
    varColor: sta.varColor,
    varIdx: idx,
    statement: s
  }
}