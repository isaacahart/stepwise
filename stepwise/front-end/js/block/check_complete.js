import { statementInSpace, tautologicallyImpliedInSpace } from "../space/space_base.js";
import { assignObjectToQuantifier } from "../theorem/assign_objects.js";
import { countExistStatements } from "../theorem/theorem_base.js";


export function checkComplete(block, space, goals) {
  // has the goal been completed //
  if (block.type !== "complete-goal") {
    return false;
  }

  goals = structuredClone(goals);
  var inputIdx = 0;
  var complete = true;

  for (var i = 0; i < goals.length; i++) {
    const loopCount = countExistStatements(goals[i])
    for (var j = 0; j < loopCount; j++) {
      if (inputIdx >= block.inputs.length) {
        goals[i] = assignObjectToQuantifier(goals[i], -1);
        block.inputs.push(-1);
      } else {
        goals[i] = assignObjectToQuantifier(goals[i], block.inputs[inputIdx]);
      }
      inputIdx++;
    }

    if (!tautologicallyImpliedInSpace(goals[i], space)) {
      complete = false;
    }
  }

  block.inputs.splice(inputIdx);

  block.successful = complete;
  return complete;
}