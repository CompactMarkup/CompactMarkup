import test from 'ava';
import { AMP, BR, LT, NUL } from '../src/spec';
test('spec', (t) => {
    t.is('\x00', NUL);
    t.not(NUL, LT);
    t.not(LT, AMP);
    t.not(AMP, BR);
    t.true(NUL == '\0');
    t.false(NUL == '');
    t.false(NUL == '0');
    t.false(NUL == null);
});
