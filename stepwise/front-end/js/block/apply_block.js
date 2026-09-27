
import { assignToBlockTypes, defaultBlockColor, defaultBlockName } from "./block_base.js";
import { addStatementsToSpaceWithModusPonens, getStatementFromCreatedBlock, impliedWithMinimalLogicInSpace, lookupTheoremInSpace, tautologicallyImpliedInSpace } from "../space/space_base.js";
import { assignObjects } from "../theorem/assign_objects.js";
import { makeObject } from "../object/object_base.js";
import { clearStatement, makeExistsStatement, makeForAllStatement, makeIfStatement, makeNotStatement, makeSimpleStatement } from "../statement/statement_base.js";
import { applyModusPonens } from "../statement/modus_ponens.js";
import { closeSpaceBranch } from "../space/intermediate_spaces.js";
import { beginSubproof } from "../proof/proof_base.js";
import { getBlockData } from "./block_data.js";
import { anyVariablesUndefined } from "../statement/statement_checks.js";
import { replaceObjectInStatement } from "../statement/replace_variable.js";
import { assignStatements } from "../theorem/assign_statement.js";


export function applyBlock(block, space, proof) {
  /* apply the block to the space, which can add new statements, objects, or blocks, or modify the current subproof of the proof */
  var f = assignToBlockTypes(block.type, [
    applyTheoremApp,
    applyForAllBlock,
    (block, space, proof) => {},
    applyTautologyBlock,
    applyModusPonensBlock,
    applyProveIfBlock,
    applyCBlockClose,
    applyProveForAllBlock,
    applyProveExistsBlock,
    applyReflexivityBlock,
    applySubstituteBlock,
    applyProofByContradictionBlock,
    applyExistsDefinitionBlock
  ]);
  clearUndefinedStatements(block, space);
  return f(block, space, proof);
}

function applyTheoremApp(block, space, proof) {
  var thm = lookupTheoremInSpace(space, block.theorem);
  if (thm == null) {
    return;
  }
  var newSta = assignStatements(thm.statement, block.statementInputs, space.objects.length);
  newSta = assignObjects(newSta, block.inputs, space.objects.length);
  applyStatementBlock(block, newSta, space);
}

function applyForAllBlock(block, space, proof) {
  var newSta = getStatementFromCreatedBlock(space, block.id);
  if (newSta === undefined) {
    return;
  }
  applyStatementBlock(block, assignObjects(newSta, block.inputs, space.objects.length), space);
}

function applyTautologyBlock(block, space, proof) {
  if (tautologicallyImpliedInSpace(block.statement, space)) {
    applyStatementBlock(block, block.statement, space);
  }
}

function applyModusPonensBlock(block, space, proof) {
  var newStas = applyModusPonens(block.sta1, makeIfStatement(block.sta1, block.sta2));
  if (newStas.length > 0) {
    applyStatementBlock(block, newStas[0], space);
  }
}

function applyProveIfBlock(block, space, proof) {
  beginSubproof(proof, space, makeIfStatement(block.sta1, block.sta2), [block.sta2]);
  applyStatementBlock(block, block.sta1, space);
}

function applyCBlockClose(block, space, proof) {
  const idx = space.openBranches[space.openBranches.length-1]
  closeSpaceBranch(space);
  if (proof.subproofs[idx].complete) {
    applyStatementBlock(block, proof.subproofs[idx].statement, space);
  } else {
    block.outputObjs = [];
    block.outputBlocks = [];
  }
}

function applyProveForAllBlock(block, space, proof) {
  beginSubproof(proof, space, makeForAllStatement(block.var.name, block.var.color, block.statement, space.objects.length), [block.statement]);
  space.objects.push(block.var);
}

function applyProveExistsBlock(block, space, proof) {
  if (block.inputs.length == 0) {
    return;
  }
  if (impliedWithMinimalLogicInSpace(replaceObjectInStatement(block.statement, space.objects.length, block.inputs[0]), space)) {
    space.statements.push(makeExistsStatement(block.var.name, block.var.color, block.statement, space.objects.length));
  }
}

function applyReflexivityBlock(block, space, proof) {
  if (block.inputs[0] >= 0) {
    space.statements.push(makeSimpleStatement("equal", [block.inputs[0], block.inputs[0]]));
  }
}

function applySubstituteBlock(block, space, proof) {
  if (block.inputs[0] < 0 || block.inputs[1] < 0) {
    return;
  }
  if (impliedWithMinimalLogicInSpace(makeSimpleStatement("equal", [block.inputs[0], block.inputs[1]]), space)) {
    if (impliedWithMinimalLogicInSpace(block.statement, space)) {
      applyStatementBlock(block, replaceObjectInStatement(block.statement, block.inputs[0], block.inputs[1]), space);
    }
  }
}

function applyProofByContradictionBlock(block, space, proof) {
  beginSubproof(proof, space, block.statement, [block.statement]);
  if (block.statement.type == "not") {
    applyStatementBlock(block, block.statement.statement, space);
  } else {
    applyStatementBlock(block, makeNotStatement(block.statement), space);
  }
}

function applyExistsDefinitionBlock(block, space, proof) {
  if (!impliedWithMinimalLogicInSpace(block.statement, space)) {
    block.outputObjs = [];
    block.outputBlocks = [];
    return;
  }
  var sta = block.statement;
  if (sta.type == "for-all") {
    applyStatementBlock(block, makeNotStatement(makeExistsStatement(sta.varName, sta.varColor, makeNotStatement(sta.statement), sta.varIdx)), space);
  } else if (sta.type == "exists") {
    applyStatementBlock(block, makeNotStatement(makeForAllStatement(sta.varName, sta.varColor, makeNotStatement(sta.statement), sta.varIdx)), space);
  } else if (sta.type == "not") {
    var sta2 = sta.statement
    if (sta2.type == "for-all") {
      applyStatementBlock(block, makeExistsStatement(sta2.varName, sta2.varColor, makeNotStatement(sta2.statement), sta2.varIdx), space);
    } else if (sta2.type == "exists") {
      applyStatementBlock(block, makeForAllStatement(sta2.varName, sta2.varColor, makeNotStatement(sta2.statement), sta2.varIdx), space);
    }
  } 
}

function applyStatementBlock(block, statement, space) {
  var outputs = addStatementsToSpaceWithModusPonens(statement, space, structuredClone(block.outputObjs), structuredClone(block.outputBlocks));

  fixOutputs(block.outputBlocks, outputs.blocks.length, () => makeObject(defaultBlockName, defaultBlockColor));
  fixOutputs(block.outputObjs, outputs.objs, () => makeObject("", "#000000"));
}

function fixOutputs(outputList, count, defaultConstructor) {
  if (count >= outputList.length) {
    // add outputs
    for (var i = outputList.length; i < count; i++) {
      outputList.push(defaultConstructor());
    }
  } else {
    // remove outputs
    outputList.splice(count);
  }
}

function clearUndefinedStatements(block, space) {
  var data = getBlockData(block, space);
  var stas = data.statementInputs;
  for (var i = 0; i < stas.length; i++) {
    var len = space.objects.length + data.boundVariables.length;
    if (anyVariablesUndefined(stas[i], [...Array(len).keys()])) {
      clearStatement(stas[i]);
    }
  }
}

export function subproofFailed(block, space, proof) {
  if (block.type != "close-c-block" || space.openBranches.length == 0) {
    return false;
  }
  const idx = space.openBranches[space.openBranches.length-1]
  return !proof.subproofs[idx].complete
}