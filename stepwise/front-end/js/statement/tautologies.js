
import { assignToStatementTypes, makeIfStatement, makeNotStatement, statementsEqual } from "./statement_base.js";

export function tautologicallyImplies(sta1, sta2) {
  return isTautology(makeIfStatement(sta1, sta2));
}


export function isTautology(sta) {
  return !isSatisfiable(makeNotStatement(sta));
}


// Is the statement satisfiable?
// This uses a bad brute-force algorithm, I will probably improve this at some point
export function isSatisfiable(sta) {
  var primes = getPrimeFormulasIn(sta);
  var assignment = new Array(primes.length);

  for (var i = 0; i < 2**primes.length; i++) {
    if (tryTruthAssignment(sta, assignment, primes)) {
      return true;
    }
    nextAssignment(assignment);
  }
  return false;
}

function nextAssignment(assignment) {
  for (var i = 0; i < assignment.length; i++) {
    if (assignment[i] === 1) {
      assignment[i] = 0;
    } else {
      assignment[i] = 1;
      return;
    }
  }
}

function tryTruthAssignment(sta, assignment, primes) {
  var f = assignToStatementTypes(sta.type, [
    tryTruthAssignmentPrime,
    tryTruthAssignmentNot,
    tryTruthAssignmentAnd,
    tryTruthAssignmentOr,
    tryTruthAssignmentIf,
    tryTruthAssignmentIff,
    tryTruthAssignmentPrime,
    tryTruthAssignmentPrime,
    tryTruthAssignmentPrime,
    tryTruthAssignmentPrime
  ])
  return f(sta, assignment, primes);
}

function tryTruthAssignmentPrime(sta, assignment, primes) {
  for (var i = 0; i < primes.length; i++) {
    if (statementsEqual(sta, primes[i])) {
      return assignment[i] == 1;
    }
  }
  return false;
}

function tryTruthAssignmentNot(sta, assignment, primes) {
  return !tryTruthAssignment(sta.statement, assignment, primes);
}

function tryTruthAssignmentAnd(sta, assignment, primes) {
  return sta.statements.every(function(s) {return tryTruthAssignment(s, assignment, primes);});
}

function tryTruthAssignmentOr(sta, assignment, primes) {
  return sta.statements.some(function(s) {return tryTruthAssignment(s, assignment, primes);});
}

function tryTruthAssignmentIf(sta, assignment, primes) {
  return !tryTruthAssignment(sta.first, assignment, primes) || tryTruthAssignment(sta.second, assignment, primes);
}

function tryTruthAssignmentIff(sta, assignment, primes) {
  return tryTruthAssignment(sta.first, assignment, primes) === tryTruthAssignment(sta.second, assignment, primes);
}


// returns the set of prime formulas (simple relations or quantifiers) in the statement
export function getPrimeFormulasIn(sta) {
  if (sta.type == "simple" || sta.type == "for-all" || sta.type == "exists" || sta.type == "axiom-schema" || sta.type == "statement-app") {
    return [sta];
  } else if (sta.type == "not") {
    return getPrimeFormulasIn(sta.statement);
  } else if (sta.type == "and" || sta.type == "or") {
    var out = [];
    for (var i = 0; i < sta.statements.length; i++) {
      var outCount = out.length;
      var primes = getPrimeFormulasIn(sta.statements[i]);
      for (var j = 0; j < primes.length; j++) {
        var isDuplicate = false;
        for (var k = 0; k < outCount; k++) {
          if (statementsEqual(primes[j], out[k])) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) {
          out.push(primes[j]);
        }
      }
    }
    return out;
  } else if (sta.type == "implication" || sta.type == "equivalence") {
    var out = getPrimeFormulasIn(sta.first);
    var outCount = out.length;
    var secondPrimes = getPrimeFormulasIn(sta.second);
    for (var j = 0; j < secondPrimes.length; j++) {
      var isDuplicate = false;
      for (var k = 0; k < outCount; k++) {
        if (statementsEqual(secondPrimes[j], out[k])) {
          isDuplicate = true;
          break;
        }
      }
      if (!isDuplicate) {
        out.push(secondPrimes[j]);
      }
    }
    return out;
  } else {
    return [];
  }
}

export function hasPrimeFormulas(sta, primes) {
  if (sta.type == "simple" || sta.type == "for-all" || sta.type == "exists" || sta.type == "axiom-schema" || sta.type == "statement-app") {
    return primes.some(function(prime) {
      return statementsEqual(sta, prime);
    });
  } else if (sta.type == "not") {
    return hasPrimeFormulas(sta.statement);
  } else if (sta.type == "and" || sta.type == "or") {
    return sta.statements.every(function(s) {
      return hasPrimeFormulas(s, primes);
    });
  } else if (sta.type == "implication" || sta.type == "equivalence") {
    return hasPrimeFormulas(sta.first, primes) && hasPrimeFormulas(sta.second, primes);
  } else {
    return false;
  }
}