import InterpreterContext from "./interpreterContext.js";
import grammarText from './grammar.js';
import * as ohm from 'ohm-js';

const constructSemantics = (grammar,context) => {
    return grammar.createSemantics().addOperation('eval', {
        Program(stmtList) {
            stmtList = stmtList.asIteration().children;
            for (let i = 0; i < stmtList.length - 1; i++) {
                const value = stmtList[i].eval();
                if (value && value.return) {
                    console.log(value.value)
                    return value.value;
                }
            }
            return;
        },
        Statement(stmt) {
            return stmt.eval();
        },
        Assignment(name, _, expr) {
            //console.log(name.sourceString)
            context.setVariable(name.sourceString, expr.eval());
        },
        FunctionDefinition(name, _, params, _2, _3, expr) {
            context.setFunction(name.sourceString, params.asIteration().children.map(p => p.sourceString), expr);
        },
        ReturnStatement(_,expr) {
            const value = expr.eval();
            return {value, return: true};
        },
        Expr(expr) {
            return expr.eval()
        },
        AddExpr_add(e1, _, e2) {
            const value_1 = e1.eval();
            const value_2 = e2.eval();
            if (typeof value_1 === typeof value_2 && 
                (typeof value_1 === "string" | typeof value_1 === "number")) {
                return value_1 + value_2;
            }
            throw new Error(`Runtime Error: Unsupported operation`);
        },
        AddExpr_subtract(e1, _, e2) {
            const value_1 = e1.eval();
            const value_2 = e2.eval();
            if (typeof value_1 === typeof value_2 && 
                (typeof value_1 === "string" | typeof value_1 === "number")) {
                return value_1 - value_2;
            }
            throw new Error(`Runtime Error: Unsupported operation`);
        },
        MulExpr_multiply(e1, _, e2) {
            const value_1 = e1.eval();
            const value_2 = e2.eval();
            if (typeof value_1 === typeof value_2 && 
                (typeof value_1 === "number")) {
                return value_1 * value_2;
            }
            throw new Error(`Runtime Error: Unsupported operation`);
        },
        MulExpr_divide(e1, _, e2) {
            const value_1 = e1.eval();
            const value_2 = e2.eval();
            if (typeof value_1 === typeof value_2 && 
                (typeof value_1 === "number")) {
                return value_1 / value_2;
            }
            throw new Error(`Runtime Error: Unsupported operation`);
        },
        PriExpr_num(chars) {
            return parseFloat(this.sourceString);
        },
        PriExpr_variable(variableName) {
            const value = context.getVariable(variableName.sourceString);
            const internal = value !== undefined ? true : false;
            if (internal) {
                return value;
            }

            const external = !internal && Object.keys(context.accessibleExternalVariables).includes(variableName.sourceString);
            if (external) {
                return context.accessibleExternalVariables[variableName.sourceString];
            }

            if (!internal && !external) {
                throw new Error(`Runtime Error: Variable ${variableName.sourceString} not defined`);
            }

        },
        PriExpr_funcCall(name, _, args, _2) {
            const argValues = args.asIteration().children.map(arg => arg.eval());
            let func = context.functions[name.sourceString];
            const internal = func ? true : false;
            if (internal) {
                context.scopeStepIn(name.sourceString);
                func.params.forEach((param, index) => {
                    context.setVariable(param, argValues[index]);
                });
                let value = func.body.eval();
                context.scopeStepOut();
                return value;
            }

            const external = !internal && Object.keys(context.accessibleExternalFunctions).includes(name.sourceString);
            if (external) {
                return context.accessibleExternalFunctions[name.sourceString](argValues,context.inaccessibleExternalContext);
            }
            if (!internal && !external) {
                throw new Error(`Runtime Error: Function ${name.sourceString} not defined`);
            }
        },
        PriExpr_parens(_,expr,_2) {
            return expr.eval()
        },
        EmptyExpr(_) {
            return undefined
        },
        PriExpr_string(str) {
            return str.sourceString.slice(1,-1);
        },

    });
};

const parseAndEvaluate = (programString, accessibleExternalScope, inaccessibleExternalContext, context) => {
    context = context ? context : new InterpreterContext(accessibleExternalScope, inaccessibleExternalContext);
    const grammar = ohm.grammar(grammarText);
    const semantics = constructSemantics(grammar, context);
    const match = grammar.match(programString);

    if (match.succeeded()) {
        return semantics(match).eval();
    } else {
        throw new Error(`Syntax error: ${match.message}`);
    };
};

export default parseAndEvaluate;


