import Inp from './inp-string'
import Tok, { NL } from './tokenizer'
import test from 'ava'

test('tokenizer', (t) => {
  let inp = Inp('abcĎ😀')
  let tok = Tok(inp)

  t.is(tok.get(), 'a')
  t.is(tok.next(), 'a')
  t.true(tok.is('b'))
  t.true(tok.is('c', 1))
  t.true(tok.is('Ď', 2))
  t.true(tok.is('😀', 3))
  t.true(tok.is(NL, 4))
})
