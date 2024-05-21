import Inp from './inp'
import { NL, NUL } from './inp'
import { assert, test } from 'vitest'

let eq = assert.equal

test('get', () => {
  let inp = Inp('abčĎe😀fg \n g')
  eq('a', inp.get(0))
  eq('b', inp.get(1))
  eq('č', inp.get(2))
  eq('Ď', inp.get(3))
  eq('e', inp.get(4))
  eq('😀', inp.get(5))
  eq('f', inp.get(6))
  eq('g', inp.get(7))
  eq(NL, inp.get(8))
  eq(' ', inp.get(9))
  eq('g', inp.get(10))
  eq(NL, inp.get(11))
  eq(NUL, inp.get(12)) // beyond the end
})

test('next-skip', () => {
  let inp = Inp('ab😀d')
  eq('a', inp.next())
  inp.skip()
  eq('😀', inp.next())
  inp.skip(1)
  eq(NL, inp.next())
  eq(NUL, inp.next())
})

test('skipWhite', () => {
  let inp = Inp(' ab')
  inp.skipWhite()
  eq('ab', inp.take(2))
  eq(NL, inp.get())
  inp.skipWhite()
  eq(NL, inp.next())
  eq(NUL, inp.next())
})

test('push', () => {
  let inp = Inp('d😀f')
  inp.push('abc')
  eq('a', inp.next())
  eq('b', inp.next())
  eq('c', inp.next())
  eq('d', inp.next())
  eq('😀', inp.next())
  eq('f', inp.next())
  eq(NL, inp.next())
  eq(NUL, inp.next())

  inp = Inp('')
  inp.push('')
  eq(NL, inp.next())
  eq(NUL, inp.next())
})

test('take', () => {
  let inp = Inp('abcdef')
  inp.next()
  eq('bc', inp.take(2))
  eq('de', inp.take(2))
})
