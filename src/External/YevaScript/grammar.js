const grammar = `
YevaScript {
    Program = ListOf<Statement, ";">  -- program
    Statement = ReturnStatement 
            | Assignment 
            | FunctionDefinition 
            | Expr
            | EmptyExpr 
    Assignment = id "=" Expr
    FunctionDefinition = id "(" Parameters ")" "=" Expr   
    Parameters = ListOf<id, ",">  -- params
    ReturnStatement = "->" Expr
    Expr = AddExpr
    AddExpr = AddExpr "+" MulExpr  -- add
            | AddExpr "-" MulExpr  -- subtract
            | MulExpr  -- term
    MulExpr = MulExpr "*" PriExpr  -- multiply
            | MulExpr "/" PriExpr  -- divide
            | PriExpr  -- factor
    PriExpr = id "(" Arguments ")" -- funcCall
            | number  -- num
            | id -- variable
            | string  -- string
            | "(" Expr ")"  -- parens
    EmptyExpr = ""
    Arguments = ListOf<Expr, ",">  -- args
    id = letter idRest*  -- identifier
    idRest = alnum | "_"  -- identifier
    number = digit+ ("." digit+)?  -- number
    string = "'" (~"'" any)* "'"  -- string
  }
`

export default grammar;