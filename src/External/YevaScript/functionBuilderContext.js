const generateId = () => {
    const ID_LENGTH = 6;
    let id = "";
    let alphabet = "1234567890";
    for (let i = 0; i < ID_LENGTH; i++) {
        let randomIndex = Math.floor(Math.random() * alphabet.length);
        id += alphabet[randomIndex];
    }
    return id;
}

class FunctionBuilderContext {
    constructor(accessibleExternalScopeTemplate){
        this.accessibleExternalFunctions = accessibleExternalScopeTemplate.functions;
        this.accessibleExternalVariables = accessibleExternalScopeTemplate.variables;
        this.functionBody = "";
        this.variables = {};
        this.functions = {};
        this.currentScope = "global";
    }
    scopeStepIn(name) {
        this.currentScope += "->";
        this.currentScope += name;
    }
    scopeStepOut() {
        this.currentScope = this.currentScope.split("->").slice(0, -1).join("->");
    };
    setVariable (name) {
        const newVarId = "var_"+generateId();
        const notYetDefined = !this.variables[name];
        if (notYetDefined) this.variables[name] = newVarId;
    };
    getVariable(name) {
        return this.variables[name];
    };
    setFunction(name, params) {
        //console.log(name,params,body,JSON.stringify(this));
        const newFunctionId = "func_"+generateId();
        params.forEach(param => {
            this.setVariable(param);
        });
        this.functions[name] = newFunctionId;
    };
    getFunction(name) {
        //console.log(name,this.functions[name])
        return this.functions[name];
    };
};

export default FunctionBuilderContext;