import { NL, NUL } from './spec';
import './typs';
export default (s) => {
    s = s
        .split(NL)
        .map((l) => l.trimEnd())
        .join(NL);
    s.endsWith(NL) || (s += NL);
    let que = [...s];
    let peek = (ahead = 0) => que[ahead] || NUL;
    let next = () => (NUL == peek() ? NUL : que.shift());
    let is = (c, ahead = 0) => c == peek(ahead);
    let push = (s) => {
        for (let c of s.split('').reverse())
            que.unshift(c);
    };
    let skip = (n = 1) => {
        while (0 < n--)
            next();
    };
    let nextLine = () => {
        let c, s = '';
        while (NL != (c = next()))
            s += c;
        return s;
    };
    let isTest = (c, test) => test(c);
    let isNumChar = (ahead = 0) => isTest(peek(ahead), (c) => '0' <= c && c <= '9');
    let isIdentChar = (ahead = 0, asFirst = false) => isTest(peek(ahead), (c) => ('a' <= c && c <= 'z') ||
        ('A' <= c && c <= 'Z') ||
        ('0' <= c && c <= '9') ||
        '_' == c ||
        (!asFirst && '-' == c));
    let isWhite = (ahead = 0) => isTest(peek(ahead), (c) => ' ' == c || '\t' == c);
    let skipWhite = () => {
        let skipped = false;
        while (isWhite()) {
            next();
            skipped = true;
        }
        return skipped;
    };
    let skipLine = () => {
        while (NL != next())
            ;
    };
    let match = (c, n = 1, atLeast = false) => {
        let i = 0;
        while (is(c, i))
            ++i;
        if (n == i || (atLeast && n < i)) {
            skip(i);
            return i;
        }
        return 0;
    };
    let matchs = (s) => {
        let i = 0;
        for (let c of s)
            if (!is(c, i++))
                return false;
        skip(i);
        return true;
    };
    let nextNumber = () => {
        let s = '';
        next();
        while (isNumChar())
            s += next();
        return s;
    };
    let ident = () => {
        let s = '';
        if (isIdentChar(0, true))
            while (isIdentChar())
                s += next();
        return s;
    };
    let token = () => {
        let s = '';
        while (!(is(NL) || isWhite()))
            s += next();
        return s;
    };
    let lineRest = () => {
        let s = '';
        while (!is(NL))
            s += next();
        return s.trim();
    };
    peek();
    return {
        peek,
        next,
        is,
        push,
        skip,
        nextLine,
        isNumChar,
        isIdentChar,
        isWhite,
        skipWhite,
        skipLine,
        match,
        matchs,
        nextNumber,
        ident,
        token,
        lineRest,
    };
};
