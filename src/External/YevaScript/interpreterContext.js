
class InterpreterContext {
    constructor(accessibleExternalScope, inaccessibleExternalContext) {
        this.variables = {};
        this.functions = {};
        this.accessibleExternalVariables = accessibleExternalScope.variables;
        this.accessibleExternalFunctions = accessibleExternalScope.functions;
        this.inaccessibleExternalContext = inaccessibleExternalContext;
        this.currentScope = "global";
    }
    scopeStepIn(name) {
        this.currentScope += "->";
        this.currentScope += name;
    }
    scopeStepOut() {
        this.currentScope = this.currentScope.split("->").slice(0, -1).join("->");
    };
    setVariable (name, value) {
        const scopedName = this.currentScope + ":" + name;
        this.variables[scopedName] = value;
        //console.log(JSON.stringify(this.variables),name);
    };
    getVariable(name) {
        let value = undefined;
        let scope = this.currentScope;
        while (value === undefined) {
            if (scope === "") {
                return undefined;
            }
            value = this.variables[scope + ":" + name];
            scope = scope.split("->").slice(0, -1).join("->");
        }
        return value;
    };
    setFunction(name, params, body) {
        this.functions[name] = { params, body };
    };
};

export default InterpreterContext;