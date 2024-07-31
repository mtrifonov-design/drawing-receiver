import * as ohm from 'ohm-js';
import grammarText from './grammar.js';
const grammar = ohm.grammar(grammarText);

describe('Grammar Matching', () => {
    test('Correctly matches simple variable assignment', () => {
        const input = `a = 5;`;
        const match = grammar.match(input);
        //console.log(match.message)
        expect(match.succeeded()).toBe(true);
    });

    test('Correctly matches function definition with multiple parameters', () => {
        const input = `f(x, y) = x + y;`;
        const match = grammar.match(input);
        expect(match.succeeded()).toBe(true);
    });

    test('Correctly matches function call with multiple arguments', () => {
        const input = `-> f(x, y);`;
        const match = grammar.match(input);
        expect(match.succeeded()).toBe(true);
    });

    test('Correctly matches entire program', () => {
        const input = `
            a = 5;
            f(x, y) = x + y;
            c = f(1, 2);
            -> a + f(1, 2)
        `;
        const match = grammar.match(input);
        console.log(match.message);
        expect(match.succeeded()).toBe(true);
    });

    test('Correctly matches complex return statement', () => {
        const input = `-> a * (b + 3);`;
        const match = grammar.match(input);
        expect(match.succeeded()).toBe(true);
    });

    test('Fails to match incomplete assignment', () => {
        const input = `a = ;`;
        const match = grammar.match(input);
        expect(match.succeeded()).toBe(false);
    });

    test('Fails to match function definition with missing parameters', () => {
        const input = `f(x, ) = x + y;`;
        const match = grammar.match(input);
        expect(match.succeeded()).toBe(false);
    });

    test('Fails to match function call with missing parentheses', () => {
        const input = `f x, y;`;
        const match = grammar.match(input);
        expect(match.succeeded()).toBe(false);
    });

    test('handles string literals as function args', () => {
        const input = `f('hello', 'world');`;
        const match = grammar.match(input);
        expect(match.succeeded()).toBe(true);
    });
});

