import * as sb from "../statement/statement_base.js";

test("assign to statement types", () => {
  expect(sb.assignToStatementTypes("and", [1, 2, 3, 4, 5, 6, 7, 8])).toBe(3);
})

test("make a simple statement", () => {
  expect(sb.makeSimpleStatement("equal", [0, 1])).toStrictEqual({type:"simple", relation:"equal", objects:[0, 1]});
});

test("make a not statement", () => {
  expect(sb.makeNotStatement(sb.makeSimpleStatement("equal", [0, 1]))).toStrictEqual(
    {type:"not", statement:sb.makeSimpleStatement("equal", [0, 1])});
});

test("make an and statement", () => {
  expect(sb.makeAndStatement([])).toStrictEqual({type:"and", statements:[]});
});

test("make an or statement", () => {
  expect(sb.makeOrStatement([sb.makeSimpleStatement("equal", [0, 1])])).toStrictEqual(
    {type:"or", statements:[sb.makeSimpleStatement("equal", [0, 1])]});
});

test("make an if statement", () => {
  expect(sb.makeIfStatement(sb.makeSimpleStatement("foo", [0, 1]), sb.makeSimpleStatement("bar", [2, 0]))).toStrictEqual(
    {type:"implication", first:sb.makeSimpleStatement("foo", [0, 1]), second:sb.makeSimpleStatement("bar", [2, 0])});
});

test("make an if and only if statement", () => {
  expect(sb.makeIffStatement(sb.makeSimpleStatement("foo", [0, 1]), sb.makeSimpleStatement("bar", [2, 0]))).toStrictEqual(
    {type:"equivalence", first:sb.makeSimpleStatement("foo", [0, 1]), second:sb.makeSimpleStatement("bar", [2, 0])});
});

test("make for-all statement without variable index", () => {
  expect(sb.makeForAllStatement("x", "#123456", sb.makeSimpleStatement("foo", [0, 1]))).toStrictEqual(
    {type:"for-all", varName:"x", varColor:"#123456", statement:sb.makeSimpleStatement("foo", [0, 1])});
});

test("make for-all statement with variable index", () => {
  expect(sb.makeForAllStatement("x", "#123456", sb.makeSimpleStatement("foo", [0, 5]), 5)).toStrictEqual(
    {type:"for-all", varName:"x", varColor:"#123456", varIdx:5, statement:sb.makeSimpleStatement("foo", [0, 5])});
});

test("make nested for-all statements", () => {
  expect(sb.makeForAllStatement("x", "#123456", 
    sb.makeForAllStatement("y", "#abcdef", sb.makeSimpleStatement("foo", [2, 0, 1]), 2), 1)).toStrictEqual(
      {type:"for-all", varName:"x", varColor:"#123456", varIdx:1,
        statement:{type:"for-all", varName:"y", varColor:"#abcdef", varIdx:2, statement:sb.makeSimpleStatement("foo", [2, 0, 1])}}
    )
})

test("make exists statement without variable index", () => {
  expect(sb.makeExistsStatement("x", "#123456", sb.makeSimpleStatement("foo", [0, 1]))).toStrictEqual(
    {type:"exists", varName:"x", varColor:"#123456", statement:sb.makeSimpleStatement("foo", [0, 1])});
});

test("make exists statement with variable index", () => {
  expect(sb.makeExistsStatement("x", "#123456", sb.makeSimpleStatement("foo", [0, 5]), 5)).toStrictEqual(
    {type:"exists", varName:"x", varColor:"#123456", varIdx:5, statement:sb.makeSimpleStatement("foo", [0, 5])});
});



test("simple statements equal", () => {
  expect(sb.statementsEqual(sb.makeSimpleStatement("foo", [3, 2, 1]), sb.makeSimpleStatement("foo", [3, 2, 1]))).toBe(true);
})

test("equals statements equal", () => {
  expect(sb.statementsEqual(sb.makeSimpleStatement("equal", [3, 1]), sb.makeSimpleStatement("equal", [1, 3]))).toBe(true);
})

test("simple statements unequal", () => {
  expect(sb.statementsEqual(sb.makeSimpleStatement("foo", [3, 2, 1]), sb.makeSimpleStatement("bar", [3, 2, 1]))).toBe(false);
})

test("simple statements unequal", () => {
  expect(sb.statementsEqual(sb.makeSimpleStatement("foo", [3, 1, 2]), sb.makeSimpleStatement("foo", [3, 2, 1]))).toBe(false);
})

test("identical for-all statements equal", () => {
  expect(sb.statementsEqual(sb.makeForAllStatement("x", "#123456", sb.makeSimpleStatement("foo", [0, 1])),
   sb.makeForAllStatement("x", "#123456", sb.makeSimpleStatement("foo", [0, 1])))).toBe(true);
})

test("for-all statements with different colors/names equal", () => {
  expect(sb.statementsEqual(sb.makeForAllStatement("x", "#123456", sb.makeSimpleStatement("foo", [0, 1])),
   sb.makeForAllStatement("y", "#abcdef", sb.makeSimpleStatement("foo", [0, 1])))).toBe(true);
})

test("for-all statements with the same variable indices equal", () => {
  expect(sb.statementsEqual(sb.makeForAllStatement("x", "#123456", sb.makeSimpleStatement("foo", [0, 1]), 1),
   sb.makeForAllStatement("x", "#123456", sb.makeSimpleStatement("foo", [0, 1]), 1))).toBe(true);
})

test("for-all statements with different variable indices equal", () => {
  expect(sb.statementsEqual(sb.makeForAllStatement("x", "#123456", sb.makeSimpleStatement("foo", [0, 1]), 1),
   sb.makeForAllStatement("x", "#123456", sb.makeSimpleStatement("foo", [0, 2]), 2))).toBe(true);
})

test("for-all statements with different inner statements unequal", () => {
  expect(sb.statementsEqual(sb.makeForAllStatement("x", "#123456", sb.makeSimpleStatement("foo", [0, 1])),
   sb.makeForAllStatement("x", "#123456", sb.makeSimpleStatement("bar", [0, 1])))).toBe(false);
})

test("for-all statements with different inner statement data unequal", () => {
  expect(sb.statementsEqual(sb.makeForAllStatement("x", "#123456", sb.makeSimpleStatement("foo", [0, 1])),
   sb.makeForAllStatement("x", "#123456", sb.makeSimpleStatement("bar", [0, 2])))).toBe(false);
})

test("for-all statements with different variable indices unequal", () => {
  expect(sb.statementsEqual(sb.makeForAllStatement("x", "#123456", sb.makeSimpleStatement("foo", [0, 1]), 1),
   sb.makeForAllStatement("x", "#123456", sb.makeSimpleStatement("foo", [0, 1]), 2))).toBe(false);
})

test("nested for-all statements with different variable indices equal", () => {
  expect(sb.statementsEqual(sb.makeForAllStatement("x", "#123456", 
    sb.makeForAllStatement("y", "#abcdef", sb.makeSimpleStatement("foo", [2, 0, 1]), 2), 1),
   sb.makeForAllStatement("x", "#123456", 
    sb.makeForAllStatement("y", "#abcdef", sb.makeSimpleStatement("foo", [1, 0, 2]), 1), 2))).toBe(true);
})

test("nested for-all statements with different variable indices equal", () => {
  expect(sb.statementsEqual(sb.makeForAllStatement("x", "#123456", 
    sb.makeForAllStatement("y", "#abcdef", sb.makeSimpleStatement("foo", [2, 0, 1]), 2), 0),
   sb.makeForAllStatement("x", "#123456", 
    sb.makeForAllStatement("y", "#abcdef", sb.makeSimpleStatement("foo", [4, 3, 1]), 4), 3))).toBe(true);
})

test("nested for-all statements with different variable indices unequal", () => {
  expect(sb.statementsEqual(sb.makeForAllStatement("x", "#123456", 
    sb.makeForAllStatement("y", "#abcdef", sb.makeSimpleStatement("foo", [2, 0, 1]), 2), 1),
   sb.makeForAllStatement("x", "#123456", 
    sb.makeForAllStatement("y", "#abcdef", sb.makeSimpleStatement("foo", [2, 0, 1]), 1), 2))).toBe(false);
})

test("symmetry holds for equality", () => {
  expect(sb.statementsEqual(sb.makeSimpleStatement("equal", [2, 0]), sb.makeSimpleStatement("equal", [0, 2]))).toBe(true);
})

test("symmetry of equality does not give incorrect positives", () => {
  expect(sb.statementsEqual(sb.makeSimpleStatement("equal", [2, 2]), sb.makeSimpleStatement("equal", [0, 2]))).toBe(false);
})

test("symmetry holds for equality in for-all", () => {
  expect(sb.statementsEqual(sb.makeForAllStatement("x", "#123456", 
    sb.makeSimpleStatement("equal", [2, 0]), 2), 
    sb.makeForAllStatement("x", "#123456", 
      sb.makeSimpleStatement("equal", [0, 4]), 4))).toBe(true);
})