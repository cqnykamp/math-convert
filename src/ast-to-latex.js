/*
 * convert syntax trees back to LaTeX code
 *
 * Copyright 2014-2017 by
 *  Jim Fowler <kisonecat@gmail.com>
 *  Duane Nykamp <nykamp@umn.edu>
 *
 * This file is part of a math-expressions library
 *
 * math-expressions is free software: you can redistribute
 * it and/or modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation, either
 * version 3 of the License, or at your option any later version.
 *
 * math-expressions is distributed in the hope that it
 * will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 */


const operators = {
  "+": function(operands) {
    return operands.join(' ');
  },
  "-": function(operands) {
    return "- " + operands[0];
  },
  "*": function(operands) {
    return operands.join(" ");
  },
  "/": function(operands) {
    return "\\frac{" + operands[0] + "}{" + operands[1] + "}";
  },
  "_": function(operands) {
    return operands[0] + "_{" + operands[1] + "}";
  },
  "^": function(operands) {
    return operands[0] + "^{" + operands[1] + "}";
  },
  "prime": function(operands) {
    return operands[0] + "'";
  },
  "tuple": function(operands) {
    return '\\left( ' + operands.join(', ') + ' \\right)';
  },
  "array": function(operands) {
    return '\\left[ ' + operands.join(', ') + ' \\right]';
  },
  "list": function(operands) {
    return operands.join(', ');
  },
  "set": function(operands) {
    return '\\left\\{ ' + operands.join(', ') + ' \\right\\}';
  },
  "vector": function(operands) {
    return '\\left( ' + operands.join(', ') + ' \\right)';
  },
  "interval": function(operands) {
    return '\\left( ' + operands.join(', ') + ' \\right)';
  },
  "and": function(operands) {
    return operands.join(' \\land ');
  },
  "or": function(operands) {
    return operands.join(' \\lor ');
  },
  "not": function(operands) {
    return '\\lnot ' + operands[0];
  },
  "=": function(operands) {
    return operands.join(' = ');
  },
  "<": function(operands) {
    return operands.join(' < ');
  },
  ">": function(operands) {
    return operands.join(' > ');
  },
  "lts": function(operands) {
    return operands.join(' < ');
  },
  "gts": function(operands) {
    return operands.join(' > ');
  },
  "le": function(operands) {
    return operands.join(' \\le ');
  },
  "ge": function(operands) {
    return operands.join(' \\ge ');
  },
  "ne": function(operands) {
    return operands.join(' \\ne ');
  },
  "in": function(operands) {
    return operands[0] + " \\in " + operands[1];
  },
  "notin": function(operands) {
    return operands[0] + " \\notin " + operands[1];
  },
  "ni": function(operands) {
    return operands[0] + " \\ni " + operands[1];
  },
  "notni": function(operands) {
    return operands[0] + " \\not\\ni " + operands[1];
  },
  "subset": function(operands) {
    return operands[0] + " \\subset " + operands[1];
  },
  "notsubset": function(operands) {
    return operands[0] + " \\not\\subset " + operands[1];
  },
  "superset": function(operands) {
    return operands[0] + " \\supset " + operands[1];
  },
  "notsuperset": function(operands) {
    return operands[0] + " \\not\\supset " + operands[1];
  },
  "union": function(operands) {
    return operands.join(' \\cup ');
  },
  "intersect": function(operands) {
    return operands.join(' \\cap ');
  },
};

// defaults for parsers if not overridden by context


// allowed multicharacter latex symbols
// in addition to the below applied function symbols
const allowedLatexSymbolsDefault = ['pi', 'theta', 'theta', 'Theta', 'alpha', 'nu', 'beta', 'xi', 'Xi', 'gamma', 'Gamma', 'delta', 'Delta', 'pi', 'Pi', 'epsilon', 'epsilon', 'rho', 'rho', 'zeta', 'sigma', 'Sigma', 'eta', 'tau', 'upsilon', 'Upsilon', 'iota', 'phi', 'phi', 'Phi', 'kappa', 'chi', 'lambda', 'Lambda', 'psi', 'Psi', 'omega', 'Omega', "abs", "exp", "log", "ln", "log10", "sign", "sqrt", "erf", "acos", "acosh", "acot", "acoth", "acsc", "acsch", "asec", "asech", "asin", "asinh", "atan", "atanh", "cos", "cosh", "cot", "coth", "csc", "csch", "sec", "sech", "sin", "sinh", "tan", "tanh", 'arcsin', 'arccos', 'arctan', 'arccsc', 'arcsec', 'arccot', 'cosec', 'arg'];


class astToLatex {

  constructor({
    allowedLatexSymbols=allowedLatexSymbolsDefault,
  } = {}){
    this.allowedLatexSymbols = allowedLatexSymbols;
  }
  
  convert(tree) {
    return this.statement(tree);
  }

  statement(tree) {
    if ((typeof tree === 'string') || (typeof tree === 'number')) {
      return this.single_statement(tree);
    }

    var operator = tree[0];
    var operands = tree.slice(1);

    if ((!(operator in operators)) && operator !== "apply")
      throw new Error("Badly formed ast: operator " + operator + " not recognized.");

    if (operator === 'and' || operator === 'or') {
      return operators[operator](operands.map(function(v, i) {
        var result = this.single_statement(v);
        // for clarity, add parenthesis unless result is
        // single quantity (with no spaces) or already has parens
        if (result.toString().match(/ /) &&
          (!(result.toString().match(/^\\left\(.*\\right\)$/))))
          return '\\left(' + result + '\\right)';
        else
          return result;
      }.bind(this)));
    }
    return this.single_statement(tree);
  }

  single_statement(tree) {
    if ((typeof tree === 'string') || (typeof tree === 'number')) {
      return this.expression(tree);
    }

    var operator = tree[0];
    var operands = tree.slice(1);

    if (operator == 'not') {
      return operators[operator](operands.map(function(v, i) {
        var result = this.single_statement(v);
        // for clarity, add parenthesis unless result is
        // single quantity (with no spaces) or already has parens
        if (result.toString().match(/ /) &&
          (!(result.toString().match(/^\\left\(.*\\right\)$/))))
          return '\\left(' + result + '\\right)';
        else
          return result;
      }.bind(this)));
    }

    if ((operator == '=') || (operator == 'ne') ||
      (operator == '<') || (operator == '>') ||
      (operator == 'le') || (operator == 'ge') ||
      (operator == 'in') || (operator == 'notin') ||
      (operator == 'ni') || (operator == 'notni') ||
      (operator == 'subset') || (operator == 'notsubset') ||
      (operator == 'superset') || (operator == 'notsuperset')) {
      return operators[operator](operands.map(function(v, i) {
        return this.expression(v);
      }.bind(this)));
    }

    if (operator == 'lts' || operator == 'gts') {
      var args = operands[0]
      var strict = operands[1];

      if (args[0] != 'tuple' || strict[0] != 'tuple')
        // something wrong if args or strict are not tuples
        throw new Error("Badly formed ast");

      var result = this.expression(args[1]);
      for (var i = 1; i < args.length - 1; i++) {
        if (strict[i]) {
          if (operator == 'lts')
            result += " < ";
          else
            result += " > ";
        }
        else {
          if (operator == 'lts') {
            result += " \\le ";
          }
          else {
            result += " \\ge ";
          }
        }
        result += this.expression(args[i + 1]);
      }
      return result;
    }

    return this.expression(tree);
  }

  expression(tree) {
    if ((typeof tree === 'string') || (typeof tree === 'number')) {
      return this.term(tree);
    }

    var operator = tree[0];
    var operands = tree.slice(1);

    if (operator == '+') {
      return operators[operator](operands.map(function(v, i) {
        if (i > 0)
          return this.termWithPlusIfNotNegated(v);
        else
          return this.term(v);
      }.bind(this)));
    }

    if ((operator == 'union') || (operator == 'intersect')) {
      return operators[operator](operands.map(function(v, i) {
        return this.term(v);
      }.bind(this)));
    }

    return this.term(tree);
  }

  term(tree) {
    if ((typeof tree === 'string') || (typeof tree === 'number')) {
      return this.factor(tree);
    }

    var operator = tree[0];
    var operands = tree.slice(1);

    if (operator == '-') {
      return operators[operator](operands.map(function(v, i) {
        return this.term(v);
      }.bind(this)));
    }
    if (operator == '*') {
      return operators[operator](operands.map(function(v, i) {
        var result;
        if (i > 0) {
          result = this.factorWithParenthesesIfNegated(v);
          if (result.toString().match(/^[0-9]/))
            return '\\cdot ' + result;
          else
            return '\\, ' + result
        }
        else
          return this.factor(v);
      }.bind(this)));
    }

    if (operator == '/') {
      return operators[operator](operands.map(function(v, i) {
        return this.expression(v);
      }.bind(this)));
    }

    return this.factor(tree);
  }

  simple_factor_or_function_or_parens(tree) {
    // return true if
    // factor(tree) is a single character
    // or tree is a number
    // or tree is a string
    // or tree is a function call
    // or factor(tree) is in parens

    var result = this.factor(tree);

    if (result.toString().length == 1 ||
      (typeof tree == 'number') ||
      (typeof tree == 'string') ||
      (tree[0] == 'apply') ||
      result.toString().match(/^\\left\(.*\\right\)$/)
    )
      return true;
    else
      return false
  }

  factor(tree) {
    if (typeof tree === 'string') {
      if (tree == "infinity")
	return "\\infty";
      if (tree.length > 1) {
	if(this.allowedLatexSymbols.includes(tree))
	  return "\\" + tree;
	else
	  return "\\var{" + tree + '}';
      }
      return tree;
    }

    if (typeof tree === 'number') {
      return tree;
    }

    var operator = tree[0];
    var operands = tree.slice(1);


    if (operator === "^") {
      var operand0 = this.factor(operands[0]);

      // so that f_(st)'^2(x) doesn't get extra parentheses
      // (and no longer recognized as function call)
      // check for simple factor after removing primes
      var remove_primes = operands[0];
      while (remove_primes[0] == 'prime') {
        remove_primes = remove_primes[1];
      }

      if (!(this.simple_factor_or_function_or_parens(remove_primes) ||
          (remove_primes[0] == '_' && (typeof remove_primes[1] == 'string'))
        ))
        operand0 = '\\left(' + operand0.toString() + '\\right)';

      return operand0 + '^{' + this.statement(operands[1]) + '}';
    }
    else if (operator === "_") {
      var operand0 = this.factor(operands[0]);
      if (!(this.simple_factor_or_function_or_parens(operands[0])))
        operand0 = '\\left(' + operand0.toString() + '\\right)';

      return operand0 + '_{' + this.statement(operands[1]) + '}';
    }
    else if (operator === "prime") {
      var op = operands[0];

      var n_primes = 1;
      while (op[0] === "prime") {
        n_primes += 1;
        op = op[1];
      }

      var result = this.factor(op);

      if (!(this.simple_factor_or_function_or_parens(op) ||
          (op[0] == '_' && (typeof op[1] == 'string'))
        ))
        result = '\\left(' + result.toString() + '\\right)';
      for (var i = 0; i < n_primes; i++) {
        result += "'";
      }
      return result;
    }
    else if (operator === "-") {
      return operators[operator](operands.map(function(v, i) {
        return this.factor(v);
      }.bind(this)));
    }
    else if (operator === 'tuple' || operator === 'array' ||
      operator === 'list' ||
      operator === 'set' || operator === 'vector') {
      return operators[operator](operands.map(function(v, i) {
        return this.statement(v);
      }.bind(this)));

    }
    else if (operator === 'interval') {

      var args = operands[0];
      var closed = operands[1];
      if (args[0] !== 'tuple' || closed[0] !== 'tuple')
        throw new Error("Badly formed ast");

      var result = this.statement(args[1]) + ", " +
        this.statement(args[2]);

      if (closed[1])
        result = '\\left[ ' + result;
      else
        result = '\\left( ' + result;

      if (closed[2])
        result = result + ' \\right]';
      else
        result = result + ' \\right)';

      return result;

    }
    else if (operator == 'apply') {

      if (operands[0] === 'abs') {
        return '\\left|' + this.statement(operands[1]) + '\\right|';
      }

      if (operands[0] === "factorial") {
        var result = this.factor(operands[1]);
        if (this.simple_factor_or_function_or_parens(operands[1]) ||
          (operands[1][0] == '_' && (typeof operands[1][1] == 'string'))
        )
          return result + "!";
        else
          return '\\left(' + result.toString() + '\\right)!';
      }

      if (operands[0] == 'sqrt') {
        return '\\sqrt{' + this.statement(operands[1]) + '}';
      }

      var f = this.factor(operands[0]);
      var f_args = this.statement(operands[1]);

      if (operands[1][0] != 'tuple')
        f_args = "\\left(" + f_args + "\\right)";

      return f + f_args;
    }
    else {
      return '\\left(' + this.statement(tree) + '\\right)';
    }
  }

  factorWithParenthesesIfNegated(tree) {
    var result = this.factor(tree);

    if (result.toString().match(/^-/))
      return '\\left(' + result.toString() + '\\right)';

    // else
    return result;
  }

  termWithPlusIfNotNegated(tree) {
    var result = this.term(tree);

    if (!result.toString().match(/^-/))
      return '+ ' + result.toString();

    // else
    return result;
  }

}


export default astToLatex;
