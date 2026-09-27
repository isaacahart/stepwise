import { assignToStatementTypes } from "./statement_base";

export function anyVariablesUndefined(statement, variables) {
  var f = assignToStatementTypes(statement.type, [
    variablesUndefinedSimple,
    variablesUndefinedNot,
    variablesUndefinedAndOr,
    variablesUndefinedAndOr,
    variablesUndefinedIf,
    variablesUndefinedIf,
    variablesUndefinedQuantifier,
    variablesUndefinedQuantifier,
    () => true,
    () => true
  ]);
  return f(statement, variables);
}

function variablesUndefinedSimple(sta, vars) {
  return sta.objects.some(obj => !vars.includes(obj));
}

function variablesUndefinedNot(sta, vars) {
  return anyVariablesUndefined(sta.statement, vars);
}

function variablesUndefinedAndOr(sta, vars) {
  return sta.statements.some(s => anyVariablesUndefined(s, vars));
}

function variablesUndefinedIf(sta, vars) {
  return anyVariablesUndefined(sta.first, vars) || anyVariablesUndefined(sta.second, vars);
}

function variablesUndefinedQuantifier(sta, vars) {
  return anyVariablesUndefined(sta.statement, [...vars, sta.varIdx]);
}