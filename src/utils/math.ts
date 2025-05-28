import { JSBI } from "@uniswap/sdk";

var ZERO = JSBI.BigInt(0);
var ONE = JSBI.BigInt(1);
var TWO = JSBI.BigInt(2);
var THREE = JSBI.BigInt(3);

export function sqrt(y: any) {
    var z = ZERO;
    var x;

    if (JSBI.greaterThan(y, THREE)) {
        z = y;
        x = JSBI.add(JSBI.divide(y, TWO), ONE);

        while (JSBI.lessThan(x, z)) {
            z = x;
            x = JSBI.divide(JSBI.add(JSBI.divide(y, x), x), TWO);
        }
    } else if (JSBI.notEqual(y, ZERO)) {
        z = ONE;
    }

    return z;
}