import test from 'ava'
import '@lib/typ'
import Inp from './inp'
import { NUL } from './spec'

test('chr', (t) => {
  t.true(NUL == '\0')
  t.false(NUL == '')
  t.false(NUL == '0')
  t.false(NUL == null)

  let inp = Inp('ab\x00č\nd')

  t.is('a', inp.peek())
  t.is('a', inp.peek(0 as int))
  t.is('�', inp.peek(2 as int))
  t.is('b', inp.peek(1 as int))
  t.is('č', inp.peek(3 as int))
  t.is('d', inp.peek(5 as int))
  t.is('\n', inp.peek(4 as int))
  t.is(NUL, inp.peek(7 as int))
  t.is('\n', inp.peek(6 as int))
  t.is(NUL, inp.peek(77 as int))

  t.is('a', inp.next())
  t.is('b', inp.peek())

  t.true(inp.hasMore())

  t.true(inp.is('č', 2 as int))
  t.true(inp.is(NUL, 6 as int))
  t.true(inp.is(NUL, 66 as int))
  t.true(inp.is('b'))

  inp.push('x')
  t.true(inp.is('x'))
  t.true(inp.is('b', 1 as int))

  inp.skip()
  t.true(inp.is('b'))

  inp.skip(2 as int)
  t.true(inp.is('č'))

  t.true(inp.hasMore())
  t.true(!inp.is(NUL))

  inp.skip(3 as int)
  t.true(!inp.is(NUL))
  t.true(inp.hasMore())

  inp.skip(1 as int)
  t.true(inp.is(NUL))
  t.false(inp.hasMore())

  inp.skip()
  t.true(inp.is(NUL))
  t.true(!inp.hasMore())
})

test('two', (t) => {
  let inp1 = Inp('abčd')
  let inp2 = Inp('abčd')

  t.is('a', inp1.next())
  t.is('b', inp1.next())
  t.is('a', inp2.next())
})

test('toks', (t) => {
  let inp = Inp('abbbccc')
  t.is('a', inp.peek())
  t.is(1, inp.match('a'))
  t.is('b', inp.peek())
  t.is(0, inp.match('b'))
  t.is(3, inp.match('b', 1 as int, true))
  t.is(0, inp.match('c', 4 as int))
  t.is(3, inp.match('c', 3 as int))

  inp = Inp('88aa -9i9bb:')
  t.is('88aa', inp.token())
  t.is('', inp.ident())
  inp.skip()
  t.is('', inp.ident())
  inp.skip()
  t.is('9i9bb', inp.ident())
})

// etc ...
