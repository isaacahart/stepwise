
/*
Block Structure

type: theorem-app
theorem: <int>
inputs: [<int>]
outputObjs: [<object>]
outputBlocks: [<object>]
statementInputs: [<statement>]
boundVariables: [[<object>]]

type: for-all-block
id: <int>
inputs: [<int>]
outputObjs: [<object>]
outputBlocks: [<object>]

type: complete-goal
inputs: [<int>]
successful: <boolean>

type: tautology
statement: <statement>
outputObjs: [<object>]
outputBlocks: [<object>]

type: modus-ponens
sta1: <statement>
sta2: <statement>
outputObjs: [<object>]
outputBlocks: [<object>]

type: prove-if
sta1: <statement>
sta2: <statement>
outputObjs: [<object>]
outputBlocks: [<object>]

type: close-c-block
outputObjs: [<object>]
outputBlocks: [<object>]

type: prove-for-all
var: <object>
statement: <statement>
outputObjs: [<object>]
outputBlocks: [<object>]

type: prove-exists
var: <object>
statement: <statement>
inputs: (<int>)

type: reflexive-equality
inputs: (<int>)

type: substitute
inputs: (<int>, <int>)
statement: <statement>
outputObjs: [<object>]
outputBlocks: [<object>]

type: proof-by-contradiction
statement: <statement>
outputObjs: [<object>]
outputBlocks: [<object>]

type: exists-definition
statement: <statement>
outputObjs: [<object>]
outputBlocks: [<object>]

*/

import { emptyOutputObj } from "../object/object_base.js";
import { getTheoremFromCreatedBlock, lookupTheoremInSpace } from "../space/space_base.js";
import { emptyStatement } from "../statement/statement_base.js";
import { countExistStatements, countFreeVariables, countTheoremInputs } from "../theorem/theorem_base.js";

export const blockTypes = [
  "theorem-app",
  "for-all-block",
  "complete-goal",
  "tautology",
  "modus-ponens",
  "prove-if",
  "close-c-block",
  "prove-for-all",
  "prove-exists",
  "reflexive-equality",
  "substitute",
  "proof-by-contradiction",
  "exists-definition"
]
export const defaultBlockName = ""
export const defaultBlockColor = "#676767"
export const cBlocks = ["prove-if", "prove-for-all", "proof-by-contradiction"];

// assign different variables/functions to be used depending on the given block type
export function assignToBlockTypes(type, values, defaultValue=false) {
  for (var i = 0; i < Math.min(values.length, blockTypes.length); i++) {
    if (type == blockTypes[i]) {
      return values[i];
    }
  }
  return defaultValue;
}

export function createTheoremAppFromTheorem(id, statement) {
  var inputs = [];
  for (var i = 0; i < countTheoremInputs(statement); i++) {
    inputs.push(-1);
  }
  var statementInputs = [];
  var boundVariables = [];
  var freeVarCounts = countFreeVariables(statement);
  for (var i = 0; i < freeVarCounts.length; i++) {
    statementInputs.push(emptyStatement());
    var staBV = [];
    for (var j = 0; j < freeVarCounts[i]; j++) {
      staBV.push(emptyOutputObj);
    }
    boundVariables.push(staBV);
  }
  return {type: "theorem-app",
    theorem: id,
    inputs: inputs,
    outputObjs: [],
    outputBlocks: [],
    statementInputs: statementInputs,
    boundVariables: boundVariables
  };
}

export function makeForAllBlock(id, statement) {
  var inputs = [];
  for (var i = 0; i < countTheoremInputs(statement); i++) {
    inputs.push(-1);
  }
  return {type: "for-all-block",
    id: id,
    inputs: inputs,
    outputObjs: [],
    outputBlocks: []
  };
}

export function createCompleteGoal(goals) {
  var ins = [];
  goals = structuredClone(goals);
  for (var i = 0; i < goals.length; i++) {
    for (var j = 0; j < countExistStatements(goals[i]); j++) {
      ins.push(-1);
    }
  }
  
  return {type: "complete-goal", inputs: ins, successful: false};
}

export function makeTautologyBlock() {
  return {type: "tautology",
    statement: emptyStatement(),
    outputObjs: [],
    outputBlocks: []};
}

export function makeModusPonensBlock() {
  return {type: "modus-ponens",
    sta1: emptyStatement(),
    sta2: emptyStatement(),
    outputObjs: [],
    outputBlocks: []};
}

export function makeProveIfBlock() {
  return {type: "prove-if",
    sta1: emptyStatement(),
    sta2: emptyStatement(),
    outputObjs: [],
    outputBlocks: []
  };
}

export function makeCloseCBlock() {
  return {type: "close-c-block",
    outputObjs: [],
    outputBlocks: []
  };
}

export function makeProveForAllBlock() {
  return {type: "prove-for-all",
    var: emptyOutputObj,
    statement: emptyStatement(),
    outputObjs: [],
    outputBlocks: []
  };
}

export function makeProveExistsBlock() {
  return {type: "prove-exists",
    var: emptyOutputObj,
    statement: emptyStatement(),
    inputs: [-1]
  };
}

export function makeReflexivityBlock() {
  return {type: "reflexive-equality",
    inputs: [-1]
  };
}

export function makeSubstituteBlock() {
  return {type: "substitute",
    inputs: [-1, -1],
    statement: emptyStatement(),
    outputObjs: [],
    outputBlocks: []
  };
}

export function makeProofByContradictionBlock() {
  return {type: "proof-by-contradiction",
    statement: emptyStatement(),
    outputObjs: [],
    outputBlocks: []
  };
}

export function makeExistsDefinitionBlock() {
  return {type: "exists-definition",
    statement: emptyStatement(),
    outputObjs: [],
    outputBlocks: []
  };
}

export function getBlockTheorem(block, space) {
  if (block.type == "theorem-app") {
    return lookupTheoremInSpace(space, block.theorem);
  } else if (block.type == "for-all-block") {
    return getTheoremFromCreatedBlock(space, block.id);
  }
}