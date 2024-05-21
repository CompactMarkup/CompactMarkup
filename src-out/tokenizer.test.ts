import Inp from './inp'
import Tok from './tokenizer'
import { assert, test, expect as x } from 'vitest'

let eq = assert.equal
let ne = assert.notEqual

test('tokenizer', () => {
  let inp = Inp('abcĎ😀')
  let tok = Tok(inp)

  x(tok.token()).toBe('abcĎ😀')
  eq(1, 2 - 1)
  ne(1, 2)
})

// .toBeCloseTo
// .not.toBe
// .toEqual
