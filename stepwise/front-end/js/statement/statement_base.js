/*
Statement Structure

type: simple
relation: <string>
objects: [<nat>]

type: not
statement: <statement>

type: and
statements: [<statement>]

type: or
statements: [<statement>]

type: implication
first: <statement>
second: <statement>

type: equivalence
first: <statement>
second: <statement>

type: for-all
varName: <string>
varColor: <hexColor>
statement: <statement>
(varIdx: <int>)

type: exists
varName: <string>
varColor: <hexColor>
statement: <statement>
(varIdx: <int>)

type: axiom-schema
staName: <string>
freeVars: <int>
statement: <statement>

type: statement-app
staIdx: <int>
inputVars: [<int>]

*/

const noop = () => {};

export const statementTypes = [
  "simple",
  "not",
  "and",
  "or",
  "implication",
  "equivalence",
  "for-all",
  "exists",
  "axiom-schema",
  "statement-app"
];

export const statementTypeLabels = [
  "Simple Relation",
  "Not",
  "And",
  "Or",
  "If",
  "If and Only If",
  "For All",
  "There Exists",
  "Axiom Schema",
  "Apply Schema Formula"
];

export function emptyStatement() {
  return makeSimpleStatement("", []);
}

export function clearStatement(sta) {
  sta.type = "simple";
  sta.relation = "";
  sta.objects = [];
}

export function makeSimpleStatement(relation, objects) {
  return {"type": "simple", "objects": objects, "relation": relation};
}

export function makeNotStatement(statement) {
  return {"type": "not", "statement": statement};
}

export function makeAndStatement(statements) {
  return {"type": "and", "statements": statements};
}

export function makeOrStatement(statements) {
  return {"type": "or", "statements": statements};
}

export function makeIfStatement(first, second) {
  return {"type": "implication", "first": first, "second": second};
}

export function makeIffStatement(first, second) {
  return {"type": "equivalence", "first": first, "second": second};
}

export function makeForAllStatement(varName, varColor, statement, varIdx=-1) {
  if (varIdx < 0) {
    return {"type": "for-all", "varName": varName, "varColor": varColor, "statement": statement};
  }
  return {"type": "for-all", "varName": varName, "varColor": varColor, "varIdx": varIdx, "statement": statement};
}

export function makeExistsStatement(varName, varColor, statement, varIdx=-1) {
  if (varIdx < 0) {
    return {"type": "exists", "varName": varName, "varColor": varColor, "statement": statement};
  }
  return {"type": "exists", "varName": varName, "varColor": varColor, "varIdx": varIdx, "statement": statement};
}

export function makeAxiomSchema(staName, freeVars, statement) {
  return {type: "axiom-schema", staName: staName, freeVars: freeVars, statement: statement};
}

export function makeStatementApp(staIdx, inputVars) {
  return {type: "statement-app", staIdx: staIdx, inputVars: inputVars};
}


// assign different variables/functions to be used depending on the given statement type
export function assignToStatementTypes(type, values, defaultValue=noop) {
  for (var i = 0; i < Math.min(values.length, statementTypes.length); i++) {
    if (type == statementTypes[i]) {
      return values[i];
    }
  }
  return defaultValue;
}


export function statementsEqual(sta1, sta2) {
  return statementsEqualHelper(sta1, sta2, [], []);
}

function statementsEqualHelper(sta1, sta2, bindings1, bindings2) {
  if (sta1.type !== sta2.type) {
    return false;
  }
  var f = assignToStatementTypes(sta1.type, [
    statementsEqualSimple,
    statementsEqualNot,
    statementsEqualAndOr,
    statementsEqualAndOr,
    statementsEqualIf,
    statementsEqualIf,
    statementsEqualQuantifier,
    statementsEqualQuantifier,
    axiomSchemataEqual,
    statementAppsEqual
  ])
  return f(sta1, sta2, bindings1, bindings2);
}

function statementsEqualSimple(sta1, sta2, bindings1, bindings2) {
  if (sta1.relation !== sta2.relation) {
    return false;
  }
  if (sta1.objects.length != sta2.objects.length) {
    return false;
  }
  if (statementsEqualSymmetricEquality(sta1, sta2, bindings1, bindings2)) {
    return true;
  }
  for (var i = 0; i < sta1.objects.length; i++) {
    var idx1 = bindings1.indexOf(sta1.objects[i]);
    var idx2 = bindings2.indexOf(sta2.objects[i]);
    if (idx1 != idx2) {
      return false;
    }
    if (idx1 == -1 && sta1.objects[i] != sta2.objects[i]) {
      return false;
    }
  }
  return true;
}

function statementsEqualSymmetricEquality(sta1, sta2, bindings1, bindings2) {
  if (sta1.relation == "equal" && sta2.relation == "equal" && sta1.objects.length == 2 && sta2.objects.length == 2) {
    var idx10 = bindings1.indexOf(sta1.objects[0]);
    var idx11 = bindings1.indexOf(sta1.objects[1]);
    var idx20 = bindings2.indexOf(sta2.objects[0]);
    var idx21 = bindings2.indexOf(sta2.objects[1]);
    if (idx10 != idx21 || idx11 != idx20) {
      return false;
    }
    if (idx10 == -1) {
      if (sta1.objects[0] != sta2.objects[1]) {
        return false;
      }
    }
    if (idx11 == -1) {
      if (sta1.objects[1] != sta2.objects[0]) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
}

function statementsEqualNot(sta1, sta2, bindings1, bindings2) {
  return statementsEqualHelper(sta1.statement, sta2.statement, bindings1, bindings2);
}

function statementsEqualAndOr(sta1, sta2, bindings1, bindings2) {
  if (sta1.statements.length != sta2.statements.length) {
    return false;
  }
  for (var i = 0; i < sta1.statements.length; i++) {
    if (!statementsEqualHelper(sta1.statements[i], sta2.statements[i], bindings1, bindings2)) {
      return false;
    }
  }
  return true;
}

function statementsEqualIf(sta1, sta2, bindings1, bindings2) {
  return statementsEqualHelper(sta1.first, sta2.first, bindings1, bindings2) && statementsEqualHelper(sta1.second, sta2.second, bindings1, bindings2);
}

function statementsEqualQuantifier(sta1, sta2, bindings1, bindings2) {
  return statementsEqualHelper(sta1.statement, sta2.statement, [...bindings1, sta1.varIdx], [...bindings2, sta2.varIdx]);
}

function axiomSchemataEqual(sta1, sta2, bindings1, bindings2) {
  return statementsEqualHelper(sta1.statement, sta2.statement, bindings1, bindings2);
}

function statementAppsEqual(sta1, sta2, bindings1, bindings2) {
  return sta1.staIdx == sta2.staIdx && sta1.inputs == sta2.inputs;
}

export function listContainsStatement(staList, sta) {
  return staList.some(elt => statementsEqual(elt, sta));
}

export function trueByReflexivity(sta) {
  return sta.type == "simple" && sta.relation == "equal" && sta.objects.length == 2 && sta.objects[0] == sta.objects[1];
}

export function overwriteStatement(sta1, sta2) {
  for (const key in sta1) {
    delete sta1[key];
  }
  Object.assign(sta1, sta2);
}