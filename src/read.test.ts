import Rd from './read'
import { NL, NUL } from './spec'
import test from 'ava'

test('get', (t) => {
  let rd = Rd('abčdef')
  t.is('a', rd.get())
  t.is('č', rd.get(2 as int))
  t.is('b', rd.get(1 as int))
  t.is(NL, rd.get(6 as int)) // EOL
  t.is(NUL, rd.get(100 as int)) // beyond the end
})

test('next-skip', (t) => {
  let rd = Rd('abcdef')
  t.is('a', rd.next())
  rd.skip()
  t.is('c', rd.next())
  rd.skip(3 as int)
  t.is(NL, rd.next())
  t.is(NUL, rd.next())
})

test('is', (t) => {
  const rd = Rd('ab😀')
  t.true(rd.is('a', 0 as int))
  t.true(rd.is('b', 1 as int))
  t.true(rd.is('😀', 2 as int))
  t.true(rd.is(NL, 3 as int))
  t.true(rd.is(NUL, 4 as int))
  t.false(rd.is('A', 0 as int))
})

test('push', (t) => {
  let rd = Rd('d😀f')
  rd.push('abc')
  t.is('a', rd.next())
  t.is('b', rd.next())
  t.is('c', rd.next())
  t.is('d', rd.next())
  t.is('😀', rd.next())
  t.is('f', rd.next())
  t.is(NL, rd.next())
  t.is(NUL, rd.next())

  rd = Rd('')
  rd.push('')
  t.is(NL, rd.next())
  t.is(NUL, rd.next())
})

test('nextLine', (t) => {
  let rd = Rd('line1\nline2\nline3')
  t.is('line1', rd.nextLine())
  t.is('line2', rd.nextLine())
  t.is('line3', rd.nextLine())
})

test('isNumChar', (t) => {
  let rd = Rd('1x😀3abc')
  t.true(rd.isNumChar())
  t.false(rd.isNumChar(1 as int))
  t.false(rd.isNumChar(2 as int))
  t.true(rd.isNumChar(3 as int))
  rd.skip(3 as int)
  t.is('3', rd.get())
  t.true(rd.isNumChar())
})

test('isIdentChar', (t) => {
  let rd = Rd('abc-123')
  t.true(rd.isIdentChar())
  rd.skip()
  t.true(rd.isIdentChar())
  rd.skip()
  t.true(rd.isIdentChar())
  rd.skip()
  t.true(rd.isIdentChar(0 as int, false))
  t.false(rd.isIdentChar(0 as int, true))
  rd.skip()
  t.true(rd.isIdentChar())
})

test('isWhite', (t) => {
  let rd = Rd(' \tt\nabc')
  t.is(' ', rd.get())
  t.true(rd.isWhite())
  rd.skip()
  t.true(rd.isWhite())
  rd.skip()
  t.false(rd.isWhite())
})

test('skipWhite', (t) => {
  let rd = Rd(' \ta\nb')
  t.true(rd.skipWhite())
  t.is('a', rd.get())
})

test('skipLine', (t) => {
  let rd = Rd('abc\ndef')
  rd.skipLine()
  t.is('d', rd.get())
})

test('match', (t) => {
  let rd = Rd('aaaabbbb')
  t.is(4, rd.match('a', 4 as int))
  t.is('b', rd.get())
})

test('matchs', (t) => {
  let rd = Rd('abc😀def')
  t.true(rd.matchs('abc😀'))
  t.is('d', rd.get())
})

test('nextNumber', (t) => {
  let rd = Rd('6123abc')
  t.is('123', rd.nextNumber())
  t.is('a', rd.get())
})

test('ident', (t) => {
  let rd = Rd('abc123 _def')
  t.is('abc123', rd.ident())
  t.is(' ', rd.next())
  t.is('_def', rd.ident())

  rd = Rd('88aa -9i9bb:')
  t.is('88aa', rd.token())
  t.is('', rd.ident())
  rd.skip()
  t.is('', rd.ident())
  rd.skip()
  t.is('9i9bb', rd.ident())
})

test('token', (t) => {
  let rd = Rd('abc123 def')
  t.is('abc123', rd.token())
  t.is(' ', rd.get())
})

test('lineRest', (t) => {
  let rd = Rd('abc def\nghi jkl')
  t.is('abc def', rd.lineRest())
  t.is('\n', rd.get())
})
