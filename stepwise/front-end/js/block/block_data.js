/*
Generic Block Data Structure
name: <string>
color: <color>
inputIds: [<int>]
inputObjs?: [<object>]
outputObjs: [<object>]
outputBlocks: [<object>]
statementInputs: [<statement>]
boundVariables: [[<object>]]
textColor?: <color>
*/

import { builtinBlockColor, goodTextColorBlock, normalTextColorBlock } from "../drawing/drawing_base";
import { getObjectsFromIds, lookupTheoremInSpace } from "../space/space_base";
import { makeStatementStringOneLine } from "../statement/statement_display";
import { getFreeVariables, getSchemaStatements, getTheoremInputIds, getTheoremInputs } from "../theorem/theorem_base";
import { assignToBlockTypes } from "./block_base";


export function getBlockData(block, space, includeInputObjs=true) {
  var f = assignToBlockTypes(block.type, [
    theoremAppData,
    forAllBlockData,
    completeGoalData,
    tautologyBlockData,
    modusPonensBlockData,
    proveIfData,
    closeCBlockData,
    proveForAllData,
    proveExistsData,
    reflexivityData,
    substituteData,
    proofByContradictionData,
    existsDefinitionData
  ]);
  var data = f(block, space);
  if (includeInputObjs && !("inputObjs" in data)) {
    data.inputObjs = getObjectsFromIds(space, data.inputIds);
  }
  data.statementInputStrings = data.statementInputs.map((sta, i) => makeStatementStringOneLine(sta, [...space.objects, ...data.boundVariables[i]]));
  return data;
}

function theoremAppData(block, space) {
  var thm = lookupTheoremInSpace(space, block.theorem);
  if (thm === undefined) {
    return deletedBlockData();
  }
  return {
    name: thm.name,
    color: thm.color,
    inputIds: block.inputs,
    outputObjs: block.outputObjs,
    outputBlocks: block.outputBlocks,
    statementInputs: block.statementInputs,
    boundVariables: block.boundVariables
  };
}

function forAllBlockData(block, space) {
  var blockData = space.createdBlocks[block.id];
  if (blockData === undefined) {
    return deletedBlockData();
  }
  return {
    name: blockData.name,
    color: blockData.color,
    inputIds: block.inputs,
    outputObjs: block.outputObjs,
    outputBlocks: block.outputBlocks,
    statementInputs: [],
    boundVariables: []
  };
}

function completeGoalData(block, space) {
  return {
    name: "complete goal",
    color: builtinBlockColor,
    inputIds: block.inputs,
    outputObjs: [],
    outputBlocks: [],
    statementInputs: [],
    boundVariables: [],
    textColor: block.successful ? goodTextColorBlock : normalTextColorBlock
  };
}

function tautologyBlockData(block, space) {
  return {
    name: "establish tautology",
    color: builtinBlockColor,
    inputIds: [],
    outputObjs: block.outputObjs,
    outputBlocks: block.outputBlocks,
    statementInputs: [block.statement],
    boundVariables: [[]]
  };
}

function modusPonensBlockData(block, space) {
  return {
    name: "modus ponens",
    color: builtinBlockColor,
    inputIds: [],
    outputObjs: block.outputObjs,
    outputBlocks: block.outputBlocks,
    statementInputs: [block.sta1, block.sta2],
    boundVariables: [[], []]
  };
}

function proveIfData(block, space) {
  return {
    name: "prove if/then",
    color: builtinBlockColor,
    inputIds: [],
    outputObjs: block.outputObjs,
    outputBlocks: block.outputBlocks,
    statementInputs: [block.sta1, block.sta2],
    boundVariables: [[], []]
  };
}

function closeCBlockData(block, space) {
  return {
    name: "         ",
    color: builtinBlockColor,
    inputIds: [],
    outputObjs: block.outputObjs,
    outputBlocks: block.outputBlocks,
    statementInputs: [],
    boundVariables: []
  };
}

function proveForAllData(block, space) {
  return {
    name: "prove for all",
    color: builtinBlockColor,
    inputIds: [],
    outputObjs: block.outputObjs,
    outputBlocks: block.outputBlocks,
    statementInputs: [block.statement],
    boundVariables: [[block.var]]
  };
}

function proveExistsData(block, space) {
  return {
    name: "prove there exists",
    color: builtinBlockColor,
    inputIds: block.inputs,
    outputObjs: [],
    outputBlocks: [],
    statementInputs: [block.statement],
    boundVariables: [[block.var]]
  };
}

function reflexivityData(block, space) {
  return {
    name: "object equals itself",
    color: builtinBlockColor,
    inputIds: block.inputs,
    outputObjs: [],
    outputBlocks: [],
    statementInputs: [],
    boundVariables: []
  };
}

function substituteData(block, space) {
  return {
    name: "substitute equal objects in statement",
    color: builtinBlockColor,
    inputIds: block.inputs,
    outputObjs: block.outputObjs,
    outputBlocks: block.outputBlocks,
    statementInputs: [block.statement],
    boundVariables: [[]]
  };
}

function proofByContradictionData(block, space) {
  return {
    name: "proof by contradiction",
    color: builtinBlockColor,
    inputIds: [],
    outputObjs: block.outputObjs,
    outputBlocks: block.outputBlocks,
    statementInputs: [block.statement],
    boundVariables: [[]]
  };
}

function existsDefinitionData(block, space) {
  return {
    name: "convert exists and for all",
    color: builtinBlockColor,
    inputIds: [],
    outputObjs: block.outputObjs,
    outputBlocks: block.outputBlocks,
    statementInputs: [block.statement],
    boundVariables: [[]]
  };
}

function deletedBlockData() {
  return {
    name: "[deleted block]",
    color: "#000000",
    inputIds: [],
    outputObjs: [],
    outputBlocks: [],
    statementInputs: [],
    boundVariables: []
  };
}

export function theoremBlockData(name, color, statement) {
  return {
    name: name, 
    color: color, 
    inputIds: getTheoremInputIds(statement),
    inputObjs: getTheoremInputs(statement), 
    outputObjs: [], 
    outputBlocks: [],
    statementInputs: [],
    statementInputStrings: getSchemaStatements(statement),
    boundVariables: getFreeVariables(statement)
  };
}

export function proofHeaderData(proof) {
  return {
    name: proof.name,
    color: proof.color,
    inputIds: getTheoremInputIds(proof.statement),
    inputObjs: getTheoremInputs(proof.statement), 
    outputObjs: [], 
    outputBlocks: [], 
    statementInputs: [],
    statementInputStrings: [],
    boundVariables: []
  };
}