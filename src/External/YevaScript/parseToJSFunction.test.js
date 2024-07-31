import parseToJSFunction from './parseToJSFunction';
import FunctionBuilderContext from './functionBuilderContext';

describe('DSL to JavaScript Function Parsing', () => {
    let accessibleExternalScopeTemplate;

    beforeEach(() => {
        accessibleExternalScopeTemplate = { functions: { sum: ([a, b]) => a + b } };
    });

    test('parses and returns simple arithmetic function', () => {
        const program = `f(x) = x + 2; -> f(3);`;
        const jsFunction = parseToJSFunction(accessibleExternalScopeTemplate, program);

        expect(jsFunction({})).toBe(5);
    });


    test('translates multiple function definitions and calls', () => {
        const program = `
            g(x) = x * 2;
            f(x) = g(x) + 5;
            -> f(3);
        `;
        const jsFunction = parseToJSFunction(accessibleExternalScopeTemplate, program);
        expect(jsFunction({})).toBe(11);
    });

    test('correctly handles external function calls', () => {
        const program = `-> sum(10, 20);`;
        const jsFunction = parseToJSFunction(accessibleExternalScopeTemplate, program);
        expect(jsFunction(accessibleExternalScopeTemplate.functions,{},{})).toBe(30);
    });

    test('correctly handles nested function calls', () => {
        const program = `
            square(x) = x * x;
            sumSquares(x, y) = square(x) + square(y);
            -> sumSquares(3, 4);
        `;
        const jsFunction = parseToJSFunction(accessibleExternalScopeTemplate, program);
        expect(jsFunction({})).toBe(25);
    });

    test('throws syntax error on malformed input', () => {
        const program = `x = 5 +;`;
        expect(() => parseToJSFunction(accessibleExternalScopeTemplate, program)).toThrow('Syntax error');
    });

    test('throws error if no return statement in function', () => {
        const program = `
            f(x) = x + 2;
        `;
        expect(() => parseToJSFunction(accessibleExternalScopeTemplate, program)).toThrow('Runtime Error: No return statement');
    });

    test('handles string literals correctly', () => {
        const program = `-> 'hello';`;
        const jsFunction = parseToJSFunction(accessibleExternalScopeTemplate, program);
        expect(jsFunction({})).toBe('hello');
    });

});

