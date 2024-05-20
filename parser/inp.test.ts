import test from 'ava'

import Inp from './inp'
import { NL, NUL } from './spec'

test('peek', (t) => {
  let inp = Inp('abčdef')
  t.is('a', inp.peek())
  t.is('č', inp.peek(2 as int))
  t.is('b', inp.peek(1 as int))
  t.is(NL, inp.peek(6 as int)) // EOL
  t.is(NUL, inp.peek(100 as int)) // beyond the end
})

test('next-skip', (t) => {
  let inp = Inp('abcdef')
  t.is('a', inp.next())
  inp.skip()
  t.is('c', inp.next())
  inp.skip(3 as int)
  t.is(NL, inp.next())
  t.is(NUL, inp.next())
})

test('is', (t) => {
  const inp = Inp('ab😀')
  t.true(inp.is('a', 0 as int))
  t.true(inp.is('b', 1 as int))
  t.true(inp.is('😀', 2 as int))
  t.true(inp.is(NL, 3 as int))
  t.true(inp.is(NUL, 4 as int))
  t.false(inp.is('A', 0 as int))
})

test('push', (t) => {
  let inp = Inp('def')
  inp.push('abc')
  t.is('a', inp.next())
  t.is('b', inp.next())
  t.is('c', inp.next())
  t.is('d', inp.next())
  t.is('e', inp.next())
  t.is('f', inp.next())
  t.is(NL, inp.next())
  t.is(NUL, inp.next())

  inp = Inp('')
  inp.push('')
  t.is(NL, inp.next())
  t.is(NUL, inp.next())
})

test('nextLine', (t) => {
  let inp = Inp('line1\nline2\nline3')
  t.is('line1', inp.nextLine())
  t.is('line2', inp.nextLine())
  t.is('line3', inp.nextLine())
})

test('isNumChar', (t) => {
  let inp = Inp('1x3abc')
  t.true(inp.isNumChar())
  t.true(inp.isNumChar(1 as int))
  t.true(inp.isNumChar(2 as int))
  inp.skip(3 as int)
  t.false(inp.isNumChar())
})

test('isIdentChar', (t) => {
  let inp = Inp('abc123')
  t.true(inp.isIdentChar())
  inp.skip()
  t.true(inp.isIdentChar())
  inp.skip()
  t.true(inp.isIdentChar())
  inp.skip()
  t.false(inp.isIdentChar(0 as int, true))
})

test('isWhite', (t) => {
  let inp = Inp(' \t\nabc')
  t.true(inp.isWhite())
  inp.skip()
  t.true(inp.isWhite())
  inp.skip()
  t.false(inp.isWhite())
})

test('skipWhite', (t) => {
  let inp = Inp(' \t\nabc')
  t.true(inp.skipWhite())
  t.is('a', inp.peek())
})

test('skipLine', (t) => {
  let inp = Inp('abc\ndef')
  inp.skipLine()
  t.is('d', inp.peek())
})

test('match', (t) => {
  let inp = Inp('aaaabbbb')
  t.is(4, inp.match('a', 4 as int))
  t.is('b', inp.peek())
})

test('matchs', (t) => {
  let inp = Inp('abcdef')
  t.true(inp.matchs('abc'))
  t.is('d', inp.peek())
})

test('nextNumber', (t) => {
  let inp = Inp('6123abc')
  t.is('123', inp.nextNumber())
  t.is('a', inp.peek())
})

test('ident', (t) => {
  let inp = Inp('abc123 def')
  t.is('abc123', inp.ident())
  t.is(' ', inp.peek())
})

test('token', (t) => {
  let inp = Inp('abc123 def')
  t.is('abc123', inp.token())
  t.is(' ', inp.peek())
})

test('lineRest', (t) => {
  let inp = Inp('abc def\nghi jkl')
  t.is('abc def', inp.lineRest())
  t.is('\n', inp.peek())
})

test('token', (t) => {
  let inp = Inp('88aa -9i9bb:')
  t.is('88aa', inp.token())
  t.is('', inp.ident())
  inp.skip()
  t.is('', inp.ident())
  inp.skip()
  t.is('9i9bb', inp.ident())
})
