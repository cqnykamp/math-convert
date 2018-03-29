import latexToAst from '../src/latex-to-ast';
import { ParseError } from '../src/error';

var converter = new latexToAst();

var trees = {
  '\\frac{1}{2} x': ['*',['/',1,2],'x'],	
  '1+x+3': ['+',1,'x',3],
  '1-x-3': ['+',1,['-','x'],['-',3]],	
  "1 + - x": ['+',1,['-','x']],
  "1 - - x": ['+',1,['-',['-','x']]],
  'x^2': ['^', 'x', 2],
  '\\log x': ['apply', 'log', 'x'],
  '\\ln x': ['apply', 'ln', 'x'],
  '-x^2': ['-',['^', 'x', 2]],
  '|x|': ['apply', 'abs','x'],
  '|\\sin|x||': ['apply', 'abs', ['apply', 'sin', ['apply', 'abs', 'x']]],
  'x^47': ['^', 'x', 47],
  'x^ab': ['*', ['^', 'x', 'a'], 'b'],
  'x^a!':  ['^', 'x', ['apply', 'factorial', 'a']],
  'xyz': ['*','x','y','z'],
  'c(a+b)': ['*', 'c', ['+', 'a', 'b']],
  '(a+b)c': ['*', ['+', 'a', 'b'], 'c'],
  'a!': ['apply', 'factorial','a'],
  '\\theta': 'theta',
  'theta': ['*', 't', 'h', 'e', 't', 'a'],
  '\\cos(\\theta)': ['apply', 'cos','theta'],
  'cos(x)': ['*', 'c', 'o', 's', 'x'],
  '|\\sin(|x|)|': ['apply', 'abs', ['apply', 'sin', ['apply', 'abs', 'x']]],
  '\\var{blah}(x)': ['*', 'blah', 'x'],
  '|x+3=2|': ['apply', 'abs', ['=', ['+', 'x', 3], 2]],
  'x_y_z': ['_', 'x', ['_','y','z']],
  'x_{y_z}': ['_', 'x', ['_','y','z']],
  '{x_y}_z': ['_', ['_', 'x', 'y'],'z'],
  'x^y^z': ['^', 'x', ['^','y','z']],
  'x^{y^z}': ['^', 'x', ['^','y','z']],
  '{x^y}^z': ['^', ['^', 'x', 'y'],'z'],
  'x^y_z': ['^', 'x', ['_','y','z']],
  'x_y^z': ['^', ['_','x','y'],'z'],
  'xyz!': ['*','x','y', ['apply', 'factorial', 'z']],
  'x': 'x',
  'f': 'f',
  'fg': ['*', 'f','g'],
  'f+g': ['+', 'f', 'g'],
  'f(x)': ['apply', 'f', 'x'],
  'f(x,y,z)': ['apply', 'f', ['tuple', 'x', 'y', 'z']],
  'fg(x)': ['*', 'f', ['apply', 'g', 'x']],
  'fp(x)': ['*', 'f', 'p', 'x'],
  'fx': ['*', 'f', 'x'],
  'f\'': ['prime', 'f'],
  'fg\'': ['*', 'f', ['prime', 'g']],
  'f\'g': ['*', ['prime', 'f'], 'g'],
  'f\'g\'\'': ['*', ['prime', 'f'], ['prime', ['prime', 'g']]],
  'x\'': ['prime', 'x'],
  'f\'(x)' : ['apply', ['prime', 'f'], 'x'],
  'f(x)\'' : ['prime', ['apply', 'f', 'x']],
  '\\sin(x)\'': ['prime', ['apply', 'sin', 'x']],
  '\\sin\'(x)': ['apply', ['prime', 'sin'], 'x'],
  'f\'\'(x)': ['apply', ['prime', ['prime', 'f']],'x'],
  '\\sin(x)\'\'': ['prime', ['prime', ['apply','sin','x']]],
  'f(x)^t_y': ['^', ['apply', 'f','x'], ['_','t','y']],
  'f_t(x)': ['apply', ['_', 'f', 't'], 'x'],
  'f(x)_t': ['_', ['apply', 'f', 'x'], 't'],
  'f^2(x)': ['apply', ['^', 'f', 2], 'x'],
  'f(x)^2': ['^', ['apply', 'f', 'x'],2],
  'f\'^a(x)': ['apply', ['^', ['prime', 'f'], 'a'], 'x'],
  'f^a\'(x)': ['apply', ['^', 'f', ['prime', 'a']], 'x'],
  'f_a^b\'(x)': ['apply', ['^', ['_', 'f', 'a'], ['prime', 'b']],'x'],
  'f_a\'^b(x)': ['apply', ['^', ['prime', ['_', 'f','a']],'b'],'x'],
  '\\sin x': ['apply', 'sin', 'x'],
  'f x': ['*', 'f', 'x'],
  '\\sin^xyz': ['*', ['apply', ['^', 'sin', 'x'], 'y'], 'z'],
  '\\sin xy': ['*', ['apply', 'sin', 'x'], 'y'],
  '\\sin^2(x)': ['apply', ['^', 'sin', 2], 'x'],
  '\\exp(x)': ['apply', 'exp', 'x'],
  'e^x': ['^', 'e', 'x'],
  'x^2!': ['^', 'x', ['apply', 'factorial', 2]],
  'x^2!!': ['^', 'x', ['apply', 'factorial', ['apply', 'factorial', 2]]],
  'x_t^2': ['^', ['_', 'x', 't'], 2],
  'x_f^2': ['_', 'x', ['^', 'f', 2]],
  'x_t\'': ['prime', ['_', 'x', 't']],
  'x_f\'': ['_', 'x', ['prime', 'f']],
  '(x,y,z)': ['tuple', 'x', 'y', 'z'],
  '(x,y)-[x,y]': ['+', ['tuple','x','y'], ['-', ['array','x','y']]],
  '2[z-(x+1)]': ['*', 2, ['+', 'z', ['-', ['+', 'x', 1]]]],
  '\\{1,2,x\\}': ['set', 1, 2, 'x'],
  '\\{x, x\\}': ['set', 'x', 'x'],
  '\\{x\\}': ['set', 'x'],
  '(1,2]': ['interval', ['tuple', 1, 2], ['tuple', false, true]],
  '[1,2)': ['interval', ['tuple', 1, 2], ['tuple', true, false]],
  '[1,2]': ['array', 1, 2 ],
  '(1,2)': ['tuple', 1, 2 ],
  '1,2,3': ['list', 1, 2, 3],
  'x=a': ['=', 'x', 'a'],
  'x=y=1': ['=', 'x', 'y', 1],
  'x=(y=1)': ['=', 'x', ['=', 'y', 1]],
  '(x=y)=1': ['=', ['=','x', 'y'], 1],
  '7 \\ne 2': ['ne', 7, 2],
  '7 \\neq 2': ['ne', 7, 2],
  '\\lnot x=y': ['not', ['=', 'x', 'y']],
  '\\lnot (x=y)': ['not', ['=', 'x', 'y']],
  'x>y': ['>', 'x','y'],
  'x \\gt y': ['>', 'x','y'],
  'x \\ge y': ['ge', 'x','y'],
  'x \\geq y': ['ge', 'x','y'],
  'x>y>z': ['gts', ['tuple', 'x', 'y','z'], ['tuple', true, true]],
  'x>y \\ge z': ['gts', ['tuple', 'x', 'y','z'], ['tuple', true, false]],
  'x \\ge y>z': ['gts', ['tuple', 'x', 'y','z'], ['tuple', false, true]],
  'x \\ge y \\ge z': ['gts', ['tuple', 'x', 'y','z'], ['tuple', false, false]],
  'x<y': ['<', 'x','y'],
  'x \\lt y': ['<', 'x','y'],
  'x \\le y': ['le', 'x','y'],
  'x \\leq y': ['le', 'x','y'],
  'x<y<z': ['lts', ['tuple', 'x', 'y','z'], ['tuple', true, true]],
  'x<y \\le z': ['lts', ['tuple', 'x', 'y','z'], ['tuple', true, false]],
  'x \\le y<z': ['lts', ['tuple', 'x', 'y', 'z'], ['tuple', false, true]],
  'x \\le y \\le z': ['lts', ['tuple', 'x', 'y', 'z'], ['tuple', false, false]],
  'x<y>z': ['>', ['<', 'x', 'y'], 'z'],
  'A \\subset B': ['subset', 'A', 'B'],
  'A \\not\\subset B': ['notsubset', 'A', 'B'],
  'A \\supset B': ['superset', 'A', 'B'],
  'A \\not\\supset B': ['notsuperset', 'A', 'B'],
  'x \\in A': ['in', 'x', 'A'],
  'x \\notin A': ['notin', 'x', 'A'],
  'x \\not\\in A': ['notin', 'x', 'A'],
  'A \\ni x': ['ni', 'A', 'x'],
  'A \\not\\ni x': ['notni', 'A', 'x'],
  'A \\cup B': ['union', 'A', 'B'],
  'A \\cap B': ['intersect', 'A', 'B'],
  'A \\land B': ['and', 'A', 'B'],
  'A \\wedge B': ['and', 'A', 'B'],
  'A \\lor B': ['or', 'A', 'B'],
  'A \\vee B': ['or', 'A', 'B'],
  'A \\land B \\lor C': ['and', 'A', 'B', 'C'],
  'A \\lor B \\lor C': ['or', 'A', 'B', 'C'],
  'A \\land B \\lor C': ['or', ['and', 'A', 'B'], 'C'],
  'A \\lor B \\land C': ['or', 'A', ['and', 'B', 'C']],
  '\\lnot x=1': ['not', ['=', 'x', 1]],
  '\\lnot(x=1)': ['not', ['=', 'x', 1]],
  '\\lnot(x=y) \\lor z \\ne w': ['or', ['not', ['=','x','y']], ['ne','z','w']],
  '1.2E3': 1200,
  '1.2E+3': 1200,
  '3.1E-3': 0.0031,
  '1.2e-3': ['+', ['*', 1.2, 'e'], ['-', 3]],
  '+2': 2,
  '\\infty': 'infinity',
  '+\\infty': 'infinity',
  'a b\\,c\\!d\\ e\\>f\\;g\\>h\\quad i \\qquad j': ['*','a','b','c','d','e','f','g','h','i','j'],
};


Object.keys(trees).forEach(function(string) {
  test("parses " + string, () => {
    expect(converter.convert(string)).toEqual(trees[string]);
  });

});


// inputs that should throw an error
var bad_inputs = {
  '1++1': "Invalid location of '+'",
  ')1++1': "Invalid location of ')'",
  '(1+1': "Expected )",
  'x-y-': "Unexpected end of input",
  '|x| |y|': "Invalid location of '|'",
  '_x': "Invalid location of _",
  'x_': "Unexpected end of input",
  'x@2': "Invalid symbol '@'",
  '|y/v': "Expected |",
  'x+^2': "Invalid location of ^",
  'x/\'y': "Invalid location of '",
  '[1,2,3)': "Expected ]",
  '(1,2,3]': "Expected )",
  '[x)': "Expected ]",
  '(x]': "Expected )",
  '\\sin': "Unexpected end of input",
  '\\sin+\\cos': "Invalid location of '+'",
}


Object.keys(bad_inputs).forEach(function(string) {
  test("throws " + string, function() {
    expect(() => {converter.convert(string)}).toThrow(bad_inputs[string]);
  });
});


test("function symbols", function () {
  let converter = new latexToAst({functionSymbols: []});
  expect(converter.convert('f(x)+h(y)')).toEqual(
    ['+',['*', 'f', 'x'], ['*', 'h', 'y']]);

  converter = new latexToAst({functionSymbols: ['f']});
  expect(converter.convert('f(x)+h(y)')).toEqual(
    ['+',['apply', 'f', 'x'], ['*', 'h', 'y']]);

  converter = new latexToAst({functionSymbols: ['f', 'h']});
  expect(converter.convert('f(x)+h(y)')).toEqual(
    ['+',['apply', 'f', 'x'], ['apply', 'h', 'y']]);

  converter = new latexToAst({functionSymbols: ['f', 'h', 'x']});
  expect(converter.convert('f(x)+h(y)')).toEqual(
    ['+',['apply', 'f', 'x'], ['apply', 'h', 'y']]);

});
    

test("applied function symbols", function () {

  let converter = new latexToAst({appliedFunctionSymbols: [],
				  allowedLatexSymbols: ['custom', 'sin']});
  expect(converter.convert('\\sin(x) + \\custom(y)')).toEqual(
    ['+', ['*', 'sin', 'x'], ['*', 'custom', 'y']]);
  expect(converter.convert('\\sin x  + \\custom y')).toEqual(
    ['+', ['*', 'sin', 'x'], ['*', 'custom', 'y']]);

  converter = new latexToAst({appliedFunctionSymbols: ['custom'],
			      allowedLatexSymbols: ['custom', 'sin']});
  expect(converter.convert('\\sin(x) + \\custom(y)')).toEqual(
    ['+', ['*', 'sin', 'x'], ['apply', 'custom', 'y']]);
  expect(converter.convert('\\sin x  + \\custom y')).toEqual(
    ['+', ['*', 'sin', 'x'], ['apply', 'custom', 'y']]);

  converter = new latexToAst({appliedFunctionSymbols: ['custom', 'sin'],
				  allowedLatexSymbols: ['custom', 'sin']});
  expect(converter.convert('\\sin(x) + \\custom(y)')).toEqual(
    ['+', ['apply', 'sin', 'x'], ['apply', 'custom', 'y']]);
  expect(converter.convert('\\sin x  + \\custom y')).toEqual(
    ['+', ['apply', 'sin', 'x'], ['apply', 'custom', 'y']]);

});

test("allow simplified function application", function () {
  let converter = new latexToAst();
  expect(converter.convert('\\sin x')).toEqual(
    ['apply', 'sin', 'x']);

  converter = new latexToAst({allowSimplifiedFunctionApplication: false});
  expect(() => {converter.convert('\\sin x')}).toThrow(
    "Expected ( after function");

  converter = new latexToAst({allowSimplifiedFunctionApplication: true});
  expect(converter.convert('\\sin x')).toEqual(
    ['apply', 'sin', 'x']);
  
});
