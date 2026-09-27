import { createCompleteGoal, createTheoremAppFromTheorem, makeForAllBlock } from "../block/block_base"
import { emptyOutputObj } from "../object/object_base";
import { emptyStatement, makeAxiomSchema, makeExistsStatement, makeForAllStatement, makeSimpleStatement } from "../statement/statement_base";

const exForAll1 = makeForAllStatement("x", "#123456", 
        makeForAllStatement("y", "#abcdef", makeSimpleStatement("foobar", [0, 1, 0])));
const exExists1 = makeExistsStatement("x", "#123456", 
        makeExistsStatement("y", "#abcdef", makeSimpleStatement("foobar", [0, 1, 0]), 1), 0);
const exSchema1 = makeAxiomSchema("s1", 2, makeAxiomSchema("s2", 1, exForAll1));

test("create theorem application from theorem", () => {
  expect(createTheoremAppFromTheorem(3, exForAll1)).toStrictEqual(
    {type: "theorem-app",
    theorem: 3,
    inputs: [-1,-1],
    outputObjs: [],
    outputBlocks: [],
    statementInputs: [],
    boundVariables: []
  });
})

test("create theorem application from axiom schema", () => {
  expect(createTheoremAppFromTheorem(3, exSchema1)).toStrictEqual(
    {type: "theorem-app",
    theorem: 3,
    inputs: [-1,-1],
    outputObjs: [],
    outputBlocks: [],
    statementInputs: [emptyStatement(), emptyStatement()],
    boundVariables: [[emptyOutputObj, emptyOutputObj], [emptyOutputObj]]
  });
})

test("create for all block", () => {
  expect(makeForAllBlock(2, exForAll1)).toStrictEqual(
    {type: "for-all-block",
    id: 2,
    inputs: [-1, -1],
    outputObjs: [],
    outputBlocks: []
  });
})

test("create complete goal block", () => {
  expect(createCompleteGoal([exExists1])).toStrictEqual({type: "complete-goal", inputs: [-1, -1], successful: false})
})