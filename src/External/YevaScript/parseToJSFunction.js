import FunctionBuilderContext from "./functionBuilderContext.js";
import grammarText from './grammar.js';
import * as ohm from 'ohm-js';



const constructSemantics = (grammar,context) => {
    return grammar.createSemantics().addOperation('parse', {
        Program(stmtList) {
            stmtList = stmtList.asIteration().children;
            let functionBody = "";
            for (let i = 0; i < stmtList.length - 1; i++) {
                const value = stmtList[i].parse();
                if (value && value.return) {
                    const varDefs = Object.values(context.variables).map(v => `let ${v} = undefined;\n`).join("");

                    //console.log(varDefs + functionBody + value.value)
                    return varDefs + functionBody + value.value;
                }
                functionBody += value;
            }
            throw new Error(`Runtime Error: No return statement`);
        },
        Statement(stmt) {
            return stmt.parse();
        },
        Assignment(name, _, expr) {
            context.setVariable(name.sourceString);
            return `${context.getVariable(name.sourceString)} = ${expr.parse()};\n`;
        },
        FunctionDefinition(name, _, params, _2, _3, expr) {
            context.setFunction(name.sourceString, params.asIteration().children.map(p => p.sourceString));
            return `const ${context.getFunction(name.sourceString)} = (${params.asIteration().children.map(p => context.getVariable(p.sourceString)).join(",")}) => ${expr.parse()};\n`;
        
        },
        ReturnStatement(_,expr) {
            const value = "return "+expr.parse();
            //console.log(value,expr.sourceString)
            return {value, return: true};
        },
        Expr(expr) {
            return expr.parse()
        },
        AddExpr_add(e1, _, e2) {
            const value_1 = e1.parse();
            const value_2 = e2.parse();
            return `${value_1} + ${value_2}`;
        },
        AddExpr_subtract(e1, _, e2) {
            const value_1 = e1.parse();
            const value_2 = e2.parse();
            return `${value_1} - ${value_2}`;
        },
        MulExpr_multiply(e1, _, e2) {
            const value_1 = e1.parse();
            const value_2 = e2.parse();
            return `${value_1} * ${value_2}`;
        },
        MulExpr_divide(e1, _, e2) {
            const value_1 = e1.parse();
            const value_2 = e2.parse();
            return `${value_1} / ${value_2}`;
        },
        PriExpr_num(chars) {
            return this.sourceString;
        },
        PriExpr_variable(variableName) {
            let varId = context.getVariable(variableName.sourceString); 
            const internal = varId ? true : false;
            if (internal) {
                return varId;
            }

            const external = !internal && Object.keys(context.accessibleExternalVariables).includes(variableName.sourceString);
            if (external) {
                return `accessibleExternalVariables.${variableName.sourceString}`;
            }
        },
        PriExpr_funcCall(name, _, args, _2) {
            const argValues = args.asIteration().children.map(arg => arg.parse());
            let func = context.getFunction(name.sourceString);
            const internal = func ? true : false;
            const external = !internal && Object.keys(context.accessibleExternalFunctions).includes(name.sourceString);
            //console.log(name.sourceString,func,JSON.stringify(context),);
            if (internal) {
                return `${func}(${argValues.join(",")})`;
            }
            if (external) {
                return `accessibleExternalFunctions.${name.sourceString}([${argValues.join(",")}],inaccessibleExternalContext)`;
            }

        },
        PriExpr_parens(_,expr,_2) {
            return "("+expr.parse()+")"
        },
        EmptyExpr(_) {
            return ""
        },
        PriExpr_string(str) {
            return str.sourceString;
        },

    });
};

const parseToJSFunction = (accessibleExternalScopeTemplate,programString,context) => {
    context = context ? context : new FunctionBuilderContext(accessibleExternalScopeTemplate);
    const grammar = ohm.grammar(grammarText);
    const semantics = constructSemantics(grammar, context);
    const match = grammar.match(programString);

    //console.log(accessibleExternalScopeTemplate)

    if (match.succeeded()) {
        return new Function("accessibleExternalFunctions","accessibleExternalVariables","inaccessibleExternalContext",semantics(match).parse());
    } else {
        throw new Error(`Syntax error: ${match.message}`);
    };
};

export default parseToJSFunction;


