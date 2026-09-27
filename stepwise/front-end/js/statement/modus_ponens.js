
import { listContainsStatement, makeIfStatement, makeNotStatement, statementsEqual, trueByReflexivity } from "./statement_base.js";
import { tautologicallyImplies } from "./tautologies.js";

export function applyModusPonens(sta1, sta2) {
  return applyModusPonensWithPredicate(sta1, sta2, statementsEqual);
}

export function applyModusPonensWithTautologies(sta1, sta2) {
  return applyModusPonensWithPredicate(sta1, sta2, tautologicallyImplies);
}

export function applyModusPonensWithMinimalLogic(sta1, sta2) {
  return applyModusPonensWithPredicate(sta1, sta2, impliesWithMinimalLogic);
}

function applyModusPonensWithPredicate(sta1, sta2, implyPredicate) {
  var newStas = [];
  if (sta2.type == "implication" || sta2.type == "equivalence") {
    if (implyPredicate(sta1, sta2.first)) {
      newStas.push(sta2.second);
    } else if (implyPredicate(sta1, makeNotStatement(sta2.second))) {
      newStas.push(makeNotStatement(sta2.first));
    }
  }
  if (sta2.type == "equivalence") {
    if (implyPredicate(sta1, sta2.second)) {
      newStas.push(sta2.first);
    } else if (implyPredicate(sta1, makeNotStatement(sta2.first))) {
      newStas.push(makeNotStatement(sta2.second));
    }
  }
  return newStas;
}

// certain common cases of tautological implication that can be checked much more quickly
export function impliesWithMinimalLogic(sta1, sta2) {
  if (trueByReflexivity(sta2)) {
    return true;
  } else if (statementsEqual(sta1, sta2)) {
    return true;
  } else if (sta1.type == "and") {
    return statementsImplyWithMinimalLogic(sta1.statements, sta2);
  } else if (sta2.type == "or") {
    if (sta1.type == "or") {
      return sta1.statements.every(elt => listContainsStatement(sta2.statements, elt));
    } else {
      return listContainsStatement(sta2.statements, sta1);
    }
  } else {
    return false;
  }
}

function statementsImplyWithMinimalLogic(staList, sta2) {
  if (staList.some(elt => impliesWithMinimalLogic(elt, sta2))) {
    return true;
  } else if (sta2.type == "and") {
    return sta2.statements.every(elt => listContainsStatement(staList, elt));
  } else if (sta2.type == "or") {
    return sta2.statements.some(elt => listContainsStatement(staList, elt));
  } else if (sta2.type == "equivalence") {
    return listContainsStatement(staList, makeIfStatement(sta2.first, sta2.second))
      && listContainsStatement(staList, makeIfStatement(sta2.second, sta2.first));
  } else {
    return false;
  }
}