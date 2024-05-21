import Inp from './inp'
import { NUL } from './spec'
import { assert, test } from 'vitest'

let eq = assert.equal
let tt = assert.isTrue
let tf = assert.isFalse

test('chr', () => {
  tt(NUL == '\0')
  tf(NUL == '')
  tf(NUL == '0')
  tf(NUL == null)

  let inp = Inp('ab\x00č\nd')

  eq('a', inp.peek())
  eq('a', inp.peek(0 as int))
  eq('�', inp.peek(2 as int))
  eq('b', inp.peek(1 as int))
  eq('č', inp.peek(3 as int))
  eq('d', inp.peek(5 as int))
  eq('\n', inp.peek(4 as int))
  eq(NUL, inp.peek(7 as int))
  eq('\n', inp.peek(6 as int))
  eq(NUL, inp.peek(77 as int))

  eq('a', inp.next())
  eq('b', inp.peek())

  tt(inp.hasMore())

  tt(inp.is('č', 2 as int))
  tt(inp.is(NUL, 6 as int))
  tt(inp.is(NUL, 66 as int))
  tt(inp.is('b'))

  inp.push('x')
  tt(inp.is('x'))
  tt(inp.is('b', 1 as int))

  inp.skip()
  tt(inp.is('b'))

  inp.skip(2 as int)
  tt(inp.is('č'))

  tt(inp.hasMore())
  tt(!inp.is(NUL))

  inp.skip(3 as int)
  tt(!inp.is(NUL))
  tt(inp.hasMore())

  inp.skip(1 as int)
  tt(inp.is(NUL))
  tf(inp.hasMore())

  inp.skip()
  tt(inp.is(NUL))
  tt(!inp.hasMore())
})

test('two', (t) => {
  let inp1 = Inp('abčd')
  let inp2 = Inp('abčd')

  eq('a', inp1.next())
  eq('b', inp1.next())
  eq('a', inp2.next())
})

test('toks', (t) => {
  let inp = Inp('abbbccc')
  eq('a', inp.peek())
  eq(1, inp.match('a'))
  eq('b', inp.peek())
  eq(0, inp.match('b'))
  eq(3, inp.match('b', 1 as int, true))
  eq(0, inp.match('c', 4 as int))
  eq(3, inp.match('c', 3 as int))

  inp = Inp('88aa -9i9bb:')
  eq('88aa', inp.token())
  eq('', inp.ident())
  inp.skip()
  eq('', inp.ident())
  inp.skip()
  eq('9i9bb', inp.ident())
})

// etc ...
