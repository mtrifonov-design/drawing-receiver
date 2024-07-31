import parseAndEvaluate from './parseAndEvaluate';

import InterpreterContext from './interpreterContext';

describe('DSL Interpreter Evaluation', () => {
 let accessibleExternalScope;
 let inaccessibleExternalContext
  beforeEach(() => {
    accessibleExternalScope = {
      variables: {
        x: 5,
        y: 10
      },
      functions: {
        add: (args,inaccessibleExternalContext) => {return args[0] + args[1];},
        extAdd: (args,inaccessibleExternalContext) => {args[0] + inaccessibleExternalContext.magicNumber;}
      }
    };
    inaccessibleExternalContext = {
      magicNumber: 5
    };

  });
  test('evaluates simple arithmetic', () => {
    const program = `-> 3 + 4;`;
    expect(parseAndEvaluate(program,accessibleExternalScope,inaccessibleExternalContext)).toBe(7);
  });

  test('handles variable assignments and retrieval', () => {
    const program = `
      x = 10;
      y = x + 5;
      -> y;
    `;
    expect(parseAndEvaluate(program,accessibleExternalScope,inaccessibleExternalContext)).toBe(15);
  });

  test('defines and calls a simple function', () => {
    const program = `
      f(x) = x * 2;
      -> f(5);
    `;
    expect(parseAndEvaluate(program,accessibleExternalScope,inaccessibleExternalContext)).toBe(10);
  });

  test('properly handles function scope for variables', () => {
    const program = `
      x = 10;
      f(x) = x;
      -> f(20);
    `;
    expect(parseAndEvaluate(program,accessibleExternalScope,inaccessibleExternalContext)).toBe(20);
  });

  test('properly handles functions with multiple parameters', () => {
    const program = `
      f(x, y) = x + y;
      -> f(5, 10);
    `;
    expect(parseAndEvaluate(program,accessibleExternalScope,inaccessibleExternalContext)).toBe(15);
  });

  test('throws error for undefined variable', () => {
    const program = `-> a;`;
    expect(() => parseAndEvaluate(program,accessibleExternalScope,inaccessibleExternalContext)).toThrow('Runtime Error: Variable a not defined');
  });

  test('throws error for undefined function', () => {
    const program = `-> g(5);`;
    expect(() => parseAndEvaluate(program,accessibleExternalScope,inaccessibleExternalContext)).toThrow('Runtime Error: Function g not defined');
  });

  test('assigns external variable to local variable', () => {
    const program = `test = x; -> test;`;
    expect(parseAndEvaluate(program,accessibleExternalScope,inaccessibleExternalContext)).toBe(5);
  });

  test('catches syntax errors', () => {
    const program = `x = 5 +;`;
    expect(() => parseAndEvaluate(program,accessibleExternalScope,inaccessibleExternalContext)).toThrow('Syntax error');
  });

  test('mutates context as expected', () => {
    const context = new InterpreterContext({},{});
    const program = `x = 4;`;
    parseAndEvaluate(program,accessibleExternalScope,inaccessibleExternalContext,context);
    expect(context.getVariable('x')).toBe(4);
  });

  test('handles nested function calls', () => {
    const program = `
      f(x) = x * 2;
      g(x) = f(x) + 5;
      -> g(5);
    `;
    expect(parseAndEvaluate(program,accessibleExternalScope,inaccessibleExternalContext)).toBe(15);
  });

  test('handles external functions', () => {
    const program = `
      -> add(16,5);
    `;
    expect(parseAndEvaluate(program,accessibleExternalScope,inaccessibleExternalContext)).toBe(21);
  });

  test('handles string literals', () => {
    const program = `
      -> 'hello';
    `;
    expect(parseAndEvaluate(program,accessibleExternalScope,inaccessibleExternalContext)).toBe('hello');
  });

  test('disallows string and number addition', () => {
    const program = `
      -> 'hello' + 5;
    `;
    expect(() => parseAndEvaluate(program,accessibleExternalScope,inaccessibleExternalContext)).toThrow('Runtime Error: Unsupported operation');
  });
});

