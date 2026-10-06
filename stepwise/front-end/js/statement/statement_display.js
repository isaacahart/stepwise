import { goodTextColor, normalTextColor } from "../drawing/drawing_base.js";
import { emptySpace, impliedWithMinimalLogicInSpace } from "../space/space_base.js";
import { assignToStatementTypes, statementTypes } from "./statement_base.js";

const indentChar = "|  ";

export function makeStatementString(sta, objects, vars={}, varIdx=0, indent="", oneLine=false, schemaStas=[], outerInputNums=[]) {
  // return a list representing one or more lines of text in a string representation of the given statement
  var f = assignToStatementTypes(sta.type, [
    statementStringSimple,
    statementStringNot,
    statementStringAndOr,
    statementStringAndOr,
    statementStringIf,
    statementStringIff,
    statementStringForAll,
    statementStringExists,
    statementStringAxiomSchema,
    statementStringStatementApp
  ]);
  if (oneLine) {
    var lst = f(sta, objects, vars, varIdx, " ", oneLine, schemaStas, outerInputNums);
    var out = ""
    for (var i = 0; i < lst.length; i++) {
      out += lst[i];
    }
    return out;
  } else {
    return f(sta, objects, vars, varIdx, indent, oneLine, schemaStas, outerInputNums);
  }
}

function statementStringSimple(sta, objects, vars, varIdx, indent) {
  var objNames = []
  for (var i = 0; i < sta.objects.length; i++) {
    var obj = sta.objects[i];
    if (obj in vars) {
      objNames.push(vars[obj]);
    } else if (obj < objects.length && obj >= 0) {
      objNames.push(objects[obj].name);
    } else {
      objNames.push("[undefined]");
    }
  }
  
  if (objNames.length == 1) {
    return [indent + objNames[0] + " is " + sta.relation];
  } else if (objNames.length > 1) {
    var out = indent + objNames[0] + " is " + sta.relation + ": ";
    for (var i = 1; i < objNames.length; i++) {
      out += objNames[i];
      if (i < objNames.length-1) {
        out += ", ";
      }
    }
    return [out];
  } else {
    return [indent + sta.relation];
  }
}

function statementStringNot(sta, objects, vars, varIdx, indent, oneLine, schemaStas) {
  var lines = [indent + "not:"];
  lines.push(...makeStatementString(sta.statement, objects, vars, varIdx, indent + indentChar, oneLine, schemaStas, []));
  return lines;
}

function statementStringAndOr(sta, objects, vars, varIdx, indent, oneLine, schemaStas) {
  var lines = [];
  for (var i = 0; i < sta.statements.length; i++) {
    if (i > 0) {
      lines.push(indent + sta.type);
    }
    lines.push(...makeStatementString(sta.statements[i], objects, vars, varIdx, indent + indentChar, oneLine, schemaStas, []));
  }
  return lines;
}

function statementStringIf(sta, objects, vars, varIdx, indent, oneLine, schemaStas) {
  var lines = [indent + "if:"];
  lines.push(...makeStatementString(sta.first, objects, vars, varIdx, indent + indentChar, oneLine, schemaStas, []));
  lines.push(indent + "then:");
  lines.push(...makeStatementString(sta.second, objects, vars, varIdx, indent + indentChar, oneLine, schemaStas, []));
  return lines;
}

function statementStringIff(sta, objects, vars, varIdx, indent, oneLine, schemaStas) {
  var lines = [];
  lines.push(...makeStatementString(sta.first, objects, vars, varIdx, indent + indentChar, oneLine, schemaStas, []));
  lines.push(indent + "if and only if");
  lines.push(...makeStatementString(sta.second, objects, vars, varIdx, indent + indentChar, oneLine, schemaStas, []));
  return lines;
}

function statementStringForAll(sta, objects, vars, varIdx, indent, oneLine, schemaStas, outerInputNums) {
  if (outerInputNums.length > 0) {
    var varName = "input" + outerInputNums[0].toString();
    var newOuterInputNums = outerInputNums.slice(1, outerInputNums.length);
  } else {
    var varName = sta.varName;
    var newOuterInputNums = [];
  }
  var lines = [indent + "for all " + varName + ":"];
  var newVars = {...vars};
  if ("varIdx" in sta) {
    newVars[sta.varIdx] = varName;
  } else {
    newVars[varIdx] = varName;
  }
  lines.push(...makeStatementString(sta.statement, objects, newVars, varIdx+1, indent + indentChar, oneLine, schemaStas, newOuterInputNums));
  return lines;
}

function statementStringExists(sta, objects, vars, varIdx, indent, oneLine, schemaStas) {
  var lines = [indent + "there exists a " + sta.varName + " such that:"];
  var newVars = {...vars};
  if ("varIdx" in sta) {
    newVars[sta.varIdx] = sta.varName;
  } else {
    newVars[varIdx] = sta.varName;
  }
  lines.push(...makeStatementString(sta.statement, objects, newVars, varIdx+1, indent + indentChar, oneLine, schemaStas, []));
  return lines;
}

function statementStringAxiomSchema(sta, objects, vars, varIdx, indent, oneLine, schemaStas) {
  var lines = [indent + "given any statement " + sta.staName + " with " + sta.freeVars + " free variables:"];
  lines.push(...makeStatementString(sta.statement, objects, vars, varIdx, indent + indentChar, oneLine, [...schemaStas, sta.staName], []));
  return lines;
}

function statementStringStatementApp(sta, objects, vars, varIdx, indent, oneLine, schemaStas) {
  var objNames = [];
  for (var i = 0; i < sta.inputVars.length; i++) {
    var obj = sta.inputVars[i];
    if (obj in vars) {
      objNames.push(vars[obj]);
    } else if (obj < objects.length && obj >= 0) {
      objNames.push(objects[obj].name);
    } else {
      objNames.push("[undefined]");
    }
  }
  
  if (objNames.length == 0) {
    return [indent + schemaStas[sta.staIdx] + " is true"];
  } else {
    var out = indent + schemaStas[sta.staIdx] + " is true of: ";
    for (var i = 0; i < objNames.length; i++) {
      out += objNames[i];
      if (i < objNames.length-1) {
        out += ", ";
      }
    }
    return [out];
  }
}

export function makeStatementListStrings(stas, objects) {
  var out = [];
  for (var i = 0; i < stas.length; i++) {
    out.push(...makeStatementString(stas[i], objects));
    out.push("");
  }
  return out;
}

export function makeStatementListStringsWithOuterInputs(stas, objects, outerInputNums) {
  var out = [];
  for (var i = 0; i < stas.length; i++) {
    if (i == 0) {
      out.push(...makeStatementString(stas[i], objects, {}, 0, "", false, [], outerInputNums));
    } else {
      out.push(...makeStatementString(stas[i], objects));
    }
    out.push("");
  }
  return out;
}

export function makeStatementStringOneLine(sta, objects) {
  return makeStatementString(sta, objects, {}, 0, "", true).slice(1);
}

export function stringifyStatementList(stas, objects) {
  return stas.map(sta => makeStatementStringOneLine(sta, objects));
}


export function colorStatementString(sta, space) {
  // return a list representing one or more lines of text in a string representation of the given statement
  var f = assignToStatementTypes(sta.type, [
    colorStatementSimple,
    colorStatementNot,
    colorStatementAndOr,
    colorStatementAndOr,
    colorStatementIf,
    colorStatementIff,
    colorStatementForAll,
    colorStatementExists,
    colorStatementAxiomSchema,
    () => [normalTextColor]
  ]);
  return f(sta, space);
}

function colorStatementSimple(sta, space) {
  if (impliedWithMinimalLogicInSpace(sta, space)) {
    return [goodTextColor];
  } else {
    return [normalTextColor];
  }
}

function colorStatementNot(sta, space) {
  var lines = [impliedWithMinimalLogicInSpace(sta, space) ? goodTextColor : normalTextColor];
  lines.push(...colorStatementString(sta.statement, space));
  return lines;
}

function colorStatementAndOr(sta, space) {
  var c = impliedWithMinimalLogicInSpace(sta, space) ? goodTextColor : normalTextColor
  var lines = [];
  for (var i = 0; i < sta.statements.length; i++) {
    if (i > 0) {
      lines.push(c);
    }
    lines.push(...colorStatementString(sta.statements[i], space));
  }
  return lines;
}

function colorStatementIf(sta, space) {
  var c = impliedWithMinimalLogicInSpace(sta.first, space) ? goodTextColor : normalTextColor
  var lines = [c];
  lines.push(...colorStatementString(sta.first, space));
  lines.push(c);
  lines.push(...colorStatementString(sta.second, space));
  return lines;
}

function colorStatementIff(sta, space) {
  var lines = [];
  lines.push(...colorStatementString(sta.first, space));
  lines.push((impliedWithMinimalLogicInSpace(sta.first, space) || impliedWithMinimalLogicInSpace(sta.second, space)) ? goodTextColor : normalTextColor);
  lines.push(...colorStatementString(sta.second, space));
  return lines;
}

function colorStatementForAll(sta, space) {
  var lines = [impliedWithMinimalLogicInSpace(sta, space) ? goodTextColor : normalTextColor];
  lines.push(...colorStatementString(sta.statement, emptySpace()));
  return lines;
}

function colorStatementExists(sta, space) {
  var lines = [impliedWithMinimalLogicInSpace(sta, space) ? goodTextColor : normalTextColor];
  lines.push(...colorStatementString(sta.statement, emptySpace()));
  return lines;
}

function colorStatementAxiomSchema(sta, space) {
  var lines = [normalTextColor];
  lines.push(...colorStatementString(sta.statement, emptySpace()));
  return lines;
}

export function colorStatementListStrings(stas, objects) {
  var out = [];
  for (var i = 0; i < stas.length; i++) {
    out.push(...colorStatementString(stas[i], objects));
    out.push(normalTextColor);
  }
  return out;
}

function statementComparator(sta1, sta2) {
  if (sta1.type == sta2.type && sta1.type == "simple") {
    if (sta1.relation > sta2.relation) {
      return 1;
    } else if (sta1.relation < sta2.relation) {
      return -1;
    } else {
      return 0;
    }
  } else {
    return statementTypes.indexOf(sta1.type) - statementTypes.indexOf(sta2.type);
  }
}

export function sortStatements(statements) {
  var newStas = [...statements];
  newStas.sort(statementComparator);
  return newStas;
}